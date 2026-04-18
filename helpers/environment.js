// PROJECT NAME: Environments
// DESCRIPTION:  Handle all environments related things
// CREATED BY:   Abdullah Al Rafi Bhuiyan
// DATE:         07/04/2026

// dependencies
require("dotenv").config();

// module scaffolding
const environments = {};

environments.staging = {
  port: 3000,
  envName: "staging",
  secretKey: process.env.SECRET_KEY_STAGING,
  maxChecks: 5,
  twilio: {
    fromPhone: process.env.TWILIO_FROM_PHONE,
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
  },
};

environments.production = {
  port: 5000,
  envName: "staging",
  secretKey: process.env.SECRET_KEY_STAGING,
  maxChecks: 5,
  twilio: {
    fromPhone: process.env.TWILIO_FROM_PHONE,
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
  },
};

// determine with environment was passed
const currentEnvironment =
  typeof process.env.NODE_ENV === "string" ? process.env.NODE_ENV : "staging";

// export corresponding environment object
const environmentToExport =
  typeof environments[currentEnvironment] === "object"
    ? environments[currentEnvironment]
    : environments.staging;

// export module
module.exports = environmentToExport;
