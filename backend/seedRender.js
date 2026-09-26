require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// This requires a valid DATABASE_URL to be passed.
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
    console.error("❌ Error: You must set the DATABASE_URL environment variable.");
    console.log("Run this script like: DATABASE_URL='postgres://user:pass@host/db' node seedRender.js");
    process.exit(1);
}

const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log("📡 Connecting to the Render database...");
        
        console.log("📄 Reading schema_pg.sql...");
        const schema = fs.readFileSync(path.join(__dirname, '../database/schema_pg.sql'), 'utf8');
        
        console.log("📄 Reading seed_pg.sql...");
        const seed = fs.readFileSync(path.join(__dirname, '../database/seed_pg.sql'), 'utf8');

        console.log("🧹 Dropping old tables to start fresh...");
        await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');

        console.log("🛠️ Executing Schema...");
        await pool.query(schema);
        console.log("✅ Schema created successfully!");

        console.log("🌱 Seeding Database...");
        await pool.query(seed);
        console.log("✅ Database seeded successfully!");

    } catch (err) {
        console.error("❌ Error during database initialization:");
        console.error(err);
    } finally {
        await pool.end();
        console.log("🔌 Connection closed.");
    }
}

run();
