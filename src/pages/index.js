import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-800 text-white font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      <Head>
        <title>Streamline LMS | The Future of Learning</title>
        <meta name="description" content="A comprehensive Learning Management System built for students, lecturers, and administrators to seamlessly manage academic workflows." />
      </Head>

      {/* Navbar Minimal */}
      <nav className="flex justify-between items-center px-4 sm:px-8 py-4 sm:py-6 max-w-7xl mx-auto w-full backdrop-blur-md bg-white/5 border-b border-white/10 sticky top-0 z-50 rounded-b-2xl sm:rounded-b-3xl mb-4 sm:mb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <span className="font-bold text-lg sm:text-xl tracking-tighter text-white">S</span>
          </div>
          <span className="text-lg sm:text-xl font-bold tracking-wider text-white">Streamline<span className="text-cyan-400">LMS</span></span>
        </div>
        <div className="flex gap-2 sm:gap-4">
          <Link href="/auth/signin" className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-full font-medium text-xs sm:text-sm transition-all hover:bg-white/10 border border-white/20 hover:border-white/40">
            Sign In
          </Link>
          <Link href="/auth/signup" className="px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full font-medium text-xs sm:text-sm shadow-lg shadow-blue-500/25 hover:shadow-cyan-400/40 transition-all hover:-translate-y-0.5 whitespace-nowrap">
            Get Started
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center mt-8 sm:mt-12 mb-16 sm:mb-24 px-2 sm:px-4 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 sm:w-96 h-64 sm:h-96 bg-cyan-500/20 rounded-full blur-[80px] sm:blur-[120px] -z-10 pointer-events-none"></div>
          
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/5 border border-white/10 mb-6 sm:mb-8 backdrop-blur-sm animate-fade-in-up">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-xs sm:text-sm font-medium text-cyan-100">Now optimized for speed and scale</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-6 sm:mb-8 leading-tight sm:leading-[1.15] bg-clip-text text-transparent bg-gradient-to-b from-white via-blue-50 to-blue-200 drop-shadow-sm px-2">
            Master the Workflow of <br className="hidden sm:block"/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Modern Education</span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-blue-100/80 mb-10 sm:mb-12 max-w-2xl font-light leading-relaxed px-4">
            The Streamline Learning and Assessment Platform bridges the gap between administration, teaching, and learning in one lightning-fast ecosystem.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center px-4">
            <Link href="/auth/signup" className="px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-indigo-900 rounded-full font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl hover:bg-cyan-50 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
              Start Exploring Workflow
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </Link>
          </div>
        </section>

        {/* Workflow Depiction Section */}
        <section className="w-full mb-20 sm:mb-32 relative">
          <div className="text-center mb-10 sm:mb-16 px-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">A Platform Built for Everyone</h2>
            <p className="text-blue-200/70 max-w-2xl mx-auto text-sm sm:text-base">Discover how our distinct role-based workflows streamline the academic experience from enrollment to graduation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative z-10 w-full px-2 sm:px-0">
            {/* Admin Workflow */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:bg-white/10 transition-all group hover:-translate-y-2 duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center mb-5 sm:mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 text-white">Administrators</h3>
              <p className="text-blue-100/70 mb-6 line-clamp-3 text-sm sm:text-base font-light">Full control over the institution. Manage user onboarding, define curriculum structures, structure courses, and oversee the entire learning ecosystem effortlessly.</p>
              <ul className="space-y-3 text-xs sm:text-sm text-blue-100/80">
                <li className="flex items-center gap-2"><svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> Global Metrics & Analytics</li>
                <li className="flex items-center gap-2"><svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> User Roles Management</li>
                <li className="flex items-center gap-2"><svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> Course Architecture Setup</li>
              </ul>
            </div>

            {/* Lecturer Workflow */}
            <div className="bg-gradient-to-b from-blue-600/20 to-white/5 backdrop-blur-lg border border-blue-400/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:bg-blue-600/30 transition-all group hover:-translate-y-2 duration-300 relative shadow-2xl shadow-blue-500/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-[10px] sm:text-xs font-bold px-3 sm:px-4 py-1 rounded-full shadow-lg whitespace-nowrap">CORE ENGINE</div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center mb-5 sm:mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 text-white">Lecturers</h3>
              <p className="text-blue-100/70 mb-6 line-clamp-3 text-sm sm:text-base font-light">The command center for educators. Distribute resources, create detailed assignments with strict deadlines, and provide granular feedback on student submissions.</p>
              <ul className="space-y-3 text-xs sm:text-sm text-blue-100/80">
                <li className="flex items-center gap-2"><svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> Content Delivery Hub</li>
                <li className="flex items-center gap-2"><svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> Real-time Assessment Grading</li>
                <li className="flex items-center gap-2"><svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> Course-wide Announcements</li>
              </ul>
            </div>

            {/* Student Workflow */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:bg-white/10 transition-all group hover:-translate-y-2 duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center mb-5 sm:mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 text-white">Students</h3>
              <p className="text-blue-100/70 mb-6 line-clamp-3 text-sm sm:text-base font-light">A unified view for academic success. Enroll in courses, access lecture materials instantly, submit assignments before deadlines, and track real-time grading and feedback.</p>
              <ul className="space-y-3 text-xs sm:text-sm text-blue-100/80">
                <li className="flex items-center gap-2"><svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> Intuitive Course Dashboard</li>
                <li className="flex items-center gap-2"><svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> Seamless File Submissions</li>
                <li className="flex items-center gap-2"><svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> Live Grades & Feedback Review</li>
              </ul>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-12 py-8 bg-black/20 backdrop-blur-md text-center text-[10px] sm:text-sm text-blue-200/50 px-4">
        <p className="flex items-center justify-center gap-2">
          &copy; {new Date().getFullYear()} Streamline LMS. Optimized for Vercel & MongoDB.
        </p>
      </footer>
    </div>
  );
}