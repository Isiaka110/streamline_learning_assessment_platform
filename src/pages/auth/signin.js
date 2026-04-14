import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import Head from 'next/head';

export default function SignInPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const result = await signIn('credentials', {
      redirect: false,
      email: formData.email,
      password: formData.password,
    });

    if (result.error) {
      setError(result.error); 
    } else {
      router.push('/dashboard'); 
    }
    setLoading(false);
  };
  
  const { error: urlError } = router.query;
  const displayError = error || urlError;

  return (
    <div className="min-h-screen bg-white text-foreground flex flex-col items-center justify-center py-12 px-6">
      <Head>
        <title>SLA Hub Access</title>
      </Head>

      <div className="w-full max-w-md bg-white rounded-[2rem] p-8 border border-border shadow-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
              <span className="text-primary font-bold text-lg">S</span>
            </div>
            <span className="text-lg font-bold text-primary tracking-tight">SLA HUB</span>
          </Link>
          
          <h1 className="text-3xl font-bold mb-2 text-foreground tracking-tight">Academic Access</h1>
          <p className="text-secondary text-xs font-bold uppercase tracking-widest opacity-60">Please enter your credentials.</p>
        </div>

        {displayError && (
          <div className="p-4 mb-6 rounded-2xl text-xs font-bold bg-red-50 text-red-600 border border-red-100 italic uppercase tracking-widest">
            {displayError === 'CredentialsSignin' ? 'Invalid entry. Please check your email/password.' : displayError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label htmlFor="email" className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] ml-1">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="name@university.edu"
              className="w-full px-5 py-4 rounded-2xl border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-bold bg-gray-50"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] ml-1">Password</label>
              <Link href="/auth/forgot-password" id="forgot-password-link" className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">
                Recovery?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="••••••••"
              className="w-full px-5 py-4 rounded-2xl border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-bold bg-gray-50"
            />
          </div>

          <button 
            type="submit" 
            id="signin-submit-btn"
            disabled={loading} 
            className="w-full btn-primary py-4 mt-4 disabled:opacity-50 text-xs shadow-none"
          >
            {loading ? 'Validating...' : 'Log In to Hub'}
          </button>
        </form>

        <div className="mt-10 text-center border-t border-border pt-8">
          <p className="text-xs font-bold text-secondary uppercase tracking-widest">
            New to the platform?{' '}
            <Link href="/auth/signup" id="signup-link" className="text-primary hover:underline">
              Create Account
            </Link>
          </p>
        </div>
      </div>
      
      <div className="mt-8">
        <Link href="/" className="text-[10px] font-bold text-secondary uppercase tracking-[0.3em] hover:text-primary transition-colors">
          ← Return to Portal
        </Link>
      </div>
    </div>
  );
}