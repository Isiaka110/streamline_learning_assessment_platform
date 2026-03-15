// components/MessageList.js

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function MessageList() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = session?.user?.id; 

  useEffect(() => {
    if (status === 'loading' || !userId) return;

    const fetchMessages = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/messages/${userId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch messages.');
        }

        const data = await response.json();
        setMessages(data.messages);
      } catch (err) {
        console.error('Fetching messages failed:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [userId, status]); 

  if (status === 'loading' || loading) {
    return (
        <div className="flex flex-col items-center justify-center p-32 gap-6 animate-pulse">
            <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-black text-emerald-600 uppercase tracking-widest text-xs">Decrypting Message Stream...</p>
        </div>
    );
  }
  
  if (error) {
    return (
        <div className="p-10 bg-rose-50 border-2 border-rose-100 rounded-[40px] text-rose-700 flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 max-w-2xl mx-auto my-20">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <p className="font-black text-xl uppercase tracking-tighter text-center">Protocol Interrupted</p>
            <p className="font-medium opacity-80 text-center">{error}</p>
        </div>
    );
  }
  
  if (!messages.length) {
    return (
        <div className="max-w-4xl mx-auto my-20 space-y-8 animate-in fade-in duration-700">
            <div className="bg-white p-10 rounded-[40px] shadow-2xl shadow-gray-100 border border-gray-100 text-center space-y-6">
                <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto text-emerald-600 border border-emerald-100">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Signal Stream Empty</h2>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">No active communications detected in this channel</p>
                </div>
                <button className="px-10 py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-xl shadow-indigo-100 hover:bg-black transition-all hover:scale-105 active:scale-95 uppercase tracking-widest text-[10px]">
                    Initialize First Signal
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-12 space-y-10 animate-in fade-in duration-700">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 bg-white p-10 rounded-[40px] shadow-2xl shadow-gray-100 border border-gray-50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 bg-emerald-600 h-full"></div>
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 italic">Communication Archive</span>
                </div>
                <h1 className="text-5xl font-black text-gray-900 tracking-tighter leading-none">
                    Signal <span className="text-emerald-600">Hub</span>
                </h1>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Processing {messages.length} Active Intel Streams</p>
            </div>
        </div>
      
        <div className="grid gap-6">
            {messages.map((message) => {
                const isIncoming = message.recipientId === userId;
                const participant = isIncoming ? message.sender : message.recipient;
                const isRead = message.status === 'READ';

                return (
                    <div 
                        key={message.id} 
                        className={`group relative bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-50 hover:-translate-y-1 flex flex-col justify-between overflow-hidden ${!isRead && isIncoming ? 'ring-2 ring-emerald-500' : ''}`}
                    >
                        {!isRead && isIncoming && (
                            <div className="absolute top-0 right-0 px-4 py-2 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest rounded-bl-[20px] shadow-lg animate-pulse">
                                New Signal
                            </div>
                        )}
                        
                        <div className="space-y-6">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg transition-transform group-hover:scale-110 ${isIncoming ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                        {participant.name?.charAt(0) || 'U'}
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${isIncoming ? 'text-emerald-500' : 'text-indigo-500'}`}>
                                                {isIncoming ? 'Inbound From' : 'Broadcast to'}
                                            </span>
                                            <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">{participant.role}</span>
                                        </div>
                                        <h4 className="text-xl font-black text-gray-900 tracking-tight group-hover:text-indigo-600 transition-colors uppercase leading-tight mt-0.5">
                                            {participant.name || participant.email}
                                        </h4>
                                    </div>
                                </div>
                                <span className="text-[10px] font-black text-gray-300 uppercase tracking-tighter tabular-nums bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                                    {new Date(message.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </span>
                            </div>
                            
                            <div className="p-6 bg-gray-50/50 rounded-[24px] border border-gray-100 group-hover:bg-white group-hover:border-indigo-100 transition-all">
                                <p className="text-sm font-medium text-gray-600 leading-relaxed italic line-clamp-2">
                                    "{message.content}"
                                </p>
                            </div>
                        </div>
                        
                        <div className="mt-8 flex justify-end">
                            <Link 
                                href={`/messages/${message.id}`} 
                                className="group/link flex items-center gap-2 px-8 py-3 bg-white border border-gray-100 text-indigo-600 font-black rounded-2xl shadow-lg shadow-gray-100 hover:bg-indigo-600 hover:text-white transition-all transform active:scale-95 uppercase tracking-widest text-[10px]"
                            >
                                Access Intel Archive
                                <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            </Link>
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
  );
}