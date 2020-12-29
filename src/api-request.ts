import Request from "./request";
import config from "./config";

export function get() {
  return new Request(config.api);
}
