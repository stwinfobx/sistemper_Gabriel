const { Client } = require('pg');

const passwords = ['shujin791', 'tuzai018'];

async function setup() {
  for (const password of passwords) {
    const client = new Client({
      user: 'postgres',
      host: 'localhost',
      database: 'postgres',
      password: password,
      port: 5432,
    });

    try {
      console.log(`Testing password: ${password}...`);
      await client.connect();
      console.log(`SUCCESS: ${password}`);
      
      try {
        await client.query('CREATE DATABASE sistemper');
        console.log("Database 'sistemper' created.");
      } catch (err) {
        if (err.code === '42P04') {
          console.log("Database 'sistemper' already exists.");
        } else {
          console.log("Error creating database:", err.message);
        }
      }
      
      await client.end();
      process.exit(0);
    } catch (err) {
      console.log(`FAILED: ${password} - ${err.message}`);
    }
  }
  console.log('BOTH PASSWORDS FAILED');
  process.exit(1);
}

setup();
