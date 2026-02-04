'use client';

export default function Legend() {
    const legendItems = [
        {
            icon: '🌳',
            label: 'ตำแหน่งต้นไม้ที่ปลูก',
            description: 'คลิกเพื่อดูรายละเอียด'
        }
    ];

    return (
        <div className="legend-container">
            <h3 className="text-sm font-bold text-green-800 mb-3 flex items-center gap-2">
                <span>📋</span>
                คำอธิบายสัญลักษณ์
            </h3>

            <div className="space-y-2">
                {legendItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                            <div className="text-sm font-medium text-gray-800">{item.label}</div>
                            <div className="text-xs text-gray-500">{item.description}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Stats */}
            <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                    💚 จังหวัดสตูล
                </div>
            </div>
        </div>
    );
}
