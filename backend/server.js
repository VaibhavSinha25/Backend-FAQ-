const express = require("express");
const connectDb = require("./db");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const app = express();
const faqRouter = require("./routes/faqRoute");
app.use(express.json());

//Database connected
connectDb();

app.use("/api/v1/faq", faqRouter);

//Starting server
app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running ...");
});
