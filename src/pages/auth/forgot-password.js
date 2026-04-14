import React from 'react';
import Link from 'next/link';
import Head from 'next/head';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-white text-foreground flex flex-col items-center justify-center py-12 px-6">
      <Head>
        <title>Reset Password | SLA</title>
        <meta name="description" content="Reset your SLA account password." />
      </Head>

      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-border shadow-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-8">
          <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
            <span className="text-primary font-bold text-xl">S</span>
          </div>
          <span className="text-2xl font-bold text-primary tracking-tight">SLA</span>
        </Link>
        
        {/* Icon */}
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-4">Forgot Password?</h1>
        <p className="text-secondary text-sm mb-8">
          For security reasons, please contact our support team to safely reset your password.
        </p>

        {/* Contact Card */}
        <div className="bg-gray-50 border border-border rounded-2xl p-6 mb-8">
          <p className="text-sm font-semibold text-secondary mb-2">Support Email</p>
          <a href="mailto:support@sla-learning.com" className="text-xl font-bold text-primary hover:underline">
            support@sla-learning.com
          </a>
        </div>

        <Link
          href="/auth/signin"
          className="btn-primary w-full inline-flex justify-center"
        >
          Back to Log In
        </Link>
      </div>
      
      <div className="mt-8">
        <Link href="/" className="text-sm font-semibold text-secondary hover:text-primary transition-colors">
          ← Back to homepage
        </Link>
      </div>
    </div>
  );
}
