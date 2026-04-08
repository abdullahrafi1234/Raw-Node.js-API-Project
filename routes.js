// PROJECT NAME: Routes
// DESCRIPTION:  Application Routes
// CREATED BY:   Abdullah Al Rafi Bhuiyan
// DATE:         06/04/2026

// dependencies
const { sampleHandler } = require("./handlers/routeHandlers/sampleHandler");
const { userHandler } = require("./handlers/routeHandlers/userHandler");

const routes = {
  sample: sampleHandler,
  user: userHandler,
};

module.exports = routes;
