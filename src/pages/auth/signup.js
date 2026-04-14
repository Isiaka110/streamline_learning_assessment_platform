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
      setMessage('Please fill in all fields.');
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
        setMessage('Registration successful! Moving to login...');
        setIsError(false);
        setTimeout(() => router.push('/auth/signin'), 1500);
      } else {
        setMessage(data.message || 'Registration failed.');
        setIsError(true);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMessage('Offline or connectivity error.');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-foreground flex flex-col items-center justify-center py-12 px-6">
      <Head>
        <title>SLA Hub Enrollment</title>
      </Head>

      <div className="w-full max-w-md bg-white rounded-[2rem] p-8 border border-border shadow-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
              <span className="text-primary font-bold text-lg">S</span>
            </div>
            <span className="text-lg font-bold text-primary tracking-tight">SLA HUB</span>
          </Link>
          
          <h1 className="text-3xl font-bold mb-2 text-foreground tracking-tight">Join the Pulse</h1>
          <p className="text-secondary text-xs font-bold uppercase tracking-widest opacity-60">Begin your digital academic journey.</p>
        </div>

        {message && (
          <div className={`p-4 mb-6 rounded-2xl text-[10px] font-bold uppercase tracking-widest italic ${isError ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label htmlFor="name" className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] ml-1">Official Name</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="e.g. Amara Johnson"
              className="w-full px-5 py-4 rounded-2xl border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-bold bg-gray-50"
            />
          </div>

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
            <label htmlFor="password" className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] ml-1">Password</label>
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
              className="w-full px-5 py-4 rounded-2xl border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-bold bg-gray-50"
            />
          </div>

          <button
            type="submit"
            id="signup-submit-btn"
            disabled={loading || !formData.email || !formData.password || !formData.name}
            className="w-full btn-primary py-4 mt-4 disabled:opacity-50 text-xs shadow-none"
          >
            {loading ? 'Processing...' : 'Complete Enrollment'}
          </button>
        </form>

        <div className="mt-10 text-center border-t border-border pt-8">
          <p className="text-xs font-bold text-secondary uppercase tracking-widest">
            Already registered?{' '}
            <Link href="/auth/signin" className="text-primary hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </div>
      
      <div className="mt-8">
        <Link href="/" className="text-[10px] font-bold text-secondary uppercase tracking-[0.3em] hover:text-primary transition-colors">
          ← Back to homepage
        </Link>
      </div>
    </div>
  );
}