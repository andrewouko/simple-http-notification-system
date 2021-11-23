const { ErrorHandler, handleError } = require('../error.js')
const https = require('https')
const http = require('http')
const { writeFile, read, statSync, existsSync, appendFile, readFile } = require('fs')
const { isEmpty, update } = require('lodash')
const { logger } = require('../logger.js')
const { query } = require('../models/db.js')
const { count } = require('console')

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

    /**
     * Insert into DB the url and topic
     * The url and topic forms a unique subscription entry
     */
    query.runQuery(`INSERT IGNORE INTO subscription SET topic = '${req.params.topic}', url = '${req.body.url}'`, (err, result) => {
        if(err){
            error = new ErrorHandler(500, 'An error occured while inserting into subscription table', err)
            return handleError(error, res)
        }
        return handleSuccess(res, {
            url: req.body.url,
            topic: req.params.topic
        })
    })
}

exports.publishMessage = async(req, res) => {
    if(isEmpty(req.body)){
        let err =  new ErrorHandler(400, 'The request must have a body', req.body)
        return handleError(err, res)
    }
    if(!req.params.topic){
        let err =  new ErrorHandler(400, 'The path param "topic" must be set', req.params)
        return handleError(err, res)
    }

    // publish message to subs
    const publishMessage = subscribers => subscribers.forEach(sub_url => {
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

            /**
             * Update the last publish date
             */
            const update_time = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
             query.runQuery(`UPDATE subscription SET last_publish = '${update_time}' WHERE topic = '${req.params.topic}' AND url = '${req.body.url}'`, (err, result) => {
                if(err){
                    logger.error('An error occured while updating the subscription table' + JSON.stringify(err))
                } else logger.info('Successfully updated the last publish time of the subscription')
             })
        }).catch(error => {
            logger.error('Subscriber http error: ' + JSON.stringify({
                url: sub_url.href,
                error: error
            }))
        })
    })

    /**
     * Select subscribers to publish to from subscription table
     * based on the topic given in the path param
     */
    query.runQuery(`SELECT url FROM subscription WHERE topic = '${req.params.topic}'`, (err, result) => {
        if(err){
            error = new ErrorHandler(500, 'An error occured while reading from subscription table', err)
            return handleError(error, res)
        }
        publishMessage(result.map(el => el.url))
        return handleSuccess(res, {
            topic: req.params.topic,
            data: req.body
        })
    })
}