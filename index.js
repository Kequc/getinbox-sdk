const Passage = require('passage-rpc');
const Application = require('./application');

const env = process.env.NODE_ENV || 'development';
const URI = (env === 'production' ? 'wss://api.getinbox.io' : 'ws://localhost:9090');

const CONNECTION_STATUS = {
    OPEN: 'open',
    RECONNECTING: 'reconnecting',
    CLOSED: 'closed'
};

function onOpen () {
    this.connectionStatus = CONNECTION_STATUS.OPEN;

    for (const application of this.applications) {
        application.authenticate(this);
    }
}

function onClose (reconnecting) {
    if (reconnecting)
        this.connectionStatus = CONNECTION_STATUS.RECONNECTING;
    else
        this.connectionStatus = CONNECTION_STATUS.CLOSED;

    for (const application of this.applications) {
        if (application.authenticated === false) continue;

        application.authenticated = false;
        this.emit('getinbox.logout', application.id);
    }
}

class Getinbox extends Passage {
    constructor (uri, options = {}) {
        super(uri || URI, Object.assign({ reconnect: true }, options));

        this.connectionStatus = CONNECTION_STATUS.CLOSED;
        this.applications = new Set();

        this.on('rpc.open', onOpen.bind(this));
        this.on('rpc.close', onClose.bind(this));
    }

    findApplication (id) {
        return this.applications.find(application => application.id === id);
    }

    addApplication (id, secretKey) {
        const application = new Application(id, secretKey);
        this.applications.add(application);

        if (this.connectionStatus === CONNECTION_STATUS.OPEN) {
            application.authenticate(this);
        }
    }

    removeApplication (id) {
        const application = this.findApplication(id);
        this.applications.remove(application);

        if (this.connectionStatus === CONNECTION_STATUS.OPEN) {
            application.logout(this);
        }
    }

    deliver (accountId, params, callback) {
        const message = {
            accountId,
            subject: params.subject,
            replyTo: params.replyTo,
            text: params.text,
            html: params.html,
            attachments: params.attachments
        };
        this.send('message.create', message, callback);
    }
}

module.exports = Getinbox;
