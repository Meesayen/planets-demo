/* global Handlebars */
/* global R */
(function() {

  // Insert new helpers here
  var helpersDict = {
    /**
     * Analytics link
     */
    'taggedAnchor': function(url, text) {
      return '<a href="' + url + '">' + text + '</a>';
    },
    'include': function(partialName) {
      return R.templates[partialName](this);
    }
  };

  // Do not touch
  try {
    module.exports = helpersDict;
  } catch(e) {
    for (var k in helpersDict) {
      if (helpersDict.hasOwnProperty(k)) {
        Handlebars.registerHelper(k, helpersDict[k]);
      }
    }
  }

})();



