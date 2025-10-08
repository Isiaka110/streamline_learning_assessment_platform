// components/MessageList.js

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

// Simple status colors for messages
const STATUS_COLORS = {
  READ: '#d1fae5', // Light green
  SENT: '#eff6ff', // Light blue (for unread/newly sent)
  ARCHIVED: '#f3f4f6', // Light gray
};

export default function MessageList() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get the logged-in user's ID (needed for the API call and display logic)
  const userId = session?.user?.id; 

  useEffect(() => {
    if (status === 'loading' || !userId) return;

    const fetchMessages = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Call the GET API route we created: /api/messages/[userId]
        const response = await fetch(`/api/messages/${userId}`);
        
        if (!response.ok) {
          // Attempt to read the error message from the response body
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
  }, [userId, status]); // Re-run effect when userId or session status changes

  if (status === 'loading' || loading) {
    return <div style={styles.loading}>Loading messages...</div>;
  }
  
  if (error) {
    return <div style={styles.error}>Error loading messages: {error}</div>;
  }
  
  if (!messages.length) {
    return <div style={styles.container}>
      <h2 style={styles.heading}>Your Inbox & Sent Items</h2>
      <p style={styles.empty}>You have no messages yet. Start a conversation!</p>
      {/* Optional: Add a link to the compose message form later */}
    </div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Your Messages ({messages.length})</h2>
      
      <div style={styles.list}>
        {messages.map((message) => {
          const isIncoming = message.recipientId === userId;
          const participant = isIncoming ? message.sender : message.recipient;
          const statusColor = STATUS_COLORS[message.status] || STATUS_COLORS.SENT;

          return (
            <div key={message.id} style={{ ...styles.messageCard, backgroundColor: statusColor }}>
              <div style={styles.header}>
                <span style={styles.type}>
                  {isIncoming ? 'INBOX: From ' : 'SENT: To '}
                </span>
                <span style={styles.name}>
                  {participant.name || participant.email} ({participant.role})
                </span>
                <span style={styles.date}>
                  {new Date(message.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <p style={styles.content}>{message.content.substring(0, 150)}...</p>
              
              {/* This link would lead to a detailed view of the message later */}
              <Link href={`/messages/${message.id}`} style={styles.viewLink}>
                View Message & Reply
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Simple internal styling for component clarity
const styles = {
    container: {
        maxWidth: '800px',
        margin: '50px auto',
        padding: '20px',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        backgroundColor: '#ffffff',
    },
    heading: {
        fontSize: '1.5em',
        marginBottom: '20px',
        borderBottom: '2px solid #10b981',
        paddingBottom: '10px',
        color: '#1f2937'
    },
    list: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    },
    messageCard: {
        padding: '15px',
        borderRadius: '6px',
        borderLeft: '4px solid #10b981',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        transition: 'box-shadow 0.2s',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '5px',
        fontSize: '0.9em'
    },
    type: {
        fontWeight: 'bold',
        marginRight: '5px',
        color: '#4b5563'
    },
    name: {
        fontWeight: 'bold',
        flexGrow: 1,
        color: '#1f2937'
    },
    date: {
        color: '#6b7280',
        fontSize: '0.85em'
    },
    content: {
        marginTop: '10px',
        marginBottom: '10px',
        color: '#374151'
    },
    viewLink: {
        color: '#2563eb',
        textDecoration: 'none',
        fontSize: '0.9em',
        fontWeight: '500'
    },
    loading: {
        textAlign: 'center',
        padding: '50px',
        color: '#3b82f6'
    },
    error: {
        textAlign: 'center',
        padding: '50px',
        color: '#ef4444',
        backgroundColor: '#fee2e2',
        border: '1px solid #fca5a5',
        borderRadius: '4px'
    },
    empty: {
        textAlign: 'center',
        padding: '30px',
        color: '#6b7280',
        fontStyle: 'italic'
    }
};