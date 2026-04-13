import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]';
import { UserRole } from '@prisma/client';

export default function DashboardRedirect() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent animate-spin mx-auto"></div>
        <p className="text-xs font-black uppercase tracking-widest text-accent italic">
          Resolving Role Permissions...
        </p>
      </div>
    </div>
  );
}

// CRUCIAL: Server-side redirection based on role
export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: { destination: '/auth/signin', permanent: false },
    };
  }

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
      destination = '/unauthorized'; 
      break;
  }

  return {
    redirect: {
      destination: destination,
      permanent: false,
    },
  };
}