'use client';

import React, { useState } from 'react';
import { 
  Panel, 
  PanelGroup, 
  PanelResizeHandle 
} from 'react-resizable-panels';
import { 
  SandpackProvider, 
  SandpackLayout, 
  SandpackCodeEditor, 
  SandpackPreview,
  SandpackFileExplorer,
  useSandpack
} from '@codesandbox/sandpack-react';
import { monokaiPro } from '@codesandbox/sandpack-themes';
import { 
  BookOpen, 
  Code2, 
  Play, 
  Sparkles, 
  CheckCircle2, 
  MessageSquare,
  ChevronRight,
  Zap,
  Send,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const initialCode = `import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 text-center animate-in fade-in zoom-in duration-500">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent mb-4">
          Hello React!
        </h1>
        <p className="text-slate-400 text-lg">
          Edit App.js to see the magic happen.
        </p>
        <button className="mt-8 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-full font-semibold transition-all shadow-lg hover:shadow-purple-500/25">
          Get Started
        </button>
      </div>
    </div>
  );
}`;

const lessonContent = `
# 🚀 Learning React: Components

Welcome to your first quest! Today, we're building a **Hero Component**.

### Objectives:
- [ ] Change the heading text to "Ready to Code".
- [ ] Add a new paragraph below the heading.
- [ ] Change the button color to a green gradient.

React components are the building blocks of modern web apps. They let you split the UI into independent, reusable pieces.
`;

export default function Workspace() {
  const [complete, setComplete] = useState(false);
  const [showTutor, setShowTutor] = useState(false);

  return (
    <div className="h-screen w-full bg-[#020617] text-slate-200 flex flex-col overflow-hidden">
      {/* Top Navbar */}
      <header className="h-14 border-b border-slate-800 bg-slate-950/50 backdrop-blur-md flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center glow-purple">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">AI<span className="text-purple-500">Code</span>Quest</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
             <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 uppercase font-bold tracking-widest">Leve 12</span>
                <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '65%' }}
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                    />
                </div>
             </div>
             <span className="text-[10px] text-purple-400 font-medium">1,240 / 2,000 XP</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 border-2 border-slate-700" />
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 relative">
        <SandpackProvider
          theme={monokaiPro}
          template="react"
          files={{
            "/App.js": initialCode,
          }}
          options={{
            externalResources: ["https://cdn.tailwindcss.com"],
          }}
        >
          <PanelGroup direction="horizontal">
            {/* Left Pane: Instructions */}
            <Panel defaultSize={25} minSize={20}>
              <div className="h-full bg-slate-950/30 border-r border-slate-800 p-6 flex flex-col gap-6 overflow-y-auto">
                <div className="flex items-center gap-2 text-purple-400 font-bold uppercase text-xs tracking-widest">
                  <BookOpen className="w-4 h-4" />
                  <span>The Quest</span>
                </div>
                
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown>{lessonContent}</ReactMarkdown>
                </div>

                <div className="mt-auto pt-6 border-t border-slate-800">
                  <button 
                    onClick={() => setComplete(true)}
                    className="w-full py-4 bg-slate-900 border border-slate-700 hover:border-purple-500/50 hover:bg-slate-800 rounded-xl flex items-center justify-center gap-3 transition-all group font-bold overflow-hidden relative"
                  >
                    <AnimatePresence mode="wait">
                      {complete ? (
                        <motion.div 
                            key="complete"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="flex items-center gap-2 text-green-400"
                        >
                            <CheckCircle2 className="w-5 h-5" />
                            Success! +200 XP
                        </motion.div>
                      ) : (
                        <motion.div 
                            key="check"
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="flex items-center gap-2"
                        >
                            <span>Check Solution</span>
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                </div>
              </div>
            </Panel>

            <PanelResizeHandle className="w-1 bg-slate-900 hover:bg-purple-500/40 transition-colors" />

            {/* Middle Pane: Editor */}
            <Panel defaultSize={45}>
              <div className="h-full flex flex-col overflow-hidden bg-[#0a0a0a]">
                <div className="h-10 bg-slate-900/50 border-b border-slate-800 flex items-center px-4 gap-4">
                   <div className="flex items-center gap-2 text-xs text-slate-400 border-b-2 border-purple-500 h-full px-2">
                      <Code2 className="w-3.5 h-3.5" />
                      App.js
                   </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <SandpackCodeEditor 
                    showTabs={false} 
                    showLineNumbers 
                    showInlineErrors
                    closableTabs={false}
                    className="h-full"
                    style={{ height: '100%' }}
                  />
                </div>
              </div>
            </Panel>

            <PanelResizeHandle className="w-1 bg-slate-900 hover:bg-purple-500/40 transition-colors" />

            {/* Right Pane: Preview */}
            <Panel defaultSize={30}>
              <div className="h-full flex flex-col bg-slate-950/20">
                <div className="h-10 bg-slate-900/50 border-b border-slate-800 flex items-center px-4 gap-4 justify-between">
                   <div className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-widest font-bold">
                      <Play className="w-3.5 h-3.5 text-green-500" />
                      Live Preview
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[10px] text-slate-500 font-bold">LIVE</span>
                   </div>
                </div>
                <div className="flex-1 bg-white">
                  <SandpackPreview 
                    showOpenInCodeSandbox={false} 
                    showRefreshButton={false}
                    className="h-full"
                    style={{ height: '100%' }}
                  />
                </div>
              </div>
            </Panel>
            <AITutorBubble />
          </PanelGroup>
        </SandpackProvider>
      </main>

      {/* Success Celebration Overlay */}
      <AnimatePresence>
        {complete && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
            >
                <div className="absolute inset-0 bg-purple-600/10 backdrop-blur-sm" />
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-slate-900 border-2 border-purple-500 p-8 rounded-3xl shadow-2xl shadow-purple-500/30 flex flex-col items-center gap-4 text-center pointer-events-auto"
                >
                    <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center glow-purple mb-2">
                        <Zap className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold">Quest Complete!</h2>
                    <p className="text-slate-400">You've mastered the basics of Components.</p>
                    <div className="flex gap-4 mt-4">
                        <button className="px-6 py-2 bg-slate-800 rounded-full font-bold text-sm">Review Code</button>
                        <button className="px-6 py-2 bg-purple-600 rounded-full font-bold text-sm hover:bg-purple-500 transition-colors">Next Quest</button>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AITutorBubble() {
  const [showTutor, setShowTutor] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', content: "Hey! I'm Lumi, your AI coding tutor. Need help with the objective or got a React error? Let me know!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Hook into the current code state
  const { sandpack } = useSandpack();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Get the current code being edited
      const currentCode = sandpack.files['/App.js']?.code || '';

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          codeContext: currentCode
        })
      });
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      setMessages((prev) => [...prev, { role: 'model', content: data.message }]);
    } catch (err: any) {
      setMessages((prev) => [...prev, { role: 'model', content: `Oops, an error occurred: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {showTutor && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-[350px] glass rounded-2xl flex flex-col overflow-hidden shadow-2xl border border-slate-700/50"
            style={{ maxHeight: '450px' }}
          >
            {/* Header */}
            <div className="h-12 bg-slate-900/80 border-b border-slate-700/50 flex items-center px-4 gap-2 text-purple-400 font-bold shrink-0">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>AI Tutor Lumi</span>
            </div>

            {/* Chat History */}
            <div className="p-4 flex flex-col gap-4 overflow-y-auto flex-1 bg-slate-950/40 hide-scrollbar" style={{ minHeight: '200px' }}>
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] text-sm p-3 rounded-2xl leading-relaxed ${
                    m.role === 'user' 
                      ? 'bg-purple-600 text-white rounded-br-sm' 
                      : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-sm'
                  }`}>
                    <div className="prose prose-invert prose-p:leading-snug prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-700 text-sm">
                      <ReactMarkdown>
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 text-slate-400 border border-slate-700 p-3 rounded-2xl rounded-bl-sm flex items-center gap-2 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" /> Thinking...
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-3 bg-slate-900/80 border-t border-slate-700/50 flex gap-2 shrink-0">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your code..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 text-sm focus:outline-none focus:border-purple-500 text-slate-200 py-2"
              />
              <button 
                type="submit" 
                disabled={loading || !input.trim()}
                className="w-9 h-9 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:hover:bg-purple-600 rounded-lg flex items-center justify-center transition-colors shrink-0 outline-none focus:ring-2 ring-purple-400"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      
      <button 
        onClick={() => setShowTutor(!showTutor)}
        className="w-16 h-16 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-500/20 glow-purple hover:scale-110 active:scale-95 transition-all group"
      >
        <MessageSquare className="w-7 h-7 text-white group-hover:rotate-12 transition-transform" />
        {!showTutor && <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-[#020617] rounded-full animate-bounce" />}
      </button>
    </div>
  );
}
