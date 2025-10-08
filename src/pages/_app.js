// pages/_app.js


// pages/_app.js

import { SessionProvider } from "next-auth/react";

// NOTE: You must fix the path to your global CSS file based on your project structure.
// If your CSS is in the project root:

// import '../../styles/globals.css'; 

// If your CSS is in the src directory:
// import '../styles/globals.css'; 


/**
 * The MyApp component wraps all page components in your application. 
 * It is where you initialize layout, global styles, and shared context/providers.
 * * @param {object} Component - The current page component to be rendered.
 * @param {object} pageProps - Props passed to the component (including the NextAuth session).
 */
function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    // The SessionProvider is crucial for NextAuth.js to expose the session 
    // context to all components without re-fetching it on every page load.
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default MyApp;