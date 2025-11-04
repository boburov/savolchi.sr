const express = require("express");
const connectDB = require("./config/db");

const app = express();
connectDB();

const port = 3000;

app.use(express.json());

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
