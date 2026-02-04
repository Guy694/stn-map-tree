import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
    try {
        // Fetch tambons with geometry converted to GeoJSON
        const tambons = await query(`
      SELECT 
        id,
        tam_name,
        dis_name,
        pro_name,
        tum_code,
        dis_code,
        pro_code,
        ST_AsGeoJSON(geometry) as geometry
      FROM tambons_polygon
      WHERE pro_name = 'สตูล'
      ORDER BY dis_name, tam_name
    `);

        // Convert to GeoJSON FeatureCollection
        const geojson = {
            type: 'FeatureCollection',
            features: tambons.map(tambon => ({
                type: 'Feature',
                properties: {
                    id: tambon.id,
                    name: tambon.tam_name,
                    districtName: tambon.dis_name,
                    provinceName: tambon.pro_name,
                    tambonCode: tambon.tum_code,
                    districtCode: tambon.dis_code,
                    provinceCode: tambon.pro_code
                },
                geometry: JSON.parse(tambon.geometry)
            }))
        };

        return NextResponse.json(geojson);
    } catch (error) {
        console.error('Error fetching tambons:', error);
        return NextResponse.json(
            { error: 'ไม่สามารถดึงข้อมูลตำบลได้' },
            { status: 500 }
        );
    }
}
