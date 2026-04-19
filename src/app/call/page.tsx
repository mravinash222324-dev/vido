import VideoCall from "@/components/VideoCall";

export const metadata = {
  title: 'Free WebRTC Video Call',
  description: 'A completely free video calling app using peer-to-peer technologies.',
};

export default function CallPage() {
  return (
    <div className="min-h-screen bg-[#020617] flex flex-col">
       <header className="h-14 border-b border-slate-800 bg-slate-950/50 backdrop-blur-md flex items-center justify-between px-6 z-50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center">
            <span className="text-xl">📞</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-white">
            Peer<span className="text-purple-500">Connect</span>
          </span>
        </div>
        <div className="text-xs text-slate-400 font-medium">Free P2P Video Link</div>
      </header>
      
      <main className="flex-1">
        <VideoCall />
      </main>
    </div>
  );
}
