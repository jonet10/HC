function notFoundHandler(req, res) {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
}

function errorHandler(error, _req, res, _next) {
  console.error(error);
  res.status(error.status || 500).json({
    message: error.message || "Internal Server Error",
  });
}

module.exports = { notFoundHandler, errorHandler };
