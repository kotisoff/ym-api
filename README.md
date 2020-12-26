# Yandex.Music API (Unofficial) for Node

This is a Node.js wrapper for the [Yandex.Music](http://music.yandex.ru/) API that is used in mobile apps (iOS/Android).

## Installation

```sh
npm install ym-api
```

## Usage

```js
import YandexMusicApi from "ym-api";
const api = new YandexMusicApi();

(async () => {
  try {
    await api.init({ username: "example@yandex.ru", password: "password" });
    const result = await api.search("gorillaz", { type: "artist" });
    console.log({ result });
  } catch (e) {
    console.log(`api error ${e.message}`);
  }
})();
```

This library provides following functions:

#### Users

- getAccountStatus
- getFeed

#### Music

- getGenres
- search

#### Playlist

- getUserPlaylists
- getPlaylist
- getPlaylists
- createPlaylist
- removePlaylist
- renamePlaylist
- addTracksToPlaylist
- removeTracksFromPlaylist

#### Tracks

- getTrack
- getTrackSupplement
- getTrackDownloadInfo
- getTrackDirectLink

## Acknowledgements

* [itsmepetrov/yandex-music-api](https://github.com/itsmepetrov/yandex-music-api)
* [MarshalX/yandex-music-api](https://github.com/MarshalX/yandex-music-api)
