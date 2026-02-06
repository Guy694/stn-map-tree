'use client';

import { useRouter } from 'next/navigation';

export default function Navbar({ currentUser, onLogout }) {
    const router = useRouter();

    const handleLogout = async () => {
        if (onLogout) {
            await onLogout();
        }
        router.push('/');
    };

    return (
        <nav className="navbar-gradient sticky top-0 z-[600] shadow-lg">
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo and Project Name */}
                    <div className="flex items-center gap-4">
                        <div className="text-4xl animate-bounce-slow">🌳</div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-white drop-shadow-lg">
                                โครงการ 1 คน 1 ต้น หนีฝนสตูล
                            </h1>
                            <p className="text-xs md:text-sm text-green-50/90">
                                ระบบบันทึกและติดตามต้นไม้
                            </p>
                        </div>
                    </div>

                    {/* User Profile Section */}
                    {currentUser && (
                        <div className="flex items-center gap-3">
                            <div className="hidden md:flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                                <span className="text-2xl">👤</span>
                                <div className="text-white">
                                    <p className="text-sm font-medium">{currentUser.fullName}</p>
                                    <p className="text-xs text-green-50/80">
                                        {currentUser.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้งาน'}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="bg-white/90 hover:bg-white text-green-700 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
                            >
                                <span>🚪</span>
                                <span className="hidden md:inline">ออกจากระบบ</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
