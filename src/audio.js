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
/**
 * Manages audio playback in the application.
 */
export class AudioManager {
  /**
   * Constructs a new AudioManager instance.
   */
  constructor() {
    this.ipc = new IPC();
  }

  /**
   * Loads an audio file.
   * @param {string} path - The path to the audio file.
   * @param {string} name - The name of the audio file.
   * @returns {Promise<void>} - A Promise that resolves when the audio file is loaded.
   */
  async _loadAudio(path, name) {
    try {
      await this.ipc.send("loadTrack", { path, name });
    } catch {
      err("Error while loading audio, " + name);
    }
  }

  /**
   * Plays an audio track.
   * @param {string} name - The name of the audio track to play.
   * @param {number} volume - The volume of the audio track (1-100).
   * @param {boolean} loop - Whether to loop the audio track.
   * @param {number} rate - The playback rate of the audio track.
   * @returns {Promise<number>} - A Promise that resolves with the ID of the playing track.
   */
  async play(name, volume, loop, rate) {
    try {
      return await this.ipc.send("playTrack", { name, volume, rate, loop });
    } catch {
      err(`Error while playing: ${name}`);
    }
  }

  /**
   * Pauses a playing audio track.
   * @param {number} id - The ID of the track to pause.
   * @returns {Promise<void>} - A Promise that resolves when the track is paused.
   */
  pause(id) {
    try {
      this.ipc.send("pauseTrack", { trackId: id });
    } catch {
      err(`Error while pausing track`);
    }
  }

  /**
   * Resumes a paused audio track.
   * @param {number} id - The ID of the track to resume.
   * @returns {Promise<void>} - A Promise that resolves when the track is resumed.
   */
  resume(id) {
    try {
      this.ipc.send("resumeTrack", { trackId: id });
    } catch {
      err(`Error while resumeing track`);
    }
  }

  /**
   * Stops a playing audio track.
   * @param {number} id - The ID of the track to stop.
   * @returns {Promise<void>} - A Promise that resolves when the track is stopped.
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
