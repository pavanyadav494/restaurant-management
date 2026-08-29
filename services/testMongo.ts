import { connectToMongo } from "./mongoClient";

async function testMongoConnection() {
  try {
    const client = await connectToMongo();
    // Example: list databases
    const databasesList = await client.db().admin().listDatabases();
    console.log("Databases:", databasesList);
    await client.close();
  } catch (err) {
    console.error("Test connection failed:", err);
  }
}

testMongoConnection();
