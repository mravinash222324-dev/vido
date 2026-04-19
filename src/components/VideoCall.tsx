'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Copy, 
  CheckCircle2, 
  UserPlus, 
  SignalHigh,
  Loader2
} from 'lucide-react';
import type Peer from 'peerjs';
import type { MediaConnection } from 'peerjs';

export default function VideoCall() {
  const [peer, setPeer] = useState<Peer | null>(null);
  const [peerId, setPeerId] = useState<string>('');
  const [remotePeerIdValue, setRemotePeerIdValue] = useState<string>('');
  
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [currentCall, setCurrentCall] = useState<MediaConnection | null>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<string>('Initializing...');

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Dynamic import to avoid SSR issues with PeerJS
    let peerInstance: Peer;

    const initPeer = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        const PeerJs = (await import('peerjs')).default;
        
        // Connect to the free default PeerJS cloud server
        peerInstance = new PeerJs({
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:global.stun.twilio.com:3478' },
              { urls: 'stun:stun.1und1.de:3478' }
            ]
          }
        });

        peerInstance.on('open', (id) => {
          setPeerId(id);
          setStatus('Ready to connect');
        });

        peerInstance.on('call', (call) => {
          // Answer automatically with our setup
          call.answer(stream);
          setCurrentCall(call);
          setStatus('In Call');

          call.on('stream', (remoteStream) => {
            setRemoteStream(remoteStream);
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
            }
          });

          call.on('close', () => {
            endCall();
          });
        });

        setPeer(peerInstance);
      } catch (err) {
        console.error("Failed to get local stream or initialize PeerJS", err);
        setStatus('Error: Microphone/Camera access denied');
      }
    };

    initPeer();

    return () => {
      if (peerInstance) {
        peerInstance.destroy();
      }
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const callRemotePeer = () => {
    if (!peer || !remotePeerIdValue || !localStream) {
      alert("System not ready or Peer ID not entered.");
      return;
    }

    setStatus('Calling...');
    const call = peer.call(remotePeerIdValue, localStream);
    setCurrentCall(call);

    call.on('stream', (remoteStream) => {
      setRemoteStream(remoteStream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
      setStatus('In Call');
    });

    call.on('close', () => {
      endCall();
    });
    
    call.on('error', (err) => {
       console.error("Call error:", err);
       setStatus('Call failed');
    });
  };

  const endCall = () => {
    if (currentCall) {
      currentCall.close();
    }
    setRemoteStream(null);
    setCurrentCall(null);
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    setStatus('Ready to connect');
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const copyToClipboard = () => {
    if (peerId) {
      navigator.clipboard.writeText(peerId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#020617] text-slate-200 flex flex-col md:flex-row p-4 gap-6 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Video Arena */}
      <div className="flex-1 flex flex-col gap-4 z-10">
        <div className="flex-1 rounded-3xl overflow-hidden glass border border-slate-800 bg-slate-900/50 shadow-2xl relative flex items-center justify-center min-h-[400px]">
          
          <AnimatePresence mode="wait">
            {!remoteStream ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center p-8 flex flex-col items-center gap-4 text-slate-500"
              >
                <div className="w-20 h-20 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center mb-4">
                  <UserPlus className="w-10 h-10 text-slate-600" />
                </div>
                <h2 className="text-2xl font-bold font-heading text-slate-300">Waiting for connection</h2>
                <p className="max-w-md">Share your ID with a friend, or paste their ID in the sidebar to start a secure P2P free video call.</p>
              </motion.div>
            ) : (
                <motion.video
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
            )}
          </AnimatePresence>

          {/* Local Video Picture-in-Picture */}
          <motion.div 
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            className="absolute bottom-6 right-6 w-48 h-64 bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl shadow-black/50 cursor-move group z-20"
          >
             <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isVideoOff ? 'opacity-0' : 'opacity-100'}`}
              />
              {isVideoOff && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                      <VideoOff className="w-8 h-8 text-slate-500" />
                  </div>
              )}
              <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none text-xs font-bold truncate">
                  You (Local)
              </div>
          </motion.div>

           {/* In Call Controls Overlay */}
           {currentCall && (
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-950/80 backdrop-blur-md px-6 py-3 rounded-full border border-slate-800 z-20"
            >
              <button 
                onClick={toggleMute}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${isMuted ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              
              <button 
                onClick={endCall}
                className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center transition-all shadow-lg shadow-red-600/20 text-white"
              >
                  <PhoneOff className="w-6 h-6" />
              </button>

              <button 
                onClick={toggleVideo}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${isVideoOff ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                  {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>
            </motion.div>
           )}
        </div>
      </div>

      {/* Sidebar Controls */}
      <div className="w-full md:w-96 flex flex-col gap-4 z-10">
        
        {/* Status Card */}
        <div className="glass bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
                  <SignalHigh className="w-5 h-5 text-purple-400" />
               </div>
               <div>
                  <h3 className="font-bold text-lg">Connection</h3>
                  <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-sm text-slate-400">{status}</span>
                  </div>
               </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2 block">Your Personal ID</label>
                    <div className="flex bg-slate-950 border border-slate-800 rounded-xl overflow-hidden focus-within:border-purple-500/50 transition-colors">
                        <input 
                            readOnly 
                            value={peerId || 'Generating...'} 
                            className="bg-transparent flex-1 px-4 py-3 text-slate-300 outline-none w-full"
                        />
                        <button 
                            onClick={copyToClipboard}
                            disabled={!peerId}
                            className="bg-slate-800 hover:bg-slate-700 px-4 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50"
                            title="Copy ID"
                        >
                            {copied ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Action Card */}
        <div className="glass bg-slate-900/50 border border-slate-800 rounded-3xl p-6 flex-1">
            <h3 className="font-bold text-lg mb-6">Connect to Peer</h3>
            <div className="space-y-4">
                <div>
                    <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2 block">Friend's ID</label>
                    <div className="flex bg-slate-950 border border-slate-800 rounded-xl overflow-hidden focus-within:border-blue-500/50 transition-colors">
                        <input 
                            value={remotePeerIdValue}
                            onChange={(e) => setRemotePeerIdValue(e.target.value)}
                            placeholder="Paste ID here..."
                            className="bg-transparent flex-1 px-4 py-3 text-slate-300 outline-none w-full placeholder:text-slate-600"
                        />
                    </div>
                </div>

                <button 
                    onClick={callRemotePeer}
                    disabled={!peer || !remotePeerIdValue || !!currentCall}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:grayscale"
                >
                    {(!peer || !localStream) ? <Loader2 className="w-5 h-5 animate-spin" /> : <Phone className="w-5 h-5" />}
                    <span>{currentCall ? 'In Call' : 'Join Call'}</span>
                </button>
            </div>

            <div className="mt-8 text-center bg-slate-950/40 border border-slate-800 p-4 rounded-2xl">
               <p className="text-xs text-slate-400 leading-relaxed">
                   This application uses free P2P WebRTC technology. Connections are handled securely directly between you and your peer without external media routing! 🚀
               </p>
            </div>
        </div>

      </div>
    </div>
  );
}
