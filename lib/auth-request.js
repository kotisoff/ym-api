import Request from "./request.js";
import conig from "./config.js";

export function get() {
  return new Request(conig.authApi);
}
