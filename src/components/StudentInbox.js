import React, { useState } from 'react';

function StudentInbox() {
    const [view, setView] = useState('inbox'); // 'inbox', 'sent', 'compose'

    const renderView = () => {
        if (view === 'compose') {
            return (
                <div className="bg-white p-10 rounded-[40px] shadow-2xl shadow-gray-100 border border-gray-50 transform animate-in slide-in-from-bottom-10 duration-500">
                    <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-100">
                        <div className="p-4 bg-emerald-50 text-emerald-600 rounded-3xl">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </div>
                        <div>
                            <h4 className="text-3xl font-black text-gray-900 tracking-tighter">Draft New Intel</h4>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Construct encrypted message</p>
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Recipient</label>
                            <input 
                                type="text" 
                                placeholder="Lecturer Alpha or System Admin" 
                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 rounded-2xl outline-none transition-all font-bold text-gray-700 placeholder:text-gray-300" 
                            />
                        </div>
                        <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Directive Subject</label>
                            <input 
                                type="text" 
                                placeholder="Core Mission Clarification" 
                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 rounded-2xl outline-none transition-all font-bold text-gray-700 placeholder:text-gray-300" 
                            />
                        </div>
                        <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Encrypted Payload</label>
                            <textarea 
                                placeholder="Input message data..." 
                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 rounded-2xl outline-none transition-all font-medium text-gray-700 min-h-[200px] resize-none placeholder:text-gray-300"
                            ></textarea>
                        </div>
                        <button className="w-full py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-2xl shadow-indigo-100 hover:bg-black transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-[10px] mt-4">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                            Transmit Data
                        </button>
                    </div>
                </div>
            );
        }

        const messages = []; 

        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center justify-between px-2">
                    <h4 className="text-3xl font-black text-gray-900 tracking-tighter">
                        {view === 'inbox' ? 'Inbound Intel' : 'Transmitted Data'}
                    </h4>
                    <span className="px-4 py-2 bg-gray-50 border border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest rounded-2xl">
                        {messages.length} Signals
                    </span>
                </div>
                
                {messages.length === 0 ? (
                    <div className="py-32 text-center bg-gray-50/50 rounded-[40px] border-4 border-dashed border-gray-100 animate-in zoom-in-95 duration-700">
                        <div className="w-20 h-20 bg-white rounded-3xl shadow-lg flex items-center justify-center text-gray-200 mx-auto mb-8">
                             <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                        </div>
                        <p className="text-2xl font-black text-gray-300 italic tracking-tight">Signal list is currently empty.</p>
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-2 animate-pulse">Awaiting Communications</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {/* Message list would go here */}
                        <p className="text-center text-gray-400 font-black italic p-20 uppercase tracking-[0.2em] text-xs">Parsing signal stream...</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-12 p-2">
            <div className="flex flex-col md:flex-row gap-4 lg:gap-8 items-center bg-white/50 backdrop-blur-xl p-4 rounded-[32px] border border-white shadow-xl">
                <div className="flex bg-gray-100 p-2 rounded-[24px] gap-2 w-full md:w-auto">
                    <button 
                        onClick={() => setView('inbox')} 
                        className={`flex-1 md:flex-none px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${view === 'inbox' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105' : 'text-gray-400 hover:text-gray-900 hover:bg-white'}`}
                    >
                        Inbound
                    </button>
                    <button 
                        onClick={() => setView('sent')} 
                        className={`flex-1 md:flex-none px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${view === 'sent' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105' : 'text-gray-400 hover:text-gray-900 hover:bg-white'}`}
                    >
                        Transmitted
                    </button>
                </div>
                
                <button 
                    onClick={() => setView('compose')} 
                    className={`w-full md:w-auto ml-auto px-10 py-5 rounded-[24px] font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 ${view === 'compose' ? 'bg-black text-white shadow-2xl' : 'bg-emerald-500 text-white shadow-xl shadow-emerald-100 hover:scale-105 active:scale-95'}`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
                    New Comms Signal
                </button>
            </div>

            <div className="relative">
                {renderView()}
            </div>
        </div>
    );
}

export default StudentInbox;