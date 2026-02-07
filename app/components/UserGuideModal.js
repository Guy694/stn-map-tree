'use client';

import { useState } from 'react';

export default function UserGuideModal({ isOpen, onClose }) {
    const [currentStep, setCurrentStep] = useState(0);

    if (!isOpen) return null;

    const steps = [
        {
            title: "ยินดีต้อนรับสู่ระบบ 1 คน 1 ต้น ฝนนี้ที่สตูล",
            icon: "🌳",
            content: (
                <div className="space-y-4">
                    <p className="text-gray-700">
                        ระบบนี้ออกแบบมาเพื่อให้ผู้ใช้สามารถบันทึกข้อมูลต้นไม้ที่ปลูกในจังหวัดสตูลได้อย่างง่ายดาย
                    </p>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-green-800 mb-2">💡 เป้าหมาย</h4>
                        <p className="text-green-700">
                            เพื่อสนับสนุนโครงการปลูกต้นไม้ และติดตามการปลูกต้นไม้ในพื้นที่จังหวัดสตูล
                        </p>
                    </div>
                </div>
            )
        },
        {
            title: "ขั้นตอนที่ 1: เข้าสู่ระบบ",
            icon: "🔐",
            content: (
                <div className="space-y-4">
                    <p className="text-gray-700">
                        ก่อนบันทึกข้อมูลต้นไม้ คุณต้องเข้าสู่ระบบเสียก่อน
                    </p>
                    <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                        <div className="flex items-start gap-3">
                            <span className="text-xl">1️⃣</span>
                            <div>
                                <h4 className="font-semibold text-blue-800">คลิกปุ่ม "เข้าสู่ระบบ"</h4>
                                <p className="text-blue-700 text-sm">ที่มุมบนขวาของหน้าจอ</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-xl">2️⃣</span>
                            <div>
                                <h4 className="font-semibold text-blue-800">กรอกข้อมูล</h4>
                                <p className="text-blue-700 text-sm">ชื่อผู้ใช้และรหัสผ่าน หรือลงทะเบียนใหม่</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-xl">3️⃣</span>
                            <div>
                                <h4 className="font-semibold text-blue-800">เข้าสู่ระบบ</h4>
                                <p className="text-blue-700 text-sm">หลังเข้าสู่ระบบแล้ว จะเห็นชื่อของคุณมุมบนขวา</p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "ขั้นตอนที่ 2: บันทึกข้อมูลต้นไม้",
            icon: "📝",
            content: (
                <div className="space-y-4">
                    <p className="text-gray-700">
                        เมื่อเข้าสู่ระบบแล้ว คุณสามารถบันทึกข้อมูลต้นไม้ได้
                    </p>
                    <div className="bg-green-50 p-4 rounded-lg space-y-3">
                        <div className="flex items-start gap-3">
                            <span className="text-xl">1️⃣</span>
                            <div>
                                <h4 className="font-semibold text-green-800">คลิกปุ่ม "บันทึกต้นไม้"</h4>
                                <p className="text-green-700 text-sm">ที่มุมบนขวาของหน้าจอ (ปุ่มสีเขียว 🌳)</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-xl">2️⃣</span>
                            <div>
                                <h4 className="font-semibold text-green-800">กรอกข้อมูล</h4>
                                <ul className="text-green-700 text-sm list-disc list-inside space-y-1">
                                    <li>ชื่อต้นไม้ (เลือกจากรายการหรือพิมพ์เอง)</li>
                                    <li>จำนวนต้น</li>
                                    <li>วันที่ปลูก</li>
                                    <li>ตำแหน่งบนแผนที่</li>
                                    <li>รูปภาพ (ถ้ามี)</li>
                                    <li>หมายเหตุเพิ่มเติม (ถ้ามี)</li>
                                </ul>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-xl">3️⃣</span>
                            <div>
                                <h4 className="font-semibold text-green-800">กดบันทึก</h4>
                                <p className="text-green-700 text-sm">ข้อมูลจะถูกบันทึกและแสดงบนแผนที่</p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "ขั้นตอนที่ 3: เลือกตำแหน่งบนแผนที่",
            icon: "📍",
            content: (
                <div className="space-y-4">
                    <p className="text-gray-700">
                        วิธีระบุตำแหน่งต้นไม้บนแผนที่
                    </p>
                    <div className="bg-orange-50 p-4 rounded-lg space-y-3">
                        <div className="flex items-start gap-3">
                            <span className="text-xl">🎯</span>
                            <div>
                                <h4 className="font-semibold text-orange-800">วิธีที่ 1: คลิกบนแผนที่</h4>
                                <p className="text-orange-700 text-sm">คลิกที่ตำแหน่งบนแผนที่เล็ก ๆ ในฟอร์ม</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-xl">🌍</span>
                            <div>
                                <h4 className="font-semibold text-orange-800">วิธีที่ 2: ใช้ GPS</h4>
                                <p className="text-orange-700 text-sm">คลิกปุ่ม "ใช้ตำแหน่งปัจจุบัน" เพื่อใช้ตำแหน่ง GPS</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-xl">✏️</span>
                            <div>
                                <h4 className="font-semibold text-orange-800">วิธีที่ 3: พิมพ์พิกัด</h4>
                                <p className="text-orange-700 text-sm">พิมพ์พิกัด Latitude และ Longitude โดยตรง</p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "ขั้นตอนที่ 4: การใช้งานแผนที่",
            icon: "🗺️",
            content: (
                <div className="space-y-4">
                    <p className="text-gray-700">
                        ฟีเจอร์ต่าง ๆ บนแผนที่
                    </p>
                    <div className="bg-purple-50 p-4 rounded-lg space-y-3">
                        <div className="flex items-start gap-3">
                            <span className="text-xl">📊</span>
                            <div>
                                <h4 className="font-semibold text-purple-800">แผงข้อมูลด้านซ้าย</h4>
                                <p className="text-purple-700 text-sm">แสดงสถิติต้นไม้และตัวกรองต่าง ๆ</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-xl">🌲</span>
                            <div>
                                <h4 className="font-semibold text-purple-800">กรองประเภทต้นไม้</h4>
                                <p className="text-purple-700 text-sm">เลือกประเภทต้นไม้ที่ต้องการดูบนแผนที่</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-xl">📍</span>
                            <div>
                                <h4 className="font-semibold text-purple-800">กรองตามพื้นที่</h4>
                                <p className="text-purple-700 text-sm">เลือกอำเภอและตำบลที่ต้องการดู</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-xl">🗺️</span>
                            <div>
                                <h4 className="font-semibold text-purple-800">เปลี่ยนชั้นข้อมูล</h4>
                                <p className="text-purple-700 text-sm">เปิด/ปิด ขอบเขตอำเภอ, ตำบล, หมู่บ้าน และ Heatmap</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-xl">🛰️</span>
                            <div>
                                <h4 className="font-semibold text-purple-800">เลือกแผนที่</h4>
                                <p className="text-purple-700 text-sm">สลับระหว่างแผนที่ OpenStreetMap และภาพดาวเทียม</p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "เคล็ดลับการใช้งาน",
            icon: "💡",
            content: (
                <div className="space-y-4">
                    <p className="text-gray-700">
                        เคล็ดลับและข้อควรรู้
                    </p>
                    <div className="bg-yellow-50 p-4 rounded-lg space-y-3">
                        <div className="flex items-start gap-3">
                            <span className="text-xl">✅</span>
                            <div>
                                <h4 className="font-semibold text-yellow-800">ถ่ายรูปต้นไม้</h4>
                                <p className="text-yellow-700 text-sm">แนะนำให้ถ่ายรูปต้นไม้เพื่อเป็นหลักฐาน</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-xl">✅</span>
                            <div>
                                <h4 className="font-semibold text-yellow-800">ระบุตำแหน่งที่แน่นอน</h4>
                                <p className="text-yellow-700 text-sm">ใช้ GPS เพื่อความแม่นยำของตำแหน่ง</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-xl">✅</span>
                            <div>
                                <h4 className="font-semibold text-yellow-800">กรอกข้อมูลให้ครบถ้วน</h4>
                                <p className="text-yellow-700 text-sm">ข้อมูลที่ครบถ้วนจะช่วยในการติดตามและสถิติ</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-xl">⚠️</span>
                            <div>
                                <h4 className="font-semibold text-yellow-800">ตรวจสอบข้อมูลก่อนบันทึก</h4>
                                <p className="text-yellow-700 text-sm">ตรวจสอบความถูกต้องของข้อมูลก่อนกดบันทึก</p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    const currentStepData = steps[currentStep];

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleClose = () => {
        setCurrentStep(0);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <span className="text-4xl">{currentStepData.icon}</span>
                            <h2 className="text-2xl font-bold">คู่มือการใช้งาน</h2>
                        </div>
                        <button
                            onClick={handleClose}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 transition"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="flex gap-1 mt-4">
                        {steps.map((_, index) => (
                            <div
                                key={index}
                                className={`h-1 flex-1 rounded-full transition-all ${index === currentStep
                                        ? 'bg-white'
                                        : index < currentStep
                                            ? 'bg-white/60'
                                            : 'bg-white/20'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                        {currentStepData.title}
                    </h3>
                    <div className="text-gray-600">
                        {currentStepData.content}
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            หน้า {currentStep + 1} จาก {steps.length}
                        </div>
                        <div className="flex gap-2">
                            {currentStep > 0 && (
                                <button
                                    onClick={prevStep}
                                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                >
                                    ← ย้อนกลับ
                                </button>
                            )}
                            {currentStep < steps.length - 1 ? (
                                <button
                                    onClick={nextStep}
                                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                                >
                                    ถัดไป →
                                </button>
                            ) : (
                                <button
                                    onClick={handleClose}
                                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                                >
                                    ✓ เข้าใจแล้ว
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
