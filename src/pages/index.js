import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-600 selection:text-white overflow-x-hidden">
      <Head>
        <title>Streamline LMS | The Future of Learning</title>
        <meta name="description" content="A comprehensive Learning Management System built for students, lecturers, and administrators to seamlessly manage academic workflows." />
      </Head>

      {/* Navbar Minimal */}
      <nav className="flex justify-between items-center px-4 sm:px-8 py-4 sm:py-6 max-w-7xl mx-auto w-full backdrop-blur-md bg-white/80 border-b border-gray-100 sticky top-0 z-50 mb-4 sm:mb-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-tr from-blue-500 to-blue-700 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
            <span className="font-bold text-lg sm:text-xl tracking-tighter text-white">S</span>
          </div>
          <span className="text-lg sm:text-xl font-bold tracking-wider text-gray-900">Streamline<span className="text-blue-600">LMS</span></span>
        </Link>
        <div className="flex gap-2 sm:gap-4">
          <Link href="/auth/signin" className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all hover:bg-gray-50 border border-gray-200 text-gray-700">
            Sign In
          </Link>
          <Link href="/auth/signup" className="px-3 sm:px-5 py-2 sm:py-2.5 bg-blue-600 text-white rounded-full font-bold text-xs sm:text-sm shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all hover:-translate-y-0.5 whitespace-nowrap">
            Get Started
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center mt-12 sm:mt-20 mb-20 sm:mb-32 px-2 sm:px-4 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 sm:w-96 h-64 sm:h-96 bg-blue-100/50 rounded-full blur-[80px] sm:blur-[120px] -z-10 pointer-events-none"></div>
          
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-blue-50 border border-blue-100 mb-6 sm:mb-8 animate-fade-in-up">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span className="text-xs sm:text-sm font-black text-blue-600 uppercase tracking-widest">Optimized for Academic Excellence</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tight mb-8 leading-none text-gray-900">
            Simplify Your <br className="hidden sm:block"/> 
            <span className="text-blue-600 italic">Academic Workflow</span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-gray-500 mb-12 max-w-2xl font-medium leading-relaxed px-4">
            The Streamline LMS bridges the gap between administration, teaching, and learning in one unified, modern ecosystem.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center px-4">
            <Link href="/auth/signup" className="px-8 sm:px-10 py-4 sm:py-5 bg-gray-900 text-white rounded-full font-black text-lg shadow-2xl hover:bg-blue-600 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-4 group">
              Start Learning Now
              <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </Link>
          </div>
        </section>

        {/* Workflow Section */}
        <section className="w-full mb-24 sm:mb-40 relative">
          <div className="text-center mb-16 sm:mb-20 px-4">
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-4 block">Unified Infrastructure</span>
            <h2 className="text-3xl sm:text-5xl font-black mb-6 text-gray-900 tracking-tighter uppercase italic">Built for Every User</h2>
            <div className="h-1.5 w-24 bg-blue-600 mx-auto rounded-full mb-8"></div>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg font-medium">Experience role-based workflows designed to streamline the academic journey.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 relative z-10 w-full px-4 sm:px-0">
            {/* Admin */}
            <div className="bg-white border-2 border-gray-50 rounded-[40px] p-8 sm:p-10 shadow-xl shadow-gray-100/50 hover:shadow-2xl hover:shadow-blue-200/20 transition-all group hover:-translate-y-3 duration-500">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-600 transition-colors duration-500">
                <svg className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                </svg>
              </div>
              <h3 className="text-2xl font-black mb-4 text-gray-900 uppercase italic">Administrators</h3>
              <p className="text-gray-500 mb-8 text-sm font-medium leading-relaxed">Full institutional control. Manage users, define curriculum, and oversee the ecosystem with ease.</p>
              <ul className="space-y-4 text-xs font-black text-gray-400 uppercase tracking-widest">
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div> User Management</li>
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div> System Analytics</li>
              </ul>
            </div>

            {/* Lecturer */}
            <div className="bg-gray-900 rounded-[40px] p-8 sm:p-10 shadow-2xl shadow-blue-900/20 hover:shadow-blue-900/40 transition-all group hover:-translate-y-3 duration-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full translate-x-10 -translate-y-10 blur-3xl"></div>
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-8">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-2xl font-black mb-4 text-white uppercase italic">Lecturers</h3>
              <p className="text-gray-400 mb-8 text-sm font-medium leading-relaxed">The educator's hub. Upload materials, create assignments, and provide real-time student feedback.</p>
              <ul className="space-y-4 text-xs font-black text-blue-400 uppercase tracking-widest">
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-white"></div> Resource Hub</li>
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-white"></div> Grading Tool</li>
              </ul>
            </div>

            {/* Student */}
            <div className="bg-white border-2 border-gray-50 rounded-[40px] p-8 sm:p-10 shadow-xl shadow-gray-100/50 hover:shadow-2xl hover:shadow-blue-200/20 transition-all group hover:-translate-y-3 duration-500">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-600 transition-colors duration-500">
                <svg className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 14l9-5-9-5-9 5 9 5z" />
                </svg>
              </div>
              <h3 className="text-2xl font-black mb-4 text-gray-900 uppercase italic">Students</h3>
              <p className="text-gray-500 mb-8 text-sm font-medium leading-relaxed">Unified academic view. Access courses, submit work, and view performance results instantly.</p>
              <ul className="space-y-4 text-xs font-black text-gray-400 uppercase tracking-widest">
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div> Task Tracking</li>
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div> Grade History</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 bg-gray-50 text-center">
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
          &copy; {new Date().getFullYear()} Streamline LMS. Efficient Learning.
        </p>
      </footer>
    </div>
  );
}