const { Health, Ping } = require("../controllers/system");
const request = require('supertest')
const express =  require('express')

const app = new express();
app.use(express.json());
const { routes, errorHandlingRoute } = require('../routes');
routes(app)
app.use((req, res, next) => errorHandlingRoute(req, res, next));

const CLIENT_IP = '1.2.3.4';
/* beforeEach(() => {
  // Mock the `ip` property on the `req` object
  jest.spyOn(req, 'ip', 'get').mockReturnValue(CLIENT_IP);
});
afterEach(() => {
  // Restore all the mocks back to their original value
  // Only works when the mock was created with `jest.spyOn`
  jest.restoreAllMocks();
}); */

const test_url = "https://webhook.site/311e68d4-efeb-41ae-834a-e3100e62a5ce"

const test_topic =  "Sample"

describe('Test Routes', function () {

    test('responds to /health', async() => {
        const res = await request(app).get('/health');
        expect(res.header['content-type']).toBe('text/html; charset=utf-8');
        expect(res.statusCode).toBe(200);
        expect(res.text).toEqual('Ok');
    });

    test('responds to /status', async() => {
        const res = await request(app).get('/status').set('X-Forwarded-For', CLIENT_IP);
        expect(res.header['content-type']).toBe('application/json; charset=utf-8');
        expect(res.statusCode).toBe(200);
        expect(res.text).toEqual(JSON.stringify(
            {
                ip: CLIENT_IP,
                health: 'Ok', 
                env: {
                    port: process.env.PORT,
                    app_name: process.env.APP_NAME
                }

            }
        ));
    });
    /* test('responds to /subscribe/:topic', async() => {
        const res = await request(app).post(`/subscribe/${test_topic}`).send({
            "url": test_url
        }).then(res => {
            console.log(res)
            return res
        })

        
        expect(res.statusCode).toBe(200);
        expect(res.header['content-type']).toBe('application/json; charset=utf-8');

        expect(res.text).toEqual(JSON.stringify(
            {
                url: test_url,
                topic: test_topic
            }
        ));
    }); */

});