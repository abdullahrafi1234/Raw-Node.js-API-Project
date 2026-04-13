// PROJECT NAME: Check handler
// DESCRIPTION:  Handle to check related routes
// CREATED BY:   Abdullah Al Rafi Bhuiyan
// DATE:         12/04/2026

// dependencies
const data = require("../../lib/data");
const { hash, parseJSON } = require("../../helpers/utilities");

// module scaffolding
const handler = {};

handler.checkHandler = (requestProperties, callback) => {
  const acceptedMethods = ["get", "post", "put", "delete"];
  if (acceptedMethods.indexOf(requestProperties.method) > -1) {
    handler._users[requestProperties.method](requestProperties, callback);
    //
  } else {
    callback(405);
  }
};

handler._users = {};

handler._users.post = (requestProperties, callback) => {};

// Authentication
handler._users.get = (requestProperties, callback) => {};

// Authentication
handler._users.put = (requestProperties, callback) => {};

// Authentication
handler._users.delete = (requestProperties, callback) => {};

module.exports = handler;
