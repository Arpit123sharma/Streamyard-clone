import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client"
function App() {
  const [mediaStream, setMediaStream] = useState(null);
  const[socket,setSocket]=useState(null)
  const[mediaRecorder,setMediaRecorder] = useState(null)
  const videoRef = useRef(null);
  
  const makeCoonection=()=>{
    const newSocket=io("http://localhost:3000")
    newSocket.on('connect',()=>{
      console.log("connected to the server")
      setSocket(newSocket)
    })
  }

  
    const getMediaStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true
        });
        setMediaStream(stream);
      } catch (error) {
        console.error("Error accessing media devices:", error);
      }
      

    };

  
  useEffect(() => {
    if (mediaStream && videoRef.current) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream]);
  const starting=()=>{
    //console.log(socket);
    if (!socket) {
      
      console.log("socket is empty");
      return
    }
    const mediarecorder = new MediaRecorder(mediaStream,{
      audioBitsPerSecond:128000,
      videoBitsPerSecond:250000,
      frame:25
    })
    setMediaRecorder(mediarecorder);
    mediarecorder.start(25)
  }
  useEffect(() => {
    if (mediaRecorder && socket) {
      mediaRecorder.ondataavailable = (ev) => {
        // console.log("Data available:", ev.data);
        socket.emit("binarystream", ev.data);
      };
    }
  }, [mediaRecorder, socket]);
  
  return (
    <>
      <div>
        <button onClick={getMediaStream}>click</button>
        {mediaStream && (
          <video autoPlay muted ref={videoRef}></video>
        )}
        <button onClick={starting}>Start</button>
        <button onClick={makeCoonection}>connection</button>
      </div>
    </>
  );
}

export default App;



