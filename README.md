# Yandex.Music API (Unofficial) for Node

This is a Node.js wrapper for the [Yandex.Music](http://music.yandex.ru/) API that is used in mobile apps (iOS/Android).

## Installation

```sh
npm install ym-api
```

## Usage

```js
import { YMApi } from "ym-api";
const api = new YMApi();

(async () => {
  try {
    await api.init({ username: "example@yandex.ru", password: "password" });
    const result = await api.searchArtists("gorillaz");
    console.log({ result });
  } catch (e) {
    console.log(`api error ${e.message}`);
  }
})();
```

## Available methods

This library provides following methods:

### Plain API

#### Users

- getAccountStatus
- getFeed

#### Music

- getGenres
- search
- searchArtists
- searchTracks
- searchAlbums
- searchAll

#### Playlist

- getPlaylist
- getPlaylists
- getUserPlaylists
- createPlaylist
- removePlaylist
- renamePlaylist
- addTracksToPlaylist
- removeTracksFromPlaylist

#### Tracks

- getTrack
- getArtistTracks
- getSingleTrack
- getTrackSupplement
- getTrackDownloadInfo
- getTrackDirectLink

#### Album

- getAlbums
- getAlbum
- getAlbumWithTracks

#### Artist

- getArtist
- getArtists

### Wrapped API

Almost all methods of the wrapped api can be called with a entity id or url

#### Tracks

- getConcreteDownloadInfo
- getMp3DownloadInfo
- getMp3DownloadUrl

#### Playlist

- getPlaylist

#### Album

- getAlbum
- getAlbumWithTracks

#### Artist

- getArtist

## Acknowledgements

- [itsmepetrov/yandex-music-api](https://github.com/itsmepetrov/yandex-music-api)
- [MarshalX/yandex-music-api](https://github.com/MarshalX/yandex-music-api)
