import app from "./src/App";
import { config } from "dotenv";
import { connectToDatabase } from './src/services/database.service';

config();

const port = process.env.PORT || 3000;

connectToDatabase() 
    .then(() => {
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    })
    .catch((error) => {
        console.error("Database connection failed:", error);
    });
