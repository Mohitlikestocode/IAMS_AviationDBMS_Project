import React, { useState, useRef, useEffect } from 'react';

const exampleQueries = [
  "Add passenger Mohit Sharma",
  "Delete passenger 2",
  "List all passengers",
  "Add user Amit Singh",
  "Show active flights",
  "Which pilots have more than 500 flight hours?",
  "Revenue per flight",
  "Show passenger counts per flight"
];

const AiQuery = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text) => {
    if (!text.trim()) return;
    
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/ai-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text, role: localStorage.getItem('userRole') || 'ADMIN' })
      });
      const data = await response.json();
      
      if (!response.ok) {
        setMessages(prev => [...prev, { role: 'ai', error: `${data.error} \n\n${data.sql}` }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', data }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', error: 'Failed to connect to AI Core.' }]);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };
      mediaRecorder.current.onstop = sendAudioData;
      audioChunks.current = [];
      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      alert('Microphone access is required for Voice Intelligence.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      // Stop all tracks to clean up hardware light
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const sendAudioData = async () => {
    if (audioChunks.current.length === 0) return;
    const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('audio', blob, 'voice.webm');
    formData.append('role', localStorage.getItem('userRole') || 'ADMIN');

    setLoading(true);
    const tempId = Date.now();
    setMessages(prev => [...prev, { id: tempId, role: 'user', content: '🎙️ Synthesizing Voice Command...' }]);

    try {
      const response = await fetch('http://localhost:5000/api/voice-query', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      
      if (!response.ok) {
        setMessages(prev => {
          const replaceUser = prev.map(m => m.id === tempId ? { role: 'user', content: `🎙️ "${data.transcript || 'Transcribed Voice Command'}"` } : m);
          return [...replaceUser, { role: 'ai', error: `${data.error} \n\n${data.sql}` }];
        });
      } else {
        setMessages(prev => {
          const replaceUser = prev.map(m => m.id === tempId ? { role: 'user', content: `🎙️ "${data.transcript}"` } : m);
          return [...replaceUser, { role: 'ai', data }];
        });
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', error: 'Groq Voice Protocol connection failed.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <React.Fragment>
      <main className="ml-64 pt-16 h-screen flex bg-surface relative">
        <div className="flex-1 flex flex-col relative h-full">
          <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/5 blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-primary-container/5 blur-[120px] pointer-events-none"></div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-12 space-y-12 pb-48">
            {messages.length === 0 ? (
              <div className="max-w-4xl mx-auto text-center mb-16">
                <span className="px-4 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-widest uppercase mb-4 inline-block">AI Command Node</span>
                <h2 className="text-4xl font-extrabold tracking-[-0.02em] mb-4 text-on-surface">Precision SQL Intelligence</h2>
                <p className="text-on-surface-variant max-w-xl mx-auto mb-8">Query the High-Altitude Command database using natural language. Your intent is automatically translated into optimized SQL logic.</p>
                
                <div className="grid grid-cols-2 gap-3 max-w-2xl mx-auto text-left">
                  {exampleQueries.map((q, idx) => (
                     <button key={idx} onClick={() => handleSend(q)} className="p-3 bg-surface-container-high hover:bg-surface-variant rounded-xl border border-white/5 text-xs text-on-surface-variant hover:text-primary transition-colors text-left flex items-center justify-between group">
                       {q} <span className="material-symbols-outlined text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
                     </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto space-y-8">
                {messages.map((msg, index) => (
                  <div key={index}>
                    {msg.role === 'user' ? (
                      <div className="flex justify-end items-start gap-4 group">
                        <div className="bg-surface-container-high rounded-2xl rounded-tr-none px-6 py-4 max-w-lg shadow-sm border border-white/5">
                          <p className="text-on-surface text-sm leading-relaxed tracking-[-0.01em]">{msg.content}</p>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center border border-white/5">
                          <span className="material-symbols-outlined text-xs text-primary">person</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-start items-start gap-4">
                        <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center">
                          <span className="material-symbols-outlined text-xs text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                        </div>
                        <div className="flex-1 space-y-4">
                          <div className="glass-panel rounded-2xl rounded-tl-none p-6 border border-white/5 shadow-2xl">
                            {msg.error ? (
                              <p className="text-error text-sm">{msg.error}</p>
                            ) : (
                              <>
                                <p className="text-primary text-xs font-bold uppercase tracking-widest mb-3">Generated SQL Query</p>
                                <div className="bg-[#0a0e16] rounded-xl p-4 font-mono text-sm text-blue-300 border border-white/5 mb-6 overflow-x-auto whitespace-pre-wrap">
                                  {msg.data.sql}
                                </div>
                                <p className="text-on-surface text-sm mb-4">Found {msg.data.rows?.length || 0} matching records.</p>
                                
                                {msg.data.rows && msg.data.rows.length > 0 && (
                                  <div className="overflow-x-auto rounded-xl border border-white/5 bg-surface-container-lowest">
                                    <table className="w-full text-left text-xs">
                                      <thead>
                                        <tr className="bg-white/5">
                                          {msg.data.columns.map((col, i) => (
                                            <th key={i} className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">{col.name}</th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-white/5">
                                        {msg.data.rows.map((row, i) => (
                                          <tr key={i}>
                                            {msg.data.columns.map((col, j) => (
                                              <td key={j} className="px-4 py-3 text-on-surface-variant font-medium whitespace-nowrap">{String(row[col.name])}</td>
                                            ))}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                   <div className="flex justify-start items-center gap-4 text-primary text-sm font-bold animate-pulse">
                     <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center">
                        <span className="material-symbols-outlined text-xs text-on-primary-container">sync</span>
                     </div>
                     Processing intent...
                   </div>
                )}
              </div>
            )}
          </div>

          <div className="absolute bottom-0 w-full p-8 bg-gradient-to-t from-background via-background/90 to-transparent">
            <div className="max-w-4xl mx-auto relative group">
              <div className="absolute -inset-1 bg-primary/10 rounded-[2rem] blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-surface-container-highest/60 backdrop-blur-3xl rounded-[1.5rem] border border-white/10 p-2 flex items-center shadow-2xl">
                <div className="px-4 text-slate-500">
                  <span className="material-symbols-outlined">auto_awesome</span>
                </div>
                <input 
                  className="flex-1 bg-transparent border-none focus:ring-0 text-on-surface py-4 text-sm font-medium placeholder-slate-500 outline-none" 
                  placeholder="Ask in English (e.g., show all passengers from the morning flight)" 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                />
                <div className="flex items-center gap-2 pr-2">
                  <button 
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`p-2 transition-colors relative ${isRecording ? 'text-error animate-pulse' : 'text-slate-400 hover:text-primary'}`}
                  >
                    <span className="material-symbols-outlined">{isRecording ? 'stop_circle' : 'mic'}</span>
                    {isRecording && <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full block animate-ping"></span>}
                  </button>
                  <button onClick={() => handleSend(input)} className="bg-primary text-on-primary w-12 h-12 rounded-xl flex items-center justify-center hover:shadow-[0_0_20px_rgba(173,198,255,0.3)] transition-all active:scale-95">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Database Schema Sidebar */}
        <aside className="w-80 bg-surface-container-lowest border-l border-white/5 flex flex-col h-full overflow-y-auto hidden xl:flex">
          <div className="p-6 sticky top-0 bg-surface-container-lowest/90 backdrop-blur-md border-b border-white/5 z-10">
             <h3 className="text-xs font-black uppercase tracking-[0.1em] text-on-surface flex items-center gap-2">
               <span className="material-symbols-outlined text-[14px] text-primary">view_timeline</span>
               Database Schema
             </h3>
             <p className="text-[10px] text-on-surface-variant mt-1 leading-relaxed">LLM contextual representation bounds</p>
          </div>
          <div className="p-6 space-y-6">
            {[
              { t: 'airline', cols: 'airline_id, name, country' },
              { t: 'aircraft', cols: 'aircraft_id, airline_id, model, seats' },
              { t: 'airport', cols: 'airport_id, name, city, country' },
              { t: 'flight', cols: 'flight_id, airline_id, source, dest, time' },
              { t: 'seat', cols: 'seat_id, aircraft_id, number, class' },
              { t: 'passenger', cols: 'passenger_id, first_name, last_name, email, passport, phone, dob' },
              { t: 'booking', cols: 'booking_id, passenger_id, date, amount' },
              { t: 'ticket', cols: 'ticket_id, booking_id, flight_id, seat' },
              { t: 'payment', cols: 'payment_id, booking_id, method, amount' },
              { t: 'crew', cols: 'crew_id, name, role, flight_hours' },
              { t: 'audit_log', cols: 'audit_id, action, details, stamp' }
            ].map(table => (
               <div key={table.t} className="bg-surface-container-low border border-white/5 rounded-xl overflow-hidden">
                 <div className="bg-surface-container-high/50 px-3 py-2 border-b border-white/5">
                   <h4 className="text-[11px] font-bold text-primary capitalize flex items-center gap-1.5">
                     <span className="material-symbols-outlined text-[12px]">table</span> {table.t}
                   </h4>
                 </div>
                 <div className="px-3 py-2">
                   <p className="text-[10px] font-mono text-slate-400 leading-relaxed uppercase break-words">{table.cols.split(', ').join('\n')}</p>
                 </div>
               </div>
            ))}
          </div>
        </aside>
      </main>
    </React.Fragment>
  );
};

export default AiQuery;
