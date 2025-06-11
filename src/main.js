import { logger } from "./application/logging.js";
import { web } from "./application/web.js";
import { configDotenv } from "dotenv";
configDotenv();

web.listen(process.env.APP_PORT, () => {
  logger.info(`App start on port ${process.env.APP_PORT}`);
})