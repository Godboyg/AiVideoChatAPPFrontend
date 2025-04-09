import React, { useRef, useState, useEffect, useCallback, createElement } from "react";
import { io } from "socket.io-client";
import ReactPlayer from "react-player";
import axios from "axios";
import "./App.css";
import Cookies from 'js-cookie';
import { ToastContainer , toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useNavigate } from 'react-router-dom';
import { RiSendPlaneLine , RiCloseCircleLine , RiMessageFill, RiMessageLine} from "@remixicon/react";

const API = import.meta.env.VITE_API_URL;
console.log("api",API);
const ENDPOINT = "https://aivediochatappbackend.onrender.com/";
const socket = io(API);
if(socket){
  console.log("socket connected",socket.id)
}else{
  console.log("socket not connected");
}

function Home() {

  const navigate = useNavigate(); 
  console.log("api",API);
  
    const cs = async() => {
        const rs = await axios.get(`${API}/ping`);
    }

    useEffect(()=>{
        cs();
    })

  const [ aiMessage , setAiMessage] = useState()
  const [ messages, setMessages] = useState([]);
  const [ userConnected , setUserConnected ] = useState(false)
  const [ value , setValue ] = useState("Hey!!")
  
  const [ authenticated , setAuthenticated ] = useState(false)
  const [ localStream, setLocalStream] = useState(null);
  const [ remoteStream, setRemoteStream] = useState(null);
  const [ connected, setConnected] = useState(false);
  const peerConnectionRef = useRef(null);
  const partnerIdRef = useRef(null);

  useEffect(()=>{
    console.log(socket.id);
  })

  useEffect(()=>{
  if(socket.id){
    console.log(socket.id);
  }else{
    toast.error("socket not connected try again!" , { position : "top-right" , autoClose : 1200 })
  }
 },[])

  socket.on("connect",() => {
    console.log("socket connected",socket.id);
  })

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((mediaStream) => {
        setLocalStream(mediaStream);
      })
      .catch(console.error);


    socket.on("user found!",(m , msg , partnerSocket)=>{
      setUserConnected(true);
      console.log("partner sokcet",partnerSocket);
      partnerIdRef.current = partnerSocket;
      toast.success("user found with the interest" , { position : "top-right" , autoClose : 1500 });
      console.log("message",m);
      console.log("ai generated text",msg);
      setAiMessage(msg);
    })

    socket.on("offer", async ({ offer }) => {
      if (peerConnectionRef.current) {
        console.log("Received offer");
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        socket.emit("answer", { answer, peerId: partnerIdRef.current });
      }
    });

    socket.on("answer", async ({ answer }) => {
      if (peerConnectionRef.current) {
        console.log("Received answer");
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socket.on("candidate", async ({ candidate }) => {
      if (peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          setConnected(true);
        } catch (e) {
          console.error("Error adding received ICE candidate", e);
        }
      }
    });

    socket.on("no user!",(msg)=>{
      if(msg){
        toast.error("there is no user of your interest", { position : "top-right" , autoClose : 1000 });
      }
    })

    socket.on("other user",(list)=>{
      console.log("other users id",list);
    })

    socket.on("disconnect",()=>{
      setUserConnected(false);
      window.location.reload();
      toast.error("user disconnected" , { position : "top-right" , autoClose : 1200 });
    })

    socket.on("received-message" , (message) => {
      setMessages((prev) => [...prev, message]);
      console.log("received message", message);
    })

    socket.on("no user!" , () => {
      toast.error("there is no user to match!" , { position : "top-right" , autoClose : 1200 });
    })

    socket.on("list after connect", (val) => {
      console.log("user left after connection" , val);
      socket.emit("user left to connect", val);
    });

    socket.on("user left to reach",(val) => {
      console.log("user left after connection to connect", val);
    });

    return () => {
      socket.off("offer");

      socket.off("match-found");

      socket.off("answer");

      socket.off("candidate");

      socket.off("user found!");

      socket.off("other user");

      socket.off("disconnect");

      socket.off("received-message");
    };
  },[]);

  async function startConnection() {
    if (!localStream) return;

    const configuration = {
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    };

    const pc = new RTCPeerConnection(configuration);
    console.log(pc);
    peerConnectionRef.current = pc;

    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("candidate", { candidate: event.candidate, peerId: partnerIdRef.current });
      }
    };

    pc.ontrack = (event) => {
      console.log(event);
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      }
    };

    console.log("remote stream",remoteStream);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit("offer", { offer, peerId: partnerIdRef.current });
  }
  
  useEffect(()=>{
    startConnection();
  },[])

  function handleChangeUser(){
    window.location.reload();
  }

  useEffect(()=>{
    const token =  document.cookie.split(';').find(cookie => cookie.trim().startsWith("token="));
    console.log(token);
  if(!token){
    navigate("/");
  }
  else{
    setAuthenticated(true);
    const tk = token.replace("token=","")
  }
  },[])

  const handleLogout = async() => {
    console.log("token deleted");
    Cookies.remove('token');
    toast.success("Logout ! " , { position : "top-right" , autoClose : 500 , onClose : () =>  navigate("/") });
  }

  const sendMessage = () =>{
    const message = {
      text: value,
      sender: partnerIdRef.current,
      timestamp: Date.now(),
    };
    console.log("peerid",partnerIdRef.current)
    // setMessages((prev) => [...prev, message]);
    socket.emit("send-message", message);
    setValue("");
  }

  return (
    <>
    <ToastContainer />
    <div className="h-screen max-sm:h-screen max-sm:w-full bg-green-100 max-sm:bg-green-100">
    {
      authenticated ? (
        <div>
      <div className="flex items-center justify-between py-3 px-5 max-sm:p-7 bg-green-200 max-sm:bg-green-200">
        <h2 className="font-bold text-2xl">Soulmegal</h2>
        <button className="p-3 bg-black rounded-xl text-white hover:cursor-pointer max-sm:mr-0" onClick={handleLogout}>LogOut</button>
      </div>
      <div className="flex">
        <div className="">
        <div className="flex max-sm:flex-col max-sm:gap-25 items-center justify-center ml-10 h-[75vh] overflow-hidden w-[65vw] max-sm:w-[80vw] max-sm:h-[65vh]">
         <div className="flex items-center justify-center h-[20vh] w-full">
           {localStream && <ReactPlayer url={localStream} playing />}
         </div>
         {remoteStream ? (
          <>
          <div className="flex items-center justify-center max-sm:h-[20vh] w-full">
            <ReactPlayer
              url={remoteStream}
              playing
              width="400px"
              height="400px"
            />
          </div>
          </>
           ): (
            <p className="mt-5">Waiting for other user...</p>
           )}
         </div>
        <div className="mt-5 ml-40 max-sm:ml-30 w-[20vw] max-sm:w-[50vw] flex items-center justify-between">
         <button onClick={startConnection} className="h-16 w-24 outline-none rounded-full hover:cursor-pointer bg-black text-white max-sm:text-[4vw] max-sm:h-20">Start Call</button>
         <button onClick={handleChangeUser} className="h-16 w-24 outline-none rounded-full hover:cursor-pointer bg-black text-white max-sm:text-[4vw] max-sm:h-20">Change Call</button>
         { userConnected && <button className="h-16 w-24 max-sm:flex items-center justify-center outline-none rounded-full hover:cursor-pointer bg-black text-white max-sm:text-[4vw] max-sm:h-20 hidden" onClick={() => setUserConnected(true)}><RiMessageLine /></button> }
        </div>
        </div>
        <div className={`max-sm:w-full max-sm:absolute max-sm:p-10 w-full ${ userConnected ? "backdrop-blur-sm" : ""} `}>
        {
          userConnected ? (
            <>
            <p className="flex items-center justify-end mb-3"><RiCloseCircleLine size={30} onClick={() => setUserConnected(false)}/></p>
            <div className={`w-full p-3 bg-green-300 relative overflow-hidden ${ userConnected ? "scale-100 opacity-100" : ""}`}>
          <p className="font-bold">Ai : {aiMessage}</p>
          <div className="overflow-auto over">
            <div className="h-[70vh] w-full">
            {messages.map((msg, i) => (
          <div key={i} className={`flex mt-3 ${msg.sender === socket.id ? "justify-end" : ""}`}>
            <div
              className={`p-2 max-w-xs rounded-xl ${
                msg.sender === socket.id
                  ? "bg-green-200 rounded-br-none"
                  : "bg-white rounded-bl-none"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
            </div>
            <div className="w-full h-12 bg-black flex items-center justify-between rounded-lg absolute bottom-4 left-0">
               <input type="text" value={value} onChange={(e)=>setValue(e.target.value)} className="w-full h-full p-4 outline-none text-white" placeholder="Enter Message...."/>
               <RiSendPlaneLine className="text-white mr-3" onClick={sendMessage} size={30}/>
            </div>
          </div>
            </div>
            </>
          ) : (
            ""
          )
        }
        </div>
      </div>
    </div>
      ) : (
        <div className="w-full h-screen flex items-center bg-gray-500 justify-center">
          <p className="font-bold text-black">Loading............</p>
        </div>
      )
    }
    </div>
    </>
  );
}

export default Home;
