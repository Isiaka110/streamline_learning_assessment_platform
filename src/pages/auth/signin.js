// pages/auth/signin.js

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
    <div className="min-h-screen bg-foreground text-white font-sans flex flex-col overflow-x-hidden">
      <Head>
        <title>Client Access | Streamline LMS</title>
        <meta name="description" content="Authenticate to your institutional learning portal." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </Head>

      {/* Layout Split */}
      <div className="flex flex-col md:flex-row min-h-screen">

        {/* Left Branding Panel — hidden on mobile */}
        <div className="hidden md:flex flex-col justify-between w-2/5 bg-foreground border-r border-white/10 p-16">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent flex items-center justify-center">
              <span className="text-white font-black italic text-sm">SL</span>
            </div>
            <span className="text-xl font-black italic uppercase tracking-tighter">Streamline<span className="text-accent">LMS</span></span>
          </Link>

          <div className="space-y-8">
            <div className="h-1 w-16 bg-accent"></div>
            <h1 className="text-5xl xl:text-6xl leading-[0.9] text-white">Institutional<br/><span className="text-accent">Learning</span><br/>Portal</h1>
            <p className="text-white/40 font-medium italic text-sm leading-relaxed">
              Role-based access for administrators, module instructors, and enrolled learners.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">Secured by NextAuth.js</p>
            <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">Advanced Credential Encryption</p>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="flex-1 flex flex-col justify-center items-center px-6 py-16 bg-background">

          {/* Mobile Logo */}
          <div className="md:hidden flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-foreground flex items-center justify-center">
              <span className="text-white font-black italic text-sm">SL</span>
            </div>
            <span className="text-xl font-black italic uppercase tracking-tighter text-foreground">Streamline<span className="text-accent">LMS</span></span>
          </div>

          <div className="w-full max-w-md">
            <div className="mb-10">
              <div className="inline-block px-4 py-1 bg-accent/10 border-l-4 border-accent mb-4">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Authentication Portal</span>
              </div>
              <h2 className="text-4xl md:text-5xl text-foreground mb-2">Client<br/>Access</h2>
              <p className="text-secondary font-medium text-sm italic">Verify your institutional credentials to proceed.</p>
            </div>

            {displayError && (
              <div className="p-4 mb-8 border-2 border-red-500 bg-red-50 text-red-900">
                <p className="font-black italic uppercase text-xs">
                  Auth Failure: {displayError === 'CredentialsSignin' 
                    ? 'Invalid credentials. Verify email and passkey.' 
                    : displayError}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-secondary">
                  Institutional Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="user@institution.edu"
                  className="w-full px-4 py-4 border-2 border-foreground/20 bg-transparent text-foreground placeholder-foreground/20 focus:outline-none focus:border-accent transition-colors text-sm font-medium"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-secondary">
                    Passkey
                  </label>
                  <Link href="/auth/forgot-password" id="forgot-password-link" className="text-[10px] font-black uppercase tracking-widest text-accent hover:underline">
                    Reset Access
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
                  className="w-full px-4 py-4 border-2 border-foreground/20 bg-transparent text-foreground placeholder-foreground/20 focus:outline-none focus:border-accent transition-colors text-sm font-medium"
                />
              </div>

              <button 
                type="submit" 
                id="signin-submit-btn"
                disabled={loading} 
                className="btn-rect-primary w-full py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Authenticating...
                  </span>
                ) : 'Authenticate →'}
              </button>
            </form>

            <div className="mt-10 pt-8 border-t-2 border-foreground/10">
              <p className="text-secondary text-sm font-medium mb-4 text-center">New to the platform?</p>
              <Link 
                href="/auth/signup" 
                id="signup-link" 
                className="btn-rect-outline w-full text-center py-4"
              >
                Register as New Learner
              </Link>
            </div>

            <div className="mt-8 text-center">
              <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-secondary hover:text-accent transition-colors">
                ← Return to Platform Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}