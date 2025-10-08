// components/ComposeMessage.js

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';

// NOTE: In a production app, the recipient list would be fetched from 
// an API endpoint like /api/users to allow the sender to select a user.
// For now, we use a placeholder list for demonstration.
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
  const [message, setMessage] = useState(null); // Success or Error message
  const [isError, setIsError] = useState(false);

  const senderId = session?.user?.id;
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear status message on input change
    if (message) setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setIsError(false);

    if (status === 'loading' || !senderId) {
        setMessage('Error: Session is not loaded or user is not logged in.');
        setIsError(true);
        setLoading(false);
        return;
    }

    // Basic Validation
    if (!formData.recipientId || !formData.content.trim()) {
        setMessage('Error: Please select a recipient and enter a message.');
        setIsError(true);
        setLoading(false);
        return;
    }
    
    try {
      // Call the Send Message API: POST /api/messages
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // The senderId is handled by the API using the session, but it is good practice
        // to send only the data the body requires.
        body: JSON.stringify({
          recipientId: formData.recipientId,
          content: formData.content.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Message sent successfully!');
        // Clear the form content after success
        setFormData({ ...formData, content: '' }); 
        
        // NOTE: You would typically want to refresh the MessageList component here.
        
      } else {
        // API returned a non-2xx status (e.g., 400, 404, 500)
        setMessage(`Failed to send message: ${data.message || 'An unknown error occurred.'}`);
        setIsError(true);
      }
    } catch (error) {
      console.error('Network error while sending message:', error);
      setMessage('A network error occurred. Check your connection.');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Compose New Message</h2>
      
      {/* Status Message */}
      {message && (
        <p style={isError ? styles.errorText : styles.successText}>
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        
        {/* Recipient Selection */}
        <label htmlFor="recipientId" style={styles.label}>Select Recipient</label>
        <select
          id="recipientId"
          name="recipientId"
          value={formData.recipientId}
          onChange={handleChange}
          required
          disabled={loading}
          style={styles.input}
        >
          <option value="" disabled>-- Choose a user --</option>
          {DUMMY_RECIPIENTS.map(user => (
              <option key={user.id} value={user.id}>
                  {user.name}
              </option>
          ))}
          {/* Include a placeholder for testing against the logged-in user's ID to test the self-message block */}
          <option value={senderId} disabled={true}>
              (Cannot message yourself)
          </option>
        </select>

        {/* Message Content */}
        <label htmlFor="content" style={styles.label}>Message Content</label>
        <textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          required
          disabled={loading}
          rows="5"
          minLength="5"
          style={styles.textarea}
        />

        <button 
          type="submit" 
          disabled={loading || !formData.recipientId || !formData.content.trim()} 
          style={styles.button}
        >
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
}

// Simple internal styling
const styles = {
    container: {
        maxWidth: '600px',
        margin: '50px auto',
        padding: '30px',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        backgroundColor: 'white',
    },
    heading: {
        fontSize: '1.5em',
        marginBottom: '20px',
        borderBottom: '2px solid #10b981',
        paddingBottom: '10px',
        color: '#1f2937'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    label: { 
        fontWeight: 'bold', 
        marginTop: '10px',
        color: '#374151',
        fontSize: '0.9em'
    },
    input: { 
        padding: '10px', 
        border: '1px solid #d1d5db', 
        borderRadius: '4px',
        fontSize: '1em'
    },
    textarea: {
        padding: '10px', 
        border: '1px solid #d1d5db', 
        borderRadius: '4px',
        resize: 'vertical',
        fontSize: '1em'
    },
    button: { 
        padding: '12px', 
        backgroundColor: '#10b981', 
        color: 'white', 
        border: 'none', 
        borderRadius: '4px', 
        cursor: 'pointer', 
        marginTop: '20px', 
        fontSize: '1em',
        fontWeight: 'bold'
    },
    successText: { color: 'green', backgroundColor: '#e6ffe6', padding: '10px', borderRadius: '4px', textAlign: 'center' },
    errorText: { color: 'red', backgroundColor: '#ffe6e6', padding: '10px', borderRadius: '4px', textAlign: 'center' },
};