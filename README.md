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
getinbox.deliver({
    accountId: '<account-id>',
    text: 'Hello from my application.'
});
```

## Instance

#### constructor ([uri: string], options?: Object)

The constructor accepts a uri you would like to connect to. by default in production this is `wss://api.getinbox.io` and any other environment `ws://localhost:9090`. A set of options might be provided for use with the underlying [passage-rpc](https://www.npmjs.com/package/passage-rpc) library.

#### conectionStatus

Returns one of the following.

| status | value |
| - | - |
| OPEN | `open` |
| RECONNECTING | `reconnecting` |
| CLOSED | `closed` |

When the connection falls into a closed state, it will wait 10 minutes and attempt to reconnect again.

#### addApplication (id: string, secretKey: string) => void

Adds an application to the connection, it will authenticate as early as possible and will re-authenticate with the API on any reconnection event.

#### removeApplication (id: string) => void

Removes the application which matches the given `id`, it will logout as soon as possible if currently connected.

#### deliver (params: Object) => void

If the account isn't configured to receive messages from one of your applications, delivery will fail. If delivery fails because of a service outage the message will be queued for delivery when the connection is re-established.

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

## Queue

By default the included queue mechanism makes use of application memory. Which would be erased in case the application is closed. As an option you may provide your own implementation with persistent memory if you are worried about deliverability.

```javascript
const queue = {
    add (item) {
        myPersistentStore.add(item);
    },
    getItems (callback) {
        myPersistentStore.fetch((items) => {
            myPersistentStore.clear();
            callback(items);
        });
    }
};

const getinbox = new Getinbox({ queue });
```

#### add (item: Object) => void

A message was attempted to be delivered while service was unavailable. This should add the given message to the queue.

#### getItems (callback (items: Object[]) => void) => void

A connection has been re-established. This should fetch all queued messages and clear them from the store, before returning the items using the provided callback.

## Events

In addition to the standard events returned by [passage-rpc](https://www.npmjs.com/package/passage-rpc).

| event | params | description |
| - | - | - |
| `getinbox.authenticate` | id, error | An application has attempted to authenticate. |
| `getinbox.logout` | id, error | An application has been logged out. |
| `getinbox.error` | error, attrs | A message failed to deliver. |
