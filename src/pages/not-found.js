// app/not-found.js

import Link from 'next/link';
// ❌ REMOVED: The unused 'notFound' import, resolving the ESLint error
// import { notFound } from 'next/navigation'; 

// A simple component to render when a 404 error occurs
export default function NotFound() {
  
  // You might want to display the error message here.
  const text = "We couldn't find the requested page.";
  
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>404 - Page Not Found 🚫</h1>
      {/* 🔑 UNCOMMENTED and used the text style */}
      <p style={styles.text}>{text}</p>
      
      {/* Link back to a safe route, like your main dashboard or home */}
      <Link href="/dashboard" style={styles.link}>
        Go to Dashboard
      </Link>
    </div>
  );
}

// Simple styling
const styles = {
    container: {
        textAlign: 'center',
        padding: '50px',
        maxWidth: '600px',
        margin: '50px auto',
        border: '1px solid #ccc',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        backgroundColor: '#fff7ed', // Light background for contrast
    },
    heading: {
        fontSize: '2.5em',
        color: '#dc2626', // Red color for error
        marginBottom: '20px',
    },
    text: { // 🔑 ADDED: Style property to fix the original commented out JSX
        fontSize: '1.2em',
        marginBottom: '30px',
    },
    link: {
        fontSize: '1em',
        color: '#2563eb',
        textDecoration: 'none',
        padding: '10px 20px',
        border: '1px solid #2563eb',
        borderRadius: '4px',
        transition: 'background-color 0.3s',
    }
};
// // app/not-found.js

// import Link from 'next/link';
// import { notFound } from 'next/navigation'; // Import the notFound helper

// // A simple component to render when a 404 error occurs
// export default function NotFound() {
//   // Although notFound() is usually called by the framework for missing routes,
//   // defining the component ensures a custom 404 page is rendered cleanly.
  
//   return (
//     <div style={styles.container}>
//       <h1 style={styles.heading}>404 - Page Not Found 🚫</h1>
//       {/* <p style={styles.text}>We couldn't find the requested page.
//       </p>
//        */}
//       {/* Link back to a safe route, like your main dashboard or home */}
//       <Link href="/dashboard" style={styles.link}>
//         Go to Dashboard
//       </Link>
//     </div>
//   );
// }

// // Simple styling
// const styles = {
//     container: {
//         textAlign: 'center',
//         padding: '50px',
//         maxWidth: '600px',
//         margin: '50px auto',
//         border: '1px solid #ccc',
//         borderRadius: '8px',
//         boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
//         backgroundColor: '#fff7ed', // Light background for contrast
//     },
//     heading: {
//         fontSize: '2.5em',
//         color: '#dc2626', // Red color for error
//         marginBottom: '20px',
//     },
//     text: {
//         fontSize: '1.2em',
//         marginBottom: '30px',
//     },
//     link: {
//         fontSize: '1em',
//         color: '#2563eb',
//         textDecoration: 'none',
//         padding: '10px 20px',
//         border: '1px solid #2563eb',
//         borderRadius: '4px',
//         transition: 'background-color 0.3s',
//     }
// };