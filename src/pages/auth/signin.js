// pages/auth/signin.js

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import Head from 'next/head';

export default function SignInPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
    <div className="min-h-screen w-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-800 text-white font-sans flex flex-col items-center justify-start py-8 px-4 sm:justify-center sm:py-6 sm:px-6 overflow-x-hidden">
      <Head>
        <title>Sign In | Streamline LMS</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </Head>

      {/* Decorative background elements */}
      <div className="fixed top-1/4 left-1/4 w-[50vw] h-[50vw] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse"></div>
      <div className="fixed bottom-1/4 right-1/4 w-[50vw] h-[50vw] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse"></div>

      <div className="w-full max-w-md animate-fade-in">
        <div className="flex justify-center mb-6 sm:mb-12">
          <Link href="/" className="flex items-center gap-3 group transition-transform hover:scale-105">
            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-xl sm:rounded-[1.25rem] flex items-center justify-center shadow-2xl shadow-cyan-500/40 group-hover:shadow-cyan-400/60 transition-all duration-300">
              <span className="font-black text-2xl sm:text-3xl tracking-tighter text-white italic">S</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-3xl font-black tracking-tighter text-white leading-none uppercase italic">Streamline</span>
              <span className="text-[10px] sm:text-xs font-black tracking-[0.3em] text-cyan-400 uppercase leading-none mt-1">Learning Hub</span>
            </div>
          </Link>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50"></div>
          
          <div className="p-6 sm:p-12 relative z-10">
            <h1 className="text-2xl sm:text-4xl font-extrabold mb-2 text-white text-center leading-tight tracking-tight">Welcome Back</h1>
            <p className="text-blue-200/60 mb-6 sm:mb-10 text-center text-[10px] sm:text-sm font-bold uppercase tracking-[0.2em]">Continue your educational journey</p>
            
            {displayError && (
              <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl text-center mb-6 sm:mb-8 bg-rose-500/10 text-rose-200 border border-rose-500/20 text-[10px] sm:text-xs font-semibold animate-shake">
                {displayError === 'CredentialsSignin' 
                  ? 'Invalid email or password. Please try again.' 
                  : `Authentication failed: ${displayError}`
                }
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-blue-200/50 ml-1">Email Address</label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-300/40 group-focus-within/input:text-cyan-400 transition-colors">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" /></svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    placeholder="name@institution.edu"
                    className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl text-white placeholder-white/20 focus:outline-none focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/10 transition-all duration-300 text-sm sm:text-base font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" name="password-label" id="password-label" className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-blue-200/50 ml-1">Password</label>
                  <Link href="/auth/forgot-password" id="forgot-password-link" className="text-[9px] sm:text-[10px] font-bold uppercase tracking-tighter text-cyan-400 hover:text-cyan-300 transition-colors">Forgot?</Link>
                </div>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-300/40 group-focus-within/input:text-cyan-400 transition-colors">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
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
                    className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl text-white placeholder-white/20 focus:outline-none focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/10 transition-all duration-300 text-sm sm:text-base font-medium"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                id="signin-submit-btn"
                disabled={loading} 
                className="w-full py-3.5 sm:py-5 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl sm:rounded-2xl shadow-xl shadow-blue-500/20 hover:shadow-cyan-400/30 transition-all duration-300 transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="relative z-10 flex items-center justify-center gap-2 text-sm sm:text-base">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Authenticating...
                    </>
                  ) : (
                    <>
                      Sign In to Dashboard
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    </>
                  )}
                </span>
              </button>
            </form>
          </div>

          <div className="p-8 sm:p-12 bg-white/5 border-t border-white/10 text-center relative z-20">
            <p className="text-blue-100/60 text-sm font-medium mb-1">New to the platform?</p>
            <Link 
              href="/auth/signup" 
              id="signup-link" 
              className="inline-block mt-4 w-full px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-cyan-400 hover:text-white font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-black/20 cursor-pointer text-center"
            >
              Create New Account
            </Link>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 px-4">
           <p className="text-blue-200/30 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-center sm:text-left leading-relaxed">
             Secured by NextAuth.js & Advanced Encryption
           </p>
           <div className="hidden sm:block h-3 w-[1px] bg-white/10"></div>
           <Link href="/" className="text-blue-200/30 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] hover:text-cyan-400 transition-colors">
              Return Home
           </Link>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
      `}</style>
    </div>
  );
}