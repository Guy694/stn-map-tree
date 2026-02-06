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
                background: 'linear-gradient(135deg, #064e3b 0%, #065f46 15%, #047857 30%, #059669 45%, #10b981 60%, #34d399 75%, #6ee7b7 90%, #a7f3d0 100%)'
            }}
        >
            {/* Modern mesh gradient overlay */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-30"
                    style={{
                        backgroundImage: `
                            radial-gradient(at 40% 20%, rgba(16, 185, 129, 0.9) 0px, transparent 50%),
                            radial-gradient(at 80% 0%, rgba(52, 211, 153, 0.7) 0px, transparent 50%),
                            radial-gradient(at 0% 50%, rgba(5, 150, 105, 0.8) 0px, transparent 50%),
                            radial-gradient(at 80% 50%, rgba(110, 231, 183, 0.6) 0px, transparent 50%),
                            radial-gradient(at 0% 100%, rgba(16, 185, 129, 0.7) 0px, transparent 50%),
                            radial-gradient(at 80% 100%, rgba(20, 184, 166, 0.6) 0px, transparent 50%),
                            radial-gradient(at 0% 0%, rgba(15, 118, 110, 0.7) 0px, transparent 50%)
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
            <div className="relative z-10 flex flex-col items-center px-6">
                {/* Animated Tree Icon */}
                <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0s' }}>
                    <div className="relative">
                        <div className="text-8xl drop-shadow-2xl animate-bounce-slow">🌳</div>
                        <div className="absolute -bottom-2 -right-2 text-4xl animate-pulse-slow">🌿</div>
                        <div className="absolute -top-2 -left-2 text-2xl animate-pulse" style={{ animationDelay: '0.5s' }}>🍃</div>
                    </div>
                </div>

                {/* Logos */}
                <div className="flex items-center justify-center gap-8 md:gap-12 mb-8">
                    <img
                        src="/img/Logo_moph.png"
                        alt="กระทรวงสาธารณสุข"
                        className="h-24 md:h-32 w-auto drop-shadow-2xl animate-fade-in-up hover:scale-105 transition-transform duration-300"
                        style={{ animationDelay: '0.3s' }}
                    />
                    <img
                        src="/img/satun.png"
                        alt="จังหวัดสตูล"
                        className="h-24 md:h-32 w-auto drop-shadow-2xl animate-fade-in-up hover:scale-105 transition-transform duration-300"
                        style={{ animationDelay: '0.5s' }}
                    />
                </div>

                {/* Title with modern styling */}
                <div className="text-center space-y-3">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-2xl animate-fade-in-up tracking-tight"
                        style={{
                            animationDelay: '0.7s',
                            textShadow: '0 4px 20px rgba(0,0,0,0.3), 0 0 40px rgba(255,255,255,0.2)'
                        }}>
                        โครงการ 1 คน 1 ต้น
                    </h1>

                    <div className="flex items-center justify-center gap-3 animate-fade-in-up" style={{ animationDelay: '0.9s' }}>
                        <div className="h-px w-12 bg-white/50"></div>
                        <h2 className="text-3xl md:text-4xl font-semibold text-white/95 drop-shadow-lg tracking-wider">
                            ฝนนี้ที่สตูล
                        </h2>
                        <div className="h-px w-12 bg-white/50"></div>
                    </div>

                    <p className="text-white/80 text-lg font-light tracking-wide animate-fade-in-up" style={{ animationDelay: '1.1s' }}>
                        🌧️ ระบบบันทึกข้อมูลต้นไม้ จังหวัดสตูล 🌱
                    </p>
                </div>

                {/* Modern loading indicator with progress feel */}
                <div className="mt-12 animate-fade-in-up" style={{ animationDelay: '1.3s' }}>
                    <div className="flex flex-col items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-white rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0s' }} />
                            <div className="w-3 h-3 bg-white/80 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0.15s' }} />
                            <div className="w-3 h-3 bg-white/60 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0.3s' }} />
                        </div>
                        <p className="text-white/70 text-sm font-light">กำลังโหลด...</p>
                    </div>
                </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center opacity-30">
                <div className="flex gap-6 text-4xl">
                    <span className="animate-float" style={{ animationDelay: '0s' }}>🌱</span>
                    <span className="animate-float" style={{ animationDelay: '0.3s' }}>🌿</span>
                    <span className="animate-float" style={{ animationDelay: '0.6s' }}>🍃</span>
                    <span className="animate-float" style={{ animationDelay: '0.9s' }}>🌾</span>
                </div>
            </div>
        </div>
    );
}
