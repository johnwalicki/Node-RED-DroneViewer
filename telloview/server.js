// Use to serve a raw MPEG-TS over WebSockets
// For example: ffmpeg -> server -> browser

const path = require('path')
const { spawn } = require('child_process')

const TelloSDK = require('./telloSDK')

const ws = require('ws')
const express = require('express')
const cfenv = require('cfenv').getAppEnv()
const app = express()

// path to accept the incoming MPEG-TS stream
const TELLO_VIDEO_PORT = 11111
const TELLO_HOST = '192.168.10.1'

const HOST = cfenv.isLocal ? 'localhost' : cfenv.bind
const PORT = cfenv.isLocal ? 3000 : cfenv.port

const telloSDK = new TelloSDK()

app.use(express.static(path.join(__dirname, 'public')))

app.post(`/streamon`, async (req, res) => {
  console.log('Starting stream.')
  await telloSDK.sendCommand('command')
  await telloSDK.sendCommand('streamon')
  res.end()
})

app.post(`/streamoff`, async (req, res) => {
  console.log('Stopping stream.')
  await telloSDK.sendCommand('command')
  await telloSDK.sendCommand('streamoff')
  res.end()
})

app.get(`/battery`, async (req, res) => {
  await telloSDK.sendCommand('command')
  const batteryLevel = await telloSDK.sendCommand('battery?')
  res.send(batteryLevel)
})

app.post(`/tellostream`, (req, res) => {
  res.connection.setTimeout(0)

  console.log(
    `Stream Connected: ${req.socket.remoteAddress}:${req.socket.remotePort}`
  )

  req.on('data', function(data) {
    wsServer.broadcast(data)
  })

  req.on('end', function() {
    console.log(
      `Stream Disconnected: ${req.socket.remoteAddress}:${req.socket.remotePort}`
    )
  })
})

app.get('/', (req, res, next) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

// HTTP Server to accept incoming MPEG-TS Stream
const server = app.listen(PORT, HOST, () => {
  const host = server.address().address
  const port = server.address().port
  console.log(`Server started at http://${host}:${port}/`)
})

// Websocket Server to send video data
const wsServer = new ws.Server({ server: server })

wsServer.on('connection', function(socket, upgradeReq) {
  const remoteAddress = (upgradeReq || socket.upgradeReq).socket.remoteAddress

  console.log(
    `WebSocket Connected: ${remoteAddress} (${wsServer.clients.size} total)`
  )

  socket.on('close', function(code, message) {
    console.log(
      `WebSocket Disonnected: ${remoteAddress} (${wsServer.clients.size} total)`
    )
  })
})

wsServer.broadcast = function(data) {
  wsServer.clients.forEach(function each(client) {
    if (client.readyState === ws.OPEN) {
      client.send(data)
    }
  })
}

console.log('starting ffmpeg')
// ffmpeg -i udp://192.168.10.1:11111 -f mpegts -codec:v mpeg1video -s 640x480 -b:v 800k -r 20 -bf 0 http://127.0.0.1:8081/tellostream
const ffmpeg = spawn('ffmpeg', [
  '-hide_banner',
  '-i',
  `udp://${TELLO_HOST}:${TELLO_VIDEO_PORT}`,
  '-f',
  'mpegts',
  '-codec:v',
  'mpeg1video',
  '-s',
  '640x480',
  '-b:v',
  '800k',
  '-bf',
  '0',
  '-r',
  '20',
  `http://${HOST}:${PORT}/tellostream`
])

ffmpeg.stderr.on('data', data => {
  console.log(`stderr: ${data}`)
})

ffmpeg.on('close', code => {
  console.log(`child process exited with code ${code}`)
})

// Safely fill ffmpeg
const exitHandler = options => {
  if (options.cleanup) {
    ffmpeg.stderr.pause()
    ffmpeg.stdout.pause()
    ffmpeg.stdin.pause()
    ffmpeg.kill()
  }
  if (options.exit) {
    process.exit()
  }
}

process.on('exit', exitHandler.bind(null, { cleanup: true }))
process.on('SIGINT', exitHandler.bind(null, { exit: true }))
process.on('SIGUSR1', exitHandler.bind(null, { exit: true }))
process.on('SIGUSR2', exitHandler.bind(null, { exit: true }))
process.on('uncaughtException', exitHandler.bind(null, { exit: true }))
