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
        if (userId === currentUserId) return "Me";
        return userNames[userId] || 'Other';
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-border">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Direct Chat Active</span>
                </div>
                <div className="relative">
                    <textarea 
                        placeholder="Type a message to your teacher or student..." 
                        className="w-full h-[100px] px-4 py-4 bg-gray-50 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-2xl outline-none transition-all text-sm resize-none"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        disabled={!otherUserId || isSubmitting}
                    />
                    <div className="mt-4 flex justify-end">
                        <button 
                            className={`px-8 py-3 font-bold rounded-xl shadow-sm transition-all transform active:scale-95 text-xs flex items-center gap-2 ${!otherUserId || isSubmitting || !newComment.trim() ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'btn-primary'}`}
                            onClick={handleSubmitComment}
                            disabled={!otherUserId || isSubmitting || !newComment.trim()}
                        >
                            {isSubmitting ? 'Sending...' : (
                                <>
                                    Send Message
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto px-1 pb-4 flex flex-col scrollbar-hide">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-2 opacity-50">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-[10px] font-bold uppercase tracking-widest">Loading history...</p>
                    </div>
                ) : comments.length === 0 ? (
                    <div className="py-16 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                        <p className="text-lg font-bold text-gray-400">No messages yet</p>
                        <p className="text-xs text-secondary mt-1">Start the conversation by sending a message above.</p>
                    </div>
                ) : (
                    comments.map(msg => (
                        <div 
                            key={msg.id} 
                            className={`flex flex-col max-w-[80%] ${isCurrentUserSender(msg.senderId) ? 'self-end items-end' : 'self-start items-start'}`}
                        >
                            <div className="flex items-center gap-2 mb-1 px-2">
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${isCurrentUserSender(msg.senderId) ? 'text-secondary opacity-60' : 'text-primary'}`}>
                                    {getDisplayName(msg.senderId)}
                                </span>
                            </div>
                            
                            <div className={`p-4 rounded-2xl shadow-sm ${isCurrentUserSender(msg.senderId) ? 'bg-primary text-white rounded-tr-none' : 'bg-white text-foreground rounded-tl-none border border-border'}`}>
                                <p className="text-sm font-semibold leading-relaxed">
                                    {msg.content}
                                </p>
                            </div>
                            
                            <span className="text-[9px] font-bold text-secondary opacity-40 mt-1 px-2">
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