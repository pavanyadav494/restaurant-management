import { MongoClient } from "mongodb";

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

export async function connectToMongo() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    // Use client.db("your-db-name") to access your database
    return client;
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
}
