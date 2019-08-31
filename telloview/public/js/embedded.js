
let videoCanvas
let player

async function init() {
  videoCanvas = document.getElementById('video-canvas')
}


const wsConnect = async function() {
  await fetch('/streamon', { method: 'POST' })

  const l = window.location
  wsUrl = `${l.protocol === 'https:' ? 'wss://' : 'ws://'}${l.hostname}:${
    l.port
  }/`

  player = new JSMpeg.Player(wsUrl, {
    canvas: videoCanvas,
    audio: false,
    videoBufferSize: 512 * 1024,
    preserveDrawingBuffer: true,
    onPlay: p => {
    }
  })
}

const wsDisconnect = async function() {
  await fetch('/streamoff', { method: 'POST' })
}

// ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  setTimeout(init, 500)
}
