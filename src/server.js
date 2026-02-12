const { app } = require("./app");
const { connectDatabase } = require("./config/db");
const { bootstrapSuperAdmin } = require("./config/bootstrapSuperAdmin");

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  await connectDatabase();
  await bootstrapSuperAdmin();
  app.listen(PORT, () => {
    console.log(`HaitiConnect API running on port ${PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});
