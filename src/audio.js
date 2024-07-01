import player from 'audio-play'
import loader from 'audio-loader'
var mario=await loader('./audio.wav')
var coin=await loader('./coin.wav')
player(mario)
setTimeout(()=>player(coin),5000)