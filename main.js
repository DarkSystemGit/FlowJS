import sdl from '@kmamal/sdl'

const window = sdl.video.createWindow({ resizable: true })
var newFrame;
const redraw = () => {
	const { pixelWidth: width, pixelHeight: height } = window
	const stride = width * 4
	const buffer = Buffer.alloc(stride * height)
	//buf=[x1:[y1,y2,y3,y4,y5,y6]]
	for(var i=0;i<buffer.length;i=i+4){
		var x=Math.trunc(Math.trunc(i/4)/width)
		var y=Math.trunc(i/4)%width
		if(Math.floor(256 * y / height)+Math.floor(256 * x / width)==0)console.log(x,y)
		buffer[i]= Math.floor(256 * y / height)
		buffer[i+1]= Math.floor(256 * x / width)
		buffer[i+2]=0
		buffer[i+3]=255
	}
	console.log('newFrame')
    newFrame=[width, height, stride, 'rgba32', buffer]
	
}

window
    .on('*',()=>{window.render(...newFrame)})
	.on('resize', redraw)
	.on('expose', redraw)