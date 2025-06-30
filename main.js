const { connect } = require('./db');
const gEarthManager = require('./g-earth-manager');

async function main() {
  const db = await connect();
  const collection = db.collection('users');
  await gEarthManager.init();
}

main().catch(console.error);