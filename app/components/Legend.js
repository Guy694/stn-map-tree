'use client';

export default function Legend({ visibleLayers, onLayerToggle }) {
    return (
        <div className="absolute bottom-5 left-5 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-4 z-[500] min-w-[200px]">
            <h3 className="font-bold text-gray-800 mb-3 text-sm">🗺️ ชั้นข้อมูล</h3>

            <div className="space-y-2">
                {/* Districts layer */}
                <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input
                        type="checkbox"
                        checked={visibleLayers.districts}
                        onChange={() => onLayerToggle('districts')}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex items-center gap-2 flex-1">
                        <div className="w-4 h-4 border-2 border-blue-700 bg-blue-500/20 rounded"></div>
                        <span className="text-sm text-gray-700">อำเภอ</span>
                    </div>
                </label>

                {/* Tambons layer */}
                <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input
                        type="checkbox"
                        checked={visibleLayers.tambons}
                        onChange={() => onLayerToggle('tambons')}
                        className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                    />
                    <div className="flex items-center gap-2 flex-1">
                        <div className="w-4 h-4 border border-green-600 bg-green-500/20 rounded"></div>
                        <span className="text-sm text-gray-700">ตำบล</span>
                    </div>
                </label>

                {/* Villages layer */}
                <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input
                        type="checkbox"
                        checked={visibleLayers.villages}
                        onChange={() => onLayerToggle('villages')}
                        className="w-4 h-4 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
                    />
                    <div className="flex items-center gap-2 flex-1">
                        <div className="w-4 h-4 border border-orange-600 bg-orange-500/20 rounded"></div>
                        <span className="text-sm text-gray-700">หมู่บ้าน</span>
                    </div>
                </label>

                <div className="border-t border-gray-200 my-2 pt-2">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🌳</span>
                        <span className="text-sm text-gray-700">ต้นไม้ที่บันทึก</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
