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
    <div className="h-[calc(100vh-3.5rem)] md:h-screen w-full bg-[#020617] text-slate-200 flex flex-col relative overflow-hidden">
      
      {/* Hidden Audio element for remote audio */}
      <audio ref={remoteAudioRef} autoPlay />

      {/* Edge-to-Edge Remote Video Background */}
      <div className="absolute inset-0 z-0">
         <AnimatePresence>
            {remoteStreamState && (
              <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="w-full h-full relative bg-black"
              >
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
                    className="w-full h-full object-cover"
                  />
                  {!remoteStreamState?.active && (
                    <div className="absolute inset-0 flex items-center justify-center text-white bg-black/60 backdrop-blur-sm pointer-events-none">
                       <div className="flex flex-col items-center gap-3">
                           <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                           <span>Processing remote feed...</span>
                       </div>
                    </div>
                  )}
              </motion.div>
            )}
         </AnimatePresence>
         
         {/* Fallback pattern when no video */}
         {!remoteStreamState && (
            <div className="w-full h-full bg-[#020617] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-[#020617]">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />
            </div>
         )}
      </div>

      {/* Main Connection UI Overlay (When Not Joined) */}
      <AnimatePresence mode="wait">
        {!isJoined && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-10 flex items-center justify-center p-4"
          >
             <div className="glass bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 w-full max-w-lg shadow-2xl">
                 <div className="text-center mb-8">
                     <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 mx-auto flex items-center justify-center mb-6 shadow-lg shadow-purple-500/25">
                         <Phone className="w-8 h-8 text-white" />
                     </div>
                     <h2 className="text-3xl font-black tracking-tight text-white mb-2">Global Match</h2>
                     <p className="text-slate-400">Connect instantly to strangers globally via Metered SFU.</p>
                 </div>

                 <div className="space-y-6">
                    <div>
                        <label className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-2 block">Room Channel</label>
                        <div className="flex bg-slate-950/50 border border-slate-700/50 rounded-xl overflow-hidden focus-within:border-purple-500/50 transition-colors">
                            <input 
                                value={roomIdValue}
                                onChange={(e) => setRoomIdValue(e.target.value)}
                                placeholder="Enter any room name..."
                                className="bg-transparent flex-1 px-5 py-4 text-white placeholder:text-slate-600 outline-none text-lg font-medium"
                            />
                             <button 
                                onClick={copyToClipboard}
                                disabled={!roomIdValue}
                                className="bg-slate-800 hover:bg-slate-700 px-5 flex items-center justify-center text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                                title="Copy Room Name"
                            >
                                {copied ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <button 
                        onClick={joinMeeting}
                        disabled={!meeting || !roomIdValue}
                        className="w-full py-5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl shadow-purple-900/20 disabled:opacity-50 disabled:grayscale"
                    >
                        {!meeting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Video className="w-6 h-6" />}
                        <span>{!meeting ? 'Initializing Engine...' : 'Join Video Chat'}</span>
                    </button>
                    
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-medium pt-2">
                        <SignalHigh className="w-4 h-4 text-green-500" />
                        Status: {status}
                    </div>
                 </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Picture-in-Picture Local Video (Mirrored) */}
      <motion.div 
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        className={`absolute top-6 right-6 md:top-8 md:right-8 w-32 h-44 md:w-48 md:h-64 bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-700/50 shadow-2xl shadow-black/50 cursor-move group z-20 transition-opacity duration-500 ${!isJoined ? 'opacity-0 pointer-events-none scale-90' : 'opacity-100 scale-100'}`}
      >
         <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            style={{ transform: 'scaleX(-1)' }}
            className={`w-full h-full object-cover transition-opacity ${isVideoOff ? 'opacity-0' : 'opacity-100'}`}
          />
          {isVideoOff && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900 pointer-events-none">
                  <VideoOff className="w-8 h-8 text-slate-500" />
              </div>
          )}
          <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
             <span className="text-[10px] md:text-xs font-bold text-white shadow-black drop-shadow-md">You</span>
          </div>
      </motion.div>

       {/* In Call Controls Overlay (Omegle style bottom bar) */}
       {isJoined && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 md:gap-4 glass bg-slate-900/60 backdrop-blur-xl px-4 md:px-8 py-3 md:py-4 rounded-full border border-slate-700/50 z-20 shadow-2xl"
        >
          <div className="hidden md:flex items-center gap-2 mr-4 bg-slate-950/50 py-2 px-4 rounded-full border border-slate-800">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
             <span className="text-xs font-bold text-slate-300">Room: {roomIdValue}</span>
          </div>

          <button 
            onClick={toggleMute}
            className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${isMuted ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
          >
              {isMuted ? <MicOff className="w-5 h-5 md:w-6 md:h-6" /> : <Mic className="w-5 h-5 md:w-6 md:h-6" />}
          </button>
          
          <button 
            onClick={leaveMeeting}
            className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center transition-transform hover:scale-105 shadow-xl shadow-red-600/30 text-white mx-2"
          >
              <PhoneOff className="w-7 h-7 md:w-8 md:h-8" />
          </button>

          <button 
            onClick={toggleVideo}
            className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${isVideoOff ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
          >
              {isVideoOff ? <VideoOff className="w-5 h-5 md:w-6 md:h-6" /> : <Video className="w-5 h-5 md:w-6 md:h-6" />}
          </button>

          <button 
            onClick={leaveMeeting} // Temporarily acts as "Next" by leaving, but true omegle logic requires pairing rewrite
            className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all shadow-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 font-black text-xs uppercase ml-1 md:ml-4 border border-blue-500/20"
          >
              Next
          </button>
        </motion.div>
       )}
    </div>
  );
}
