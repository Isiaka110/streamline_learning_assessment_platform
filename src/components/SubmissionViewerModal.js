
// components/SubmissionViewerModal.js

import React from 'react';

const SubmissionViewerModal = ({ submission, onClose }) => {
    if (!submission) return null;

    // A simple, unstyled backdrop for modal functionality
    const modalStyles = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    };

    const contentStyles = {
        padding: '30px',
        backgroundColor: 'white',
        borderRadius: '8px',
        maxWidth: '700px',
        width: '90%',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        maxHeight: '80vh',
        overflowY: 'auto',
    };

    return (
        <div style={modalStyles}>
            <div style={contentStyles}>
                <h3>Review Submission</h3>
                <hr style={{ marginBottom: '20px' }} />
                
                {submission.submissionText && (
                    <div style={{ marginBottom: '20px', border: '1px solid #e5e7eb', padding: '15px', borderRadius: '4px' }}>
                        <h4 style={{ marginTop: 0, color: '#3b82f6' }}>Submitted Text:</h4>
                        <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{submission.submissionText}</p>
                    </div>
                )}

                {submission.filePath && (
                    <div style={{ marginBottom: '20px' }}>
                        <h4 style={{ color: '#3b82f6' }}>Submitted File:</h4>
                        {/* Check common image extensions */}
                        {submission.filePath.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
                            <>
                                <img 
                                    src={submission.filePath} 
                                    alt="Submission File" 
                                    style={{ maxWidth: '100%', maxHeight: '400px', display: 'block', margin: '10px 0', border: '1px solid #ddd' }}
                                />
                                <p style={{ fontSize: '0.9em', color: '#6b7280' }}>*The image file is displayed above.</p>
                            </>
                        ) : (
                            <p style={{ margin: '10px 0' }}>File Type: Unknown/Document</p>
                        )}
                        
                        <a href={submission.filePath} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                            <button style={{ padding: '8px 15px', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }}>
                                Open File: {submission.filePath.split('/').pop() || 'Download'}
                            </button>
                        </a>
                    </div>
                )}
                
                {!submission.submissionText && !submission.filePath && (
                    <p style={{ color: '#ef4444' }}>No content was found for this submission.</p>
                )}

                <button 
                    onClick={onClose} 
                    style={{ marginTop: '30px', padding: '10px 20px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', float: 'right' }}
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default SubmissionViewerModal;