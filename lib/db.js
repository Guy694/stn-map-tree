import mysql from 'mysql2/promise';

let pool;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT || '3306'),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: 'utf8mb4'
    });
  }
  return pool;
}

export async function query(sql, params) {
  const pool = getPool();
  const [results] = await pool.execute(sql, params);
  return results;
}

export async function queryOne(sql, params) {
  const results = await query(sql, params);
  return results[0] || null;
}

// Helper function to convert MySQL geometry to GeoJSON
export function geometryToGeoJSON(geometry) {
  if (!geometry) return null;
  
  // MySQL returns geometry as Buffer, we need to convert it
  // This is a simplified version - in production you might want to use a library
  try {
    // For now, we'll use ST_AsGeoJSON in queries instead
    return geometry;
  } catch (error) {
    console.error('Error converting geometry:', error);
    return null;
  }
}

export default { getPool, query, queryOne, geometryToGeoJSON };
