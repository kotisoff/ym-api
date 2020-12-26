import restler from 'restler';
const { get, post } = restler;

export default class Rest {
    _sendRequest(method, uri, options, callback) {
        method(uri, options)
            .on('success', function (data, response) {
                if (data.result) {
                    callback(null, data.result);
                } else {
                    callback(null, data);
                }
            })
            .on('fail', function (err, response) {
                if (err) {
                    callback(err);
                } else {
                    callback(new Error('Request failed'));
                }
            })
            .on('error', function (err, response) {
                if (err) {
                    callback(err);
                } else {
                    callback(new Error('Request error'));
                }
            })
            .on('timeout', function (ms) {
                callback(new Error('Request timed out (' + ms + ')'));
            });
    }

    get(request, callback) {
        this._sendRequest(
            get,
            request.getURI(),
            {
                query: request.getQuery(),
                headers: request.getHeaders(),
                data: request.getBodyData()
            },
            callback
        );
    }

    post(request, callback) {
        this._sendRequest(
            post,
            request.getURI(),
            {
                query: request.getQuery(),
                headers: request.getHeaders(),
                data: request.getBodyData()
            },
            callback
        );
    }
}
