"use client";

import { useState } from "react";
import { Bot, Send, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/api/client";

export default function AITutorPage() {
  const [messages, setMessages] = useState<{role: "assistant" | "user", content: string}[]>([
    {role: "assistant", content: "Hi there! 👋 I'm your MagEdu AI Tutor. Need help understanding Chemical Reactions, or want to practice some questions?"}
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, {role: "user", content: text}]);
    setInput("");
    setLoading(true);

    try {
      const res = await apiRequest<{message: string}>("/api/student/tutor/chat", {
        method: "POST",
        body: JSON.stringify({ message: text, skill_id: "ch01.chemical_reactions" })
      });
      setMessages(prev => [...prev, {role: "assistant", content: res.message}]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, {role: "assistant", content: "I'm sorry, I'm having trouble connecting right now. Try again?"}]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-4rem)] pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-6 space-y-4">
        <p className="text-sm font-semibold tracking-widest text-[--color-forest] uppercase">Intelligence</p>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-[--color-charcoal] lowercase">
          tutor<br />
          <span className="text-[--color-forest]">copilot.</span>
        </h1>
        <p className="text-xl text-[--color-forest-green]">Ask me anything about your Science curriculum!</p>
      </header>

      <div className="flex-1 card-brutal border-2 border-[--color-forest-green] bg-[--color-ivory] flex flex-col overflow-hidden relative">
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="w-10 h-10 rounded shadow-[2px_2px_0_0_var(--color-charcoal)] flex-shrink-0 flex items-center justify-center bg-[--color-amber] text-[#422006] border border-[#422006]">
                  <Bot className="w-5 h-5" />
                </div>
              )}
              <div className={`p-4 font-medium text-sm md:text-base border shadow-[2px_2px_0_0_var(--color-charcoal)] ${msg.role === 'user' ? 'bg-[--color-forest] text-[--color-ivory] rounded-tl-xl rounded-tr-none rounded-b-xl border-[--color-forest]' : 'bg-white text-[--color-charcoal] rounded-tr-xl rounded-tl-none rounded-b-xl border-[--color-charcoal]'}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
             <div className="flex gap-4 max-w-[85%]">
               <div className="w-10 h-10 rounded shadow-[2px_2px_0_0_var(--color-charcoal)] flex-shrink-0 flex items-center justify-center bg-[--color-amber] text-[#422006] border border-[#422006]">
                  <Bot className="w-5 h-5 animate-pulse" />
                </div>
                <div className="p-4 font-medium bg-white border border-[--color-charcoal] rounded-tr-xl rounded-tl-none rounded-b-xl shadow-[2px_2px_0_0_var(--color-charcoal)] text-[--color-sage-gray]">
                  Thinking...
                </div>
             </div>
          )}
        </div>

        <div className="p-4 bg-[--color-sage] border-t-2 border-[--color-forest-green]">
          <div className="flex gap-2 mt-0 mb-3 overflow-x-auto pb-2 scrollbar-hide">
            {["Explain Balancing Equations", "Quiz me on Acids", "What is Refraction?"].map((suggestion, i) => (
              <button 
                key={i}
                onClick={() => sendMessage(suggestion)}
                className="whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1 hover:-translate-y-[1px] transition-all bg-[--color-ivory] text-[--color-forest] border-[--color-forest] shadow-[1px_1px_0_0_var(--color-forest)]"
              >
                <Sparkles className="w-3 h-3 text-[--color-amber]" />
                {suggestion}
              </button>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="relative">
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask a question..." 
              className="w-full pl-6 pr-14 py-4 rounded-xl border-2 border-[--color-forest] bg-[#111A16] text-[--color-ivory] outline-none placeholder:text-[--color-sage-gray]"
            />
            <button 
              type="submit"
              disabled={!input || loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-lg text-[#422006] bg-[--color-amber] hover:-translate-y-[1px] transition-transform font-bold disabled:opacity-50 border border-[#422006] shadow-[2px_2px_0_0_var(--color-charcoal)]"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
