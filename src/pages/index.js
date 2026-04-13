import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen selection:bg-accent selection:text-white">
      <Head>
        <title>Streamline | Institutional Learning Ecosystem</title>
        <meta name="description" content="Advanced Learning Management System for modern academic environments." />
      </Head>

      {/* Navigation */}
      <nav className="glass sticky top-0 z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-foreground flex items-center justify-center">
              <span className="text-white font-black italic">SL</span>
            </div>
            <span className="text-xl font-black tracking-tighter uppercase italic">Streamline<span className="text-accent underline">LMS</span></span>
          </Link>
          <div className="hidden md:flex gap-8 items-center font-bold text-xs uppercase tracking-widest text-secondary">
            <a href="#ecosystem" className="hover:text-foreground transition-colors">Ecosystem</a>
            <a href="#framework" className="hover:text-foreground transition-colors">Framework</a>
            <div className="h-4 w-[1px] bg-border"></div>
            <Link href="/auth/signin" className="hover:text-foreground transition-colors">Client Access</Link>
          </div>
          <Link href="/auth/signup" className="btn-rect-primary">
            Initialize
          </Link>
        </div>
      </nav>

      <main>
        {/* Hero Area */}
        <section className="relative pt-20 pb-32 overflow-hidden px-6">
          <div className="absolute top-0 right-0 -z-10 w-1/2 h-full opacity-10 blur-3xl animate-float">
             <div className="w-full h-full bg-accent rounded-full"></div>
          </div>
          
          <div className="max-w-7xl mx-auto text-center md:text-left flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 space-y-8">
              <div className="inline-block px-4 py-1 bg-accent/10 border-l-4 border-accent">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">LMS Standards v4.0</span>
              </div>
              
              <h1 className="text-5xl md:text-8xl leading-[0.9] font-black italic uppercase tracking-tighter text-foreground">
                Institutional <br/> 
                <span className="text-accent">Learning</span> <br/> 
                Excellence
              </h1>
              
              <p className="max-w-xl text-lg text-secondary font-medium leading-relaxed">
                A unified framework for academic administration, module delivery, and learner assessment. Engineered for the future of digital education.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/auth/signup" className="btn-rect-primary text-center">
                  Start Enrollment
                </Link>
                <Link href="/auth/signin" className="btn-rect-outline text-center">
                  Platform Demo
                </Link>
              </div>
            </div>

            <div className="flex-1 hidden md:block">
              <div className="relative">
                <div className="absolute inset-0 bg-accent/20 -rotate-3 z-0"></div>
                <div className="glass p-1 relative z-10 border-4 border-foreground">
                  <div className="bg-foreground w-full h-96 flex items-center justify-center">
                     <span className="text-accent text-6xl font-black italic">INTERFACE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Grid-based Content Section */}
        <section id="ecosystem" className="py-32 bg-foreground text-white px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-6xl text-white italic leading-none">The Academic <br/> Hub Ecosystem</h2>
                <div className="h-1 w-32 bg-accent"></div>
              </div>
              <p className="max-w-md text-slate-400 font-medium italic">
                Our platform provides role-specific portals tailored to maximize institutional efficiency.
              </p>
            </div>

            <div className="grid-lms">
              {/* Admin Portal */}
              <div className="p-8 border border-white/10 hover:border-accent group transition-all duration-500">
                <div className="text-accent mb-6 font-black text-4xl">01</div>
                <h3 className="text-2xl mb-4 text-white">Institutional Admin</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                  Centralized control for user lifecycles, curriculum definitions, and high-level platform analytics.
                </p>
                <ul className="space-y-3 font-bold text-[10px] uppercase tracking-widest text-slate-500 group-hover:text-accent transition-colors">
                  <li>- Faculty Management</li>
                  <li>- System Governance</li>
                </ul>
              </div>

              {/* Lecturer Portal */}
              <div className="p-8 border-2 border-accent transition-all duration-500 relative overflow-hidden group">
                <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="text-white mb-6 font-black text-4xl italic underline">02</div>
                <h3 className="text-2xl mb-4 text-white">Module Instructors</h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-8">
                  Advanced module architecture, resource distribution, and automated assessment frameworks.
                </p>
                <ul className="space-y-3 font-bold text-[10px] uppercase tracking-widest text-white">
                  <li>- Module Repository</li>
                  <li>- Grading Engine</li>
                </ul>
              </div>

              {/* Student Portal */}
              <div className="p-8 border border-white/10 hover:border-accent group transition-all duration-500">
                <div className="text-accent mb-6 font-black text-4xl">03</div>
                <h3 className="text-2xl mb-4 text-white">Learner Portal</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                  Personalized learning paths, interactive assignments, and real-time performance tracking.
                </p>
                <ul className="space-y-3 font-bold text-[10px] uppercase tracking-widest text-slate-500 group-hover:text-accent transition-colors">
                  <li>- Course Enrollment</li>
                  <li>- Performance Metrics</li>
                </ul>
              </div>

              {/* Resource Portal */}
              <div className="p-8 border border-white/10 hover:border-accent group transition-all duration-500">
                <div className="text-accent mb-6 font-black text-4xl">04</div>
                <h3 className="text-2xl mb-4 text-white">Resource Vault</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                  Global repository for institutional knowledge, documentation, and archival materials.
                </p>
                <ul className="space-y-3 font-bold text-[10px] uppercase tracking-widest text-slate-500 group-hover:text-accent transition-colors">
                  <li>- Asset Library</li>
                  <li>- Video Archives</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile-First Approach Section */}
        <section id="framework" className="py-32 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-20 items-center">
            <div className="flex-1 w-full">
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-square bg-slate-200 border-2 border-foreground flex items-center justify-center">
                  <span className="font-black italic text-foreground opacity-20">GRID_A</span>
                </div>
                <div className="aspect-square bg-foreground flex items-center justify-center">
                   <span className="font-black italic text-accent">GRID_B</span>
                </div>
                <div className="aspect-square bg-accent flex items-center justify-center">
                   <span className="font-black italic text-white">GRID_C</span>
                </div>
                <div className="aspect-square bg-slate-200 border-2 border-foreground flex items-center justify-center">
                   <span className="font-black italic text-foreground opacity-20">GRID_D</span>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-8">
               <h2 className="text-4xl md:text-6xl leading-tight">Responsive <br/> Performance <br/> Framework</h2>
               <p className="text-secondary font-medium italic">
                 Our mobile-first philosophy ensures that the learning experience is seamless across all devices, from high-resolution workstations to handheld mobile terminals.
               </p>
               <button className="btn-rect-primary">View Infrastructure</button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t-4 border-foreground py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
           <div className="space-y-2">
              <span className="text-2xl font-black italic uppercase tracking-tighter">Streamline.</span>
              <p className="text-[10px] uppercase font-bold tracking-[0.5em] text-secondary">Advanced Institutional LMS</p>
           </div>
           <p className="text-xs font-bold text-secondary uppercase tracking-widest italic">
              &copy; {new Date().getFullYear()} GLOBAL LEARNING STANDARDS. ALL SYSTEMS NOMINAL.
           </p>
        </div>
      </footer>
    </div>
  );
}