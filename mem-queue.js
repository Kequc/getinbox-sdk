class Queue {
    constructor () {
        this._items = [];
    }

    add (item) {
        this._items.push(item);
    }

    getItems (callback) {
        const items = this._items;
        this._items = [];
        callback(items);
    }
}

module.exports = Queue;
