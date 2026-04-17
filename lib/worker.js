// PROJECT NAME: Workers Library
// DESCRIPTION:  Workers related file
// CREATED BY:   Abdullah Al Rafi Bhuiyan
// DATE:         16/04/2026

// dependencies
const url = require("url");
const http = require("http");
const https = require("https");
const { parseJSON } = require("../helpers/utilities");
const data = require("./data");
const { sendTwilioSms } = require("../helpers/notifications");

// worker object - module scaffolding
const worker = {};

// lookup all the checks
worker.gatherAllChecks = () => {
  // get all the checks
  data.list("checks", (err, checks) => {
    if (!err && checks && checks.length > 0) {
      checks.forEach((check) => {
        // read the checkData
        data.read("checks", check, (err, originalCheckData) => {
          if (!err && originalCheckData) {
            // pass the data to the check validation
            worker.validateCheckData(parseJSON(originalCheckData));
          } else {
            console.log("Error: reading on of the checks data!");
          }
        });
      });
    } else {
      console.log(`Error : could not find any checks process`);
    }
  });
};

// validate individual check data
worker.validateCheckData = (originalCheckData) => {
  let originalData = originalCheckData;
  if (originalCheckData && originalCheckData.id) {
    originalData.state =
      typeof originalCheckData.state === "string" &&
      ["up", "down"].indexOf(originalCheckData.state) > -1
        ? originalCheckData.state
        : "down";

    originalData.lastChecked =
      typeof originalCheckData.lastChecked === "number" &&
      originalCheckData.lastChecked > 0
        ? originalCheckData.lastChecked
        : false;

    // pass to the process
    worker.performCheck(originalCheckData);
  } else {
    console.log("Error: check was invalid or not properly formatted");
  }
};

// perform check
worker.performCheck = (originalCheckData) => {
  // prepare the initial outcome
  let checkOutCome = {
    error: false,
    responseCode: false,
  };
  // mark the outcome has not been yet
  let outComeSent = false;

  // parse the hostname and full url data from original data
  const parsedUrl = url.parse(
    originalCheckData.protocol + "://" + originalCheckData.url,
    true,
  );
  const hostname = parsedUrl.hostname;
  const path = parsedUrl.path;

  // construct the request
  const requestDetails = {
    protocol: originalCheckData.protocol + ":",
    hostname: hostname,
    method: originalCheckData.method.toUpperCase(),
    path,
    timeout: originalCheckData.timeoutSeconds * 1000,
  };

  const protocolToUse = originalCheckData.protocol === "http" ? http : https;

  let req = protocolToUse.request(requestDetails, (res) => {
    // grab the status of the response
    const status = res.statusCode;

    // update the check outcome and pass to the next process
    checkOutCome.responseCode = status;
    if (!outComeSent) {
      worker.processCheckOutcome(originalCheckData, checkOutCome);
      outComeSent = true;
    }
  });
  req.on("error", (e) => {
    let checkOutCome = {
      error: true,
      value: e,
    };
    // update the check outcome and pass to the next process
    if (!outComeSent) {
      worker.processCheckOutcome(originalCheckData, checkOutCome);
      outComeSent = true;
    }
  });

  req.on("timeout", () => {
    let checkOutCome = {
      error: true,
      value: "timeout",
    };
    // update the check outcome and pass to the next process
    if (!outComeSent) {
      worker.processCheckOutcome(originalCheckData, checkOutCome);
      outComeSent = true;
    }
  });

  // req send
  req.end();
};

// save check outcome to database and send to next process
worker.processCheckOutcome = (originalCheckData, checkOutCome) => {
  // check if check outcome is up or down
  let state =
    !checkOutCome.error &&
    checkOutCome.responseCode &&
    originalCheckData.successCodes.indexOf(checkOutCome.responseCode) > -1
      ? "up"
      : "down";

  // decide whether we should alert the user or not
  let alertWanted =
    originalCheckData.lastChecked && originalCheckData.state !== state
      ? true
      : false;

  // update the check data
  let newCheckData = originalCheckData;

  newCheckData.state = state;
  newCheckData.lastChecked = Date.now();

  // update the check to disk
  data.update("checks", newCheckData.id, newCheckData, (err) => {
    if (!err) {
      if (alertWanted) {
        // send the check data to next process
        worker.alertUserToStatusChange(newCheckData);
      } else {
        console.log("Alert is not needed as there is no state change");
      }
    } else {
      console.log("Error trying to save check data of one of the checks!");
    }
  });
};

// send notification sms to user if state changes
worker.alertUserToStatusChange = (newCheckData) => {
  let msg = `Alert your check for ${newCheckData.method.toUpperCase()} ${newCheckData.protocol}:// ${newCheckData.url} is currently ${newCheckData.state}`;

  sendTwilioSms(newCheckData.userPhone, msg, (err) => {
    if (!err) {
      console.log(`User was alerted to a status change via SMS ${msg}`);
    } else {
      console.log("There was a problem sending sms to one of the user!");
    }
  });
};

// timer to execute the worker process once per minute
worker.loop = () => {
  setInterval(() => {
    worker.gatherAllChecks();
  }, 9000);
};

//

// start server
worker.init = () => {
  // execute all the checks
  worker.gatherAllChecks();

  // call the loop so that checks continue
  worker.loop();
};

// export server
module.exports = worker;
