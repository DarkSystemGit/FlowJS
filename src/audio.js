import fs from 'fs'
import portAudio from 'naudiodon'
import process from 'process'
import path from 'path'
export class AudioManager{
    constructor(){
        this.tracks={}
        this.sfx={}
        this.queue={tracks:[],sfx:[]}
        this.run=0
        this.audio=new portAudio.AudioIO({outOptions: {
            channelCount: 2,
            sampleFormat: portAudio.SampleFormat16Bit,
            sampleRate: 48000,
            deviceId: -1, // Use -1 or omit the deviceId to select the default device
            closeOnError: false // Close the stream if an audio error is detected, if set false then just log the error
          }})
        process.nextTick(()=>{
            if(!this.run)
            if(this.queue.sfx.length>0){
                var sfx=this.queue.sfx.shift()
                if(!sfx.paused)sfx.data.pipe(this.audio)
            }
            if(this.queue.sfx.length>0||this.queue.tracks.length>0)this.audio.start()
        })
    }
    addTrack(track,name){
        this.tracks[name]=fs.createReadStream(track)
    }
    removeTrack(name){
        delete this.tracks[name];
    }
    playTrack(track){
        this.queue.tracks.push(this.track[track])
    }
    pauseTrack(id){
        
    }
    stopTrack(id){}
    addSFX(sfx,name){
        this.sfx[name]={data:fs.createReadStream(sfx),paused:false}
    }
    playSFX(name){
        this.queue.sfx.push(this.sfx[name])
    }
    removeSFX(name){
        delete this.sfx[name];
    }
}
var audio=new AudioManager()
audio.addSFX(path.join(process.cwd(),'audio.wav'),'mario')
audio.playSFX('mario')
audio.playSFX('mario')