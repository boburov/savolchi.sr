const express = require("express");
const dotenv = require("dotenv");
const authRouter = require("./router/auth/auth.router");
const connectDB = require("./config/db");
const cors = require("cors");
dotenv.config();

connectDB();
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000", "https://boburov.uz"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/auth", authRouter);
app.use("/user", require("./router/users/user.router"));
app.use("/test", require("./router/test.router"));
app.use("/file", require("./router/upload/upload"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
