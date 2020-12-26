import querystring from "querystring";

export default class Request {
  #scheme;
  #host;
  #port;
  #path;
  #headers;
  #query;
  #bodyData;
  constructor(config) {
    this.#scheme = config.scheme;
    this.#host = config.host;
    this.#port = config.port;
    this.#path = config.path;

    this.#headers = config.headers;
    this.#query = config.query;
    this.#bodyData = config.bodyData;
  }
  setPath(path) {
    this.#path = path;

    return this;
  }
  getHeaders(headers) {
    return this.#headers;
  }
  setHeaders(headers) {
    this.#headers = headers;

    return this;
  }
  addHeaders(headers) {
    if (!this.#headers) {
      this.#headers = headers;
    } else {
      for (var key in headers) {
        this.#headers[key] = headers[key];
      }
    }

    return this;
  }
  getQuery() {
    return this.#query;
  }
  setQuery(query) {
    this.#query = query;

    return this;
  }
  addQuery(query) {
    if (!this.#query) {
      this.#query = query;
    } else {
      for (var key in query) {
        this.#query[key] = query[key];
      }
    }

    return this;
  }
  getQueryAsString() {
    if (!this.#query) return "";

    const params = [];

    for (var key in this.#query) {
      params.push(key + "=" + this.#query[key]);
    }

    return "?" + params.join("&");
  }
  getBodyData() {
    return this.#bodyData;
  }
  getBodyDataString() {
    return querystring.stringify(this.#bodyData);
  }
  setBodyData(bodyData) {
    this.#bodyData = bodyData;

    return this;
  }
  addBodyData(bodyData) {
    if (!this.#bodyData) {
      this.#bodyData = bodyData;
    } else {
      for (var key in bodyData) {
        this.#bodyData[key] = bodyData[key];
      }
    }

    return this;
  }
  getURI() {
    let uri = this.#scheme + "://" + this.#host;

    if (this.#port) {
      uri += ":" + this.#port;
    }

    if (this.#path) {
      uri += this.#path;
    }

    return uri;
  }
  getURL() {
    return this.getURI() + this.getQueryAsString();
  }
}
