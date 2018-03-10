const Passage = require('passage-rpc');
const Application = require('./application');
const MemQueue = require('./mem-queue');

const env = process.env.NODE_ENV || 'development';
const URI = (env === 'production' ? 'wss://api.getinbox.io' : 'ws://localhost:9090');
const DEFAULT_OPTIONS = {
    reconnect: true,
    reconnectTimeout: 6000
};
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
    if (reconnecting) {
        this.connectionStatus = CONNECTION_STATUS.RECONNECTING;
    } else {
        this.connectionStatus = CONNECTION_STATUS.CLOSED;
        setTimeout(() => { this.connect(); }, 10 * 60 * 1000);
    }

    for (const application of this.applications) {
        if (application.authenticated === false) continue;

        application.authenticated = false;
        this.emit('getinbox.logout', application.id);
    }
}

function onAuthenticate () {
    if (this.isReady) {
        this.queue.getItems((items) => {
            for (const item of items) {
                this.deliver(item);
            }
        });
    }
}

class Getinbox extends Passage {
    constructor (uri, options = {}) {
        if (typeof uri === 'object') {
            options = uri;
            uri = undefined;
        }
        super(uri || URI, Object.assign({}, DEFAULT_OPTIONS, options));

        this.queue = options.queue || new MemQueue();
        this.connectionStatus = CONNECTION_STATUS.CLOSED;
        this.applications = new Set();

        this.on('rpc.open', onOpen.bind(this));
        this.on('rpc.close', onClose.bind(this));
        this.on('getinbox.authenticate', onAuthenticate.bind(this));
    }

    isReady () {
        for (const application of this.applications) {
            if (application.authenticated === false) return false;
        }
        return true;
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
        this.applications.delete(application);

        if (this.connectionStatus === CONNECTION_STATUS.OPEN) {
            application.logout(this);
        }
    }

    deliver (params) {
        this.send('message.create', params, (error) => {
            if (error && error.code === 503) {
                this.queue.add(params);
            } else if (error) {
                this.emit('getinbox.error', error, params);
            }
        });
    }
}

module.exports = Getinbox;
