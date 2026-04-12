// PROJECT NAME: User handler
// DESCRIPTION:  Handle to handle token related routes
// CREATED BY:   Abdullah Al Rafi Bhuiyan
// DATE:         08/04/2026

// dependencies
const data = require("../../lib/data");
const {
  hash,
  parseJSON,
  createRandomString,
} = require("../../helpers/utilities");
const { token } = require("../../routes");

// module scaffolding
const handler = {};

handler.tokenHandler = (requestProperties, callback) => {
  const acceptedMethods = ["get", "post", "put", "delete"];
  if (acceptedMethods.indexOf(requestProperties.method) > -1) {
    handler._token[requestProperties.method](requestProperties, callback);
    //
  } else {
    callback(405);
  }
};

handler._token = {};

//
handler._token.post = (requestProperties, callback) => {
  const phone =
    typeof requestProperties.body.phone === "string" &&
    requestProperties.body.phone.trim().length === 11
      ? requestProperties.body.phone
      : false;

  const password =
    typeof requestProperties.body.password === "string" &&
    requestProperties.body.password.trim().length > 0
      ? requestProperties.body.password
      : false;

  if (phone && password) {
    data.read("users", phone, (err, userData) => {
      let hashedPassword = hash(password);
      if (hashedPassword === parseJSON(userData).password) {
        let tokenId = createRandomString(20);
        let expires = Date.now() + 60 * 60 * 1000;
        let tokenObject = {
          phone,
          id: tokenId,
          expires,
        };

        // store the token
        data.create("tokens", tokenId, tokenObject, (err) => {
          if (!err) {
            callback(200, tokenObject);
          } else {
            callback(500, {
              error: "There was a problem in the server side",
            });
          }
        });
      } else {
        callback(400, {
          error: "Password in not valid",
        });
      }
    });
  } else {
    callback(400, {
      error: "You have a problem in your request",
    });
  }
};

// Authentication
handler._token.get = (requestProperties, callback) => {
  // check the id  is valid
  const id =
    typeof requestProperties.queryStringObject.id === "string" &&
    requestProperties.queryStringObject.id.trim().length === 20
      ? requestProperties.queryStringObject.id
      : false;

  if (id) {
    // lookup the token
    data.read("tokens", id, (err, tokenData) => {
      // tokenData is normal string
      const token = { ...parseJSON(tokenData) };
      if (!err && token) {
        callback(200, token);
      } else {
        callback(404, {
          error: "Requested token was not found",
        });
      }
    });
  } else {
    callback(404, {
      error: "Requested token was not found",
    });
  }
};

// Authentication
handler._token.put = (requestProperties, callback) => {
  const id =
    typeof requestProperties.body.id === "string" &&
    requestProperties.body.id.trim().length === 20
      ? requestProperties.body.id
      : false;

  const extend =
    typeof requestProperties.body.extend === "boolean" &&
    requestProperties.body.extend === true
      ? requestProperties.body.extend
      : false;

  if (id && extend) {
    data.read("tokens", id, (err, tokenData) => {
      let tokenObject = parseJSON(tokenData);
      if (tokenObject.expires > Date.now()) {
        tokenObject.expires = Date.now() * 60 * 60 * 1000;

        // store the updated token
        data.update("tokens", id, tokenObject, (err) => {
          if (!err) {
            callback(200, tokenObject);
          } else {
            callback(500, {
              error: "There was a server side error",
            });
          }
        });
      } else {
        callback(400, {
          error: "Token already expired",
        });
      }
    });
  } else {
    callback(400, {
      error: "There was a problem in your request",
    });
  }
};

// Authentication
handler._token.delete = (requestProperties, callback) => {};

module.exports = handler;
