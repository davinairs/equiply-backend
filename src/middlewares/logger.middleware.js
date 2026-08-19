function getStatusColor(statusCode) {
  if (statusCode >= 500) return "\x1b[31m";
  if (statusCode >= 400) return "\x1b[33m";
  if (statusCode >= 300) return "\x1b[36m";
  if (statusCode >= 200) return "\x1b[32m";

  return "\x1b[0m";
}

function logger(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;

    const color = getStatusColor(res.statusCode);

    console.log(
      `${color}[${new Date().toLocaleString()}] ${req.method} ${req.originalUrl} | ${res.statusCode} | ${duration}ms | IP: ${req.ip}\x1b[0m`,
    );
  });

  next();
}

module.exports = logger;
