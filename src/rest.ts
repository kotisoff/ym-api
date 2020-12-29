import axios, { AxiosRequestConfig } from "axios";
import Request from "./request";
import { Method, Response } from "./types";

export default class Rest {
  async _sendRequestAxios(method: Method, request: Request): Promise<Response> {
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

  get(request: Request): Promise<Response> {
    return this._sendRequestAxios("get", request);
  }

  post(request: Request): Promise<Response> {
    return this._sendRequestAxios("post", request);
  }
}
