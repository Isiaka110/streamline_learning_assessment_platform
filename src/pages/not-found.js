import Link from 'next/link';
import Head from 'next/head';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-foreground text-white flex items-center justify-center px-6">
      <Head>
        <title>404 — Resource Not Found | Streamline LMS</title>
      </Head>

      <div className="max-w-lg w-full text-center space-y-10">
        {/* Giant 404 */}
        <div className="relative">
          <span className="text-[12rem] md:text-[16rem] font-black italic leading-none opacity-5 select-none block">404</span>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="h-1 w-24 bg-accent mb-6"></div>
            <h1 className="text-3xl md:text-5xl text-white mb-2">Resource<br/>Not Found</h1>
            <p className="text-white/40 text-sm font-medium italic max-w-xs">
              The requested page or endpoint does not exist in the current institutional deployment.
            </p>
          </div>
        </div>

        {/* Action */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard" className="btn-rect bg-accent border-accent text-white hover:bg-white hover:text-foreground hover:border-white transition-all">
            Return to Hub
          </Link>
          <Link href="/" className="btn-rect bg-transparent border-white/20 text-white/60 hover:border-white hover:text-white transition-all">
            Platform Home
          </Link>
        </div>

        {/* Footer */}
        <p className="text-[10px] font-black uppercase tracking-widest text-white/20 italic">
          Streamline LMS — Institutional Learning Ecosystem
        </p>
      </div>
    </div>
  );
}