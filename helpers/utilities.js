// PROJECT NAME: Utilites
// DESCRIPTION:  Important utility function
// CREATED BY:   Abdullah Al Rafi Bhuiyan
// DATE:         07/04/2026

// dependencies

// module scaffolding
const crypto = require("crypto");
const utilities = {};
const environments = require("./environments");

// parse JSON string to object
utilities.parseJSON = (jsonString) => {
  let output;

  try {
    output = JSON.parse(jsonString);
  } catch {
    output = {};
  }

  return output;
};
// hash string
utilities.hash = (str) => {
  if (typeof str === "string" && str.length > 0) {
    const hash = crypto
      .createHmac("sha256", environments.secretKey)
      .update(str)
      .digest("hex");
    return hash;
  }
};

// export module
module.exports = utilities;
