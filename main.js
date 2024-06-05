import sdl from '@kmamal/sdl'
import createContext from '@kmamal/gl'

const window = sdl.video.createWindow({
  title: "Hello, World!",
  opengl: true,
})

// Clear screen to red
const { width, height, native } = window
const gl = createContext(width, height, { window: native })
gl.clearColor(1, 0, 0, 1)
gl.clear(gl.COLOR_BUFFER_BIT)
gl.swap()