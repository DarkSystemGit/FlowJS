import player from 'audio-play'
import loader from 'audio-loader'
import {MessageChannel} from 'worker_threads'
class AudioManager{
  constructor(){
    this.assets={}
    this.playing=[]
  }
  async loadTrack(msg){
    this.assets[msg.name]=await loader(msg.path)
  }
  playTrack(msg){
    return this.playing.push(player(this.assets[msg.name],{volume:msg.volume/100||1,rate:msg.rate||1}))
  }
  pauseTrack(msg){
    this.playing[msg.trackId].pause()
  }
  resumeTrack(msg){
     this.playing[msg.trackId].play()
  }
}
const {response,cmd}=new MessageChannel()
const audio=new AudioManager()
cmd.on('message',async (msg)=>response.postMessage({id:msg.id,res:await audio[msg.type](msg)}))
