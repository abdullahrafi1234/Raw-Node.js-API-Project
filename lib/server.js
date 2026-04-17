// PROJECT NAME: Server Library
// DESCRIPTION:  Server related file
// CREATED BY:   Abdullah Al Rafi Bhuiyan
// DATE:         16/04/2026

// dependencies
const http = require("http");
const { handleReqRes } = require("../helpers/handleReqRes");

// app object - module scaffolding
const server = {};

// configuration
server.config = {
  port: 3000,
};

//create server
server.createServer = () => {
  const createServerVariable = http.createServer(server.handleReqRes);

  createServerVariable.listen(server.config.port, () => {
    console.log(`Listening to port ${server.config.port}`);
  });
};

// handle request response
server.handleReqRes = handleReqRes;

// start server
server.init = () => {
  server.createServer();
};

// export server
module.exports = server;
