// pages/auth/signup.js

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';

const DEFAULT_ROLE = 'STUDENT';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [isError, setIsError] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (message) setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setIsError(false);

    if (!formData.name || !formData.email || !formData.password) {
      setMessage('Error: All registration fields are required.');
      setIsError(true);
      setLoading(false);
      return;
    }

    try {
      const payload = { ...formData, role: DEFAULT_ROLE };
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Enrollment confirmed. Redirecting to authentication portal...');
        setIsError(false);
        setTimeout(() => router.push('/auth/signin'), 2000);
      } else {
        setMessage(`Registration Failed: ${data.message || 'An unknown error occurred.'}`);
        setIsError(true);
      }
    } catch (error) {
      console.error('Network error during registration:', error);
      setMessage('Network connectivity error. Please retry.');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-foreground text-white font-sans flex flex-col overflow-x-hidden">
      <Head>
        <title>Learner Enrollment | Streamline LMS</title>
        <meta name="description" content="Register for the institutional learning platform." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </Head>

      <div className="flex flex-col md:flex-row min-h-screen">

        {/* Left Branding Panel — hidden on mobile */}
        <div className="hidden md:flex flex-col justify-between w-2/5 bg-foreground border-r border-white/10 p-16">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent flex items-center justify-center">
              <span className="text-white font-black italic text-sm">SL</span>
            </div>
            <span className="text-xl font-black italic uppercase tracking-tighter">
              Streamline<span className="text-accent">LMS</span>
            </span>
          </Link>

          <div className="space-y-8">
            <div className="h-1 w-16 bg-accent"></div>
            <h1 className="text-5xl xl:text-6xl leading-[0.9] text-white">
              Learner<br /><span className="text-accent">Enrollment</span><br />Portal
            </h1>
            <p className="text-white/40 font-medium italic text-sm leading-relaxed">
              Join the institutional ecosystem as a registered learner and access your personalized academic hub.
            </p>
            {/* Steps */}
            <div className="space-y-4 pt-4">
              {[
                { n: '01', label: 'Submit registration credentials' },
                { n: '02', label: 'Account provisioned by system' },
                { n: '03', label: 'Access your learner portal' },
              ].map(step => (
                <div key={step.n} className="flex items-center gap-4">
                  <span className="text-accent font-black text-xs">{step.n}</span>
                  <div className="flex-1 h-[1px] bg-white/10"></div>
                  <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest">{step.label}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">
            Safe &amp; Secure Academic Infrastructure
          </p>
        </div>

        {/* Right Form Panel */}
        <div className="flex-1 flex flex-col justify-center items-center px-6 py-16 bg-background">

          {/* Mobile Logo */}
          <div className="md:hidden flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-foreground flex items-center justify-center">
              <span className="text-white font-black italic text-sm">SL</span>
            </div>
            <span className="text-xl font-black italic uppercase tracking-tighter text-foreground">
              Streamline<span className="text-accent">LMS</span>
            </span>
          </div>

          <div className="w-full max-w-md">
            <div className="mb-10">
              <div className="inline-block px-4 py-1 bg-accent/10 border-l-4 border-accent mb-4">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">New Learner Registration</span>
              </div>
              <h2 className="text-4xl md:text-5xl text-foreground mb-2">
                Enroll<br />Now
              </h2>
              <p className="text-secondary font-medium text-sm italic">
                Create your learner profile to access course modules and assessments.
              </p>
            </div>

            {message && (
              <div className={`p-4 mb-8 border-2 ${isError ? 'border-red-500 bg-red-50 text-red-900' : 'border-green-500 bg-green-50 text-green-900'}`}>
                <p className="font-black italic uppercase text-xs">{message}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-secondary">
                  Full Legal Name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="e.g. Amara Johnson"
                  className="w-full px-4 py-4 border-2 border-foreground/20 bg-transparent text-foreground placeholder-foreground/20 focus:outline-none focus:border-accent transition-colors text-sm font-medium"
                />
              </div>

              {/* Email */}
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
                  placeholder="learner@institution.edu"
                  className="w-full px-4 py-4 border-2 border-foreground/20 bg-transparent text-foreground placeholder-foreground/20 focus:outline-none focus:border-accent transition-colors text-sm font-medium"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-secondary">
                  Passkey (min. 8 characters)
                </label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  minLength="8"
                  placeholder="••••••••"
                  className="w-full px-4 py-4 border-2 border-foreground/20 bg-transparent text-foreground placeholder-foreground/20 focus:outline-none focus:border-accent transition-colors text-sm font-medium"
                />
              </div>

              <button
                type="submit"
                id="signup-submit-btn"
                disabled={loading || !formData.email || !formData.password || !formData.name}
                className="btn-rect-primary w-full py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Provisioning Account...
                  </span>
                ) : 'Submit Enrollment →'}
              </button>
            </form>

            <div className="mt-10 pt-8 border-t-2 border-foreground/10">
              <p className="text-secondary text-sm font-medium mb-4 text-center">Already registered?</p>
              <Link
                href="/auth/signin"
                id="signin-link"
                className="btn-rect-outline w-full text-center py-4"
              >
                Access Existing Account
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