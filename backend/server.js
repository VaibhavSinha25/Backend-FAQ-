const express = require("express");
const connectDb = require("./db");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const morgan = require("morgan");

const app = express();

// 1. Security headers with Helmet
app.use(helmet());

// 2. Enable CORS for specific origins
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// 3. Rate limiting (100 requests per 15 minutes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// 4. Prevent HTTP Parameter Pollution
app.use(hpp());

// 5. Data sanitization against NoSQL injection and XSS
app.use(mongoSanitize());
app.use(xss());

// 6. Body parser with request size limit
app.use(express.json({ limit: "10kb" }));

// 7. Request logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// 8. Disable x-powered-by header
app.disable("x-powered-by");

// Database connection
connectDb();

// Routes
const faqRouter = require("./routes/faqRoute");
app.use("/api/faqs", faqRouter);

// 9. Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: "error",
    message: "Internal Server Error",
  });
});

// 10. HTTPS redirection in production
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.header("x-forwarded-proto") !== "https") {
      res.redirect(`https://${req.header("host")}${req.url}`);
    } else {
      next();
    }
  });
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
