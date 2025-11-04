const express = require("express");
const dotenv = require("dotenv");
const authRouter = require("./router/auth/authRouter");

dotenv.config();




const app = express();
app.use(express.json());

app.use("/auth", authRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
