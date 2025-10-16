import React, { useState } from 'react';

function StudentInbox() {
    const [view, setView] = useState('inbox'); // 'inbox', 'sent', 'compose'

    const renderView = () => {
        if (view === 'compose') {
            return (
                <div style={styles.composeBox}>
                    <h4 style={styles.composeHeader}>Compose New Message</h4>
                    {/* NOTE: You'd need a selection for recipient (e.g., Course Lecturer) */}
                    <input type="text" placeholder="Recipient (e.g., Lecturer Name or Admin)" style={styles.input} />
                    <input type="text" placeholder="Subject" style={styles.input} />
                    <textarea placeholder="Your Message..." style={styles.textarea}></textarea>
                    <button style={styles.sendButton}>Send Message</button>
                </div>
            );
        }

        const messages = []; // Replace with fetched inbox/sent messages

        return (
            <div>
                <h4 style={styles.messageListHeader}>{view === 'inbox' ? 'Your Inbox' : 'Your Sent Items'}</h4>
                {messages.length === 0 ? (
                    <p style={styles.info}>You have no messages yet. Start a conversation!</p>
                ) : (
                    // Logic to display message list
                    <p>Display message list here...</p>
                )}
            </div>
        );
    };

    return (
        <div style={styles.container}>
            <div style={styles.navRow}>
                <button onClick={() => setView('inbox')} style={view === 'inbox' ? styles.activeNavButton : styles.navButton}>
                    Inbox (0 Unread)
                </button>
                <button onClick={() => setView('sent')} style={view === 'sent' ? styles.activeNavButton : styles.navButton}>
                    Sent Items
                </button>
                <button onClick={() => setView('compose')} style={styles.composeButton}>
                    Compose New Message
                </button>
            </div>

            {renderView()}
        </div>
    );
}

const styles = {
    container: { padding: '15px' },
    navRow: { display: 'flex', gap: '10px', borderBottom: '1px solid #ddd', paddingBottom: '10px', marginBottom: '20px' },
    navButton: { padding: '8px 15px', backgroundColor: 'transparent', border: 'none', borderRadius: '4px', cursor: 'pointer', color: '#4b5563' },
    activeNavButton: { padding: '8px 15px', backgroundColor: '#f3f4f6', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
    composeButton: { marginLeft: 'auto', padding: '8px 15px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    messageListHeader: { fontSize: '1.4em', marginBottom: '15px' },
    info: { padding: '15px', backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '4px', textAlign: 'center' },

    // Compose Styles
    composeBox: { padding: '15px', backgroundColor: '#fff', borderRadius: '8px' },
    composeHeader: { marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' },
    input: { width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px' },
    textarea: { width: '100%', height: '150px', padding: '10px', marginBottom: '15px', border: '1px solid #ccc', borderRadius: '4px', resize: 'none' },
    sendButton: { padding: '10px 20px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
};

export default StudentInbox;