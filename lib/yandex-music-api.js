import { get } from "./auth-request.js";
import { get as _get } from "./api-request.js";
import fallbackConfig from "./config.js";
import Rest from "./rest.js";

const rest = new Rest();

export default class YandexMusicApi {
  #config = {
    ouath_code: {
      CLIENT_ID: fallbackConfig.ouath_code.CLIENT_ID,
      CLIENT_SECRET: fallbackConfig.ouath_code.CLIENT_SECRET,
    },

    oauth_token: {
      CLIENT_ID: fallbackConfig.oauth_token.CLIENT_ID,
      CLIENT_SECRET: fallbackConfig.oauth_token.CLIENT_SECRET,
    },

    fake_device: {
      DEVICE_ID: fallbackConfig.fake_device.DEVICE_ID,
      UUID: fallbackConfig.fake_device.UUID,
      PACKAGE_NAME: fallbackConfig.fake_device.PACKAGE_NAME,
    },

    user: {
      USERNAME: null,
      PASSWORD: null,
      TOKEN: null,
      UID: null,
    },
  };

  constructor(config = {}) {
    this.#config = { ...this.#config, ...config };
  }

  _performRequest(method, request) {
    return new Promise(function (resolve, reject) {
      method(request, function (error, result) {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  _getAuthHeader() {
    return {
      Authorization: "OAuth " + this.#config.user.TOKEN,
    };
  }

  /**
   * Authentication:
   * Step one: Get an authorization code.
   * Step two: Exchange code to receive an access_token for the user.
   * @returns {Promise}
   */
  init(config) {
    // Skip authorization if access_token and uid are present
    if (config.access_token && config.uid) {
      this.#config.user.TOKEN = config.access_token;
      this.#config.user.UID = config.uid;
      return Promise.resolve({
        access_token: config.access_token,
        uid: config.uid,
      });
    }

    this.#config.user.USERNAME = config.username;
    this.#config.user.PASSWORD = config.password;

    // Authorization: step one
    const request = get().setPath("/1/token").setBodyData({
      grant_type: "password",
      username: this.#config.user.USERNAME,
      password: this.#config.user.PASSWORD,
      client_id: this.#config.ouath_code.CLIENT_ID,
      client_secret: this.#config.ouath_code.CLIENT_SECRET,
    });

    return this._performRequest(rest.post.bind(rest), request).then(function (
      data
    ) {
      // Authorization: step two
      const request = get()
        .setPath("/1/token")
        .setQuery({
          device_id: this._config.fake_device.DEVICE_ID,
          uuid: this._config.fake_device.UUID,
          package_name: this._config.fake_device.PACKAGE_NAME,
        })
        .setBodyData({
          grant_type: "x-token",
          access_token: data.access_token,
          client_id: this._config.oauth_token.CLIENT_ID,
          client_secret: this._config.oauth_token.CLIENT_SECRET,
        });

      return this._performRequest(rest.post.bind(rest), request).then(function (
        token
      ) {
        // Store user token and uid for other requests
        this._config.user.TOKEN = token.access_token;
        this._config.user.UID = token.uid;

        token.expires_on = new Date(
          new Date().getTime() + token.expires_in * 1000
        );

        return token;
      });
    });
  }

  /**
   * GET: /account/status
   * Get account status for curren user
   * @returns {Promise}
   */
  getAccountStatus() {
    const request = _get()
      .setPath("/account/status")
      .addHeaders(this._getAuthHeader());

    return this._performRequest(rest.get.bind(rest), request);
  }

  /**
   * GET: /feed
   * Get the user's feed
   * @returns {Promise}
   */
  getFeed() {
    const request = _get().setPath("/feed").addHeaders(this._getAuthHeader());

    return this._performRequest(rest.get.bind(rest), request);
  }

  /**
   * GET: /genres
   * Get a list of music genres
   * @returns {Promise}
   */
  getGenres() {
    const request = _get().setPath("/genres").addHeaders(this._getAuthHeader());

    return this._performRequest(rest.get.bind(rest), request);
  }

  /**
   * GET: /search
   * Search artists, tracks, albums.
   * @param   {String} query     The search query.
   * @param   {Object} [options] Options: type {String} (artist|album|track|all),
                                          page {Int},
                                          nococrrect {Boolean}
   * @returns {Promise}
   */
  search(query, options) {
    const opts = options || {};
    const request = _get()
      .setPath("/search")
      .addHeaders(this._getAuthHeader())
      .setQuery({
        type: opts["type"] || "all",
        text: query,
        page: opts["page"] || 0,
        nococrrect: opts["nococrrect"] || false,
      });

    return this._performRequest(rest.get.bind(rest), request);
  }

  /**
   * GET: /users/[user_id]/playlists/list
   * Get a user's playlists.
   * @param   {String} userId The user ID, if null then equal to current user id
   * @returns {Promise}
   */
  getUserPlaylists(userId) {
    const request = _get()
      .setPath(
        "/users/" + (userId || this.#config.user.UID) + "/playlists/list"
      )
      .addHeaders(this._getAuthHeader());

    return this._performRequest(rest.get.bind(rest), request);
  }

  /**
   * GET: /users/[user_id]/playlists/[playlist_kind]
   * Get a playlist without tracks
   * @param   {String} userId       The user ID, if null then equal to current user id
   * @param   {String} playlistKind The playlist ID.
   * @returns {Promise}
   */
  getPlaylist(userId, playlistKind) {
    const request = _get()
      .setPath(
        "/users/" +
          (userId || this.#config.user.UID) +
          "/playlists/" +
          playlistKind
      )
      .addHeaders(this._getAuthHeader());

    return this._performRequest(rest.get.bind(rest), request);
  }

  /**
   * GET: /users/[user_id]/playlists
   * Get an array of playlists with tracks
   * @param   {Array|string}  playlistKind The playlists ID.
   * @param   {String} [userId]     The user ID, if null then equal to current user id
   * @param   {Object} [options]    Options: mixed {Boolean}, rich-tracks {Boolean}
   * @returns {Promise}
   */
  getPlaylists(playlists, userId, options) {
    const opts = options || {},
      user = userId || this.#config.user.UID,
      plists = Array.isArray(playlists) ? playlists.join() : playlists || "";

    const request = _get()
      .setPath("/users/" + user + "/playlists")
      .addHeaders(this._getAuthHeader())
      .setQuery({
        kinds: plists,
        mixed: opts["mixed"] || false,
        "rich-tracks": opts["rich-tracks"] || false,
      });

    return this._performRequest(rest.get.bind(rest), request);
  }

  /**
   * POST: /users/[user_id]/playlists/create
   * Create a new playlist
   * @param   {String} name      The name of the playlist
   * @param   {Object} [options] Options: visibility {String} (public|private)
   * @returns {Promise}
   */
  createPlaylist(name, options) {
    const opts = options || {};
    const request = _get()
      .setPath("/users/" + this.#config.user.UID + "/playlists/create")
      .addHeaders(this._getAuthHeader())
      .setBodyData({
        title: name,
        visibility: opts.visibility || "private",
      });

    return this._performRequest(rest.post.bind(rest), request);
  }

  /**
   * POST: /users/[user_id]/playlists/[playlist_kind]/delete
   * Remove a playlist
   * @param   {String} userId       The user ID, if null then equal to current user id
   * @param   {String} playlistKind The playlist ID.
   * @returns {Promise}
   */
  removePlaylist(playlistKind) {
    const request = _get()
      .setPath(
        "/users/" +
          this.#config.user.UID +
          "/playlists/" +
          playlistKind +
          "/delete"
      )
      .addHeaders(this._getAuthHeader());

    return this._performRequest(rest.post.bind(rest), request);
  }

  /**
   * POST: /users/[user_id]/playlists/[playlist_kind]/name
   * Change playlist name
   * @param   {String} playlistKind The playlist ID.
   * @param   {String} name         New playlist name.
   * @returns {Promise}
   */
  renamePlaylist(playlistKind, name) {
    const request = _get()
      .setPath(
        "/users/" +
          this.#config.user.UID +
          "/playlists/" +
          playlistKind +
          "/name"
      )
      .addHeaders(this._getAuthHeader())
      .setBodyData({
        value: name,
      });

    return this._performRequest(rest.post.bind(rest), request);
  }

  /**
   * POST: /users/[user_id]/playlists/[playlist_kind]/change-relative
   * Add tracks to the playlist
   * @param   {String}   playlistKind The playlist's ID.
   * @param   {Object[]} tracks       An array of objects containing a track info:
                                      track id and album id for the track.
                                      Example: [{id:'20599729', albumId:'2347459'}]
   * @param   {String}   revision     Operation id for that request
   * @param   {Object}   [options]    Options: at {Int}
   * @returns {Promise}
   */
  addTracksToPlaylist(playlistKind, tracks, revision, options) {
    const opts = options || {};
    const request = _get()
      .setPath(
        "/users/" +
          this.#config.user.UID +
          "/playlists/" +
          playlistKind +
          "/change-relative"
      )
      .addHeaders(this._getAuthHeader())
      .setBodyData({
        diff: JSON.stringify([
          {
            op: "insert",
            at: opts.at || 0,
            tracks: tracks,
          },
        ]),
        revision: revision,
      });

    return this._performRequest(rest.post.bind(rest), request);
  }

  /**
   * POST: /users/[user_id]/playlists/[playlist_kind]/change-relative
   * Remove tracks from the playlist
   * @param   {String}   playlistKind The playlist's ID.
   * @param   {Object[]} tracks       An array of objects containing a track info:
                                      track id and album id for the track.
                                      Example: [{id:'20599729', albumId:'2347459'}]
   * @param   {String}   revision     Operation id for that request
   * @param   {Object}   [options]    Options: from {Int},
                                               to {Int}
   * @returns {Promise}
   */
  removeTracksFromPlaylist(playlistKind, tracks, revision, options) {
    const opts = options || {};
    const request = _get()
      .setPath(
        "/users/" +
          this.#config.user.UID +
          "/playlists/" +
          playlistKind +
          "/change-relative"
      )
      .addHeaders(this._getAuthHeader())
      .setBodyData({
        diff: JSON.stringify([
          {
            op: "delete",
            from: opts["from"] || 0,
            to: opts["to"] || tracks.length,
            tracks: tracks,
          },
        ]),
        revision: revision,
      });

    return this._performRequest(rest.post.bind(rest), request);
  }
}
