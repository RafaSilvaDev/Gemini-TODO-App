import * as mongoDB from "mongodb";
import * as dotenv from "dotenv";

export const collections: {
  todos?: mongoDB.Collection;
  users?: mongoDB.Collection;
} = {};

function validateEnvVars() {
  const requiredEnvVars = [
    "DB_NAME",
    "TODOS_COLLECTION_NAME",
    "USERS_COLLECTION_NAME",
    "MONGODB_URI"
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing environment variable: ${envVar}`);
    }
  }
}

export async function connectToDatabase() {
  dotenv.config();
  validateEnvVars();

  const client: mongoDB.MongoClient = new mongoDB.MongoClient(
    process.env.MONGODB_URI || 'mongodb://mongodb:27017'
  );

  try {
    await client.connect();

    const dbList = await client.db().admin().listDatabases();
    const databaseExists = dbList.databases.some(
      (db) => db.name === process.env.DB_NAME
    );

    if (databaseExists) {
      console.log(`Database '${process.env.DB_NAME}' found!`);
    } else {
      console.log(
        `Database '${process.env.DB_NAME}' not found. Creating it...`
      );
    }

    const db: mongoDB.Db = client.db(process.env.DB_NAME);
    const usersCollection: mongoDB.Collection = db.collection(
      process.env.USERS_COLLECTION_NAME || ""
    );
    const todosCollection: mongoDB.Collection = db.collection(
      process.env.TODOS_COLLECTION_NAME || ""
    );

    collections.users = usersCollection;
    collections.todos = todosCollection;

    console.log(
      `Successfully connected to collection: ${usersCollection.collectionName}`
    );
    console.log(
      `Successfully connected to collection: ${todosCollection.collectionName}`
    );

  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
}
