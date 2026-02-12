require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { swaggerUi, swaggerDocument } = require("./config/swagger");
const { apiRouter } = require("./routes");
const { notFoundHandler, errorHandler } = require("./middlewares/error.middleware");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/public", express.static(path.join(process.cwd(), "storage")));
app.use(express.static(path.join(__dirname, "web")));

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "web", "index.html"));
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "HaitiConnect API",
    date: new Date().toISOString(),
  });
});

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api/v1", apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = { app };
