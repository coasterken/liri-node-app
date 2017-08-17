//js file for liri homework project

// link to twitter keys file - exports
var twKeys = require("./keys.js");

console.log(twKeys)
// this is a way to loop thru an object
for (var key in twKeys.twitterKeys) {
  if (twKeys.twitterKeys.hasOwnProperty(key)) {
    console.log("The " + key + " is " + twKeys.twitterKeys[key]);
  }
}