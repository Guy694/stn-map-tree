'use client';

import { useState } from 'react';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
    const [isRegistering, setIsRegistering] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        fullName: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
            const body = isRegistering
                ? formData
                : { username: formData.username, password: formData.password };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'เกิดข้อผิดพลาด');
                setLoading(false);
                return;
            }

            if (isRegistering) {
                // After registration, switch to login
                setIsRegistering(false);
                setFormData({ username: '', password: '', fullName: '' });
                setError('');
                alert('สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ');
            } else {
                // Login successful
                onLoginSuccess(data.user);
                setFormData({ username: '', password: '', fullName: '' });
                onClose();
            }
        } catch (err) {
            setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsRegistering(!isRegistering);
        setError('');
        setFormData({ username: '', password: '', fullName: '' });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000]">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-green-500 px-6 py-4">
                    <h2 className="text-xl font-bold text-white">
                        {isRegistering ? '📝 สมัครสมาชิก' : '🔐 เข้าสู่ระบบ'}
                    </h2>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            ชื่อผู้ใช้
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                            placeholder="กรอกชื่อผู้ใช้"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            รหัสผ่าน
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                            placeholder="กรอกรหัสผ่าน"
                        />
                    </div>

                    {isRegistering && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                ชื่อ-นามสกุล
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                                placeholder="กรอกชื่อ-นามสกุล"
                            />
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'กำลังดำเนินการ...' : (isRegistering ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ')}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition"
                        >
                            ยกเลิก
                        </button>
                    </div>

                    {/* Toggle mode */}
                    <div className="text-center pt-2 border-t">
                        <button
                            type="button"
                            onClick={toggleMode}
                            className="text-sm text-green-600 hover:text-green-700 font-medium"
                        >
                            {isRegistering ? 'มีบัญชีแล้ว? เข้าสู่ระบบ' : 'ยังไม่มีบัญชี? สมัครสมาชิก'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
