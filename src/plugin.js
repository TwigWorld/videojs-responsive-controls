import videojs from 'video.js';
import elementResizeDetectorMaker from 'element-resize-detector';
import {version as VERSION} from '../package.json';

// Default options for the plugin.
const defaults = {
  sizes: {
    mini: 450,
    mobile: 600,
  },
  controls: {
    currentTimeDisplay: {
      mini: false,
    },
    timeDivider: {
      mini: false,
    },
    durationDisplay: {
      mini: false,
    },
    remainingTimeDisplay: {
      mini: false,
      mobile: false,
    },
    captionsButton: {
      mini: false,
    },
  }
};

// // Cross-compatibility for Video.js 5 and 6.
const registerPlugin = videojs.registerPlugin || videojs.plugin;
// // const dom = videojs.dom || videojs;

/**
 * Ascending sorting for breakpoints
 *
 * @param      {Array}  previousSize  Previous breakpoint to sort
 * @param      {Array}  nextSize      Next breakpoint to sort
 * @return     {Array}  Breakpoints array sorted in ascending order
 */
const ascending = (previousSize, nextSize) => previousSize[1] - nextSize[1];

/**
 * Gets all active breakpoints that may be applied to current video player size.
 *
 * @param      {number}    playerSize  The player size.
 * @param      {Object}    sizes       Object containing all possible breakpoints.
 * @return     {Function}  The active breakpoints.
 */
const getActiveBreakpoints = (playerSize, sizes) => (
  Object.entries(sizes)
    .sort(ascending)
    .filter(size => size[1] >= playerSize)
)

/**
 * Gets the breakpoint name for the current player's size
 *
 * @param      {Player}   player  Video.js player object.
 * @param      {Object}   sizes   Object containing all possible breakpoints.
 * @return     {String}   Breakpoint name.
 */
const getPlayerSize = (player, sizes) => {
  const playerSize = player.el().clientWidth;
  const breakpoints = getActiveBreakpoints(playerSize, sizes);

  return breakpoints[0] ? breakpoints[0][0] : 'default';
}


/**
 * Controls should be visible by default so this function checks if
 * desired state was specified and returns either desired state or true.
 *
 * @param      {boolean}  setting  Desired state.
 * @return     {boolean}  Desired state or true.
 */
const trueByDefault = setting => typeof setting !== 'undefined' ? !!setting : true;

/**
 * Determines if given control is a native Video.js plugin by searching for it
 * in player.controlBar.
 *
 * @param      {Player}   player   Video.js player object.
 * @param      {String}   control  Name of the plugin.
 * @return     {boolean}  True if native, False otherwise.
 */
const isNative = (player, control) => typeof player.controlBar[control] === 'object';

/**
 * Uses Video.js API to hide or show Video.js plugin.
 *
 * @param      {Player}   player   Video.js player object.
 * @param      {Object}   control  The element to trigger.
 * @param      {boolean}  show     Desired state.
 * @return     {Function}
 */
const setNative = (player, control, show) => {
  const target = player.controlBar[control];
  return show ? target.show() : target.hide();
}

/**
 * Uses CSS to hide or show custom element. Useful for legacy plugins that
 * do not follow official plugin structure.
 *
 * @param      {Player}     player      Video.js player object.
 * @param      {String}     className   Class of the element to trigger.
 * @param      {boolean}    show        Desired state.
 * @return     {(DOMElement|undefined)}
 */
const setCustom = (player, className, show) => {
  const target = player.el().querySelectorAll(`.${className}`);
  const hiddenClass = 'vjs-hidden';

  if (target.length === 0) {
      return undefined;
  }

  return show ? target[0].classList.remove(hiddenClass) :
                target[0].classList.add(hiddenClass);
}

/**
 * Applies specified settingf to the control element based on video player's size
 *
 * @param      {Player}         player   Video.js player object.
 * @param      {Object|String}  control  Video.js plugin instance or class name.
 * @param      {boolean}        setting  Indites if the control element should be visible
 *                                       on given breakpoint.
 * @return     {Function}
 */
const set = (player, control, setting) => {
  const target = trueByDefault(setting);
  const native = isNative(player, control);

  return native ? setNative(player, control, target) :
                  setCustom(player, control, target);
}

/**
 * Applies specified settings to the video player based on it's size
 *
 * @param      {Player}  player         Video.js player object.
 * @param      {Object}  arg2           Settings object
 * @param      {Object}  arg2.sizes     Breakpoints on which the controls will update.
 * @param      {Object}  arg2.controls  Specifies states of all the controls for different breakpoints.
 * @return     {undefined}
 */
const setup = (player, { sizes, controls }) => {
  const size = getPlayerSize(player, sizes);

  for (const control in controls) {
    const setting = controls[control][size];
    set(player, control, setting);
  }
}

/**
 * Initializes new instance of resize detector
 *
 * @return     {ElementResizeDetextor} Detector instance
 */
const newDetector = () => {
  return elementResizeDetectorMaker({ strategy: "scroll" });
}

/**
 * Sets up event listener looking for changes in size of the video player
 * and fire initial setup straight away.
 *
 * @function init
 * @param    {Player} player A Video.js player object.
 *
 * @param    {Object} [settings={}]
 *           Object containing settings for the plugin.
 */
const onPlayerReady = (player, settings) => {
  player.addClass('vjs-responsive-controls');
  window.resizeDetector = window.resizeDetector || newDetector();
  window.resizeDetector.listenTo(player.el(), () => setup(player, settings));
  setup(player, settings);
};

/**
 * Overwrites default breakpoints with ones specified by the developer.
 *
 * @param      {Object}  settings  Settings passed on initialisation.
 * @param      {Object}  defaults  Default settings for plugin.
 * @return     {Object}  Settings to be applied.
 */
const getMediaQueries = (settings, defaults) => (
  settings && settings.sizes ? settings.sizes : defaults.sizes
);

/**
 * Uses deep-merge to merge default controls settings with ones
 * specified by the developer.
 *
 * @param      {Object}  settings  Settings paased on initialisation.
 * @param      {Object}  defaults  Default settings for plugin.
 * @return     {Object}  Settings to be applied.
 */
const mergeUsersSettings = (settings, defaults) => (
  settings && settings.controls ?
  videojs.mergeOptions(defaults.controls, settings.controls) :
  defaults.controls
)

/**
 * A video.js plugin.
 *
 * In the plugin function, the value of `this` is a video.js `Player`
 * instance. You cannot rely on the player being in a "ready" state here,
 * depending on how the plugin is invoked. This may or may not be important
 * to you; if not, remove the wait for "ready"!
 *
 * @function responsiveControls
 * @param    {Object} [options={}]
 *           An object of options left to the plugin author to define.
 */
const responsiveControls = function(userSettings) {
  const settings = {
    sizes: getMediaQueries(userSettings, defaults),
    controls: mergeUsersSettings(userSettings, defaults),
  };

  this.addClass('vjs-responsive-controls');
  window.resizeDetector = window.resizeDetector || newDetector();
  window.resizeDetector.listenTo(this.el(), () => setup(this, settings));
  // setup(player, settings);
};

// Register the plugin with video.js.
registerPlugin('responsiveControls', responsiveControls);

// Include the version number.
responsiveControls.VERSION = VERSION;

export default responsiveControls;
