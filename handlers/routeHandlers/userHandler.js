// PROJECT NAME: User handler
// DESCRIPTION:  Handle to handle user related routes
// CREATED BY:   Abdullah Al Rafi Bhuiyan
// DATE:         08/04/2026

// dependencies
const data = require("../../lib/data");
const { hash, parseJSON } = require("../../helpers/utilities");

// module scaffolding
const handler = {};

handler.userHandler = (requestProperties, callback) => {
  const acceptedMethods = ["get", "post", "put", "delete"];
  if (acceptedMethods.indexOf(requestProperties.method) > -1) {
    handler._users[requestProperties.method](requestProperties, callback);
    //
  } else {
    callback(405);
  }
};

handler._users = {};

handler._users.post = (requestProperties, callback) => {
  const firstName =
    typeof requestProperties.body.firstName === "string" &&
    requestProperties.body.firstName.trim().length > 0
      ? requestProperties.body.firstName
      : false;

  const lastName =
    typeof requestProperties.body.lastName === "string" &&
    requestProperties.body.lastName.trim().length > 0
      ? requestProperties.body.lastName
      : false;

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

  const tosAgreement =
    typeof requestProperties.body.tosAgreement === "string" &&
    requestProperties.body.tosAgreement.trim().length > 0
      ? requestProperties.body.tosAgreement
      : false;

  if (firstName && lastName && phone && password && tosAgreement) {
    // make sure that the user doesn't already exists
    data.read("users", phone, (err) => {
      if (err) {
        let userObject = {
          firstName,
          lastName,
          phone,
          password: hash(password),
          tosAgreement,
        };

        // store the user to db
        data.create("users", phone, userObject, (err) => {
          if (!err) {
            callback(200, {
              message: "User was created successfully",
            });
          } else {
            callback(500, { error: "Could not create user" });
          }
        });
      } else {
        callback(500, {
          error: "There was a problem in server side",
        });
      }
    });
  } else {
    callback(400, {
      error: "You have a problem in your request",
    });
  }
};

handler._users.get = (requestProperties, callback) => {
  // check the phone number is valid
  const phone =
    typeof requestProperties.queryStringObject.phone === "string" &&
    requestProperties.queryStringObject.phone.trim().length === 11
      ? requestProperties.queryStringObject.phone
      : false;

  if (phone) {
    // lookup the user
    data.read("users", phone, (err, u) => {
      // u er data ta k direct use kora good practice na tai alada rakhbo
      const user = { ...parseJSON(u) };
      if (!err && user) {
        //pass always remove first
        delete user.password;
        callback(200, user);
      } else {
        callback(404, {
          error: "Requested user was not found",
        });
      }
    });
  } else {
    callback(404, {
      error: "Requested user was not found",
    });
  }
};

handler._users.put = (requestProperties, callback) => {
  // check the phone number if valid
  const phone =
    typeof requestProperties.body.phone === "string" &&
    requestProperties.body.phone.trim().length === 11
      ? requestProperties.body.phone
      : false;

  const firstName =
    typeof requestProperties.body.firstName === "string" &&
    requestProperties.body.firstName.trim().length > 0
      ? requestProperties.body.firstName
      : false;

  const lastName =
    typeof requestProperties.body.lastName === "string" &&
    requestProperties.body.lastName.trim().length > 0
      ? requestProperties.body.lastName
      : false;

  const password =
    typeof requestProperties.body.password === "string" &&
    requestProperties.body.password.trim().length > 0
      ? requestProperties.body.password
      : false;

  if (phone) {
    if (firstName || lastName || password) {
      // lookup the user
      data.read("users", phone, (err, uData) => {
        const userData = { ...parseJSON(uData) };
        if (!err) {
          if (firstName) {
            userData.firstName = firstName;
          }
          if (lastName) {
            userData.lastName = lastName;
          }
          if (password) {
            userData.password = hash(password);
          }
          // update to database
          data.update("users", phone, userData, (err) => {
            if (!err) {
              callback(200, {
                message: "User was updated successfully",
              });
            } else {
              callback(500, {
                error: "There was a problem in the server side",
              });
            }
          });
        } else {
          callback(400, {
            error: "You have a problem in your request",
          });
        }
      });
    } else {
      callback(400, {
        error: "You have a problem in your request",
      });
    }
  } else {
    callback(400, {
      error: "Invalid phone number try again",
    });
  }
};

handler._users.delete = (requestProperties, callback) => {
  // check the phone number is valid
  const phone =
    typeof requestProperties.queryStringObject.phone === "string" &&
    requestProperties.queryStringObject.phone.trim().length === 11
      ? requestProperties.queryStringObject.phone
      : false;

  if (phone) {
    // lookup user
    data.read("users", phone, (err, userData) => {
      if (!err && userData) {
        data.delete("users", phone, (err) => {
          if (!err) {
            callback(200, {
              message: "Deleted successfully",
            });
          } else {
            callback(500, {
              error: "There was a problem on server side delete",
            });
          }
        });
      } else {
        callback(500, {
          error: "There was a server side error",
        });
      }
    });
  } else {
    callback(400, {
      error: "There was a problem in your request",
    });
  }
};

module.exports = handler;
