import YandexMusicApi from "../src/yandex-music-api.js";
import config from "./config.js";
const api = new YandexMusicApi();

(async () => {
  try {
    await api.init(config.user);
    const searchResult = await api.search("gorillaz", { type: "artist" });
    const gorillaz = searchResult.artists.results[0];
    const gorillazMostPopularTrack = gorillaz.popularTracks[0];
    const gorillazMostPopularTrackId = `${gorillazMostPopularTrack.id}:${gorillaz.id}`;
    console.log({ searchResult, gorillaz, gorillazMostPopularTrack });

    const getTrackResult = await api.getTrack(gorillazMostPopularTrackId);
    console.log({ getTrackResult });

    const getTrackSupplementResult = await api.getTrackSupplement(
      gorillazMostPopularTrackId
    );
    console.log({ getTrackSupplementResult });

    const getTrackDownloadInfoResult = await api.getTrackDownloadInfo(
      gorillazMostPopularTrackId
    );
    const mp3Tracks = getTrackDownloadInfoResult
      .filter((r) => r.codec === "mp3")
      .sort((a, b) => b.bitrateInKbps - a.bitrateInKbps);
    const hqMp3Track = mp3Tracks[0];
    console.log({ getTrackDownloadInfoResult, mp3Tracks, hqMp3Track });

    const getTrackDirectLinkResult = await api.getTrackDirectLink(
      hqMp3Track.downloadInfoUrl
    );
    console.log({ getTrackDirectLinkResult });
  } catch (e) {
    console.log(`api error ${e.message}`);
  }
})();
