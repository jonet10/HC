const express = require("express");
const { authRouter } = require("./auth.routes");
const { usersRouter } = require("./users.routes");
const { studentsRouter } = require("./students.routes");
const { paymentsRouter } = require("./payments.routes");
const { reportsRouter } = require("./reports.routes");
const { notificationsRouter } = require("./notifications.routes");
const { gradesRouter } = require("./grades.routes");
const { bulletinsRouter } = require("./bulletins.routes");

const apiRouter = express.Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/students", studentsRouter);
apiRouter.use("/payments", paymentsRouter);
apiRouter.use("/reports", reportsRouter);
apiRouter.use("/notifications", notificationsRouter);
apiRouter.use("/grades", gradesRouter);
apiRouter.use("/bulletins", bulletinsRouter);

module.exports = { apiRouter };
