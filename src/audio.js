import { Worker } from "node:worker_threads";
import crypto from "crypto";
import path from "path";
import { err } from "./utils.js";
class IPC {
  constructor() {
    this.messages = {};
    this.worker = new Worker(
      path.join(import.meta.dirname, "./audioWorker.js")
    );
    this.worker.on("message", (m) => this.messages[m.id](m));
  }
  send(type, params) {
    return new Promise((resolve) => {
      var id = genUUID();
      this.messages[id] = (m) => resolve(m.res);
      this.worker.postMessage({ type, id, ...params });
    });
  }
}
export class AudioManager {
  constructor() {
    this.ipc = new IPC();
  }
  /**
   * Internal method to load a audio file
   * @param {String} path Path to file
   * @param {String} name File Name
   */
  async _loadAudio(path, name) {
    try {
      await this.ipc.send("loadTrack", { path, name });
    } catch {
      err("Error while loading audio, " + name);
    }
  }
  /**
   * Plays a track
   * @param {String} name Track Name
   * @param {Number} volume Volume (1-100)
   * @param {Boolean} loop Loop Track
   * @param {Number} rate Playback Rate
   * @returns {Number} Track ID
   */
  async play(name, volume, loop, rate) {
    try {
      return await this.ipc.send("playTrack", { name, volume, rate, loop });
    } catch {
      err(`Error while playing: ${name}`);
    }
  }
  /**
   * Pauses a playing track
   * @param {Number} id
   */
  pause(id) {
    try {
      this.ipc.send("pauseTrack", { trackId: id });
    } catch {
      err(`Error while pausing track`);
    }
  }
  /**
   * Resumes a playing track
   * @param {Number} id
   */
  resume(id) {
    try {
      this.ipc.send("resumeTrack", { trackId: id });
    } catch {
      err(`Error while resumeing track`);
    }
  }
  /**
   * Stops a playing track
   * @param {Number} id
   */
  stop(id) {
    try {
      this.pause(id);
    } catch {
      err(`Error while stopping track`);
    }
  }
}
const genUUID = () => crypto.randomBytes(16).toString("hex");
