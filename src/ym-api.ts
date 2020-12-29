import { get as authRequest } from "./auth-request";
import { get as apiRequest } from "./api-request";
import { get as directLinkRequest } from "./direct-link-request";
import fallbackConfig from "./config";
import Rest from "./rest";
import { parseStringPromise } from "xml2js";
import crypto from "crypto";
import {
  ApiConfig,
  ApiInitConfig,
  InitResponse,
  GetGenresResponse,
  SearchType,
  SearchResponse,
  Playlist,
  GetTrackResponse,
  GetTrackSupplementResponse,
  GetTrackDownloadInfoResponse,
  ObjectResponse,
  GetFeedResponse,
  GetAccountStatusResponse,
} from "./types";

const rest = new Rest();

export default class YandexMusicApi {
  private config: ApiConfig = {
    oauth: {
      CLIENT_ID: fallbackConfig.oauth.CLIENT_ID,
      CLIENT_SECRET: fallbackConfig.oauth.CLIENT_SECRET,
    },

    fake_device: {
      DEVICE_ID: fallbackConfig.fake_device.DEVICE_ID,
      UUID: fallbackConfig.fake_device.UUID,
      PACKAGE_NAME: fallbackConfig.fake_device.PACKAGE_NAME,
    },

    user: {
      USERNAME: "",
      PASSWORD: "",
      TOKEN: "",
      UID: 0,
    },
  };

  constructor(config = {}) {
    this.config = { ...this.config, ...config };
  }

  private getAuthHeader(): { Authorization: string } {
    return {
      Authorization: `OAuth ${this.config.user.TOKEN}`,
    };
  }

  /**
   * Authentication
   */
  async init(config: ApiInitConfig): Promise<InitResponse> {
    // Skip auth if access_token and uid are present
    if (config.access_token && config.uid) {
      this.config.user.TOKEN = config.access_token;
      this.config.user.UID = config.uid;
      return {
        access_token: config.access_token,
        uid: config.uid,
      };
    }

    if (!config.username || !config.password) {
      throw new Error(
        "username && password || access_token && uid must be set"
      );
    }
    this.config.user.USERNAME = config.username;
    this.config.user.PASSWORD = config.password;

    const data = (await rest.post(
      authRequest().setPath("/1/token").setBodyData({
        grant_type: "password",
        username: this.config.user.USERNAME,
        password: this.config.user.PASSWORD,
        client_id: this.config.oauth.CLIENT_ID,
        client_secret: this.config.oauth.CLIENT_SECRET,
      })
    )) as ObjectResponse;

    this.config.user.TOKEN = data.access_token;
    this.config.user.UID = data.uid;

    return data as InitResponse;
  }

  /**
   * GET: /account/status
   * Get account status for curren user
   */
  getAccountStatus(): Promise<GetAccountStatusResponse> {
    const request = apiRequest()
      .setPath("/account/status")
      .addHeaders(this.getAuthHeader());

    return rest.get(request) as Promise<GetAccountStatusResponse>;
  }

  /**
   * GET: /feed
   * Get the user's feed
   */
  getFeed(): Promise<GetFeedResponse> {
    const request = apiRequest()
      .setPath("/feed")
      .addHeaders(this.getAuthHeader());

    return rest.get(request) as Promise<GetFeedResponse>;
  }

  /**
   * GET: /genres
   * Get a list of music genres
   */
  getGenres(): Promise<GetGenresResponse> {
    const request = apiRequest()
      .setPath("/genres")
      .addHeaders(this.getAuthHeader());

    return rest.get(request) as Promise<GetGenresResponse>;
  }

  /**
   * GET: /search
   * Search artists, tracks, albums.
   */
  search(
    query: string,
    options: {
      type?: SearchType;
      page?: number;
      nococrrect?: boolean;
    } = {}
  ): Promise<SearchResponse> {
    const type = !options.type ? "all" : options.type;
    const page = String(!options.page ? 0 : options.page);
    const nococrrect = String(
      options.nococrrect == null ? false : options.nococrrect
    );
    const request = apiRequest()
      .setPath("/search")
      .addHeaders(this.getAuthHeader())
      .setQuery({
        type,
        text: query,
        page,
        nococrrect,
      });

    return rest.get(request) as Promise<SearchResponse>;
  }

  /**
   * GET: /users/[user_id]/playlists/list
   * Get a user's playlists.
   */
  getUserPlaylists(userId: number | null = null): Promise<Array<Playlist>> {
    const uid = [null, 0].includes(userId) ? this.config.user.UID : userId;
    const request = apiRequest()
      .setPath(`/users/${uid}/playlists/list`)
      .addHeaders(this.getAuthHeader());

    return rest.get(request) as Promise<Array<Playlist>>;
  }

  /**
   * GET: /users/[user_id]/playlists/[playlist_kind]
   * Get a playlist without tracks
   */
  getUserPlaylist(
    playlistId: number,
    userId: number | null = null
  ): Promise<Playlist> {
    const uid = [null, 0].includes(userId) ? this.config.user.UID : userId;
    const request = apiRequest()
      .setPath(`/users/${uid}/playlists/${playlistId}`)
      .addHeaders(this.getAuthHeader());

    return rest.get(request) as Promise<Playlist>;
  }

