class Application {
    constructor (id, secretKey) {
        this.id = id;
        this.secretKey = secretKey;
        this.authenticated = false;
    }

    authenticate (connection) {
        const params = {
            applicationId: this.id,
            secretKey: this.secretKey
        };

        connection.send('application.authenticate', params, (error) => {
            if (!error)
                this.authenticated = true;
            connection.emit('getinbox.authenticate', this.id, error);
        });
    }

    logout (connection) {
        const params = {
            applicationId: this.id,
        };

        connection.send('application.logout', params, (error) => {
            if (!error)
                this.authenticated = false;
            connection.emit('getinbox.logout', this.id, error);
        });
    }
}

module.exports = Application;
