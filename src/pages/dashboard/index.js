import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]';
import { UserRole } from '@prisma/client';

export default function DashboardRedirect() {
  return (
    <div style={{ padding: '50px', textAlign: 'center', background: '#0f172a', minHeight: '100-vh', color: 'white' }}>
      <h1>Redirecting to your dashboard...</h1>
      <p>Initializing secure session.</p>
    </div>
  );
}

// CRUCIAL: Server-side redirection based on role
export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);

  // 1. Unauthenticated check (always redirect to login)
  if (!session) {
    return {
      redirect: { destination: '/auth/signin', permanent: false },
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