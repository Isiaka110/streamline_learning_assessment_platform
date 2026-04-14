import Link from 'next/link';
import Image from 'next/image';

const LOGO_SIZE = 50;

function LogoContainer({ className = "" }) {
    return (
        <Link href="/dashboard" className="block shrink-0">
            <div className={`relative w-[50px] h-[50px] bg-primary rounded-full overflow-hidden shadow-sm flex items-center justify-center group hover:scale-105 transition-transform duration-300 ${className}`}>
                 <span className="text-white font-bold text-2xl">S</span>
            </div>
        </Link>
    );
}

export default LogoContainer;