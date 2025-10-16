import { getSession } from 'next-auth/react';
import { UserRole } from '@prisma/client';

export default function DashboardRedirect() {
  // This component will rarely render anything visible 
  // because the server-side redirection is so fast.
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>Redirecting to your dashboard...</h1>
      <p>Please wait.</p>
    </div>
  );
}

// CRUCIAL: Server-side redirection based on role
export async function getServerSideProps(context) {
  const session = await getSession(context);

  // 1. Unauthenticated check (always redirect to login)
  if (!session) {
    return {
      redirect: { destination: '/auth/SignIn', permanent: false },
    };
  }

  // 2. Role-based redirection
  const role = session.user.role;
  let destination;

  switch (role) {
    case UserRole.STUDENT:
      destination = '/dashboard/student';
      break;
    case UserRole.LECTURER:
      destination = '/dashboard/lecturer';
      break;
    case UserRole.ADMIN:
      destination = '/dashboard/admin';
      break;
    default:
      // Fallback for unhandled roles
      destination = '/unauthorized'; 
      break;
  }

  // 3. Perform the server-side redirect
  return {
    redirect: {
      destination: destination,
      permanent: false, // Use temporary redirect (302)
    },
  };
}