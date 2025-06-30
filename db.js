require('dotenv').config();

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;

async function connect() {
  if (!db) {
    await client.connect();
    db = client.db('Habbo');
    console.log('Conectado a la base de datos');
  }
  console.log('Usando la base de datos:', db.databaseName);
  return db;
}

async function close() {
  if (client) {
    await client.close();
    db = null;
  }
}

module.exports = { connect, close };