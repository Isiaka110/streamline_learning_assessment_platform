import React, { useState, useEffect, useCallback } from 'react';
import SubmissionFormModal from './SubmissionFormModal'; // Component for submitting
import SubmissionViewerModal from './SubmissionViewerModal'; // Component for viewing

const StudentAssignmentView = ({ courseId, studentId }) => {
    const [assignments, setAssignments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
    const [isViewerModalOpen, setIsViewerModalOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [submissionToView, setSubmissionToView] = useState(null);

    const fetchAssignmentsWithSubmissions = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // NOTE: The API endpoint must ensure it returns the specific student's submission
            const res = await fetch(`/api/student/assignments?courseId=${courseId}`); 
            const data = await res.json();
            
            if (res.ok) {
                setAssignments(data.assignments);
            } else {
                setError(data.message || 'Failed to load assignments.');
            }
        } catch (err) {
            console.error('Fetch Student Assignments Error:', err);
            setError('Network error while fetching assignments.');
        } finally {
            setIsLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        if (courseId && studentId) {
            fetchAssignmentsWithSubmissions();
        }
    }, [fetchAssignmentsWithSubmissions, courseId, studentId]);

    const handleSubmissionClick = (assignment) => {
        setSelectedAssignment(assignment);
        setIsSubmissionModalOpen(true);
    };

    /** CRITICAL FIX: Closes modal and triggers a data refetch. */
    const handleSubmissionSuccess = () => {
        setIsSubmissionModalOpen(false);
        setSelectedAssignment(null);
        fetchAssignmentsWithSubmissions(); // REFRESH DATA to show updated status
    };
    
    // Viewer Handlers
    const handleViewSubmissionClick = (submission) => {
        setSubmissionToView(submission);
        setIsViewerModalOpen(true);
    };

    const styles = {
        // ... (Styles object from previous response)
        container: { marginTop: '10px' },
        title: { fontSize: '1.4em', color: '#1f2937', marginBottom: '15px' },
        assignmentCard: { border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px', marginBottom: '15px', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
        assignmentHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
        assignmentTitle: { fontSize: '1.2em', color: '#3b82f6', margin: 0 },
        dueDate: { fontSize: '0.9em', color: '#6b7280' },
        description: { fontSize: '0.95em', color: '#4b5563', lineHeight: '1.5', whiteSpace: 'pre-wrap' },
        points: { fontSize: '0.9em', color: '#374151', fontWeight: 'bold' },
        statusBlock: { marginTop: '15px', padding: '10px', borderRadius: '6px', backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb' },
        statusText: { fontSize: '0.9em', color: '#4b5563', marginBottom: '5px' },
        gradeText: { fontSize: '1.1em', fontWeight: 'bold', color: '#10b981' },
        noGrade: { color: '#f59e0b' }, // Changed to amber/yellow for 'Pending'
        gradedLock: { color: '#ef4444', fontWeight: 'bold' }, // Added style for lock message
        buttonRow: { marginTop: '15px', display: 'flex', gap: '10px', alignItems: 'center' },
        submitButton: { padding: '8px 15px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
        viewSubmissionButton: { padding: '8px 15px', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
        pastDue: { color: '#ef4444', fontWeight: 'bold' },
        submittedStatus: { color: '#10b981', fontWeight: 'bold' },
        notSubmittedStatus: { color: '#f59e0b', fontWeight: 'bold' },
        info: { padding: '15px', backgroundColor: '#eff6ff', color: '#1d4ed8', borderRadius: '4px', textAlign: 'center' },
        error: { padding: '15px', backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: '4px', marginBottom: '20px' },
    };

    if (isLoading) return <p style={styles.info}>Loading assignments...</p>;
    if (error) return <p style={styles.error}>Error: {error}</p>;

    return (
        <div style={styles.container}>
            <h3 style={styles.title}>Your Assignments and Grades</h3>
            {assignments.length === 0 ? (
                <p style={styles.info}>No assignments have been posted for this course yet.</p>
            ) : (
                assignments.map((assignment) => {
                    // CRITICAL: submission is the first (and only) element of the filtered submissions array
                    const submission = assignment.submissions[0]; 
                    
                    const isSubmitted = !!submission;
                    // ✅ FIX: Check if submission exists AND grade is set (not null/undefined)
                    const isGraded = isSubmitted && submission.grade !== null && submission.grade !== undefined;
                    
                    const dueDate = new Date(assignment.dueDate);
                    const isPastDue = new Date() > dueDate;

                    // --- Determine the Button Text and Enabled State ---
                    let buttonText = 'Submit Assignment';
                    let showUpdateButton = false;
                    
                    if (isSubmitted) {
                        buttonText = 'Update Submission';
                        // Allow update ONLY if submitted AND NOT graded
                        showUpdateButton = !isGraded; 
                    } else if (!isSubmitted) {
                        // Allow submission if not submitted (regardless of due date, though API may reject it)
                        showUpdateButton = true; 
                    }
                    
                    // If submitted and graded, the button should be hidden (showUpdateButton is false)
                    // If not submitted, the button will show 'Submit Assignment' (showUpdateButton is true)
                    // If submitted but not graded, the button will show 'Update Submission' (showUpdateButton is true)

                    return (
                        <div key={assignment.id} style={styles.assignmentCard}>
                            <div style={styles.assignmentHeader}>
                                <h4 style={styles.assignmentTitle}>{assignment.title}</h4>
                                <span style={styles.dueDate}>
                                    Due: {dueDate.toLocaleDateString()} {dueDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                    {isPastDue && !isSubmitted && <span style={styles.pastDue}> (Past Due)</span>}
                                </span>
                            </div>
                            <p style={styles.points}>Max Points: {assignment.maxPoints}</p>
                            <p style={styles.description}>{assignment.description}</p>

                            <div style={styles.statusBlock}>
                                <p style={styles.statusText}>
                                    Submission Status: {' '}
                                    <span style={isSubmitted ? styles.submittedStatus : styles.notSubmittedStatus}>
                                        {isSubmitted ? 'Submitted' : 'Not Submitted'}
                                    </span>
                                </p>
                                <p style={styles.statusText}>
                                    Grade: {' '}
                                    {isGraded ? (
                                        <span style={styles.gradeText}>{submission.grade} / {assignment.maxPoints}</span>
                                    ) : (
                                        <span style={styles.noGrade}>{isSubmitted ? 'Pending' : 'N/A'}</span>
                                    )}
                                </p>
                                {isSubmitted && submission.feedback && (
                                    <p style={styles.statusText}>
                                        Feedback: 
                                        <span style={{fontWeight: 'normal', marginLeft: '5px'}}>{submission.feedback}</span>
                                    </p>
                                )}
                            </div>

                            <div style={styles.buttonRow}>
                                
                                {showUpdateButton ? (
                                    // Show button for Submit OR Update (if not graded)
                                    <button 
                                        onClick={() => handleSubmissionClick(assignment)} 
                                        style={styles.submitButton}
                                    >
                                        {isSubmitted ? 'Update Submission' : 'Submit Assignment'}
                                    </button>
                                ) : isGraded ? (
                                    // Show lock message if the submission is graded
                                    <p style={styles.gradedLock}>Submission Graded. Updates Locked.</p>
                                ) : null} 
                                

                                {isSubmitted && (submission.filePath || submission.submissionText) && (
                                    <button 
                                        onClick={() => handleViewSubmissionClick(submission)} 
                                        style={styles.viewSubmissionButton}
                                    >
                                        View My Submission
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })
            )}

            {isSubmissionModalOpen && selectedAssignment && (
                <SubmissionFormModal
                    assignment={selectedAssignment}
                    studentId={studentId}
                    onClose={() => setIsSubmissionModalOpen(false)}
                    onSuccess={handleSubmissionSuccess}
                />
            )}

            {isViewerModalOpen && submissionToView && (
                <SubmissionViewerModal
                    submission={submissionToView}
                    onClose={() => setIsViewerModalOpen(false)}
                />
            )}
        </div>
    );
};

export default StudentAssignmentView;