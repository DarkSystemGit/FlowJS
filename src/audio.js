import fs from 'fs'
import portAudio from 'naudiodon'
import process from 'process'
import path from 'path'
import util from 'util'
import {pipeline as pipeImpl} from 'stream'
const pipeline=util.promisify(pipeImpl)
export class AudioManager{
    constructor(){
        this.tracks={}
        this.sfx={}
        this.queue={tracks:[],sfx:[]}
        this.run=0
        this.sounds={}
        this.audio=new portAudio.AudioIO({outOptions: {
            channelCount: 2,
            sampleFormat: portAudio.SampleFormat16Bit,
            sampleRate: 44100,
            deviceId: -1, // Use -1 or omit the deviceId to select the default device
            closeOnError: false // Close the stream if an audio error is detected, if set false then just log the error
          }})
        setInterval(()=>{
            if(!this.run)
            Object.keys(this.sounds).forEach(song => {
                if((this.sfx[song]||this.tracks[song]).paused){this.sounds[song].pause()}else{this.sounds[song].resume()}
            });    
            if(this.queue.sfx.length>0){
                var sfx=this.queue.sfx.shift()
                this.sounds[sfx.name]=sfx.data
                pipeline(sfx.data,this.audio)
            }
            if(this.queue.tracks.length>0&&this.queue.sfx.length<1&&Object.keys(this.sounds).length==0){
                var track=this.queue.tracks.shift()
                this.sounds[track.name]=track.data
                pipeline(track.data,this.audio)
            }
            try{if(this.queue.sfx.length>0||this.queue.tracks.length>0)this.audio.start()}catch{}
        },0)
    }
    addTrack(track,name){
        this.tracks[name]={data:fs.createReadStream(track),paused:false,name}
    }
    removeTrack(name){
        delete this.tracks[name];
    }
    playTrack(track){
        this.queue.tracks.push(this.tracks[track])
    }
    pauseTrack(name){
        this.tracks[name].paused=true
    }
    stopAudio(){
        this.audio.abort()
    }
    addSFX(sfx,name){
        this.sfx[name]={data:fs.createReadStream(sfx),paused:false,name}
    }
    playSFX(name){
        this.queue.sfx.push(this.sfx[name])
    }
    removeSFX(name){
        delete this.sfx[name];
    }
}
var audio=new AudioManager()
audio.addTrack(path.join(process.cwd(),'audio.wav'),'mario')
audio.playTrack('mario')
audio.playTrack('mario')
setTimeout(()=>audio.stopAudio(),5000)