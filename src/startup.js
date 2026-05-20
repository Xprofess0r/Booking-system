/**
 * startup.js - Production boot for Railway
 * Waits for DB, runs migrations, starts server.
 */

require('dotenv').config();
const { Sequelize } = require('sequelize');
const { execSync }  = require('child_process');
const path          = require('path');

const ROOT = path.resolve(__dirname, '..');

async function waitForDB(maxRetries = 10, delayMs = 3000) {
  const cfg = require('./config/config.js').production;
  console.log('DB config check:', JSON.stringify({
    host: cfg.host, user: cfg.username, db: cfg.database, port: cfg.port
  }));
  for (let i = 1; i <= maxRetries; i++) {
    try {
      const seq = new Sequelize(cfg.database, cfg.username, cfg.password, {
        host: cfg.host, port: cfg.port, dialect: 'mysql',
        dialectOptions: cfg.dialectOptions, logging: false
      });
      await seq.authenticate();
      await seq.close();
      console.log('✔ Database is reachable');
      return true;
    } catch (err) {
      console.log(`⏳ DB not ready (attempt ${i}/${maxRetries}): ${err.message}`);
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
  throw new Error('✖ Could not connect to database after maximum retries');
}

function run(cmd) {
  console.log(`\n▶ ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd: ROOT });
}

async function boot() {
  try {
    await waitForDB();
    run('npx sequelize-cli db:migrate');
    console.log('\n▶ Starting server...');
    require('./index');
  } catch (err) {
    console.error('\n✖ Boot failed:', err.message);
    process.exit(1);
  }
}

boot();
