// PROJECT NAME: Not found handler
// DESCRIPTION:
// CREATED BY:   Abdullah Al Rafi Bhuiyan
// DATE:         06/04/2026

// module scaffolding
const handler = {};

handler.notFoundHandler = (requestProperties, callback) => {
  callback(404, {
    message: "Your requested URL is not found",
  });
};

module.exports = handler;
