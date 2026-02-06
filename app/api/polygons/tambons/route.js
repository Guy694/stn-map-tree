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
      FROM satun_tambon_polygon
      WHERE pro_name = 'สตูล'
      ORDER BY dis_name, tam_name
    `);

        // Convert to GeoJSON FeatureCollection
        const geojson = {
            type: 'FeatureCollection',
            features: tambons.map(tambon => {
                // Handle geometry - ST_AsGeoJSON might return string or object
                let geometry;
                if (typeof tambon.geometry === 'string') {
                    geometry = JSON.parse(tambon.geometry);
                } else if (typeof tambon.geometry === 'object' && tambon.geometry !== null) {
                    geometry = tambon.geometry;
                } else {
                    throw new Error(`Invalid geometry type: ${typeof tambon.geometry}`);
                }

                return {
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
                    geometry
                };
            })
        };

        return NextResponse.json(geojson);
    } catch (error) {
        console.error('Error fetching tambons:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            code: error.code
        });
        return NextResponse.json(
            { error: 'ไม่สามารถดึงข้อมูลตำบลได้', details: error.message },
            { status: 500 }
        );
    }
}
