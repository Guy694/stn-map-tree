import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
    try {
        // Fetch villages with geometry converted to GeoJSON
        const villages = await query(`
      SELECT 
        id,
        vil_name,
        tam_name,
        dis_name,
        pro_name,
        vil_code,
        tum_code,
        dis_code,
        pro_code,
        ST_AsGeoJSON(geometry) as geometry
      FROM villages_polygon
      WHERE pro_name = 'สตูล'
      ORDER BY dis_name, tam_name, vil_name
    `);

        // Convert to GeoJSON FeatureCollection
        const geojson = {
            type: 'FeatureCollection',
            features: villages.map(village => ({
                type: 'Feature',
                properties: {
                    id: village.id,
                    name: village.vil_name,
                    tambonName: village.tam_name,
                    districtName: village.dis_name,
                    provinceName: village.pro_name,
                    villageCode: village.vil_code,
                    tambonCode: village.tum_code,
                    districtCode: village.dis_code,
                    provinceCode: village.pro_code
                },
                geometry: JSON.parse(village.geometry)
            }))
        };

        return NextResponse.json(geojson);
    } catch (error) {
        console.error('Error fetching villages:', error);
        return NextResponse.json(
            { error: 'ไม่สามารถดึงข้อมูลหมู่บ้านได้' },
            { status: 500 }
        );
    }
}
