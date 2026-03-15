// app/not-found.js

import Link from 'next/link';
// ❌ REMOVED: The unused 'notFound' import, resolving the ESLint error
// import { notFound } from 'next/navigation'; 

// A simple component to render when a 404 error occurs
export default function NotFound() {
  const text = "We couldn't find the requested page.";
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-800 text-white font-sans selection:bg-indigo-500 selection:text-white px-4">
        <div className="max-w-md w-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-10 text-center shadow-xl relative overflow-hidden">
             {/* Decorative glow */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-red-500/20 rounded-full blur-[80px] pointer-events-none -z-10"></div>
            
            <h1 className="text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-red-400 to-red-600 drop-shadow-md">
                404
            </h1>
            <h2 className="text-2xl font-bold mb-4 text-blue-50">Page Not Found 🚫</h2>
            <p className="text-blue-100/70 mb-10">{text}</p>
            
            {/* Link back to a safe route */}
            <Link 
                href="/dashboard" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-bold rounded-full shadow-lg hover:shadow-red-500/25 transition-all text-sm uppercase tracking-wider"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Go to Dashboard
            </Link>
        </div>
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