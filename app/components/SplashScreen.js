'use client';

import { useState, useEffect } from 'react';

export default function SplashScreen({ onComplete }) {
    const [isVisible, setIsVisible] = useState(true);
    const [isFading, setIsFading] = useState(false);

    useEffect(() => {
        // Start fade out after 2.5 seconds
        const fadeTimer = setTimeout(() => {
            setIsFading(true);
        }, 2500);

        // Complete splash after 3 seconds
        const completeTimer = setTimeout(() => {
            setIsVisible(false);
            if (onComplete) onComplete();
        }, 3000);

        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(completeTimer);
        };
    }, [onComplete]);

    if (!isVisible) return null;

    return (
        <div
            className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-500 ${isFading ? 'opacity-0' : 'opacity-100'}`}
            style={{
                background: 'linear-gradient(135deg, #0f766e 0%, #059669 25%, #10b981 50%, #34d399 75%, #6ee7b7 100%)'
            }}
        >
            {/* Modern mesh gradient overlay */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-30"
                    style={{
                        backgroundImage: `
                            radial-gradient(at 40% 20%, rgba(16, 185, 129, 0.8) 0px, transparent 50%),
                            radial-gradient(at 80% 0%, rgba(52, 211, 153, 0.6) 0px, transparent 50%),
                            radial-gradient(at 0% 50%, rgba(5, 150, 105, 0.7) 0px, transparent 50%),
                            radial-gradient(at 80% 50%, rgba(110, 231, 183, 0.5) 0px, transparent 50%),
                            radial-gradient(at 0% 100%, rgba(16, 185, 129, 0.6) 0px, transparent 50%),
                            radial-gradient(at 80% 100%, rgba(20, 184, 166, 0.5) 0px, transparent 50%),
                            radial-gradient(at 0% 0%, rgba(15, 118, 110, 0.6) 0px, transparent 50%)
                        `
                    }}
                />
                {/* Animated floating shapes */}
                <div className="absolute -top-10 -left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-teal-300/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />
                <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-emerald-300/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center">
                {/* Logos */}
                <div className="flex items-center justify-center gap-10 mb-10">
                    <img
                        src="/img/Logo_moph.png"
                        alt="กระทรวงสาธารณสุข"
                        className="h-28 w-auto drop-shadow-2xl animate-fade-in-up"
                        style={{ animationDelay: '0.2s' }}
                    />
                    <img
                        src="/img/satun.png"
                        alt="จังหวัดสตูล"
                        className="h-28 w-auto drop-shadow-2xl animate-fade-in-up"
                        style={{ animationDelay: '0.4s' }}
                    />
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-4 drop-shadow-lg animate-fade-in-up tracking-wide" style={{ animationDelay: '0.6s' }}>
                    1 คน 1 ต้นไม้
                </h1>
                <h2 className="text-2xl md:text-3xl font-medium text-white/95 text-center drop-shadow-md animate-fade-in-up tracking-wider" style={{ animationDelay: '0.8s' }}>
                    ฝนนี้ที่สตูล
                </h2>

                {/* Modern loading indicator */}
                <div className="mt-12 animate-fade-in-up" style={{ animationDelay: '1s' }}>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                        <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                        <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                    </div>
                </div>
            </div>
        </div>
    );
}
