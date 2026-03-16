// pages/auth/forgot-password.js

import React from 'react';
import Link from 'next/link';
import Head from 'next/head';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-800 text-white font-sans flex items-center justify-center p-6 bg-fixed">
      <Head>
        <title>Forgot Password | Streamline LMS</title>
      </Head>

      {/* Decorative background elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md animate-fade-in">
        <div className="flex justify-center mb-10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform duration-300">
              <span className="font-bold text-2xl tracking-tighter text-white">S</span>
            </div>
            <span className="text-2xl font-bold tracking-wider text-white">Streamline<span className="text-cyan-400">LMS</span></span>
          </Link>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50"></div>
          
          <div className="p-10 relative z-10 text-center">
            <div className="w-20 h-20 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-cyan-500/30">
                <svg className="w-10 h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h1 className="text-3xl font-extrabold mb-4 text-white leading-tight">Password Recovery</h1>
            <p className="text-blue-200/60 mb-8 text-sm font-medium leading-relaxed">
                For security reasons, password resets must be initiated by your institutional administrator.
            </p>
            
            <div className="bg-blue-600/20 border border-blue-500/30 rounded-2xl p-6 mb-8">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400 mb-2">Support Contact</p>
                <p className="text-lg font-black text-white">admin@streamlinelms.edu</p>
            </div>

            <Link 
              href="/auth/signin" 
              className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-bold text-sm transition-all hover:gap-4"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16l-4-4m0 0l4-4m-4 4h18" /></svg>
              Return to Sign In
            </Link>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
