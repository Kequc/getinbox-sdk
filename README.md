# Getinbox SDK

Simple module for delivering messages to [Getinbox](https://www.getinbox.io).

## Install

```
npm i getinbox-sdk --save
```

## Usage

```javascript
const Getinbox = require('getinbox-sdk');

const getinbox = new Getinbox();
getinbox.addApplication('<my-application-id>', '<my-secret-key>');
```
```javascript
const text = 'Hello from my application.';

getinbox.deliver('<account-id>', { text }, (error) => {
    if (!error)
        console.log('Message delivered successfully!');
});
```

## Instance

#### constructor (uri: string, options: Object)

The constructor accepts a uri you would like to connect to. by default in production this is `wss://api.getinbox.io` and any other environment `ws://localhost:9090`. As well as a set of options which matches up with the underlying [passage-rpc](https://www.npmjs.com/package/passage-rpc) library.

#### conectionStatus

Returns one of the following.

| status | value |
| - | - |
| OPEN | `open` |
| RECONNECTING | `reconnecting` |
| CLOSED | `closed` |

#### addApplication (id: string, secretKey: string) => void

Adds an application to the connection, it will authenticate as early as possible and will re-authenticate with the API on any reconnection event.

#### removeApplication (id: string) => void

Removes the application which matches the given `id`, it will logout as soon as possible if currently connected.

#### deliver (accountId: string, params: Object, callback? (error: Error) => void) => void

Delivers a message to the specified `accountId`, if the account isn't authorised to receive messages from any of your applications delivery will fail. If a callback is not provided and delivery fails this method will throw an error.

## Params

When delivering a message only the `accountId` and `text` parameter is required.

| param | description |
| - | - |
| subject | Message subject. |
| replyTo | Email address so that they might contact you. |
| text | Body of the message in text format. |
| html | Body of the message in html format. |
| attachments | Array of attachments. |

Attachments are formatted like so.

| param | description |
| - | - |
| filename | Name of attachment. |
| content | File content encoded in base64 format. |
| contentType | File type/mime type. |

## Events

In addition to the standard events returned by [passage-rpc](https://www.npmjs.com/package/passage-rpc).

| event | params | description |
| - | - | - |
| `getinbox.authenticate` | id, error | An application has attempted to authenticate. |
| `getinbox.logout` | id, error | An application has been logged out. |
