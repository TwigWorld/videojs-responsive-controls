import document from 'global/document';

import QUnit from 'qunit';
import sinon from 'sinon';
import videojs from 'video.js';

import plugin from '../src/plugin';

const Player = videojs.getComponent('Player');

const classList = pluginInstance => pluginInstance.el().classList;
const isHidden = pluginInstance => classList(pluginInstance).contains('vjs-hidden');
const isVisible = pluginInstance => !isHidden(pluginInstance);
const dispatchResizeEvent = (player, size, clock) => {
  player.el().style.width = `${size}px`;

  const event = document.createEvent('HTMLEvents');

  event.initEvent('scroll', true, false);

  const detector = player.el().querySelectorAll('.erd_scroll_detection_container')[0];
  const detectNode = detector.childNodes[0].childNodes[0].childNodes[0];

  detectNode.dispatchEvent(event);
  clock.tick(1);
};

QUnit.test('the environment is sane', function(assert) {
  assert.strictEqual(typeof Array.isArray, 'function', 'es5 exists');
  assert.strictEqual(typeof sinon, 'object', 'sinon exists');
  assert.strictEqual(typeof videojs, 'function', 'videojs exists');
  assert.strictEqual(typeof plugin, 'function', 'plugin is a function');
});

QUnit.module('videojs-responsive-controls', {

  beforeEach() {

    // Mock the environment's timers because certain things - particularly
    // player readiness - are asynchronous in video.js 5. This MUST come
    // before any player is created; otherwise, timers could get created
    // with the actual timer methods!
    this.clock = sinon.useFakeTimers();

    this.fixture = document.getElementById('qunit-fixture');
    this.video = document.createElement('video');
    this.fixture.appendChild(this.video);
    this.player = videojs(this.video);
  },

  afterEach() {
    this.player.dispose();
    this.clock.restore();
  }
});

QUnit.test('registers itself with video.js', function(assert) {
  assert.expect(2);

  assert.strictEqual(
    typeof Player.prototype.responsiveControls,
    'function',
    'videojs-responsive-controls plugin was registered'
  );

  this.player.responsiveControls();

  // Tick the clock forward enough to trigger the player to be "ready".
  this.clock.tick(1);

  assert.ok(
    this.player.hasClass('vjs-responsive-controls'),
    'the plugin adds a class to the player'
  );
});

QUnit.test('uses default settings if no settings are passed', function(assert) {
  assert.expect(5);

  this.player.width(1000);
  this.player.responsiveControls();
  this.clock.tick(2);

  const {
    currentTimeDisplay,
    timeDivider,
    durationDisplay,
    remainingTimeDisplay,
    captionsButton
  } = this.player.controlBar;

  assert.ok(isVisible(currentTimeDisplay));
  assert.ok(isVisible(timeDivider));
  assert.ok(isVisible(durationDisplay));
  assert.ok(isVisible(remainingTimeDisplay));
  assert.ok(isVisible(captionsButton));

});

QUnit.test('uses default settings for different breakpoints', function(assert) {
  assert.expect(5);

  this.player.width(400);
  this.player.responsiveControls();
  this.clock.tick(2);

  const {
    currentTimeDisplay,
    timeDivider,
    durationDisplay,
    remainingTimeDisplay,
    captionsButton
  } = this.player.controlBar;

  assert.ok(isHidden(currentTimeDisplay));
  assert.ok(isHidden(timeDivider));
  assert.ok(isHidden(durationDisplay));
  assert.ok(isHidden(remainingTimeDisplay));
  assert.ok(isHidden(captionsButton));
});

QUnit.test('shows and hides plugins depending on video player size', function(assert) {
  assert.expect(2);

  this.player.width(1000);
  this.player.responsiveControls();
  this.clock.tick(2);

  const { currentTimeDisplay } = this.player.controlBar;

  assert.ok(isVisible(currentTimeDisplay));

  this.clock.tick(2);
  dispatchResizeEvent(this.player, 300, this.clock);

  assert.ok(isHidden(currentTimeDisplay));
});

QUnit.test('allows redefining media queries', function(assert) {
  assert.expect(6);

  this.player.width(1000);
  this.player.responsiveControls({
    sizes: {
      custom: 100
    },
    controls: {
      captionsButton: {
        custom: false
      }
    }
  });

  this.clock.tick(2);

  const {
    remainingTimeDisplay,
    captionsButton
  } = this.player.controlBar;

  assert.ok(isVisible(remainingTimeDisplay));
  assert.ok(isVisible(captionsButton));

  this.clock.tick(2);
  // Below default media query but above custom
  // Default media query should not apply
  dispatchResizeEvent(this.player, 300, this.clock);

  assert.ok(isVisible(remainingTimeDisplay));
  assert.ok(isVisible(captionsButton));

  this.clock.tick(2);
  dispatchResizeEvent(this.player, 100, this.clock);

  assert.ok(isVisible(remainingTimeDisplay));
  assert.ok(isHidden(captionsButton));
});

QUnit.test('allows redefining default value for a single control element', function(assert) {
  assert.expect(1);

  this.player.width(1000);
  this.player.responsiveControls({
    controls: {
      captionsButton: {
        default: false
      }
    }
  });

  this.clock.tick(2);
  const { captionsButton } = this.player.controlBar;

  assert.ok(isHidden(captionsButton));
});

QUnit.test('allows redefining behaviour for single controls', function(assert) {
  assert.expect(6);

  this.player.width(1000);
  this.player.responsiveControls({
    controls: {
      captionsButton: {
        mini: true,
        small: false,
        default: true
      },
      remainingTimeDisplay: {
        mini: false,
        small: true,
        default: false
      }
    }
  });

  this.clock.tick(2);

  const {
    remainingTimeDisplay,
    captionsButton
  } = this.player.controlBar;

  // Default breakpoint
  assert.ok(isHidden(remainingTimeDisplay));
  assert.ok(isVisible(captionsButton));

  this.clock.tick(2);
  dispatchResizeEvent(this.player, 600, this.clock);

  // Mobile Breakpoint
  assert.ok(isVisible(remainingTimeDisplay));
  assert.ok(isHidden(captionsButton));

  // Mini breakpoint
  this.clock.tick(2);
  dispatchResizeEvent(this.player, 450, this.clock);

  assert.ok(isHidden(remainingTimeDisplay));
  assert.ok(isVisible(captionsButton));

});

QUnit.test('allows redefining behaviour for non standard elements', function(assert) {
  assert.expect(2);

  const custom = document.createElement('div');

  custom.className = 'vjs-language-container';
  this.player.el().querySelectorAll('.vjs-control-bar')[0].appendChild(custom);

  this.player.width(400);
  this.player.responsiveControls({
    controls: {
      'vjs-language-container': {
        mini: false,
        small: false
      }
    }
  });

  this.clock.tick(2);
  const customSelector = this.player.el().querySelectorAll('.vjs-language-container')[0];

  assert.ok(customSelector.classList.contains('vjs-hidden'));

  this.clock.tick(2);
  dispatchResizeEvent(this.player, 900, this.clock);
  assert.ok(!customSelector.classList.contains('vjs-hidden'));
});
