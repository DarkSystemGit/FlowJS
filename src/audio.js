import { Worker } from "node:worker_threads";
import crypto from "crypto";
import path from "path";
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
      this.messages[id] = (m)=>resolve(m.res);
      this.worker.postMessage({ type, id, ...params });
    });
  }
}
export class AudioManager{
    constructor(){
        this.ipc=new IPC()
    }
    /**
     * Internal method to load a audio file
     * @param {String} path Path to file
     * @param {String} name File Name
     */
    async _loadAudio(path,name){
        await this.ipc.send('loadTrack',{path,name})
    }
    /**
     * Plays a track
     * @param {String} name Track Name
     * @param {Number} volume Volume (1-100)
     * @param {Number} rate Playback Rate
     * @returns {Number} Track ID
     */
    async play(name,volume,rate){
        return await this.ipc.send('playTrack',{name,volume,rate})
    }
    /**
     * Pauses a playing track
     * @param {Number} id 
     */
    pause(id){
        this.ipc.send('pauseTrack',{trackId:id})
    }
    /**
     * Resumes a playing track
     * @param {Number} id 
     */
    resume(id){
        this.ipc.send('pauseTrack',{trackId:id})
    }
    /**
     * Stops a playing track
     * @param {Number} id 
     */
    stop(id){this.pause(id)}
}
const genUUID = () => crypto.randomBytes(16).toString("hex");


