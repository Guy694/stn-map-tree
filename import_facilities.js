const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function importSql() {
    console.log('Starting import...');

    // Create connection with hardcoded credentials
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '123456',
        database: 'stn_tree',
        multipleStatements: true
    });

    try {
        console.log('Connected to database.');

        // Read SQL file
        const sqlPath = path.join(process.cwd(), 'health_facilities(1).sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');

        // Disable foreign key checks and drop table
        await connection.query('SET FOREIGN_KEY_CHECKS=0');
        await connection.query('DROP TABLE IF EXISTS health_facilities');
        console.log('Dropped old table.');

        // Execute SQL content
        await connection.query(sqlContent);
        console.log('Imported new data.');

        // Re-enable foreign key checks
        await connection.query('SET FOREIGN_KEY_CHECKS=1');

        console.log('Import completed successfully!');

        // Check data count
        const [rows] = await connection.query('SELECT COUNT(*) as count FROM health_facilities');
        console.log(`Total facilities: ${rows[0].count}`);

    } catch (error) {
        console.error('Import failed:', error);
    } finally {
        await connection.end();
    }
}

importSql();
