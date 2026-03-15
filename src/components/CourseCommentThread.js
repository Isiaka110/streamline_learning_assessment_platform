import React, { useState, useEffect, useCallback } from 'react';

const POLLING_INTERVAL = 5000; 

function CourseCommentThread({ courseId, currentUserId, otherUserId }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userNames, setUserNames] = useState({});
    const [isMounted, setIsMounted] = useState(false);

    const isCurrentUserSender = (senderId) => senderId === currentUserId;

    const fetchComments = useCallback(async () => {
        if (!courseId || !currentUserId || !otherUserId) return;

        try {
            const response = await fetch(`/api/communication/messages?courseId=${courseId}`);
            const data = await response.json();

            if (response.ok) {
                const threadMessages = data.messages
                    .filter(msg => 
                        (msg.senderId === currentUserId && msg.recipientId === otherUserId) ||
                        (msg.senderId === otherUserId && msg.recipientId === currentUserId)
                    )
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                
                if (threadMessages.length > 0) {
                    const firstMsg = threadMessages[0];
                    const names = {
                        [firstMsg.senderId]: firstMsg.senderName || 'Sender',
                        [firstMsg.recipientId]: firstMsg.recipientName || 'Recipient',
                    };
                    setUserNames(names);
                }

                if (isMounted) {
                    setComments(threadMessages);
                }
            }
        } catch (error) {
            console.error("Network error fetching comments:", error);
        } finally {
             if (isMounted) {
                setLoading(false);
            }
        }
    }, [courseId, currentUserId, otherUserId, isMounted]);

    useEffect(() => {
        setIsMounted(true);
        fetchComments(); 
        const intervalId = setInterval(fetchComments, POLLING_INTERVAL);
        return () => {
             setIsMounted(false);
             clearInterval(intervalId);
        };
    }, [fetchComments]);


    const handleSubmitComment = async () => {
        if (!newComment.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/communication/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipientId: otherUserId,
                    content: newComment.trim(),
                    courseId: courseId,
                }),
            });

            if (response.ok) {
                setNewComment('');
                await fetchComments(); 
            }
        } catch (error) {
            console.error("Network error posting comment:", error);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const getDisplayName = (userId) => {
        if (userId === currentUserId) return "Self";
        return userNames[userId] || 'External Node';
    };

    return (
        <div className="flex flex-col gap-10 animate-in fade-in duration-700">
            <div className="bg-white p-8 rounded-[40px] shadow-2xl shadow-gray-100 border border-gray-100 transform transition-all">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Encrypted Data Stream Active</span>
                </div>
                <div className="relative group">
                    <textarea 
                        placeholder="Type tactical intel or feedback here..." 
                        className="w-full h-[120px] px-8 py-6 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 rounded-[32px] outline-none transition-all font-medium text-gray-700 resize-none placeholder:text-gray-300 shadow-inner group-hover:shadow-indigo-50"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        disabled={!otherUserId || isSubmitting}
                    />
                    <div className="absolute bottom-4 right-4 flex items-center gap-4">
                        <button 
                            className={`px-10 py-4 font-black rounded-[24px] shadow-2xl transition-all transform active:scale-95 uppercase tracking-widest text-[10px] flex items-center gap-3 ${!otherUserId || isSubmitting || !newComment.trim() ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-black shadow-indigo-100 hover:shadow-black/20'}`}
                            onClick={handleSubmitComment}
                            disabled={!otherUserId || isSubmitting || !newComment.trim()}
                        >
                            {isSubmitting ? 'Transmitting...' : (
                                <>
                                    Transmit Signal
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-6 max-h-[600px] overflow-y-auto px-4 custom-scrollbar pb-10">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-30">
                        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-[10px] font-black uppercase tracking-widest italic">Syncing History...</p>
                    </div>
                ) : comments.length === 0 ? (
                    <div className="py-20 text-center bg-gray-50/50 rounded-[40px] border-4 border-dashed border-gray-100 animate-in zoom-in-95">
                        <p className="text-xl font-black text-gray-300 italic tracking-tight uppercase">No communications archived.</p>
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-2 animate-pulse">Initiate First Link</p>
                    </div>
                ) : (
                    comments.map(msg => (
                        <div 
                            key={msg.id} 
                            className={`flex flex-col max-w-[85%] animate-in slide-in-from-bottom-4 duration-500 ${isCurrentUserSender(msg.senderId) ? 'self-end items-end' : 'self-start items-start'}`}
                        >
                            <div className="flex items-center gap-2 mb-2 px-4">
                                {!isCurrentUserSender(msg.senderId) && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 ring-2 ring-indigo-50"></div>}
                                <span className={`text-[9px] font-black uppercase tracking-widest ${isCurrentUserSender(msg.senderId) ? 'text-gray-400' : 'text-indigo-600'}`}>
                                    {getDisplayName(msg.senderId)}
                                </span>
                                {isCurrentUserSender(msg.senderId) && <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>}
                            </div>
                            
                            <div className={`p-6 rounded-[32px] shadow-xl transition-transform hover:scale-[1.02] ${isCurrentUserSender(msg.senderId) ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-100' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100 shadow-gray-100'}`}>
                                <p className="text-sm font-medium leading-relaxed italic selection:bg-white/20">
                                    {msg.content}
                                </p>
                            </div>
                            
                            <span className="text-[9px] font-black text-gray-300 uppercase mt-3 px-4 tabular-nums tracking-tighter">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(msg.createdAt).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default CourseCommentThread;