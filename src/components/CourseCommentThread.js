import React, { useState, useEffect, useCallback } from 'react';

// Polling interval (e.g., refresh every 5 seconds)
const POLLING_INTERVAL = 5000; 

function CourseCommentThread({ courseId, currentUserId, otherUserId }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // 🔑 NEW State: Store the full user names
    const [userNames, setUserNames] = useState({});
    
    // 🔑 NEW State: Track if the component is mounted to prevent state updates after unmount
    const [isMounted, setIsMounted] = useState(false);

    const isCurrentUserSender = (senderId) => senderId === currentUserId;

    // --- Core Fetch Function (Used for initial load and polling) ---
    const fetchComments = useCallback(async () => {
        // Prevent fetching if required data is missing
        if (!courseId || !currentUserId || !otherUserId) return;

        try {
            const response = await fetch(`/api/communication/messages?courseId=${courseId}`);
            const data = await response.json();

            if (response.ok) {
                // 🔑 FIX: Assuming the API now returns messages with senderName and recipientName
                const threadMessages = data.messages
                    .filter(msg => 
                        (msg.senderId === currentUserId && msg.recipientId === otherUserId) ||
                        (msg.senderId === otherUserId && msg.recipientId === currentUserId)
                    )
                    // Sort from newest to oldest (matching the API default)
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                
                // 🔑 FIX: Derive user names from the first message, if possible
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
            } else {
                console.error("Failed to fetch comments:", data.message);
            }
        } catch (error) {
            console.error("Network error fetching comments:", error);
        } finally {
             if (isMounted) {
                setLoading(false);
            }
        }
    }, [courseId, currentUserId, otherUserId, isMounted]);

    // --- Real-Time Polling Implementation ---
    useEffect(() => {
        setIsMounted(true);
        fetchComments(); // Initial fetch
        
        // Setup polling
        const intervalId = setInterval(fetchComments, POLLING_INTERVAL);

        // Cleanup function: runs when component unmounts
        return () => {
             setIsMounted(false);
             clearInterval(intervalId);
        };
    }, [fetchComments]);


    // --- Post Comment Handler ---
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

            const data = await response.json();

            if (response.ok) {
                setNewComment('');
                // Instead of only using the local object, we force a re-fetch
                // to get the message with the correct timestamp and any processing the server did.
                await fetchComments(); 
                
            } else {
                alert(`Error posting comment: ${data.message}`);
            }
        } catch (error) {
            console.error("Network error posting comment:", error);
            alert('A network error occurred while posting.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // Helper to get the display name
    const getDisplayName = (userId) => {
        if (userId === currentUserId) return "You";
        return userNames[userId] || 'Other User';
    };


    const styles = {
        // ... (Styles remain the same)
        commentBox: { display: 'flex', flexDirection: 'column', gap: '15px' },
        inputArea: { borderBottom: '1px solid #ddd', paddingBottom: '15px', marginBottom: '15px' },
        commentInput: { width: '100%', height: '80px', padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px', marginBottom: '10px', resize: 'vertical', fontSize: '0.95em' },
        commentButton: { padding: '8px 15px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', transition: 'background-color 0.2s', float: 'right' },
        warning: { color: '#dc2626', fontSize: '0.85em', marginTop: '5px' },
        thread: { display: 'flex', flexDirection: 'column', maxHeight: '350px', overflowY: 'auto', gap: '8px', paddingRight: '5px' },
        commentItem: { maxWidth: '80%', padding: '10px 12px', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', border: '1px solid #eee' },
        commentAuthor: { margin: '0', fontSize: '0.9em', color: '#1f2937' },
        commentContent: { margin: '5px 0', fontSize: '0.95em', wordWrap: 'break-word' },
        commentTime: { fontSize: '0.75em', color: '#6b7280', display: 'block', textAlign: 'right', marginTop: '5px' }
    };

    return (
        <div style={styles.commentBox}>
            <div style={styles.inputArea}>
                <textarea 
                    placeholder="Type your message or feedback here..." 
                    style={styles.commentInput}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={!otherUserId || isSubmitting}
                />
                <button 
                    style={styles.commentButton}
                    onClick={handleSubmitComment}
                    disabled={!otherUserId || isSubmitting || !newComment.trim()}
                >
                    {isSubmitting ? 'Posting...' : 'Post Message'}
                </button>
            </div>

            <div style={styles.thread}>
                {loading ? (
                    <p>Loading conversation history...</p>
                ) : comments.length === 0 ? (
                    <p>No messages yet. Start the conversation!</p>
                ) : (
                    comments.map(msg => (
                        <div 
                            key={msg.id} 
                            style={{ 
                                ...styles.commentItem,
                                backgroundColor: isCurrentUserSender(msg.senderId) ? '#e0f2fe' : '#fff', 
                                alignSelf: isCurrentUserSender(msg.senderId) ? 'flex-end' : 'flex-start',
                            }}
                        >
                            <p style={styles.commentAuthor}>
                                {/* 🔑 FIX: Show the actual user's name */}
                                <strong>{getDisplayName(msg.senderId)}:</strong>
                            </p>
                            <p style={styles.commentContent}>{msg.content}</p>
                            <span style={styles.commentTime}>
                                {new Date(msg.createdAt).toLocaleString()}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default CourseCommentThread;