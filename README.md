# videojs-responsive-controls

Adapts Video.js controls to different player sizes.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Table of contents

- [Installation](#installation)
- [Basics](#basics)
- [Defaults](#defaults)
- [Features](#features)
    - [Visible by default](#visible-by-default)
    - [Specifying own breakpoints](#specifying-own-breakpoints)
    - [Using with legacy plugins](#using-with-legacy-plugins)
- [Bundling with legacy systems](#bundling-with-legacy-systems)
  - [`<script>` Tag](#script-tag)
  - [Browserify/CommonJS](#browserifycommonjs)
  - [RequireJS/AMD](#requirejsamd)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->
## Installation

```sh
npm install --save videojs-responsive-controls
```


## Basics

Basic usage:

```js
import 'videojs-responsive-controls';

player.responsiveControls({
    controls: {
      currentTimeDisplay: { mini: false, mobile: false },
      'vjs-resolution-button': { mini: false },
      'vjs-language-container': { mini: false }
    }
});
```

Allows controlling both Video.js native plugins and legacy plugins (via their class names).

## Defaults

Default breakpoints are:

- `mini`: <450px,
- `mobile`: <600px,
- `default`: any higher resolution

Default settings are:

```
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
```

## Features

#### Visible by default

If user did not specified visibility for given plugin/breakpoint, and the visibility is also
not specified in default settings - the plugin will be visible.

#### Specifying own breakpoints

You can specify own breakpoints like this:

```js
player.responsiveControls({
    sizes: {
        custom: 1024,
    },
    controls: {
        currentTimeDisplay: { custom: false }
    }
});
```

Default breakpoints will be overwritten by this setting, therefore if you wish to use defaults too
you'll have to specify default breakpoints along with your custom ones like so:


```js
player.responsiveControls({
    sizes: {
        mini: 450,
        mobile: 600,
        custom: 1024,
    },
    controls: {
        currentTimeDisplay: { custom: false }
    }
});
```

Breakpoints are mobile-up so specified value is a maximum size video player can have to be affected by this breakpoint.

To hide element by default use `default` breakpoint:

```js
player.responsiveControls({
    controls: {
        currentTimeDisplay: { default: false, mini: true }
    }
});
```


#### Using with legacy plugins

Legacy plugins does not register in `videojs.controlBar` space but you can still manage them throught
this script passing class name in options, like this:

```js
player.responsiveControls({
    controls: {
        'vjs-language-container': { mini: false }
    }
});
```



## Bundling with legacy systems

To include videojs-responsive-controls on your website or web application, use any of the following legacy methods.

### `<script>` Tag

This is the simplest case. Get the script in whatever way you prefer and include the plugin _after_ you include [video.js][videojs], so that the `videojs` global is available.

```html
<script src="//path/to/video.min.js"></script>
<script src="//path/to/videojs-responsive-controls.min.js"></script>
<script>
  var player = videojs('my-video');

  player.responsiveControls();
</script>
```

### Browserify/CommonJS

When using with Browserify, install videojs-responsive-controls via npm and `require` the plugin as you would any other module.

```js
var videojs = require('video.js');

// The actual plugin function is exported by this module, but it is also
// attached to the `Player.prototype`; so, there is no need to assign it
// to a variable.
require('videojs-responsive-controls');

var player = videojs('my-video');

player.responsiveControls();
```

### RequireJS/AMD

When using with RequireJS (or another AMD library), get the script in whatever way you prefer and `require` the plugin as you normally would:

```js
require(['video.js', 'videojs-responsive-controls'], function(videojs) {
  var player = videojs('my-video');

  player.responsiveControls();
});
```

## License

MIT. Copyright (c) Tomasz Janiczek &lt;tjaniczek@twig-world.com&gt;


[videojs]: http://videojs.com/
