import React, { useEffect, useState } from 'react'
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { ToastContainer , toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function Login() {
    const [ email , setEmail ] = useState()
    const [ interest , setInterest] = useState();
    const navigate = useNavigate();
    const API = import.meta.env.VITE_API_URL;

    const cs = async() => {
        const rs = await axios.get(`${API}/ping`);
    }

    useEffect(()=>{
        cs();
    })

    const handleSubmit = async(e)=>{
        e.preventDefault();
        setEmail("");
        setInterest("");
        const data = { email , interest };
        const res = await axios.post(`${API}/login`, data);
        console.log(res.data.message);
        if(res.data.message === "user created"){
            toast.success("Login Successful!", { position: "top-right", onClose: () => navigate("/home"),
                autoClose: 1500 })
        }
        else if(res.data.message === "user updated"){
            toast.success("User found updated Successfully!", { position: "top-right", onClose: () => navigate("/home"),
                autoClose: 1500 }); 
        }
        else{
            toast.error("failed login!", { position: "top-right", autoClose: 3000 });
        }

        if(res.data.token){
            const token = res.data.token;
            document.cookie = `token=${token}; max-age=${15 * 24 * 60 * 60}; Secure; SameSite=Strict`;
        }
    }

    useEffect(()=>{
        const token =  document.cookie.split(';').find(cookie => cookie.trim().startsWith("token="));

        if(token){
          navigate("/home");
        }
    })

  return (
    <>
    <ToastContainer/>
    <div className="h-screen w-full bg-zinc-800 flex items-center justify-center max-sm:p-5">
        <div className="bg-black text-white max-sm:w-full p-[2vw] rounded-2xl hover:border hover:border-cyan-600">
            <form onSubmit={handleSubmit}>
                <div className="flex flex-col">
                    <label className='font-bold text-[1.4vw] max-sm:text-[5vw]'>Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className='mt-2 w-[25vw] h-[8vh] max-sm:w-full outline-none py-2 px-4 hover:border hover:border-cyan-400 rounded-lg text-[1.1vw] max-sm:text-[2.5vw] max-sm:px-3 max-sm:p-1' placeholder='Enter Email.....' required={true}/>
                </div>
                <div className="flex flex-col">
                    <label className='font-bold text-[1.4vw] mt-2 max-sm:text-[5vw]'>Interest</label>
                    <textarea type="text" value={interest} onChange={e => setInterest(e.target.value)} className='mt-2 w-[25vw] h-[20vh] outline-none resize-none py-2 px-4 hover:border hover:border-cyan-400 rounded-lg text-[1.1vw] max-sm:text-[2.5vw] max-sm:w-full' placeholder='Enter Your Interest.....'/>
                </div>
                <div className="w-full h-[7vh] rounded-xl flex items-center justify-center bg-blue-800 mt-2">
                    <button className='w-full h-full cursor-pointer'>Get in!</button>
                </div>
            </form>
        </div>
    </div>
    </>
  )
}

export default Login
