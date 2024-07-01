import { Worker, MessageChannel } from 'worker_threads'
import path from 'path'
const worker=new Worker(path.join(import.meta.dirname,'./audio.js'))