// PROJECT NAME: Uptime Monitoring Application
// DESCRIPTION:  A RestFul API to monitor up or down time of user defined links
// CREATED BY:   Abdullah Al Rafi Bhuiyan
// DATE:         30/03/2026

// dependencies
const server = require("./lib/server");
const workers = require("./lib/worker");

// app object - module scaffolding
const app = {};

app.init = () => {
  // start the server
  server.init();

  // start the workers
  workers.init();
};

app.init();

// export the app
module.exports = app;
