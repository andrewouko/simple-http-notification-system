# How to start the application

**Install dependencies using npm :**

`npm install`

**Create .env file in `the project root folder` with following variables :**

-   `PORT` : This is the port where the applicationw will be running from
-   `APP_NAME` : This is a name for the application. This will be the name used in the activity logs.
-   `TOPICS_AND_URLS` : This is the name for the csv file used to store the topics and urls data.

*A sample is provided in the project root*

**Run the development server using the scripts provided in package.json :**

`npm run start`

*Application will now be accessible from the port provided in the .env file*

**Activity & Error Logging  Files :**

*Located in the root of the project and must be writable*

- `${APP_NAME}.log`
- `error.log`

## TEST IF APPLICATION IS INSTALLED CORRECTLY

**Manual Test**
Navigate to `http://host:port/health` e.g http:localhost:8080/health

**Unit test**
`npm test`



**HTTP NOTIFICATION SYSTEM REST API**
====

**General Error Responses**
----
    <_A brief description of the HTTP format of the errors.>

* **Sample Error Response Headers:**
    * **HTTP Status Code:** 404 | 400 | 500 <br />
    * **Content-type:** application/json <br />
* **Sample Response Body:**
```json
        {
            "status": "404 | 400 | 500",
            "message": "A description of the error in plain text",
            "error": {}
        }
```
* **Sample Error Response Headers Description:**
    * **HTTP Status Codes:** <br />
    * * **404:** This HTTP status code shows the url/resource requested could not be found. <br />
    * * **400:** The request body is invalid. E.g it does not contain all the required parameters. <br />
    * * **500:** Internal server error. The application encountered an unexpected error. The logs can be used to trace what went wrong. <br />
    * **Content-type:** Responses will always be of the format `application/json` <br />

* **Sample Error Response Body Description:**
    * **status:**  This status corresponds to the HTTP status code of the response. <br />
    * **message:**  A plain text (string) description of the error. <br />
    * **error:**  An object containing more details about the error. <br />

**Health**
----
* **URL: `/health`**

    <_This endpoint is used to check if the server has been started and is reachable.>

* **Method:**
  `GET`

* **Success Response Headers:**
  * **Code:** 200 <br />
  * **Content-type:** text/html; charset=utf-8 <br />
* **Success Response Body:** 
```html
    Ok
```

* **Sample cURL request:**
```console
    curl --location --request GET 'localhost:8080/health'
```



**Status**
----
* **URL: `/status`**

    <_This endpoint is used to check the status of the service .>

* **Method:**
  `GET`

* **Success Response Headers:**
  * **Code:** 200 <br />
  * **Content-type:** text/html; charset=utf-8 <br />
* **Success Response Body:** 
```json
    {
        "ip": "::1",
        "health": "Ok",
        "env": {
            "port": "8080",
            "app_name": "http-notification-system"
        }
    }   
```
* **Response Description:**
    * **ip:**  This is the remote ip address of the client accessing the service. <br />
    * **health:**  A health status. <br />
    * **env:**  An object containing the configured environment variables. <br />


* **Sample cURL request:**
```console
    curl --location --request GET 'localhost:8080/status'
```


**Subscribe**
----
* **URL: `/subscribe/:topic`**

    <_This endpoint adds a subscriber to a topic.>

* **Method:**
  `POST`

* **Sample Request Body:** 
```json
    {
        "url": "https://webhook.site/311e68d4-efeb-41ae-834a-e3100e62a5ce"
    }
```

* **Success Response Headers:**
  * **Code:** 200 <br />
  * **Content-type:** application/json <br />
* **Success Response Body:** 
```json
    {
        "url": "http://localhost:3010/tiesto",
        "topic": "sample topic two"
    } 
```

* **Request Description:**
    * **url:**  The url to notify the subscriber on for the topic provided on the path params. <br />

* **Response Description:**
    * **url:**  This url to notify the subscriber on. <br />
    * **topic:**  The topic the subscriber is subscribed to. <br />


* **Sample cURL request:**
```console
    curl --location --request POST 'localhost:8080/subscribe/Sample Topic' \
    --header 'Content-Type: application/json' \
    --data-raw '{
        "url": "https://webhook.site/311e68d4-efeb-41ae-834a-e3100e62a5ce"
    }'
```

**Publish**
----
* **URL: `/publish/:topic`**

    <_This publishes a message to all subscribers of a topic .>

* **Method:**
  `POST`

* **Sample Request Body:** 
```json
    {
        "key": "value",
        "key2": "value2"
    }
```

* **Success Response Headers:**
  * **Code:** 200 <br />
  * **Content-type:** application/json <br />
* **Success Response Body:** 
```json
    {
        "topic": "sample topic",
        "data": {
            "key": "value"
        }
    }
```

* **Request Description:**
    An JSON object with payload to publish to all subscribers of the topic specified in the path param. <br />

* **Response Description:**
    * **data:**  The payload sent to all subscribers. <br />
    * **topic:**  The topic the message is published to. <br />

* **Sample cURL request:**
```console
    curl --location --request POST 'localhost:8080/publish/Sample Topic' \
    --header 'Content-Type: application/json' \
    --data-raw '{
        "key": "value"
    }'
```