import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
    try {
        // Fetch districts with geometry converted to GeoJSON
        const districts = await query(`
      SELECT 
        id,
        dis_name,
        pro_name,
        dis_code,
        pro_code,
        ST_AsGeoJSON(geometry) as geometry
      FROM districts_polygon
      WHERE pro_name = 'สตูล'
      ORDER BY dis_name
    `);

        // Convert to GeoJSON FeatureCollection
        const geojson = {
            type: 'FeatureCollection',
            features: districts.map(district => {
                // Handle geometry - ST_AsGeoJSON might return string or object
                let geometry;
                if (typeof district.geometry === 'string') {
                    geometry = JSON.parse(district.geometry);
                } else if (typeof district.geometry === 'object' && district.geometry !== null) {
                    // Already an object, use as-is
                    geometry = district.geometry;
                } else {
                    throw new Error(`Invalid geometry type: ${typeof district.geometry}`);
                }

                return {
                    type: 'Feature',
                    properties: {
                        id: district.id,
                        name: district.dis_name,
                        provinceName: district.pro_name,
                        districtCode: district.dis_code,
                        provinceCode: district.pro_code
                    },
                    geometry
                };
            })
        };

        return NextResponse.json(geojson);
    } catch (error) {
        console.error('Error fetching districts:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            code: error.code
        });
        return NextResponse.json(
            { error: 'ไม่สามารถดึงข้อมูลอำเภอได้', details: error.message },
            { status: 500 }
        );
    }
}
