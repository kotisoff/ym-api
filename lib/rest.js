import axios from "axios";

export default class Rest {
  async _sendRequestAxios(method, request, callback) {
    const axiosRequest = {
      method,
      url: request.getURL(),
      headers: request.getHeaders(),
    };
    if (["PUT", "POST", "DELETE", "PATCH"].includes(method.toUpperCase())) {
      axiosRequest.data = request.getBodyDataString();
      axiosRequest.headers = {
        ...axiosRequest.headers,
        ...{ "content-type": "application/x-www-form-urlencoded" },
      };
    }
    try {
      const { data } = await axios(axiosRequest);
      if (data.result) {
        return data.result;
      } else {
        return data;
      }
    } catch (e) {
      console.error({ e, response: e.response });
      throw new Error(`Request failed: ${e.message}`);
    }
  }

  get(request) {
    return this._sendRequestAxios("get", request);
  }

  post(request) {
    return this._sendRequestAxios("post", request);
  }
}
