const gEarthManager = require('./g-earth-manager');

async function main() {
  await gEarthManager.init();
}

main().catch(console.error);