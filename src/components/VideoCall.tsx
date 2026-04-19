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

export default function VideoCall() {
  const [meeting, setMeeting] = useState<any>(null);
  const [roomIdValue, setRoomIdValue] = useState<string>('lobby'); // Default simple room
  
  const [isJoined, setIsJoined] = useState(false);
  const [remoteStreamState, setRemoteStreamState] = useState<MediaStream | null>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<string>('Ready to connect');

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null); // For remote audio tracks

  // Initialize the meeting instance when Metered SDK is available
  useEffect(() => {
    // Polling to wait for sdk.min.js to inject window.Metered
    const interval = setInterval(() => {
      if ((window as any).Metered && !meeting) {
        const m = new (window as any).Metered.Meeting();
        setMeeting(m);
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [meeting]);

  const joinMeeting = async () => {
    if (!meeting || !roomIdValue) {
      alert("System not ready or Room ID not entered.");
      return;
    }

    setStatus('Joining...');
    
    try {
      // Must match your precise Metered domain
      const roomURL = `voughtinternational.metered.live/${roomIdValue}`;
      await meeting.join({ roomURL: roomURL, name: "User" });
      
      setIsJoined(true);
      setStatus('In Call');

      // Bind events before starting hardware
      setupMeetingEvents(meeting);

      // Start hardware
      try { await meeting.startVideo(); } catch (e) { console.error("Camera Error", e); }
      try { await meeting.startAudio(); } catch (e) { console.error("Mic Error", e); }
      
    } catch (e) {
      console.error("Join Error:", e);
      setStatus("Join failed (Did you create the room?)");
    }
  };

  const setupMeetingEvents = (m: any) => {
    // Handle Local Tracks
    m.on("localTrackStarted", function(item: any) {
      if (item.type === "video") {
        const track = item.track;
        const mediaStream = new MediaStream([track]);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = mediaStream;
        }
      }
      // Note: We don't play local audio to prevent echo
    });

    // Handle Remote Tracks
    m.on("remoteTrackStarted", function(remoteTrackItem: any) {
      const track = remoteTrackItem.track;
      const mediaStream = new MediaStream([track]);

      if (remoteTrackItem.type === "video") {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = mediaStream;
          remoteVideoRef.current.play().catch(e => console.error("Remote video play intercepted", e));
        }
        // Force re-render of UI
        setRemoteStreamState(mediaStream);
      }

      if (remoteTrackItem.type === "audio") {
         if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = mediaStream;
            remoteAudioRef.current.play().catch(e => console.error("Remote audio play intercepted", e));
         }
      }
    });

    m.on("participantLeft", function() {
        // If it's a 1-on-1, clear remote video implicitly when they leave
        setRemoteStreamState(null);
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    });
  };

  const leaveMeeting = async () => {
    if (meeting) {
      try {
        await meeting.leave();
      } catch(e) {
        console.error("Leave error", e);
      }
    }
    setIsJoined(false);
    setRemoteStreamState(null);
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    setStatus('Ready to connect');
  };

  const toggleMute = async () => {
    if (!meeting) return;
    if (isMuted) {
      await meeting.unmuteAudio();
    } else {
      await meeting.muteAudio();
    }
    setIsMuted(!isMuted);
  };

  const toggleVideo = async () => {
    if (!meeting) return;
    if (isVideoOff) {
      await meeting.startVideo();
    } else {
      await meeting.stopVideo();
    }
    setIsVideoOff(!isVideoOff);
  };

  const copyToClipboard = () => {
      navigator.clipboard.writeText(roomIdValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#020617] text-slate-200 flex flex-col md:flex-row p-4 gap-6 relative overflow-hidden">
      
      {/* Hidden Audio element for remote audio */}
      <audio ref={remoteAudioRef} autoPlay />

      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Video Arena */}
      <div className="flex-1 flex flex-col gap-4 z-10">
        <div className="flex-1 rounded-3xl overflow-hidden glass border border-slate-800 bg-slate-900/50 shadow-2xl relative flex items-center justify-center min-h-[400px]">
          
          <AnimatePresence mode="wait">
            {!remoteStreamState ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center p-8 flex flex-col items-center gap-4 text-slate-500"
              >
                <div className="w-20 h-20 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center mb-4">
                  <UserPlus className="w-10 h-10 text-slate-600" />
                </div>
                <h2 className="text-2xl font-bold font-heading text-slate-300">
                   {isJoined ? "Waiting for others to join..." : "Waiting to join room"}
                </h2>
                <p className="max-w-md">Join the highly-scalable Metered SFU room to instantly connect over any network globally.</p>
              </motion.div>
            ) : (
                <div className="w-full h-full relative">
                  <video
                    ref={(node) => {
                       if (node) {
                          remoteVideoRef.current = node;
                          if (node.srcObject !== remoteStreamState) {
                             node.srcObject = remoteStreamState;
                          }
                       }
                    }}
                    autoPlay
                    playsInline
                    onClick={(e) => { e.currentTarget.play() }}
                    className="w-full h-full object-cover animate-in fade-in duration-500 bg-black"
                  />
                  {!remoteStreamState?.active && (
                    <div className="absolute inset-0 flex items-center justify-center text-white bg-black/50 pointer-events-none">
                       Video feed processing...
                    </div>
                  )}
                </div>
            )}
          </AnimatePresence>

          {/* Local Video Picture-in-Picture */}
          <motion.div 
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            className={`absolute bottom-6 right-6 w-48 h-64 bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl shadow-black/50 cursor-move group z-20 transition-opacity ${!isJoined ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          >
             <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isVideoOff ? 'opacity-0' : 'opacity-100'}`}
              />
              {isVideoOff && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900 pointer-events-none">
                      <VideoOff className="w-8 h-8 text-slate-500" />
                  </div>
              )}
              <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none text-xs font-bold truncate">
                  You (Local)
              </div>
          </motion.div>

           {/* In Call Controls Overlay */}
           {isJoined && (
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
                onClick={leaveMeeting}
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
                      <span className={`w-2 h-2 rounded-full ${isJoined ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`} />
                      <span className="text-sm text-slate-400">{status}</span>
                  </div>
               </div>
            </div>
        </div>

        {/* Action Card */}
        <div className="glass bg-slate-900/50 border border-slate-800 rounded-3xl p-6 flex-1">
            <h3 className="font-bold text-lg mb-6">Connect to Room</h3>
            <div className="space-y-4">
                <div>
                    <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2 block">Enterprise Room Name</label>
                    <div className="flex bg-slate-950 border border-slate-800 rounded-xl overflow-hidden focus-within:border-blue-500/50 transition-colors">
                        <input 
                            value={roomIdValue}
                            onChange={(e) => setRoomIdValue(e.target.value)}
                            placeholder="Enter room name..."
                            className="bg-transparent flex-1 px-4 py-3 text-slate-300 outline-none w-full placeholder:text-slate-600"
                        />
                         <button 
                            onClick={copyToClipboard}
                            disabled={!roomIdValue}
                            className="bg-slate-800 hover:bg-slate-700 px-4 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50"
                            title="Copy Room ID"
                        >
                            {copied ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                        </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Any two people connecting to the same room will instantly link via the Metered SFU.</p>
                </div>

                <button 
                    onClick={isJoined ? leaveMeeting : joinMeeting}
                    disabled={!meeting || !roomIdValue}
                    className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-50 disabled:grayscale ${isJoined ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white hover:shadow-purple-500/25'}`}
                >
                    {!meeting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Phone className="w-5 h-5" />}
                    <span>{isJoined ? 'Connected (Leave)' : 'Join Video Call'}</span>
                </button>
            </div>

            <div className="mt-8 text-center bg-slate-950/40 border border-slate-800 p-4 rounded-2xl">
               <p className="text-xs text-slate-400 leading-relaxed">
                   🔥 UPGRADED to Metered Video SDK! Video is now routed securely through a carrier-agnostic SFU cluster instead of blocking P2P nodes.
               </p>
            </div>
        </div>

      </div>
    </div>
  );
}
