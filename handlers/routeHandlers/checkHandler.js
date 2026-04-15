// PROJECT NAME: Check handler
// DESCRIPTION:  Handle to check related routes
// CREATED BY:   Abdullah Al Rafi Bhuiyan
// DATE:         12/04/2026

// dependencies
const data = require("../../lib/data");
const { parseJSON, createRandomString } = require("../../helpers/utilities");
const tokenHandler = require("../../handlers/routeHandlers/tokenHandler");
const { maxChecks } = require("../../helpers/environments");
const { check } = require("../../routes");

// module scaffolding
const handler = {};

handler.checkHandler = (requestProperties, callback) => {
  const acceptedMethods = ["get", "post", "put", "delete"];
  if (acceptedMethods.indexOf(requestProperties.method) > -1) {
    handler._check[requestProperties.method](requestProperties, callback);
    //
  } else {
    callback(405);
  }
};

handler._check = {};

// Authentication
handler._check.post = (requestProperties, callback) => {
  let protocol =
    typeof requestProperties.body.protocol === "string" &&
    ["http", "https"].indexOf(requestProperties.body.protocol) > -1
      ? requestProperties.body.protocol
      : false;

  let url =
    typeof requestProperties.body.url === "string" &&
    requestProperties.body.url.trim().length > 0
      ? requestProperties.body.url
      : false;

  let method =
    typeof requestProperties.body.method === "string" &&
    ["get", "post", "put", "delete"].indexOf(requestProperties.body.method) > -1
      ? requestProperties.body.method
      : false;

  let successCodes =
    typeof requestProperties.body.successCodes === "object" &&
    requestProperties.body.successCodes instanceof Array
      ? requestProperties.body.successCodes
      : false;

  let timeoutSeconds =
    typeof requestProperties.body.timeoutSeconds === "number" &&
    requestProperties.body.timeoutSeconds % 1 === 0 &&
    requestProperties.body.timeoutSeconds >= 1 &&
    requestProperties.body.timeoutSeconds <= 5
      ? requestProperties.body.timeoutSeconds
      : false;

  if (protocol && url && method && successCodes && timeoutSeconds) {
    //verify token
    const token =
      typeof requestProperties.headersObject.token === "string"
        ? requestProperties.headersObject.token
        : false;

    // lookup the user phone by reading the token
    data.read("tokens", token, (err, tokenData) => {
      if (!err && tokenData) {
        let userPhone = parseJSON(tokenData).phone;

        // lookup the user data
        data.read("users", userPhone, (err, userData) => {
          if (!err && userData) {
            tokenHandler._token.verify(token, userPhone, (tokenIsValid) => {
              if (tokenIsValid) {
                let userObject = parseJSON(userData);
                let userChecks =
                  typeof userObject.checks === "object" &&
                  userObject.checks instanceof Array
                    ? userObject.checks
                    : [];

                if (userChecks.length < maxChecks) {
                  //
                  let checkId = createRandomString(20);
                  let checkObject = {
                    id: checkId,
                    userPhone,
                    protocol,
                    url,
                    method,
                    successCodes,
                    timeoutSeconds,
                  };

                  // save the object
                  data.create("checks", checkId, checkObject, (err) => {
                    if (!err) {
                      // add check id to the users object
                      userObject.checks = userChecks;
                      userObject.checks.push(checkId);

                      // save the new user data
                      data.update("users", userPhone, userObject, (err) => {
                        if (!err) {
                          // return the data about the new check
                          callback(200, checkObject);
                        } else {
                          callback(500, {
                            error: "There was a problem in the server side",
                          });
                        }
                      });
                    } else {
                      callback(500, {
                        error: "There was a problem in the server side",
                      });
                    }
                  });
                } else {
                  callback(401, {
                    error: "User already reached max check limit",
                  });
                }
              } else {
                callback(403, {
                  error: "Authentication error",
                });
              }
            });
          } else {
            callback(403, {
              error: "user not found",
            });
          }
        });
      } else {
        callback(403, {
          error: "Authentication problem",
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
handler._check.get = (requestProperties, callback) => {
  // check the id  is valid
  const id =
    typeof requestProperties.queryStringObject.id === "string" &&
    requestProperties.queryStringObject.id.trim().length === 20
      ? requestProperties.queryStringObject.id
      : false;

  if (id) {
    //lookup the check
    data.read("checks", id, (err, checkData) => {
      if (!err && checkData) {
        //verify token
        const token =
          typeof requestProperties.headersObject.token === "string"
            ? requestProperties.headersObject.token
            : false;

        tokenHandler._token.verify(
          token,
          parseJSON(checkData).userPhone,
          (tokenIsValid) => {
            if (tokenIsValid) {
              callback(200, parseJSON(checkData));
            } else {
              callback(403, {
                error: "Authentication error",
              });
            }
          },
        );
      } else {
        callback(500, {
          error: "You have a problem in your request",
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
handler._check.put = (requestProperties, callback) => {
  // check the id  is valid
  const id =
    typeof requestProperties.queryStringObject.id === "string" &&
    requestProperties.queryStringObject.id.trim().length === 20
      ? requestProperties.queryStringObject.id
      : false;

  let protocol =
    typeof requestProperties.body.protocol === "string" &&
    ["http", "https"].indexOf(requestProperties.body.protocol) > -1
      ? requestProperties.body.protocol
      : false;

  let url =
    typeof requestProperties.body.url === "string" &&
    requestProperties.body.url.trim().length > 0
      ? requestProperties.body.url
      : false;

  let method =
    typeof requestProperties.body.method === "string" &&
    ["get", "post", "put", "delete"].indexOf(requestProperties.body.method) > -1
      ? requestProperties.body.method
      : false;

  let successCodes =
    typeof requestProperties.body.successCodes === "object" &&
    requestProperties.body.successCodes instanceof Array
      ? requestProperties.body.successCodes
      : false;

  let timeoutSeconds =
    typeof requestProperties.body.timeoutSeconds === "number" &&
    requestProperties.body.timeoutSeconds % 1 === 0 &&
    requestProperties.body.timeoutSeconds >= 1 &&
    requestProperties.body.timeoutSeconds <= 5
      ? requestProperties.body.timeoutSeconds
      : false;

  if (id) {
    if (protocol || url || method || successCodes || timeoutSeconds) {
      // token check korte phone number lagbe tai check database read kore ashbo.
      data.read("checks", id, (err, checkData) => {
        if (!err && checkData) {
          let checkObject = parseJSON(checkData);
          const token =
            typeof requestProperties.headersObject.token === "string"
              ? requestProperties.headersObject.token
              : false;

          tokenHandler._token.verify(
            token,
            checkObject.userPhone,
            (tokenIsValid) => {
              if (tokenIsValid) {
                if (protocol) {
                  checkObject.protocol = protocol;
                }
                if (url) {
                  checkObject.url = url;
                }
                if (method) {
                  checkObject.method = method;
                }
                if (successCodes) {
                  checkObject.successCodes = successCodes;
                }
                if (timeoutSeconds) {
                  checkObject.timeoutSeconds = timeoutSeconds;
                }
                // store the check object
                data.update("checks", id, checkObject, (err) => {
                  if (!err) {
                    callback(200);
                  } else {
                    callback(500, {
                      error: "There was a server side error",
                    });
                  }
                });
              } else {
                callback(403, {
                  error: "Authentication error",
                });
              }
            },
          );
        } else {
          callback(500, {
            error: "There was a problem in the server side",
          });
        }
      });
    } else {
      callback(400, {
        error: "At least one field required",
      });
    }
  } else {
    callback(400, {
      error: "You have a problem in your request",
    });
  }
};

// Authentication
// handler._check.delete = (requestProperties, callback) => {
//   // check the id  is valid
//   const id =
//     typeof requestProperties.queryStringObject.id === "string" &&
//     requestProperties.queryStringObject.id.trim().length === 20
//       ? requestProperties.queryStringObject.id
//       : false;

//   if (id) {
//     //lookup the check
//     data.read("checks", id, (err, checkData) => {
//       if (!err && checkData) {
//         //verify token
//         const token =
//           typeof requestProperties.headersObject.token === "string"
//             ? requestProperties.headersObject.token
//             : false;

//         tokenHandler._token.verify(
//           token,
//           parseJSON(checkData).userPhone,
//           (tokenIsValid) => {
//             if (tokenIsValid) {
//               // delete the check data
//               data.delete("checks", id, (err) => {
//                 if (!err) {
//                   // Already delete on check file then
//                   // delete the users check er jonno users e dukte hbe
//                   data.read(
//                     "users",
//                     parseJSON(checkData).userPhone,
//                     (err, userData) => {
//                       let userObject = parseJSON(userData);
//                       if (!err && userData) {
//                         let userChecks =
//                           typeof userObject.checks === "object" &&
//                           userObject.checks instanceof Array
//                             ? userObject.checks
//                             : [];

//                         // remove the deleted check id from the user list checks
//                         let checkPosition = userChecks.indexOf(id);

//                         if (checkPosition > -1) {
//                           userChecks.splice(checkPosition, 1);

//                           // remove the user data
//                           userObject.checks = userChecks;
//                           data.update(
//                             "users",
//                             userObject.phone,
//                             userObject,
//                             (err) => {
//                               if (!err) {
//                                 callback(200, {
//                                   message: "Check deleted successfully",
//                                 });
//                               } else {
//                                 callback(500, {
//                                   error:
//                                     "The check id that you are trying to remove is not found in user",
//                                 });
//                               }
//                             },
//                           );
//                         }
//                       } else {
//                         callback(500, {
//                           error: "There was a server side problem",
//                         });
//                       }
//                     },
//                   );
//                 } else {
//                   callback(500, {
//                     error: "There was a server side problem",
//                   });
//                 }
//               });
//             } else {
//               callback(403, {
//                 error: "Authentication error",
//               });
//             }
//           },
//         );
//       } else {
//         callback(500, {
//           error: "You have a problem in your request",
//         });
//       }
//     });
//   } else {
//     callback(400, {
//       error: "You have a problem in your request",
//     });
//   }
// };

handler._check.delete = (requestProperties, callback) => {
  const id =
    typeof requestProperties.queryStringObject.id === "string" &&
    requestProperties.queryStringObject.id.trim().length === 20
      ? requestProperties.queryStringObject.id
      : false;

  if (id) {
    data.read("checks", id, (err, checkData) => {
      if (!err && checkData) {
        const token =
          typeof requestProperties.headersObject.token === "string"
            ? requestProperties.headersObject.token
            : false;

        const checkObject = parseJSON(checkData);

        tokenHandler._token.verify(
          token,
          checkObject.userPhone,
          (tokenIsValid) => {
            if (tokenIsValid) {
              data.delete("checks", id, (err) => {
                if (!err) {
                  data.read("users", checkObject.userPhone, (err, userData) => {
                    if (!err && userData) {
                      let userObject = parseJSON(userData);
                      let userChecks =
                        typeof userObject.checks === "object" &&
                        userObject.checks instanceof Array
                          ? userObject.checks
                          : [];

                      let checkPosition = userChecks.indexOf(id);

                      if (checkPosition > -1) {
                        userChecks.splice(checkPosition, 1);
                        userObject.checks = userChecks;

                        data.update(
                          "users",
                          userObject.phone,
                          userObject,
                          (err) => {
                            if (!err) {
                              callback(200, {
                                message: "Check deleted successfully",
                              });
                            } else {
                              callback(500, {
                                error: "Could not update the user",
                              });
                            }
                          },
                        );
                      } else {
                        // EXACT LINE FIX 1
                        callback(500, {
                          error: "Check ID not found in user's list",
                        });
                      }
                    } else {
                      // EXACT LINE FIX 2
                      callback(500, { error: "User not found" });
                    }
                  });
                } else {
                  callback(500, { error: "Could not delete the check file" });
                }
              });
            } else {
              callback(403, { error: "Authentication error" });
            }
          },
        );
      } else {
        callback(404, { error: "Check ID not found" });
      }
    });
  } else {
    callback(400, { error: "Invalid ID in request" });
  }
};

module.exports = handler;
