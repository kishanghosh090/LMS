import "dotenv/config";
import express from "express";
import morgan from "morgan";
import mongooseSanitizer from "express-mongo-sanitize";
import helmet from "helmet";
import hpp from "hpp";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
const port = process.env.PORT || 5000;

// Global rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,
  message: "Too many requests from this IP, please try again in an hour!",
});

// security middlewares
app.use(helmet());
app.use(mongooseSanitizer());
app.use(hpp());
app.use("/api", limiter);

// logging middlewares
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// cors
app.use(
  cors({
    origin: process.env.ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "device-remember-token",
      "Access-Control-Allow-Origin",
      "Origin",
      "Accept",
    ],
  })
);

// body parser middleares
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ limit: "20kb", extended: true }));
app.use(cookieParser());

// global error handler
app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(error.status || 500).json({
    status: "error",
    error: error.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
});

// API Routes

// it should be always at bottom
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
