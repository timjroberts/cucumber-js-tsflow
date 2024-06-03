import * as log4jsModule from "log4js";
// @ts-expect-error
import log4js from "log4js";

const getLogger = log4js?.getLogger || log4jsModule.getLogger;
const logger = getLogger("cucumber-js.tsflow");

export default logger;
