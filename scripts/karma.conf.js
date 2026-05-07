const generate = require('videojs-generate-karma-config');

module.exports = function(config) {

  // see https://github.com/videojs/videojs-generate-karma-config
  // for options
  const options = {
    browsers(aboutToRun) {
      // only run ChromeHeadless to avoid flaky Safari/Firefox detection
      return aboutToRun.filter(function(launcherName) {
        return (/^ChromeHeadless/).test(launcherName);
      });
    }
  };

  config = generate(config, options);

  // any other custom stuff not supported by options here!
};
