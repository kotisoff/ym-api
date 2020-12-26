import YandexMusicApi from "../lib/yandex-music-api.js";
import config from "./config.js";

const api = new YandexMusicApi();

api
  .init(config.user)
  .then(function (token) {
    console.log("uid: " + token.uid);
    console.log("token: " + token.access_token);
    console.log(
      "expires in: " + new Date(new Date().getTime() + token.expires_in * 1000)
    );
  })
  .catch(function (err) {
    console.log("Error: ", err);
  });
