// PROJECT NAME:
// DESCRIPTION:
// CREATED BY:   Abdullah Al Rafi Bhuiyan
// DATE:         06/04/2026

// module scaffolding
const handler = {};

handler.sampleHandler = (requestProperties, callback) => {
  console.log(requestProperties);

  callback(200, {
    message: "This is requested property",
  });
};

module.exports = handler;
