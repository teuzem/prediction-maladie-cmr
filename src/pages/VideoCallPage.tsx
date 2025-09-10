import React, { useState, useEffect, useRef } from 'react'
import { useParams, useLocation, Navigate, useNavigate } from 'react-router-dom'
import Peer from 'simple-peer'
import { motion } from 'framer-motion'
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, FileText } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'

export function VideoCallPage() {
  const { appointmentId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  
  const appointment = location.state?.appointment

  const [stream, setStream] = useState<MediaStream | null>(null)
  const [peer, setPeer] = useState<Peer.Instance | null>(null)
  const [callAccepted, setCallAccepted] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)
  const [chatMessages, setChatMessages] = useState<{ sender: string, text: string }[]>([])
  const [chatInput, setChatInput] = useState('')
  const [showChat, setShowChat] = useState(false)

  const myVideo = useRef<HTMLVideoElement>(null)
  const userVideo = useRef<HTMLVideoElement>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!user || !appointmentId) return

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream)
        if (myVideo.current) {
          myVideo.current.srcObject = currentStream
        }
        setupSignalingAndPeer(currentStream)
      })
      .catch(err => {
        console.error("Error accessing media devices.", err)
        toast.error("Impossible d'accéder à la caméra et au microphone.")
      })

    return () => {
      stream?.getTracks().forEach(track => track.stop())
      channelRef.current?.unsubscribe()
      peer?.destroy()
    }
  }, [appointmentId, user])

  const setupSignalingAndPeer = (currentStream: MediaStream) => {
    const channel = supabase.channel(`call:${appointmentId}`, {
      config: {
        presence: {
          key: user!.id,
        },
      },
    })
    channelRef.current = channel

    const isInitiator = profile?.role === 'doctor'

    const p = new Peer({
      initiator: isInitiator,
      trickle: false,
      stream: currentStream,
    })

    p.on('signal', (data) => {
      channel.send({
        type: 'broadcast',
        event: 'signal',
        payload: { senderId: user!.id, signalData: data },
      })
    })

    p.on('stream', (remoteStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = remoteStream
      }
      setCallAccepted(true)
    })

    p.on('data', (data) => {
      const message = JSON.parse(data.toString())
      setChatMessages(prev => [...prev, message])
    })

    p.on('close', () => endCall())
    p.on('error', (err) => {
      console.error('Peer error:', err)
      toast.error('Une erreur de connexion est survenue.')
    })

    channel.on('broadcast', { event: 'signal' }, ({ payload }) => {
      if (payload.senderId !== user!.id) {
        p.signal(payload.signalData)
      }
    }).subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channel.track({ online_at: new Date().toISOString() })
      }
    })

    setPeer(p)
  }

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks()[0].enabled = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const toggleCamera = () => {
    if (stream) {
      stream.getVideoTracks()[0].enabled = !isCameraOff
      setIsCameraOff(!isCameraOff)
    }
  }

  const endCall = async () => {
    setCallAccepted(false)
    peer?.destroy()
    channelRef.current?.unsubscribe()
    if (profile?.role === 'doctor') {
      await supabase.from('appointments').update({ status: 'completed' }).eq('id', appointmentId)
    }
    navigate('/appointments')
  }

  const sendChatMessage = () => {
    if (chatInput.trim() && peer) {
      const message = { sender: profile?.full_name || 'Moi', text: chatInput }
      peer.send(JSON.stringify(message))
      setChatMessages(prev => [...prev, message])
      setChatInput('')
    }
  }

  const writeReport = () => {
    const report = prompt("Veuillez rédiger le rapport de consultation :");
    if (report) {
      toast.success("Rapport enregistré (simulation). La consultation est marquée comme terminée.");
      endCall();
    }
  }

  if (!appointment) {
    return <Navigate to="/appointments" replace />
  }

  return (
    <div className="h-screen bg-secondary-900 text-white flex flex-col">
      <header className="p-4 flex justify-between items-center bg-black/20">
        <div className="font-semibold">
          Consultation avec {profile?.role === 'doctor' ? appointment.parent.full_name : `Dr. ${appointment.doctor.profile.full_name}`}
        </div>
        <div className="text-sm">ID Rendez-vous: {appointmentId?.substring(0, 8)}...</div>
      </header>

      <main className="flex-1 relative flex p-4 gap-4">
        <div className="flex-1 relative flex items-center justify-center">
          <div className="w-full h-full rounded-lg overflow-hidden bg-black flex items-center justify-center">
            <video ref={userVideo} playsInline autoPlay className={`w-full h-full object-cover transition-opacity duration-500 ${callAccepted ? 'opacity-100' : 'opacity-0'}`} />
            {!callAccepted && <div className="absolute text-center"><div className="animate-pulse mb-4"><div className="w-24 h-24 bg-secondary-700 rounded-full mx-auto"></div></div><p className="text-secondary-400">En attente de la connexion de l'autre participant...</p></div>}
          </div>
          <motion.div drag dragMomentum={false} className="absolute bottom-6 right-6 w-48 h-32 rounded-lg overflow-hidden shadow-2xl border-2 border-primary-500 cursor-grab active:cursor-grabbing">
            <video ref={myVideo} playsInline autoPlay muted className="w-full h-full object-cover" />
          </motion.div>
        </div>

        {showChat && (
          <motion.div initial={{ width: 0 }} animate={{ width: 350 }} exit={{ width: 0 }} className="bg-secondary-800 rounded-lg flex flex-col">
            <div className="p-4 border-b border-secondary-700"><h3 className="font-semibold">Chat de consultation</h3></div>
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              {chatMessages.map((msg, i) => (<div key={i} className="text-sm"><span className="font-bold text-primary-400">{msg.sender}: </span><span>{msg.text}</span></div>))}
            </div>
            <div className="p-4 border-t border-secondary-700"><input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendChatMessage()} placeholder="Écrire un message..." className="w-full bg-secondary-700 p-2 rounded-md text-white placeholder-secondary-400" /></div>
          </motion.div>
        )}
      </main>

      <footer className="p-4 bg-black/20 flex justify-center items-center">
        <div className="flex items-center space-x-4 bg-secondary-800 p-3 rounded-full shadow-lg">
          <button onClick={toggleMute} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors">{isMuted ? <MicOff className="w-5 h-5 text-yellow-400" /> : <Mic className="w-5 h-5" />}</button>
          <button onClick={toggleCamera} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors">{isCameraOff ? <VideoOff className="w-5 h-5 text-yellow-400" /> : <Video className="w-5 h-5" />}</button>
          <button onClick={() => setShowChat(!showChat)} className={`p-3 rounded-full hover:bg-white/20 transition-colors ${showChat ? 'bg-primary-600' : 'bg-white/10'}`}><MessageSquare className="w-5 h-5" /></button>
          {profile?.role === 'doctor' && (<button onClick={writeReport} className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"><FileText className="w-5 h-5" /></button>)}
          <button onClick={endCall} className="p-4 bg-red-600 rounded-full hover:bg-red-700 transition-colors"><PhoneOff className="w-6 h-6" /></button>
        </div>
      </footer>
    </div>
  )
}
