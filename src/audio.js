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
const genUUID = () => crypto.randomBytes(16).toString("hex");
const ipc = new IPC();
console.log(await ipc.send('loadTrack',{name:'mario',path:'audio.wav'}))
