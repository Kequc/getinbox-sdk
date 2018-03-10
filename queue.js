class Queue {
    constructor () {
        this.items = [];
        this.callbacks = [];
    }

    add (message, callback) {
        this.items.push(message);
        this.callbacks.push(callback);
    }

    deliver (connection) {
        const items = this.items;
        this.items = [];
        const callbacks = this.callbacks;
        this.callbacks = [];

        for (let i = 0; i < items.length; i++) {
            connection.deliver(items[i], callbacks[i]);
        }
    }
}

module.exports = Queue;
