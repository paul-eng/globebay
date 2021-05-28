"use strict";
var node_fetch_1 = require("node-fetch");
module.exports = function wakeUp(url, interval, callback) {
  var _interval = interval ? interval : 25;
  var milliseconds = _interval * 60000;
  setTimeout(function () {
    try {
      const time = new Date().getHours();
      if (time >= 6 && time <= 21) {
        node_fetch_1.default(url);
      }
    } catch (err) {
    } finally {
      try {
        if (callback) {
          callback();
        }
      } catch (e) {
        callback ? console.log("Callback failed: ", e.message) : null;
      } finally {
        return wakeUp(url, _interval, callback);
      }
    }
  }, milliseconds);
};
