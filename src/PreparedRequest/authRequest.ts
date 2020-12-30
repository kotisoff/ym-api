import Request from "../Request";
import config from "../config";

export default function authRequest() {
  return new Request(config.authApi);
}
