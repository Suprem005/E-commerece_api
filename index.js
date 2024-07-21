import express from "express";
import connectDB from "./database-connection/db.connect.js";

const app = express();

// console.log(process);

// to make app understand json

app.use(express.json());

// connect database
connectDB();

// register routes

// network port and server
const PORT = process.env.PORT;

// const PORT = 8000;

app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});
