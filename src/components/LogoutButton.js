import { signOut } from 'next-auth/react';

export default function LogoutButton() {
  const handleLogout = async () => {
    // Call signOut, which clears the session and redirects the user.
    // The callbackUrl ensures the user is taken directly to the sign-in page.
    await signOut({ 
      callbackUrl: '/auth/SignIn' 
    });
  };

  return (
    <button 
      onClick={handleLogout} 
      // Use simple, clean inline styles to match your dashboard's style aesthetic
      style={styles.button}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = styles.button.backgroundColor}
    >
      Logout
    </button>
  );
}

const styles = {
  button: {
    padding: '10px 20px',
    backgroundColor: '#dc2626', // Red color
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9em',
    fontWeight: 'bold',
    transition: 'background-color 0.15s ease-in-out',
  },
  buttonHover: {
    backgroundColor: '#b91c1c', // Darker red on hover
  }
};