  /**
   * GET: /users/[user_id]/playlists
   * Get an array of playlists with tracks
   */
  getPlaylists(
    playlists: Array<number>,
    userId: number | null = null,
    options: { mixed?: boolean; "rich-tracks"?: boolean } = {}
  ): Promise<Array<Playlist>> {
    const uid = [null, 0].includes(userId) ? this.config.user.UID : userId;
    const kinds = playlists.join();
    const mixed = String(options.mixed == null ? false : options.mixed);
    const richTracks = String(
      options["rich-tracks"] == null ? false : options["rich-tracks"]
    );

    const request = apiRequest()
      .setPath(`/users/${uid}/playlists`)
      .addHeaders(this.getAuthHeader())
      .setQuery({
        kinds,
        mixed,
        "rich-tracks": richTracks,
      });

    return rest.get(request) as Promise<Array<Playlist>>;
  }

  /**
   * POST: /users/[user_id]/playlists/create
   * Create a new playlist
   */
  createPlaylist(
    name: string,
    options: { visibility?: "public" | "private" } = {}
  ): Promise<Playlist> {
    const visibility = !options.visibility ? "private" : options.visibility;
    const request = apiRequest()
      .setPath("/users/" + this.config.user.UID + "/playlists/create")
      .addHeaders(this.getAuthHeader())
      .setBodyData({
        title: name,
        visibility,
      });

    return rest.post(request) as Promise<Playlist>;
  }

  /**
   * POST: /users/[user_id]/playlists/[playlist_kind]/delete
   * Remove a playlist
   */
  removePlaylist(playlistId: number): Promise<"ok" | string> {
    const request = apiRequest()
      .setPath(`/users/${this.config.user.UID}/playlists/${playlistId}/delete`)
      .addHeaders(this.getAuthHeader());

    return rest.post(request) as Promise<"ok" | string>;
  }

  /**
   * POST: /users/[user_id]/playlists/[playlist_kind]/name
   * Change playlist name
   */
  renamePlaylist(playlistId: number, name: string): Promise<Playlist> {
    const request = apiRequest()
      .setPath(`/users/${this.config.user.UID}/playlists/${playlistId}/name`)
      .addHeaders(this.getAuthHeader())
      .setBodyData({
        value: name,
      });

    return rest.post(request) as Promise<Playlist>;
  }

  /**
   * POST: /users/[user_id]/playlists/[playlist_kind]/change-relative
   * Add tracks to the playlist
   */
  addTracksToPlaylist(
    playlistId: number,
    tracks: Array<{ id: number; albumId: number }>,
    revision: number,
    options: { at?: number } = {}
  ): Promise<Playlist> {
    const at = !options.at ? 0 : options.at;
    const request = apiRequest()
      .setPath(
        `/users/${this.config.user.UID}/playlists/${playlistId}/change-relative`
      )
      .addHeaders(this.getAuthHeader())
      .setBodyData({
        diff: JSON.stringify([
          {
            op: "insert",
            at,
            tracks: tracks,
          },
        ]),
        revision: String(revision),
      });

    return rest.post(request) as Promise<Playlist>;
  }

  /**
   * POST: /users/[user_id]/playlists/[playlist_kind]/change-relative
   * Remove tracks from the playlist
   */
  removeTracksFromPlaylist(
    playlistId: number,
    tracks: Array<{ id: number; albumId: number }>,
    revision: number,
    options: { from?: number; to?: number } = {}
  ): Promise<Playlist> {
    const from = !options.from ? 0 : options.from;
    const to = !options.to ? tracks.length : options.to;
    const request = apiRequest()
      .setPath(
        `/users/${this.config.user.UID}/playlists/${playlistId}/change-relative`
      )
      .addHeaders(this.getAuthHeader())
      .setBodyData({
        diff: JSON.stringify([
          {
            op: "delete",
            from,
            to,
            tracks,
          },
        ]),
        revision: String(revision),
      });

    return rest.post(request) as Promise<Playlist>;
  }

  /**
   * GET: /tracks/[track_id]
   * Get an array of playlists with tracks
   */
  getTrack(trackId: string): Promise<GetTrackResponse> {
    const request = apiRequest()
      .setPath(`/tracks/${trackId}`)
      .addHeaders(this.getAuthHeader());

    return rest.get(request) as Promise<GetTrackResponse>;
  }

  /**
   * GET: /tracks/[track_id]/supplement
   * Get an array of playlists with tracks
   */
  getTrackSupplement(trackId: string): Promise<GetTrackSupplementResponse> {
    const request = apiRequest()
      .setPath(`/tracks/${trackId}/supplement`)
      .addHeaders(this.getAuthHeader());

    return rest.get(request) as Promise<GetTrackSupplementResponse>;
  }

  /**
   * GET: /tracks/[track_id]/download-info
   * Get track download information
   */
  getTrackDownloadInfo(trackId: string): Promise<GetTrackDownloadInfoResponse> {
    const request = apiRequest()
      .setPath(`/tracks/${trackId}/download-info`)
      .addHeaders(this.getAuthHeader());

    return rest.get(request) as Promise<GetTrackDownloadInfoResponse>;
  }

  /**
   * Get track direct link
   */
  async getTrackDirectLink(trackDownloadUrl: string): Promise<string> {
    const request = directLinkRequest(trackDownloadUrl);
    const xml = await rest.get(request);
    const parsedXml = await parseStringPromise(xml);
    const host = parsedXml["download-info"].host[0];
    const path = parsedXml["download-info"].path[0];
    const ts = parsedXml["download-info"].ts[0];
    const s = parsedXml["download-info"].s[0];
    const sign = crypto
      .createHash("md5")
      .update("XGRlBW9FXlekgbPrRHuSiA" + path.slice(1) + s)
      .digest("hex");

    return `https://${host}/get-mp3/${sign}/${ts}${path}`;
  }
}
