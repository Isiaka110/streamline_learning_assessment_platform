import React from 'react';
import Image from 'next/image';

const LOGO_SIZE = 50;

function LogoContainer({ className = "" }) {
    return (
        <div className={`relative w-[50px] h-[50px] bg-indigo-600 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center shrink-0 border border-white/20 group hover:scale-110 transition-transform duration-500 ${className}`}>
            <Image
                src="/logo.png"
                alt="Platform Logo"
                width={LOGO_SIZE}
                height={LOGO_SIZE}
                style={{ objectFit: 'cover' }}
                priority
                className="transition-opacity group-hover:opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent pointer-events-none"></div>
        </div>
    );
}

export default LogoContainer;