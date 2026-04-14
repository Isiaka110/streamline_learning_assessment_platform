import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-white selection:bg-primary selection:text-white pb-12">
      <Head>
        <title>SLA | Streamlined Learning and Assessment Platform</title>
        <meta name="description" content="A lightweight, digital solution for higher education. Move from manual paper-based workflows to efficient digital assessments, communication, and recordkeeping." />
      </Head>

      {/* Navigation */}
      <nav className="glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
              <span className="text-primary font-bold text-lg">S</span>
            </div>
            <span className="text-lg font-bold text-primary tracking-tight">SLA</span>
          </Link>
          <div className="hidden md:flex gap-6 items-center font-bold text-xs text-foreground uppercase tracking-widest">
            <a href="#about" className="hover:text-primary transition-colors">Vision</a>
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
          </div>
          <div className="flex gap-4 items-center">
            <Link href="/auth/signin" className="font-bold text-xs text-primary uppercase tracking-widest hover:opacity-80 transition-opacity hidden md:block">
              Log In
            </Link>
            <Link href="/auth/signup" className="btn-primary py-2.5 px-6 text-xs shadow-none">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Area */}
        <section className="relative pt-12 md:pt-16 pb-12 px-6 overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 items-center">
            
            {/* Left side: Visual representation */}
            <div className="flex-1 w-full relative">
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-4">
                    <div className="aspect-[4/5] bg-blue-600 rounded-[2rem] overflow-hidden relative shadow-lg flex flex-col justify-end p-6 text-white">
                       <h3 className="text-xl font-bold mb-1">Digital Transition</h3>
                       <p className="text-[10px] font-semibold opacity-80">Modernizing higher education.</p>
                       <div className="mt-4 flex gap-2">
                          <div className="w-8 h-1 bg-white/30 rounded-full"></div>
                          <div className="w-4 h-1 bg-white rounded-full"></div>
                       </div>
                    </div>
                    <div className="bg-white rounded-[2rem] p-6 border border-border shadow-sm flex flex-col gap-3">
                       <div className="w-10 h-10 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                       </div>
                       <div>
                          <h4 className="font-bold text-foreground text-sm uppercase">Zero Script Loss</h4>
                          <p className="text-[9px] font-bold text-secondary uppercase tracking-widest italic opacity-50">Integrity focus</p>
                       </div>
                    </div>
                 </div>
                 <div className="space-y-4 pt-8">
                    <div className="bg-orange-500 rounded-[2rem] p-6 text-white shadow-lg">
                       <svg className="w-6 h-6 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                       <h4 className="font-bold mb-1 text-sm uppercase">Efficiency</h4>
                       <p className="text-[9px] font-bold opacity-80 uppercase">No bottlenecks.</p>
                    </div>
                    <div className="aspect-[4/5] bg-gray-50 rounded-[2rem] overflow-hidden relative border border-border flex items-center justify-center p-6">
                       <div className="text-center space-y-3">
                          <div className="w-12 h-1 bg-gray-200 mx-auto rounded-full"></div>
                          <div className="w-16 h-1 bg-gray-200 mx-auto rounded-full"></div>
                          <p className="text-[9px] font-bold text-secondary italic uppercase tracking-widest">Repository</p>
                       </div>
                    </div>
                 </div>
               </div>
            </div>

            {/* Right side: Content */}
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/20 rounded-full text-primary font-bold text-[9px] uppercase tracking-widest">
                <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                Digital Shift In Higher Education
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-[1.1] tracking-tight">
                Streamlined Learning & <span className="text-primary">Assessment.</span>
              </h1>
              
              <p className="text-base text-secondary leading-relaxed max-w-lg font-bold opacity-70 italic">
                Addressing the challenges of manual, paper-based academic workflows in universities. 
              </p>

              <div className="bg-white rounded-[2rem] p-8 border border-border shadow-sm space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full translate-x-4 -translate-y-4"></div>
                
                <div className="grid grid-cols-2 gap-6 pb-6 border-b border-gray-50">
                   <div>
                      <span className="text-2xl font-bold text-foreground">100%</span>
                      <p className="text-[9px] font-bold text-secondary uppercase tracking-widest">Accountability</p>
                   </div>
                   <div>
                      <span className="text-2xl font-bold text-foreground">Live</span>
                      <p className="text-[9px] font-bold text-secondary uppercase tracking-widest">Feedback Loop</p>
                   </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-foreground flex items-center gap-2 text-sm uppercase">
                    Platform Evolution
                  </h4>
                  <p className="text-[13px] text-secondary leading-relaxed font-semibold italic">
                    "SLA replaces traditional, ineffective paper-based communication with a centralized hub."
                  </p>
                </div>
                
                <Link href="/auth/signup" className="w-full btn-primary text-center block text-xs uppercase tracking-widest py-4 shadow-none">
                   Get Started Today
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <section id="about" className="py-16 md:py-20 px-6">
           <div className="max-w-4xl mx-auto text-center space-y-8">
              <div className="space-y-2">
                 <h2 className="text-[10px] font-bold text-primary uppercase tracking-[0.4em]">The Platform Goal</h2>
                 <h3 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                    Optimized for Academic Excellence.
                 </h3>
              </div>
              <p className="text-lg text-secondary leading-relaxed font-bold italic opacity-60 max-w-2xl mx-auto">
                 "Our methodology focuses on replacing script loss and grading errors with a context-aware system developed for the institutional landscape."
              </p>
           </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-20 px-6 bg-gray-50 border-y border-border">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Digital Submission", icon: "M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 006.5 22H20M4 19.5V3a2.5 2.5 0 012.5-2.5H20", color: "blue", desc: "Instant hand-ins for assignments, eliminating the need for bulky paper scripts." },
                { title: "Automated Grading", icon: "M9 11l3 3L22 4M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "green", desc: "Reducing grading errors and ensuring students receive results without manual delays." },
                { title: "Centralized Chat", icon: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z", color: "purple", desc: "A dedicated hub for students and teachers to communicate directly and transparently." },
                { title: "Academic Repository", icon: "M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z", color: "orange", desc: "Secure digital recordkeeping for all academic materials and history." }
              ].map((f, i) => (
                <div key={i} className="bg-white p-8 rounded-[2rem] border border-border shadow-sm group hover:border-primary transition-all duration-300">
                  <div className={`w-10 h-10 bg-${f.color}-50 text-${f.color}-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors`}>
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d={f.icon} strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <h3 className="text-lg font-bold mb-3 text-foreground">{f.title}</h3>
                  <p className="text-secondary text-[13px] leading-relaxed font-semibold italic opacity-80">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 px-6 max-w-7xl mx-auto border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
         <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
              <span className="text-primary font-bold">S</span>
            </div>
            <span className="text-base font-bold text-primary tracking-tight">SLA PLATFORM</span>
         </div>
         <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Designed for Operational Excellence.</p>
         <div className="flex gap-6 text-[10px] font-bold text-foreground mt-4 md:mt-0">
            <Link href="/auth/signin" className="uppercase tracking-widest hover:text-primary transition-colors">Access</Link>
            <Link href="/auth/signup" className="uppercase tracking-widest hover:text-primary transition-colors">Join</Link>
         </div>
      </footer>
    </div>
  );
}