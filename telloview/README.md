# Tello Streaming

This directory contains the instructions for viewing the streaming video from a Tello drone in the browser.

## Prerequisites

1. Install [`Node.js`](https://nodejs.org)
1. Install [`FFmpeg`](https://ffmpeg.org/)
1. Clone this repository
   ```
   $ git clone https://github.com/johnwalicki/Node-RED-DroneViewer
   ```  
1. Change to `telloview` directory
   ```
   $ cd Node-RED-DroneViewer/telloview
   ```  
1. Install dependencies
   ```
   $ npm install
   ```  

## Run

1. Connect computer to Tello drone WiFi
1. In a terminal window, start the server in the `telloview` directory
   ```
   $ npm start
   ```  

1. Open a browser and go to **http://localhost:3000/**.
1. Click **start stream** in the Node-RED Dashboard

You should now see a live feed from Tello drone in the browser window!

## Notes

`telloSDK.js` is a Node.js application which accesses the Tello drone, and sends commands to the Tello.

`server.js` is a Node.js/express application which listens for incoming video stream and broadcasts to clients connected via websocket. It triggers the Tello video streaming, captures the video stream, uses FFmpeg to convert the video (to MPEG-TS) and re-streams it to an HTTP endpoint.

`embedded.js` is the frontend JS which establishes a websocket connection to the server and uses `jsmpeg` to decode the video.

## Links

- [FFmpeg](https://ffmpeg.org/)
- [jsmpeg](https://jsmpeg.com/)
- [Tello](https://www.ryzerobotics.com/tello)
