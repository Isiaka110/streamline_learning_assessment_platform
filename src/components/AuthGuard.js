// // components/AuthGuard.js

// import React from 'react';
// import { useSession } from 'next-auth/react';
// import { useRouter } from 'next/router';
// import { UserRole } from '@prisma/client'; // Import your enum

// /**
//  * Higher-Order Component (HOC) to enforce authentication and role-based access.
//  * * @param {React.Component} WrappedComponent - The page component to protect.
//  * @param {UserRole[]} allowedRoles - An array of roles allowed to view the page (e.g., [UserRole.ADMIN]).
//  * @returns {React.Component} - The protected component.
//  */
// export function withAuthGuard(WrappedComponent, allowedRoles = []) {
  
//   const AuthGuard = (props) => {
//     const { data: session, status } = useSession();
//     const router = useRouter();
//     const isClient = typeof window !== 'undefined';

//     const isLoading = status === 'loading';

//     // 1. Wait for session to load (Crucial for preventing flash of unauthenticated content)
//     if (isLoading || !isClient) {
//       // You can return a simple loading indicator or null
//       return <div style={styles.loadingContainer}>Loading authentication...</div>;
//     }

//     // 2. Check Authentication Status
//     if (!session) {
//       // User is not logged in. Redirect to login page.
//       // We pass the current path as a 'callbackUrl' so the user returns here after login.
//       router.replace(`/auth/signin?callbackUrl=${router.pathname}`);
//       return null;
//     }

//     // 3. Check Role Authorization
//     const userRole = session.user?.role;
    
//     // Check if the user's role is included in the list of allowed roles.
//     if (allowedRoles.length > 0 && userRole && !allowedRoles.includes(userRole)) {
//       // User is logged in but does not have the correct role.
//       // Redirect to a dashboard or access denied page.
//       router.replace('/dashboard'); 
//       return <div style={styles.accessDenied}>Access Denied. Redirecting...</div>;
//     }

//     // 4. Success: User is logged in and authorized. Render the component.
//     return <WrappedComponent {...props} session={session} />;
//   };

//   // Give the HOC a helpful display name for React DevTools
//   AuthGuard.displayName = `withAuthGuard(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

//   return AuthGuard;
// }

// // Simple inline styles for placeholders
// const styles = {
//     loadingContainer: {
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center',
//         height: '100vh',
//         fontSize: '1.5em',
//         color: '#3b82f6'
//     },
//     accessDenied: {
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center',
//         height: '100vh',
//         fontSize: '1.5em',
//         color: '#ef4444'
//     }
// }

// components/AuthGuard.js

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { UserRole } from '@prisma/client';

// Minimal, consistent loading screen styles
const authLoadingStyles = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh', // Use minHeight for flexibility
  fontSize: '1.5em',
  color: 'rgb(59, 130, 246)',
  backgroundColor: '#f9fafb', // Match dashboard background
  padding: '20px', // Consistent padding
};

export const withAuthGuard = (WrappedComponent, allowedRoles = []) => {
  const ComponentWithAuth = (props) => {
    // We can rely on a 'session' prop if passed from getServerSideProps
    // or use useSession() if it's a client-only component or SSR didn't provide it.
    const { data: clientSession, status: clientStatus } = useSession();
    const router = useRouter();

    // Prioritize the session from getServerSideProps if available
    // Otherwise, use the client-side session.
    const session = props.session || clientSession;
    const status = props.session ? 'authenticated' : clientStatus; // If prop.session, assume authenticated

    // --- Authentication Logic ---
    useEffect(() => {
      // Only run this effect if the status is not 'loading'
      if (status === 'loading') return;

      if (!session) {
        // Not authenticated
        console.warn('Redirecting: User not authenticated.');
        router.replace(`/auth/login?error=AccessDenied&redirectTo=${router.asPath}`);
        return;
      }

      // Check if user role is allowed
      if (allowedRoles.length > 0 && !allowedRoles.includes(session.user.role)) {
        console.warn('Redirecting: User role not allowed.', {
          userRole: session.user.role,
          allowedRoles,
        });
        router.replace(`/auth/login?error=UnauthorizedRole&redirectTo=${router.asPath}`);
        return;
      }

      // If we reach here, authentication and authorization are successful.
      // No explicit state needed, just allow rendering WrappedComponent.
    }, [session, status, router, allowedRoles, props.session]);


    // --- Render Logic ---
    // If we're still loading the session on the client and no server session was provided,
    // show a consistent loading indicator. This is where the hydration mismatch occurred.
    if (status === 'loading' || !session && clientStatus === 'loading') {
      return (
        <div style={authLoadingStyles}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className="loading-spinner" style={{ marginRight: '10px' }}>
                    {/* You can add a CSS spinner here if you have one */}
                    <img src="/path/to/your/logo.png" alt="Loading..." style={{ height: '30px', animation: 'spin 1s linear infinite' }}/>
                </span>
                Loading authentication...
            </div>
             <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
      );
    }

    // If session is present and roles are verified (or no roles specified), render the wrapped component.
    // The `useEffect` above handles redirects if roles are not allowed.
    if (session && (allowedRoles.length === 0 || allowedRoles.includes(session.user.role))) {
      return <WrappedComponent {...props} session={session} />;
    }

    // Fallback: This should ideally not be reached if redirects are working correctly.
    return (
        <div style={authLoadingStyles}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                 Access Denied or Unknown State.
            </div>
        </div>
    );
  };

  // Give the component a display name for easier debugging in React DevTools
  const wrappedComponentName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  ComponentWithAuth.displayName = `withAuthGuard(${wrappedComponentName})`;

  return ComponentWithAuth;
};

// You'll also need to ensure your _app.js passes the session prop correctly:
// import { SessionProvider } from 'next-auth/react';
// import { getSession } from 'next-auth/react'; // or getServerSession from 'next-auth/next'

// function MyApp({ Component, pageProps: { session, ...pageProps } }) {
//   return (
//     <SessionProvider session={session}> // Pass the session prop here
//       <Component {...pageProps} session={session} /> // And here for AuthGuard
//     </SessionProvider>
//   );
// }

// MyApp.getInitialProps = async (appContext) => {
//   const appProps = await App.getInitialProps(appContext);
//   const session = await getSession(appContext.ctx); // or getServerSession
//   return { ...appProps, pageProps: { ...appProps.pageProps, session } };
// };