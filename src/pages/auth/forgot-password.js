// pages/auth/forgot-password.js

import React from 'react';
import Link from 'next/link';
import Head from 'next/head';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-foreground text-white flex flex-col overflow-x-hidden">
      <Head>
        <title>Credential Recovery | Streamline LMS</title>
        <meta name="description" content="Reset your institutional platform credentials." />
      </Head>

      <div className="flex flex-col md:flex-row min-h-screen">

        {/* Left Branding — hidden on mobile */}
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
              Credential<br /><span className="text-accent">Recovery</span><br />Protocol
            </h1>
          </div>

          <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">
            Administered by NextAuth.js Security Layer
          </p>
        </div>

        {/* Right Content */}
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

          <div className="w-full max-w-md text-center space-y-10">
            {/* Icon */}
            <div className="w-20 h-20 border-2 border-foreground/20 flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>

            <div>
              <h2 className="text-4xl md:text-5xl text-foreground mb-4">Access Recovery</h2>
              <p className="text-secondary font-medium italic max-w-sm mx-auto">
                For institutional security, passkey resets must be initiated through your platform administrator.
              </p>
            </div>

            {/* Contact Card */}
            <div className="p-8 border-2 border-accent bg-accent/5">
              <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-3">Administrative Contact</p>
              <p className="text-2xl font-black italic text-foreground">admin@streamlinelms.edu</p>
            </div>

            {/* Back to sign in */}
            <Link
              href="/auth/signin"
              className="btn-rect-outline inline-flex items-center gap-2"
            >
              ← Return to Authentication
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
