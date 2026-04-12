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

// create random string
utilities.createRandomString = (strLength) => {
  let length = strLength;
  length = typeof strLength === "number" && strLength > 0 ? strLength : false;

  if (length) {
    let possibleCharacters = "abcdefghijklmnopqrstuvwxyz1234567890";

    let output = "";
    for (let i = 1; i <= length; i += 1) {
      let randomCharacter = possibleCharacters.charAt(
        Math.floor(Math.random() * possibleCharacters.length),
      );
      output += randomCharacter;
    }
    return output;
  }
  return false;
};

// export module
module.exports = utilities;
