import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
    try {
        //Fetch villages from satun_village_polygon table
        const villages = await query(`
      SELECT 
        id,
        villname,
        subdistnam,
        distname,
        provname,
        villcode,
        ST_AsGeoJSON(geom) as geometry
      FROM satun_village_polygon
      WHERE provname = 'สตูล'
      ORDER BY distname, subdistnam, villname
    `);

        // Convert to GeoJSON FeatureCollection
        const geojson = {
            type: 'FeatureCollection',
            features: villages.map(village => {
                // Handle geometry - ST_AsGeoJSON returns a string
                let geometry;

                if (typeof village.geometry === 'string') {
                    geometry = JSON.parse(village.geometry);
                } else if (typeof village.geometry === 'object' && village.geometry !== null) {
                    geometry = village.geometry;
                } else {
                    console.warn('Unexpected geometry format for village:', village.id);
                    return null;
                }

                return {
                    type: 'Feature',
                    properties: {
                        id: village.id,
                        name: village.villname,
                        tambonName: village.subdistnam,
                        districtName: village.distname,
                        provinceName: village.provname,
                        villageCode: village.villcode
                    },
                    geometry
                };
            }).filter(f => f !== null) // Remove any null features
        };

        return NextResponse.json(geojson);
    } catch (error) {
        console.error('Error fetching villages:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            code: error.code
        });
        return NextResponse.json(
            { error: 'ไม่สามารถดึงข้อมูลหมู่บ้านได้', details: error.message },
            { status: 500 }
        );
    }
}
