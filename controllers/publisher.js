const { ErrorHandler, handleError } = require('../error.js')
const https = require('https')
const http = require('http')
const { writeFile, read, statSync, existsSync, appendFile, readFile } = require('fs')
const { isEmpty } = require('lodash')
const { logger } = require('../logger.js')

const handleSuccess = (response, data) => {
    response.status(200).json({
        // status: 200,
        ...data
    })
}

const httpRequest = (options, payload = null, protocol =  null) => {
    return new Promise((resolve, reject) => {
        if(!protocol) protocol = https
        const req = protocol.request(options, res => {
            let body = [];
            res.on('data', chunk => {
                body.push(chunk);
            });
            res.on('end', async() => {
                body = Buffer.concat(body).toString()
                /* try{
                    body = JSON.parse(body);
                } catch(error){
                    console.log('http request error', error)
                    reject({
                        message: body,
                        statusCode: res.statusCode
                    })
                } */
                resolve(body)
            })
        })
        req.on('error', error => {
            reject(error)
        })
        if(payload)
            req.write(payload)
        req.end()  
    })

}


const file_path = process.env.TOPICS_AND_URLS

exports.createSubsription = (req, res) => {
    if(!req.body.url){
        let err =  new ErrorHandler(400, 'The request must have the url property set', req.body)
        return handleError(err, res)
    }
    if(!req.params.topic){
        let err =  new ErrorHandler(400, 'The path param topic must be set', req.params)
        return handleError(err, res)
    }
    const handleFileError = err => {
        new ErrorHandler(500, 'Unable to write to file: ' + file_path, err)
        return handleError(err, res)
    }
    const handleSaveDataToFile = () => {
        const data_to_add = `${req.params.topic},${req.body.url}`
        // console.log('data to add',data_to_add)
        readFile(file_path, (e, data) => {
            if(e) return handleFileError(e)
            // console.log('index of', data.toString().indexOf(data_to_add))
            const handleSuccesResponse = () => handleSuccess(res, {
                url: req.body.url,
                topic: req.params.topic
            })
            if(data.toString().indexOf(data_to_add) < 0){
                return appendFile(file_path, `${data_to_add}\\n`, err => {
                    // console.log('Fule')
                    if(err) return handleFileError(err)
                    return handleSuccesResponse()
                })
            } else return handleSuccesResponse()
        })
    }
    if (!existsSync(file_path) || statSync(file_path).size === 0){
        return writeFile(file_path, 'topic,url\\n',  err => {
            if(err) return handleFileError(err)
            return handleSaveDataToFile()
        })
    }
    return handleSaveDataToFile()
}

exports.publishMessage = (req, res) => {
    if(isEmpty(req.body)){
        let err =  new ErrorHandler(400, 'The request must have a body', req.body)
        return handleError(err, res)
    }
    if(!req.params.topic){
        let err =  new ErrorHandler(400, 'The path param "topic" must be set', req.params)
        return handleError(err, res)
    }

    const handleSuccesResponse = () => handleSuccess(res, {
        topic: req.params.topic,
        data: req.body
    })

    if (!existsSync(file_path) || statSync(file_path).size === 0){
        // there are no subscriibers as the file is empty
        return handleSuccesResponse()
    }
    return readFile(file_path, (e, data) => {
        if(e) return handleFileError(e)

        const data_arr = data.toString().split('\\n').filter(el => el.length).map(col => col.split(','))
        const topic_index = data_arr[0].indexOf('topic')
        const url_index = data_arr[0].indexOf('url')

        // subscribers to publish to
        const subscribers = data_arr.filter((el, i) => i >= 1 && el[topic_index] == req.params.topic).map(el => el[url_index])
        // console.log(subscribers)
        subscribers.forEach(sub_url => {
            sub_url = new URL(sub_url)
            let options = {
                hostname: sub_url.hostname,/* url.replace(/htt(p|ps):\/\//g, '').replace(/:\d+/, '') */
                path: sub_url.pathname,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': JSON.stringify(req.body).length,
                },
                port: sub_url.port
            }
            // console.log(options, sub_url)
            return httpRequest(options, JSON.stringify(req.body), sub_url.protocol == 'http:' ? http : https ).then(res => {
                // console.log(res)
                // log subscriber response
                logger.info('Subscriber response: ' + JSON.stringify({
                    url: sub_url.href,
                    response: res
                }))

            }).catch(error => {
                logger.error('Subscriber http error: ' + JSON.stringify({
                    url: sub_url.href,
                    error: error
                }))
            })
            // httpRequest()
        })

        return handleSuccesResponse()
    })
}