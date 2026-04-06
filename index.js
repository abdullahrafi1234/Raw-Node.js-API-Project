// PROJECT NAME: Uptime Monitoring Application
// DESCRIPTION:  A RestFul API to monitor up or down time of user defined links
// CREATED BY:   Abdullah Al Rafi Bhuiyan
// DATE:         30/03/2026

// dependencies

const http = require("http");
const { handleReqRes } = require("./helpers/handleReqRes");
const environment = require("./helpers/environments");

// app object - module scaffolding
const app = {};

// configuration
// app = {};

//create server
app.createServer = () => {
  const server = http.createServer(app.handleReqRes);

  server.listen(environment.port, () => {
    console.log(`Listening to port ${environment.port}`);
  });
};

// handle request response
app.handleReqRes = handleReqRes;

// start server
app.createServer();

// Nodemon can auto restart server
