// :::1::: AssignmentCreationForm.js
import React, { useState } from 'react';

const AssignmentCreationForm = ({ courseId, onSuccess, onCancel }) => {
    const [title, setTitle] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [maxPoints, setMaxPoints] = useState(100);
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (!title.trim() || !dueDate || !maxPoints) {
            setError("Please fill in Title, Due Date, and Max Points.");
            setIsLoading(false);
            return;
        }

        const assignmentData = {
            title,
            dueDate: new Date(dueDate).toISOString(), 
            maxPoints: parseInt(maxPoints, 10), 
            description,
        };

        try {
            const res = await fetch(`/api/lecturer/assignments?courseId=${courseId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(assignmentData),
            });

            const contentType = res.headers.get("content-type");
            let data = {};
            if (contentType && contentType.includes("application/json")) {
                data = await res.json();
            } else {
                const text = await res.text();
                console.error("Server Non-JSON Response (Create):", text);
                setError(`Server returned non-JSON response (Status: ${res.status}).`);
                setIsLoading(false);
                return;
            }

            if (res.ok) {
                alert("Assignment created successfully!");
                if (onSuccess) onSuccess(data.assignment);
            } else {
                setError(data.message || 'Failed to create assignment. Check server logs.');
            }
        } catch (err) {
            console.error('Assignment Creation Error:', err);
            setError('Network error while creating assignment.');
        } finally {
            setIsLoading(false);
        }
    };

    const styles = {
        form: { display: 'flex', flexDirection: 'column', gap: '15px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' },
        input: { padding: '10px', border: '1px solid #ddd', borderRadius: '4px' },
        textarea: { padding: '10px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '100px' },
        buttonRow: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' },
        cancelButton: { padding: '10px 15px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
        createButton: { padding: '10px 15px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
        header: { marginBottom: '15px', borderBottom: '1px solid #ddd', paddingBottom: '10px' },
        error: { color: '#ef4444', marginBottom: '10px' }
    };

    return (
        <form onSubmit={handleSubmit} style={styles.form}>
            <h3 style={styles.header}>Create New Assignment</h3>
            {error && <p style={styles.error}>{error}</p>}

            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                style={styles.input}
                disabled={isLoading}
            />
            <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={styles.input}
                disabled={isLoading}
            />
            <input
                type="number"
                value={maxPoints}
                onChange={(e) => setMaxPoints(e.target.value)}
                placeholder="Max Points"
                min="1"
                style={styles.input}
                disabled={isLoading}
            />
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (Optional)"
                style={styles.textarea}
                disabled={isLoading}
            />

            <div style={styles.buttonRow}>
                <button type="button" onClick={onCancel} style={styles.cancelButton} disabled={isLoading}>
                    Cancel
                </button>
                <button type="submit" style={styles.createButton} disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create Assignment'}
                </button>
            </div>
        </form>
    );
};

export default AssignmentCreationForm;


// import React, { useState } from 'react';

// const AssignmentCreationForm = ({ courseId, onSuccess, onCancel }) => {
//     const [title, setTitle] = useState('');
//     const [dueDate, setDueDate] = useState('');
//     const [maxPoints, setMaxPoints] = useState(100);
//     const [description, setDescription] = useState('');
//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState(null);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setIsLoading(true);
//         setError(null);

//         if (!title || !dueDate || !maxPoints) {
//             setError("Please fill in Title, Due Date, and Max Points.");
//             setIsLoading(false);
//             return;
//         }

//         const assignmentData = {
//             courseId,
//             title,
//             dueDate,
//             maxPoints: parseInt(maxPoints, 10),
//             description,
//         };

//         try {
//             // POST request to the lecturer assignments API
//             const res = await fetch(`/api/lecturer/assignments`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(assignmentData),
//             });

//             const data = await res.json();

//             if (res.ok) {
//                 alert("Assignment created successfully!");
//                 if (onSuccess) onSuccess(data.assignment);
//             } else {
//                 setError(data.message || 'Failed to create assignment.');
//             }
//         } catch (err) {
//             console.error('Assignment Creation Error:', err);
//             setError('Network error while creating assignment.');
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const styles = {
//         form: { display: 'flex', flexDirection: 'column', gap: '15px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' },
//         input: { padding: '10px', border: '1px solid #ddd', borderRadius: '4px' },
//         textarea: { padding: '10px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '100px' },
//         buttonRow: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' },
//         cancelButton: { padding: '10px 15px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
//         createButton: { padding: '10px 15px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
//         header: { marginBottom: '15px', borderBottom: '1px solid #ddd', paddingBottom: '10px' },
//         error: { color: '#ef4444', marginBottom: '10px' }
//     };

//     return (
//         <form onSubmit={handleSubmit} style={styles.form}>
//             <h3 style={styles.header}>Create New Assignment</h3>
//             {error && <p style={styles.error}>{error}</p>}

//             <input
//                 type="text"
//                 value={title}
//                 onChange={(e) => setTitle(e.target.value)}
//                 placeholder="Title"
//                 style={styles.input}
//                 disabled={isLoading}
//             />
//             <input
//                 type="datetime-local" // Use datetime-local for both date and time input
//                 value={dueDate}
//                 onChange={(e) => setDueDate(e.target.value)}
//                 style={styles.input}
//                 disabled={isLoading}
//             />
//             <input
//                 type="number"
//                 value={maxPoints}
//                 onChange={(e) => setMaxPoints(e.target.value)}
//                 placeholder="Max Points"
//                 min="1"
//                 style={styles.input}
//                 disabled={isLoading}
//             />
//             <textarea
//                 value={description}
//                 onChange={(e) => setDescription(e.target.value)}
//                 placeholder="Description (Optional)"
//                 style={styles.textarea}
//                 disabled={isLoading}
//             />

//             <div style={styles.buttonRow}>
//                 <button type="button" onClick={onCancel} style={styles.cancelButton} disabled={isLoading}>
//                     Cancel
//                 </button>
//                 <button type="submit" style={styles.createButton} disabled={isLoading}>
//                     {isLoading ? 'Creating...' : 'Create Assignment'}
//                 </button>
//             </div>
//         </form>
//     );
// };

// export default AssignmentCreationForm;