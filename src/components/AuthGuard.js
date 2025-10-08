// components/AuthGuard.js

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

// This component wraps your private page component.
// It enforces authentication and optional role-based access control (RBAC).
const AuthGuard = ({ children, allowedRoles = [] }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isUser = !!session?.user; // Check if session data exists

  useEffect(() => {
    // 1. Check for Loading Status
    if (status === 'loading') return;

    // 2. Check Authentication Status (Unauthenticated)
    // If the user is not logged in, redirect them to the sign-in page
    if (!isUser) {
      router.push(`/auth/signin?callbackUrl=${router.asPath}`);
      return;
    }
    
    // 3. Check Authorization Status (RBAC)
    // If allowedRoles are specified, check if the user's role is included
    if (allowedRoles.length > 0) {
      const userRole = session.user.role;
      if (!allowedRoles.includes(userRole)) {
        // Redirect to a forbidden/unauthorized page (or back to dashboard)
        router.push('/unauthorized'); 
        console.warn(`Access denied for role: ${userRole}`);
      }
    }
    
  }, [isUser, status, router, session, allowedRoles]);

  // Display a loading screen while session is being fetched
  if (status === 'loading' || !isUser) {
    // Optionally add role check here to ensure immediate redirect
    if (status === 'loading') {
      return <div>Loading session...</div>;
    }
    return null; // Don't render content before check is complete
  }

  // If authenticated and authorized, render the child components
  if (isUser && (allowedRoles.length === 0 || allowedRoles.includes(session.user.role))) {
    return <>{children}</>;
  }
  
  // Render nothing if authentication/authorization is still pending or failed the role check
  return null;
};

// A utility function to make wrapping components cleaner
export const withAuthGuard = (Component, allowedRoles = []) => {
  return (props) => (
    <AuthGuard allowedRoles={allowedRoles}>
      <Component {...props} />
    </AuthGuard>
  );
};