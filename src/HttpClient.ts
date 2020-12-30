import axios, { AxiosRequestConfig } from "axios";
import {
  HttpClientInterface,
  Method,
  Response,
  RequestInterface,
} from "./types";

export default class HttpClient implements HttpClientInterface {
  async _sendRequestAxios(
    method: Method,
    request: RequestInterface
  ): Promise<Response> {
    const axiosRequest: AxiosRequestConfig = {
      method,
      url: request.getURL(),
      headers: request.getHeaders(),
      data: {},
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
      console.error({
        status: e.response.status,
        headers: e.response.headers,
        data: e.response.data,
      });
      throw new Error(`Request failed: ${e.message}`);
    }
  }

  get(request: RequestInterface): Promise<Response> {
    return this._sendRequestAxios("get", request);
  }

  post(request: RequestInterface): Promise<Response> {
    return this._sendRequestAxios("post", request);
  }
}
