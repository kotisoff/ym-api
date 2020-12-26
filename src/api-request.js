import Request from "./request.js";
import config from "./config.js";

export function get() {
  return new Request(config.api);
}
