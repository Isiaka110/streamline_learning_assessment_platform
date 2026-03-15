// components/ComposeMessage.js

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';

const DUMMY_RECIPIENTS = [
    { id: 'user_lecturer_123', name: 'Dr. Smith (Lecturer)', role: 'LECTURER' },
    { id: 'user_student_456', name: 'Alice Johnson (Student)', role: 'STUDENT' },
];

export default function ComposeMessage() {
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState({
    recipientId: '',
    content: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); 
  const [isError, setIsError] = useState(false);

  const senderId = session?.user?.id;
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (message) setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setIsError(false);

    if (status === 'loading' || !senderId) {
        setMessage('Session Error: User authentication required.');
        setIsError(true);
        setLoading(false);
        return;
    }

    if (!formData.recipientId || !formData.content.trim()) {
        setMessage('Validation Error: Recipient and content are required.');
        setIsError(true);
        setLoading(false);
        return;
    }
    
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: formData.recipientId,
          content: formData.content.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Communication broadcast successful.');
        setFormData({ ...formData, content: '' }); 
      } else {
        setMessage(`Transmission failure: ${data.message || 'Unknown protocol error.'}`);
        setIsError(true);
      }
    } catch (error) {
      setMessage('Network uplink failure.');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="bg-white rounded-[40px] shadow-2xl shadow-indigo-100/50 border border-gray-100 overflow-hidden relative">
        <div className="bg-indigo-600 p-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-20 -translate-y-20 blur-3xl"></div>
          <div className="relative z-10 space-y-2">
            <h2 className="text-4xl font-black tracking-tight leading-none uppercase italic">Transmit Signal</h2>
            <p className="text-indigo-100/80 text-[10px] font-black uppercase tracking-[0.2em]">Platform Encryption Secure</p>
          </div>
        </div>

        <div className="p-10">
          {message && (
            <div className={`mb-8 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center animate-in zoom-in-95 ${isError ? 'bg-rose-50 border border-rose-100 text-rose-600' : 'bg-emerald-50 border border-emerald-100 text-emerald-600'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">Target Recipient</label>
              <div className="relative">
                <select
                  name="recipientId"
                  value={formData.recipientId}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 rounded-[28px] outline-none transition-all font-bold text-gray-700 appearance-none cursor-pointer shadow-inner"
                >
                  <option value="" disabled>-- Identify Channel --</option>
                  {DUMMY_RECIPIENTS.map(user => (
                      <option key={user.id} value={user.id}>
                          {user.name}
                      </option>
                  ))}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">Secure Payload (Message)</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Type your strategic data here..."
                className="w-full min-h-[180px] p-8 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 rounded-[32px] outline-none transition-all resize-none shadow-inner font-medium text-gray-700 placeholder:text-gray-300 italic"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading || !formData.recipientId || !formData.content.trim()} 
              className={`w-full py-6 font-black rounded-[32px] shadow-2xl transition-all transform active:scale-95 uppercase tracking-widest text-[11px] flex items-center justify-center gap-4 ${loading || !formData.recipientId || !formData.content.trim() ? 'bg-gray-100 text-gray-300' : 'bg-indigo-600 text-white hover:bg-black shadow-indigo-100 hover:shadow-black/20'}`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Synchronizing Broadcast...
                </>
              ) : (
                <>
                  Engage Transmission
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
      
      <div className="mt-8 flex justify-center items-center gap-3 opacity-30">
        <div className="w-1 h-1 rounded-full bg-indigo-600"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] italic text-indigo-900">End of Transmission Form</p>
        <div className="w-1 h-1 rounded-full bg-indigo-600"></div>
      </div>
    </div>
  );
}