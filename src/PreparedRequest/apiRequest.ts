import Request from "../Request";
import config from "../config";

export default function apiRequest() {
  return new Request(config.api);
}
