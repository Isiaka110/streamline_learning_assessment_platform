// pages/index.js

// This file forces a server-side redirect (302) to the sign-in page.
export async function getServerSideProps(context) {
  return {
    redirect: {
      destination: '/auth/signin', 
      permanent: false, 
    },
  };
}

export default function Home() {
  return null;
}