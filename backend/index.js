import express from "express";
import http from "http";
import cors from "cors";
import { Server as SocketIo } from "socket.io";
import { spawn } from 'child_process'

const app = express();
app.use(cors()); // Enable CORS for all routes

const server = http.createServer(app);
const io = new SocketIo(server, {
  cors: {
    origin: "http://localhost:5174", // Allow requests from this origin
    methods: ["GET", "POST"] // Allow only GET and POST requests
  }
});

const options = [
  '-i',
  '-',
  '-c:v', 'libx264',
  '-preset', 'ultrafast',
  '-tune', 'zerolatency',
  '-r', `${25}`,
  '-g', `${25 * 2}`,
  '-keyint_min', 25,
  '-crf', '25',
  '-pix_fmt', 'yuv420p',
  '-sc_threshold', '0',
  '-profile:v', 'main',
  '-level', '3.1',
  '-c:a', 'aac',
  '-b:a', '128k',
  '-ar', 128000 / 4,
  '-f', 'flv',
  `rtmp://a.rtmp.youtube.com/live2/vqyj-hbw6-se59-1ba9-7x6g`,
];

const ffmpegProcess = spawn('ffmpeg', options);

ffmpegProcess.stdout.on("data",data => console.log("ffmpeg data that we have: ",data))

ffmpegProcess.stderr.on("data", err => console.error("error in ffmpeg: ",err.toString()))

io.on("connection", (socket) => {
  console.log("There is a new connection", socket.id);

  socket.on("binarystream", (stream) => {
    //console.log("Incoming binary stream:", stream);
    // Process the binary stream here
    ffmpegProcess.stdin.write(stream,(e)=>console.log("error in writing stream in ffmpeg: ",e))

  });
});


server.listen(3000, () => console.log("Server is listening on port 3000"));
