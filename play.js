(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _GameEnginePublications = require('./GameEngine/Publications');

var _GameEnginePublications2 = _interopRequireDefault(_GameEnginePublications);

var canvas = document.getElementById('gamecanvas');

var browserUI = {
  renderContext: canvas.getContext('2d'),
  height: canvas.height,
  width: canvas.width
};

browserUI.publications = (0, _GameEnginePublications2['default'])(browserUI);
var publish = browserUI.publications.publish;

canvas.addEventListener('click', function (evt) {
  publish('click', {
    x: evt.offsetX,
    y: evt.offsetY
  });
});

canvas.addEventListener('mousemove', function (evt) {
  publish('mouseMove', {
    x: evt.offsetX,
    y: evt.offsetY
  });
});

canvas.addEventListener('mouseleave', function (evt) {
  publish('mouseLeave');
});

document.addEventListener('keypress', function (evt) {
  if (evt.which === 32) {
    publish('spacebarKey');
  }
});

exports['default'] = browserUI;
module.exports = exports['default'];

},{"./GameEngine/Publications":4}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var gameLoopDelta = 0;
var lastFrameTimeMs = 0;

var update = function update(gameObj, delta) {
  gameObj.updatingElements.forEach(function (element) {
    element.update(element, delta, gameObj);
  });
};

var render = function render(gameObj) {
  gameObj.renderingElements.forEach(function (element) {
    element.render(element.state, gameObj.renderContext);
  });
};

var gameLoop = function gameLoop(timestamp, game) {

  if (!game.running) {
    return;
  }

  requestAnimationFrame(function (timestampInner) {
    gameLoop(timestampInner, game);
  });

  gameLoopDelta = timestamp - lastFrameTimeMs;
  lastFrameTimeMs = timestamp;

  update(game, gameLoopDelta);
  render(game);
};

var startGame = function startGame(game) {

  if (game.initialised !== true) {
    if (typeof game.init === 'function') {
      game.init(game);
    }
    game.initialised = true;
  }

  game.running = true;

  if (game.subscribe) {
    game.subscribe(game);
  }

  requestAnimationFrame(function (timestamp) {
    lastFrameTimeMs = timestamp;
    gameLoop(timestamp, game);
  });
};

exports.startGame = startGame;
var stopGame = function stopGame(game) {
  game.running = false;
  if (game.unsubscribe) {
    game.unsubscribe(game);
  }
};
exports.stopGame = stopGame;

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _Publications = require('./Publications');

var _Publications2 = _interopRequireDefault(_Publications);

var addGameElements = function addGameElements(game, elementToAdd) {
  var elements = game.elements;
  var updatingElements = game.updatingElements;
  var renderingElements = game.renderingElements;
  var publications = game.publications;

  elementToAdd.forEach(function (element) {

    // Create element object if just the element factory function
    if (typeof element === 'function') {
      element = element();
    }

    // Initialise element
    var init = element.init;
    if (typeof init === 'function') {
      init(element, game);
    }

    // Add to element collection
    var elementName = element.name;
    if (!elements[elementName]) {
      elements[elementName] = [];
    }
    elements[elementName].push(element);

    // // Asign game loop functions
    if (typeof element.update === 'function') {
      updatingElements.push(element);
    }

    if (typeof element.render === 'function') {
      renderingElements.push(element);
    }

    // Add subscriptions
    var elementSubscribe = element.subscribe;
    if (typeof elementSubscribe === 'object') {
      Object.keys(elementSubscribe).forEach(function (action) {
        var callback = elementSubscribe[action];
        publications.subscribe(action, callback, element);
      });
    }
  });
};

var filterOut = function filterOut(element, collection) {
  return collection.filter(function (el) {
    return el !== element;
  });
};

var removeGameElements = function removeGameElements(game, elements) {
  elements.forEach(function (element) {

    // Unsubscribe
    if (typeof element.subscribe === 'object') {
      Object.keys(element.subscribe).forEach(function (action) {
        game.publications.unsubscribe(action, element);
      });
    }
    // Remove from collections
    game.updatingElements = filterOut(element, game.updatingElements);
    game.renderingElements = filterOut(element, game.renderingElements);
    game.elements[element.name] = filterOut(element, game.elements[element.name]);
  });
};

var resetGame = function resetGame(gameObj) {
  gameObj.running = false;

  Object.keys(gameObj.elements).forEach(function (key) {
    var elements = gameObj.elements[key];
    removeGameElements(gameObj, elements);
  });

  gameObj.state = {};
  gameObj.init(gameObj);
  gameObj.running = true;
};

// Game constructor function
var GameObject = function GameObject(name, conf) {
  var gameObj = {
    add: function add() {
      for (var _len = arguments.length, elements = Array(_len), _key = 0; _key < _len; _key++) {
        elements[_key] = arguments[_key];
      }

      addGameElements(this, elements);
    },
    config: conf.config,
    elements: {},
    init: conf.init,
    initialised: false,
    name: name,
    remove: function remove() {
      for (var _len2 = arguments.length, elements = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        elements[_key2] = arguments[_key2];
      }

      removeGameElements(this, elements);
    },
    renderContext: conf.renderContext,
    renderingElements: [],
    reset: function reset() {
      resetGame(this);
    },
    running: false,
    state: {},
    subscribe: conf.subscribe,
    updatingElements: [],
    unsubscribe: conf.unsubscribe
  };

  gameObj.publications = (0, _Publications2['default'])(gameObj);

  return gameObj;
};

exports['default'] = GameObject;
module.exports = exports['default'];

},{"./Publications":4}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var Publications = function Publications(publisher) {
  var subs = {};

  var pubs = {
    publish: function publish(action, data) {
      if (!subs.hasOwnProperty(action)) {
        return;
      }
      subs[action].forEach(function (_ref) {
        var callback = _ref.callback;
        var subscriber = _ref.subscriber;

        callback(data, subscriber, publisher);
      });
    },

    subscribe: function subscribe(action, callback, subscriber) {
      if (!subs.hasOwnProperty(action)) {
        subs[action] = [];
      }
      var sub = {
        callback: callback,
        subscriber: subscriber
      };
      subs[action].push(sub);
    },

    unsubscribe: function unsubscribe(action, subscriber) {
      if (!subs.hasOwnProperty(action)) {
        return;
      }
      subs[action] = subs[action].filter(function (sub) {
        return sub.subscriber !== subscriber;
      });
    }

  };

  return pubs;
};

exports["default"] = Publications;
module.exports = exports["default"];

},{}],5:[function(require,module,exports){
// Game element factory function
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var defineElement = function defineElement(options) {
  var name = options.name;
  var init = options.init;
  var update = options.update;
  var render = options.render;
  var subscribe = options.subscribe;

  var elementIdIndex = 0;

  var factory = function factory() {
    var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var element = {};

    element.name = name;

    // Assign id
    element.id = element.name + "_" + elementIdIndex;
    elementIdIndex++;

    // Initialise state
    element.init = init;
    element.config = config;
    element.state = {};

    // Asign game loop functions
    element.update = update;
    element.render = render;

    // Assign subscription settings
    element.subscribe = subscribe;

    return element;
  };

  return factory;
};

Object.freeze(defineElement);

exports["default"] = defineElement;
module.exports = exports["default"];

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _GameEngineDefineElement = require('../../GameEngine/defineElement');

var _GameEngineDefineElement2 = _interopRequireDefault(_GameEngineDefineElement);

var Buildings = (0, _GameEngineDefineElement2['default'])({
  name: 'Buildings',
  init: function init(_ref, game) {
    var state = _ref.state;
    var config = _ref.config;
    var _game$config = game.config;
    var gameWidth = _game$config.width;
    var gameHeight = _game$config.height;

    state.buildings = [];

    for (var ix = 0; ix < gameWidth; ix++) {
      if (Math.random() > 0.9) {
        var buildingX = ix - 15;
        var builindgWidth = Math.max(Math.random() * 30 | 0, 10);
        var buildingHeight = Math.max(Math.random() * 40 | 0, 15);
        state.buildings.push({
          x: buildingX,
          y: gameHeight - buildingHeight - 40,
          width: builindgWidth,
          height: buildingHeight,
          destroyed: false
        });
      }
    }
  },
  render: function render(state, context) {
    var buildings = state.buildings;

    buildings.forEach(function (building) {
      var x = building.x;
      var y = building.y;
      var width = building.width;
      var height = building.height;
      var destroyed = building.destroyed;

      if (destroyed) {
        context.fillStyle = 'rgba(125,125,125,0.4)';
      } else {
        context.fillStyle = 'rgba(200,30,200,0.4)';
      }
      context.fillRect(x, y, width, height);
    });
  },
  subscribe: {
    missileGroundImpact: function missileGroundImpact(data, element, game) {
      var state = element.state;
      var buildings = state.buildings;
      var positionX = data.positionX;

      state.buildings = buildings.map(function (building) {
        var destroyed = building.destroyed;
        var x = building.x;
        var width = building.width;

        if (destroyed) {
          return building;
        }
        var insideLeftBound = positionX + 30 >= x;
        var insideRightBound = positionX <= x + width;
        if (insideLeftBound && insideRightBound) {
          building.destroyed = true;
        }
        return building;
      });
    },
    gameOver: function gameOver(data, element, game) {
      var state = element.state;
      var buildings = state.buildings;

      state.buildings = buildings.map(function (building) {
        building.destroyed = true;
        return building;
      });
    }
  }
});

exports['default'] = Buildings;
module.exports = exports['default'];

},{"../../GameEngine/defineElement":5}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _GameEngineDefineElement = require('../../GameEngine/defineElement');

var _GameEngineDefineElement2 = _interopRequireDefault(_GameEngineDefineElement);

var CitizenScore = (0, _GameEngineDefineElement2['default'])({
  name: 'CitizenScore',
  init: function init(_ref, game) {
    var state = _ref.state;
    var config = _ref.config;
    var _config$citizens = config.citizens;
    var citizens = _config$citizens === undefined ? 1200 : _config$citizens;

    state.citizens = citizens;
    state.x = game.config.width - 10;
    state.y = game.config.height - 15;
  },
  render: function render(state, context) {
    var citizens = state.citizens;
    var x = state.x;
    var y = state.y;

    context.font = '18px monospace';
    context.textAlign = 'right';
    context.fillStyle = 'rgba(255,255,255,0.8)';
    context.fillText('citizens ' + citizens, x, y);
  },
  subscribe: {
    missileGroundImpact: function missileGroundImpact(data, element, game) {
      if (game.state.gameOver) {
        return;
      }
      var state = element.state;

      var populationDamage = 50 + (Math.random() * 50 | 0);
      state.citizens = Math.max(state.citizens - populationDamage, 0);
      if (state.citizens === 0 && !game.state.gameOver) {
        game.publications.publish('citizensDestroyed');
      }
    }
  }
});

exports['default'] = CitizenScore;
module.exports = exports['default'];

},{"../../GameEngine/defineElement":5}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _GameEngineDefineElement = require('../../GameEngine/defineElement');

var _GameEngineDefineElement2 = _interopRequireDefault(_GameEngineDefineElement);

var _util = require('../util');

var DefenseBase = (0, _GameEngineDefineElement2['default'])({
  name: 'DefenseBase',
  init: function init(_ref, game) {
    var state = _ref.state;
    var config = _ref.config;
    var _config$x = config.x;
    var x = _config$x === undefined ? Math.random() * game.config.width : _config$x;
    var _config$y = config.y;
    var y = _config$y === undefined ? game.config.height - 50 : _config$y;
    var _config$width = config.width;
    var width = _config$width === undefined ? 20 : _config$width;

    state.width = width;
    state.positionX = x - width / 2;
    state.positionY = y;
  },
  render: function render(state, context) {
    var positionX = state.positionX;
    var positionY = state.positionY;
    var width = state.width;

    context.fillStyle = 'rgb(100,200,100)';
    context.fillRect(positionX, positionY, 20, width);
  }
});

exports['default'] = DefenseBase;
module.exports = exports['default'];

},{"../../GameEngine/defineElement":5,"../util":23}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _GameEngineDefineElement = require('../../GameEngine/defineElement');

var _GameEngineDefineElement2 = _interopRequireDefault(_GameEngineDefineElement);

var pointInsideCircle = function pointInsideCircle(_ref) {
  var circleX = _ref.circleX;
  var circleY = _ref.circleY;
  var circleRadius = _ref.circleRadius;
  var pointX = _ref.pointX;
  var pointY = _ref.pointY;

  // Point is inside circle if distance squared is less than or equal to r squared
  // return d^2 <= r^2
  var rSquared = circleRadius * circleRadius;
  var dSquared = Math.pow(pointY - circleY, 2) + Math.pow(pointX - circleX, 2);
  return dSquared <= rSquared;
};

var getCornerPoints = function getCornerPoints(_ref2) {
  var positionX = _ref2.positionX;
  var positionY = _ref2.positionY;
  var width = _ref2.width;

  return [{ x: positionX, y: positionY }, { x: positionX + width, y: positionY }, { x: positionX, y: positionY + width }, { x: positionX + width, y: positionY + width }];
};

var DefenseExplosion = (0, _GameEngineDefineElement2['default'])({
  name: 'DefenseExplosion',
  init: function init(_ref3, game) {
    var state = _ref3.state;
    var _ref3$config = _ref3.config;
    var config = _ref3$config === undefined ? {} : _ref3$config;
    var _config$x = config.x;
    var x = _config$x === undefined ? 0 : _config$x;
    var _config$y = config.y;
    var y = _config$y === undefined ? 0 : _config$y;

    state.x = x;
    state.y = y;
    state.size = 3;
    state.alpha = 1;
  },
  update: function update(element, delta, game) {
    var state = element.state;
    var size = state.size;
    var alpha = state.alpha;

    if (size >= 35) {
      game.publications.publish('explosionComplete', {
        elementId: element.id
      });
      return;
    }

    state.size = size + delta * 0.1;

    if (alpha > 0) {
      state.alpha = alpha - delta * 0.002;
    }

    var x = state.x;
    var y = state.y;

    game.elements.IncomingMissile.forEach(function (missile) {
      if (missile.state.destroyed) {
        return;
      }

      var _missile$state = missile.state;
      var positionX = _missile$state.positionX;
      var positionY = _missile$state.positionY;

      var cornerPoints = getCornerPoints({
        positionX: positionX,
        positionY: positionY,
        width: 30
      });

      var insideExplosion = cornerPoints.some(function (point) {
        return pointInsideCircle({
          circleX: x,
          circleY: y,
          circleRadius: size,
          pointX: point.x,
          pointY: point.y
        });
      });

      if (insideExplosion) {
        game.publications.publish('missileDestroyed', {
          elementId: missile.id
        });
      }
    });
  },
  render: function render(state, context) {
    var x = state.x;
    var y = state.y;
    var size = state.size;
    var alpha = state.alpha;

    context.fillStyle = 'rgba(255,255,255,' + alpha + ')';
    context.beginPath();
    context.arc(x, y, size, 0, Math.PI * 2, true);
    context.closePath();
    context.fill();
  },
  subscribe: {
    explosionComplete: function explosionComplete(data, element, game) {
      if (data.elementId !== element.id) {
        return;
      }
      game.remove(element);
    }
  }
});

exports['default'] = DefenseExplosion;
module.exports = exports['default'];

},{"../../GameEngine/defineElement":5}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _GameEngineDefineElement = require('../../GameEngine/defineElement');

var _GameEngineDefineElement2 = _interopRequireDefault(_GameEngineDefineElement);

var _util = require('../util');

var DefenseMissile = (0, _GameEngineDefineElement2['default'])({
  name: 'DefenseMissile',
  init: function init(_ref, game) {
    var state = _ref.state;
    var _ref$config = _ref.config;
    var config = _ref$config === undefined ? {} : _ref$config;
    var _config$originX = config.originX;
    var originX = _config$originX === undefined ? 0 : _config$originX;
    var _config$originY = config.originY;
    var originY = _config$originY === undefined ? 0 : _config$originY;
    var _config$targetX = config.targetX;
    var targetX = _config$targetX === undefined ? 10 : _config$targetX;
    var _config$targetY = config.targetY;
    var targetY = _config$targetY === undefined ? 10 : _config$targetY;

    state.originX = originX;
    state.originY = originY;
    state.positionX = originX;
    state.positionY = originY;
    state.targetX = targetX;
    state.targetY = targetY;
    state.dx = -(targetX - originX) / (targetY - originY);
    state.dy = -1;
    state.fillStyle = (0, _util.randomColour)({ b: 255, r: 10, a: 0.4 });
  },
  update: function update(element, delta, game) {
    var state = element.state;
    var config = element.config;
    var positionX = state.positionX;
    var positionY = state.positionY;
    var dx = state.dx;
    var dy = state.dy;
    var targetX = config.targetX;
    var targetY = config.targetY;

    state.positionX += dx;
    state.positionY += dy;

    var pastTargetX = dx > 0 ? positionX >= targetX : positionX < targetX;
    var pastTargetY = positionY <= targetY;

    if (pastTargetX && pastTargetY) {
      game.publications.publish('missileAtTarget', {
        elementId: element.id
      });
    }
  },
  render: function render(state, context) {
    var originX = state.originX;
    var originY = state.originY;
    var positionX = state.positionX;
    var positionY = state.positionY;
    var targetX = state.targetX;
    var targetY = state.targetY;
    var fillStyle = state.fillStyle;

    context.strokeStyle = 'rgba(255,255,255,0.8)';

    // Target outer
    context.beginPath();
    context.arc(targetX, targetY, 10, 0, Math.PI * 2, true);
    context.stroke();
    // Target Inner
    context.beginPath();
    context.arc(targetX, targetY, 3, 0, Math.PI * 2, true);
    context.stroke();

    // Missile path
    context.beginPath();
    context.moveTo(originX, originY);
    context.strokeStyle = 'dashed';
    context.lineTo(positionX, positionY);
    context.stroke();

    // Missile
    context.fillStyle = fillStyle;
    context.beginPath();
    context.arc(positionX, positionY, 4, 0, Math.PI * 2, true);
    context.closePath();
    context.stroke();
    context.fill();
  },
  subscribe: {
    missileAtTarget: function missileAtTarget(data, element, game) {
      if (data.elementId !== element.id) {
        return;
      }
      var _element$config = element.config;
      var targetX = _element$config.targetX;
      var targetY = _element$config.targetY;
      var fillStyle = element.state.fillStyle;

      game.publications.publish('createExplosion', {
        x: targetX,
        y: targetY
      });
      game.remove(element);
    }
  }
});

exports['default'] = DefenseMissile;
module.exports = exports['default'];

},{"../../GameEngine/defineElement":5,"../util":23}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _GameEngineDefineElement = require('../../GameEngine/defineElement');

var _GameEngineDefineElement2 = _interopRequireDefault(_GameEngineDefineElement);

var _DefenseMissile = require('./DefenseMissile');

var _DefenseMissile2 = _interopRequireDefault(_DefenseMissile);

var DefenseWeapons = (0, _GameEngineDefineElement2['default'])({
  name: 'DefenseWeapons',
  init: function init(_ref, game) {
    var state = _ref.state;
    var _ref$config = _ref.config;
    var config = _ref$config === undefined ? {} : _ref$config;
    var _config$weapons = config.weapons;
    var weapons = _config$weapons === undefined ? game.config.missileCount : _config$weapons;
    var height = game.config.height;

    state.weapons = weapons;
    state.x = 10;
    state.y = height - 15;
  },
  render: function render(state, context) {
    var weapons = state.weapons;
    var x = state.x;
    var y = state.y;

    context.font = '18px monospace';
    context.textAlign = 'left';
    context.fillStyle = 'rgba(255,255,255,0.8)';
    context.fillText('missiles ' + weapons, x, y);
  },
  subscribe: {
    fire: function fire(data, element, game) {
      var state = element.state;
      var weapons = state.weapons;

      if (weapons === 0) {
        return;
      }
      state.weapons = Math.max(state.weapons - 1, 0);

      var x = data.x;
      var y = data.y;

      var originX = 0;
      var originY = 0;
      if (game.elements.ScopeTarget && game.elements.ScopeTarget.length > 0) {
        var scopeState = game.elements.ScopeTarget[0].state;
        originX = scopeState.originX;
        originY = scopeState.originY;
      }

      game.add((0, _DefenseMissile2['default'])({
        targetX: x,
        targetY: y,
        originX: originX,
        originY: originY
      }));
    }
  }
});

exports['default'] = DefenseWeapons;
module.exports = exports['default'];

},{"../../GameEngine/defineElement":5,"./DefenseMissile":10}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _GameEngineDefineElement = require('../../GameEngine/defineElement');

var _GameEngineDefineElement2 = _interopRequireDefault(_GameEngineDefineElement);

var GameOver = (0, _GameEngineDefineElement2['default'])({
  name: 'GameOver',
  init: function init(_ref, game) {
    var state = _ref.state;
    var config = _ref.config;
    var _game$config = game.config;
    var width = _game$config.width;
    var height = _game$config.height;

    state.x = width / 2;
    state.y = height / 2;
    state.width = width;
    state.height = height;
    if (config.winner) {
      state.statusText = 'You survived!';
    } else {
      state.statusText = 'You lost';
    }
  },
  render: function render(state, context) {
    var x = state.x;
    var y = state.y;
    var width = state.width;
    var height = state.height;
    var statusText = state.statusText;

    context.fillStyle = 'rgba(0,0,0,0.5)';
    context.fillRect(0, 0, width, height);
    context.font = '30px monospace';
    context.textAlign = 'center';
    context.fillStyle = 'rgba(255,255,255,0.8)';
    context.fillText('Game Over', x, y - 20);;
    context.fillText(statusText, x, y + 20);;
    context.font = '14px monospace';
    context.fillText('(click to play again)', x, y + 50);;
  }
});

exports['default'] = GameOver;
module.exports = exports['default'];

},{"../../GameEngine/defineElement":5}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _GameEngineDefineElement = require('../../GameEngine/defineElement');

var _GameEngineDefineElement2 = _interopRequireDefault(_GameEngineDefineElement);

var _GameOver = require('./GameOver');

var _GameOver2 = _interopRequireDefault(_GameOver);

var _DefenseExplosion = require('./DefenseExplosion');

var _DefenseExplosion2 = _interopRequireDefault(_DefenseExplosion);

var GameStatus = (0, _GameEngineDefineElement2['default'])({
  name: 'GameStatus',
  init: function init(_ref, game) {
    var state = _ref.state;
    var config = _ref.config;
    var _config$resolutions = config.resolutions;
    var resolutions = _config$resolutions === undefined ? 0 : _config$resolutions;

    state.resolutions = resolutions;
  },
  subscribe: {
    missileResolved: function missileResolved(data, element, game) {
      var state = element.state;

      state.resolutions = state.resolutions + 1;
      if (!game.state.gameOver && state.resolutions === game.config.missileCount) {
        game.publications.publish('gameOver', { winner: true });
      }
    },
    citizensDestroyed: function citizensDestroyed(data, element, game) {
      game.publications.publish('gameOver', { winner: false });
    },
    gameOver: function gameOver(data, element, game) {
      game.state.gameOver = true;
      game.add((0, _GameOver2['default'])({ winner: data.winner }));
    },
    reset: function reset(data, element, game) {
      game.reset();
    },
    createExplosion: function createExplosion(data, element, game) {
      var x = data.x;
      var y = data.y;
      var stroke = data.stroke;

      game.add((0, _DefenseExplosion2['default'])({
        x: x,
        y: y
      }));
    }
  }
});

exports['default'] = GameStatus;
module.exports = exports['default'];

},{"../../GameEngine/defineElement":5,"./DefenseExplosion":9,"./GameOver":12}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _GameEngineDefineElement = require('../../GameEngine/defineElement');

var _GameEngineDefineElement2 = _interopRequireDefault(_GameEngineDefineElement);

var Ground = (0, _GameEngineDefineElement2['default'])({
  name: 'Ground',
  init: function init(_ref, game) {
    var state = _ref.state;
    var config = _ref.config;

    state.x = 0;
    state.y = game.config.height - 40, state.width = game.config.width;
    state.height = 40;
    state.damageLevel = 0;
    state.fillStyle = 'rgba(100,200,100,0.6)';
    state.fillStyle2 = 'rgba(100,200,100,1)';
  },
  render: function render(state, context) {
    var fillStyle = state.fillStyle;
    var fillStyle2 = state.fillStyle2;
    var x = state.x;
    var y = state.y;
    var width = state.width;
    var height = state.height;

    var gradient = context.createLinearGradient(x, y, x, y + height);
    gradient.addColorStop(0, fillStyle);
    gradient.addColorStop(0.75, fillStyle2);

    context.fillStyle = gradient;
    context.fillRect(x, y, width, height);
  },
  subscribe: {
    missileGroundImpact: function missileGroundImpact(data, element, game) {
      if (game.state.gameOver) {
        return;
      }
      var state = element.state;

      state.damageLevel = state.damageLevel + 30;
      var redFill = Math.min(100 + state.damageLevel, 255);
      state.fillStyle = 'rgba(' + redFill + ',200,100,0.6)';
    }
  }
});

exports['default'] = Ground;
module.exports = exports['default'];

},{"../../GameEngine/defineElement":5}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _GameEngineDefineElement = require('../../GameEngine/defineElement');

var _GameEngineDefineElement2 = _interopRequireDefault(_GameEngineDefineElement);

var _util = require('../util');

var IncomingMissile = (0, _GameEngineDefineElement2['default'])({
  name: 'IncomingMissile',
  init: function init(_ref, game) {
    var state = _ref.state;
    var config = _ref.config;

    state.destroyed = false;
    state.impacted = false;
    state.fillStyle = (0, _util.randomColour)({ r: 255, b: 10 });
    state.positionX = Math.random() * game.config.width - 20;
    state.positionY = Math.random() * game.config.height * 0.5 - game.config.height * 0.5;
    state.groundY = game.elements.Ground[0].state.y;
  },
  update: function update(element, delta, game) {
    var state = element.state;

    state.positionY += 0.0275 * delta;

    var positionX = state.positionX;
    var positionY = state.positionY;
    var destroyed = state.destroyed;
    var impacted = state.impacted;
    var groundY = state.groundY;

    if (!destroyed && !impacted && groundY) {
      if (positionY + 30 > groundY) {
        game.publications.publish('missileGroundImpact', {
          elementId: element.id,
          positionX: positionX
        });
      }
    }
  },
  render: function render(state, context) {
    context.fillStyle = state.fillStyle;
    context.fillRect(state.positionX, state.positionY, 30, 30);
  },
  subscribe: {
    missileDestroyed: function missileDestroyed(data, element, game) {
      var state = element.state;

      if (data.elementId !== element.id || state.destroyed) {
        return;
      }
      state.destroyed = true;
      state.fillStyle = 'rgba(125,125,125,0.5)';
      game.publications.publish('updateMissileDestroyedScore');
    },
    missileGroundImpact: function missileGroundImpact(data, element, game) {
      if (data.elementId !== element.id) {
        return;
      }
      game.remove(element);
      game.publications.publish('missileResolved');
    }
  }
});

exports['default'] = IncomingMissile;
module.exports = exports['default'];

},{"../../GameEngine/defineElement":5,"../util":23}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _GameEngineDefineElement = require('../../GameEngine/defineElement');

var _GameEngineDefineElement2 = _interopRequireDefault(_GameEngineDefineElement);

var MissilesDestroyedScore = (0, _GameEngineDefineElement2['default'])({
  name: 'MissilesDestroyedScore',
  init: function init(_ref, game) {
    var state = _ref.state;
    var config = _ref.config;
    var _config$destroyedScore = config.destroyedScore;
    var destroyedScore = _config$destroyedScore === undefined ? 0 : _config$destroyedScore;

    state.destroyedScore = destroyedScore;
    state.x = game.config.width - 10;
  },
  render: function render(state, context) {
    var destroyedScore = state.destroyedScore;
    var x = state.x;

    context.font = "18px monospace";
    context.textAlign = 'right';
    context.fillStyle = "rgba(255,255,255,0.8)";
    context.fillText('' + destroyedScore, x, 25);;
  },
  subscribe: {
    updateMissileDestroyedScore: function updateMissileDestroyedScore(data, element, game) {
      var state = element.state;

      state.destroyedScore = state.destroyedScore + 1;
      if (!game.state.gameOver) {
        game.publications.publish('missileResolved');
      }
    }
  }
});

exports['default'] = MissilesDestroyedScore;
module.exports = exports['default'];

},{"../../GameEngine/defineElement":5}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _GameEngineDefineElement = require('../../GameEngine/defineElement');

var _GameEngineDefineElement2 = _interopRequireDefault(_GameEngineDefineElement);

var Scene = (0, _GameEngineDefineElement2['default'])({
  name: 'Scene',
  init: function init(_ref, game) {
    var state = _ref.state;

    state.fillStyle = 'rgb(50, 50, 50)';
    state.width = game.config.width;
    state.height = game.config.height;
  },
  render: function render(state, context) {
    var width = state.width;
    var height = state.height;
    var fillStyle = state.fillStyle;

    context.clearRect(0, 0, width, height);
    context.fillStyle = fillStyle;
    context.fillRect(0, 0, width, height);
  }
});

exports['default'] = Scene;
module.exports = exports['default'];

},{"../../GameEngine/defineElement":5}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _GameEngineDefineElement = require('../../GameEngine/defineElement');

var _GameEngineDefineElement2 = _interopRequireDefault(_GameEngineDefineElement);

var ScopeTarget = (0, _GameEngineDefineElement2['default'])({
  name: 'ScopeTarget',
  init: function init(_ref, game) {
    var state = _ref.state;
    var config = _ref.config;
    var height = game.config.height;
    var _config$ranges = config.ranges;
    var ranges = _config$ranges === undefined ? [{
      boundX: 0,
      originX: 0
    }] : _config$ranges;

    state.fillStyle = 'rgba(50,255,125,0.6)';
    state.positionX = 0;
    state.positionY = 0;
    state.keepAliveTime = 0;

    state.originY = height - 50;
    state.originX = ranges[0].originX;
  },
  update: function update(_ref2, delta) {
    var state = _ref2.state;

    state.keepAliveTime -= 0.1 * delta;
  },
  render: function render(state, context) {
    if (state.keepAliveTime <= 0) {
      return;
    }

    var positionX = state.positionX;
    var positionY = state.positionY;
    var originX = state.originX;
    var originY = state.originY;
    var fillStyle = state.fillStyle;

    context.beginPath();
    context.moveTo(positionX, positionY);
    context.strokeStyle = 'dashed';
    context.lineTo(originX, originY);
    context.strokeStyle = fillStyle;
    context.stroke();

    context.fillStyle = fillStyle;
    context.beginPath();
    context.arc(positionX, positionY, 10, 0, Math.PI * 2, true);
    context.stroke();

    context.beginPath();
    context.arc(positionX, positionY, 3, 0, Math.PI * 2, true);
    context.stroke();
    // context.strokeRect(positionX - 10, positionY - 10, 20, 20);
    // context.strokeRect(positionX - 3, positionY - 3, 6, 6)
  },
  subscribe: {
    scopeTargetMove: function scopeTargetMove(data, element, game) {
      var state = element.state;
      var _element$config = element.config;
      var config = _element$config === undefined ? {} : _element$config;

      if (game.state.gameOver) {
        state.keepAliveTime = 0;
        return;
      }

      var x = data.x;
      var y = data.y;

      state.positionX = x;
      state.positionY = y;

      var _config$ranges2 = config.ranges;
      var ranges = _config$ranges2 === undefined ? [] : _config$ranges2;

      var range = ranges.find(function (_ref3) {
        var boundX = _ref3.boundX;

        return x < boundX;
      });
      if (range) {
        state.originX = range.originX;
      }

      state.keepAliveTime = 500;
    },
    scopeTargetExit: function scopeTargetExit(data, element, game) {
      if (game.state.gameOver) {
        return;
      }
      var state = element.state;

      state.keepAliveTime = 0;
    }
  }
});

exports['default'] = ScopeTarget;
module.exports = exports['default'];

},{"../../GameEngine/defineElement":5}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _GameEngineDefineElement = require('../../GameEngine/defineElement');

var _GameEngineDefineElement2 = _interopRequireDefault(_GameEngineDefineElement);

var Stars = (0, _GameEngineDefineElement2['default'])({
  name: 'Stars',
  init: function init(_ref, game) {
    var state = _ref.state;
    var config = _ref.config;

    state.x = 1;
    state.y = 1, state.width = game.config.width;
    state.height = game.config.height - 40;
    state.fillStyle = 'rgba(230,230,230,0.6)';
    state.stars = [];
    for (var iy = state.y; iy < state.height; iy++) {
      for (var ix = state.x; ix < state.width; ix++) {
        var densityChance = (1 - iy / state.height) * Math.random();
        if (densityChance > 0.15 && Math.random() > 0.997) {
          state.stars.push({
            x: ix,
            y: iy
          });
        }
      }
    }
  },
  render: function render(state, context) {
    var fillStyle = state.fillStyle;
    var stars = state.stars;

    context.fillStyle = state.fillStyle;
    stars.forEach(function (star) {
      context.fillRect(star.x, star.y, 2, 2);
    });
  }
});

exports['default'] = Stars;
module.exports = exports['default'];

},{"../../GameEngine/defineElement":5}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _GameEngineGameObject = require('../GameEngine/GameObject');

var _GameEngineGameObject2 = _interopRequireDefault(_GameEngineGameObject);

var _BrowserUI = require('../BrowserUI');

var _BrowserUI2 = _interopRequireDefault(_BrowserUI);

var _init = require('./init');

var _init2 = _interopRequireDefault(_init);

var _subscriptions = require('./subscriptions');

var game = (0, _GameEngineGameObject2['default'])('Missile Command', {
  config: {
    width: _BrowserUI2['default'].width,
    height: _BrowserUI2['default'].height,
    missileCount: 40
  },
  init: _init2['default'],
  renderContext: _BrowserUI2['default'].renderContext,
  subscribe: _subscriptions.subscribe,
  unsubscribe: _subscriptions.unsubscribe
});

exports['default'] = game;
module.exports = exports['default'];

},{"../BrowserUI":1,"../GameEngine/GameObject":3,"./init":21,"./subscriptions":22}],21:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _util = require('./util');

var _elementsScene = require('./elements/Scene');

var _elementsScene2 = _interopRequireDefault(_elementsScene);

var _elementsGround = require('./elements/Ground');

var _elementsGround2 = _interopRequireDefault(_elementsGround);

var _elementsStars = require('./elements/Stars');

var _elementsStars2 = _interopRequireDefault(_elementsStars);

var _elementsBuildings = require('./elements/Buildings');

var _elementsBuildings2 = _interopRequireDefault(_elementsBuildings);

var _elementsDefenseBase = require('./elements/DefenseBase');

var _elementsDefenseBase2 = _interopRequireDefault(_elementsDefenseBase);

var _elementsDefenseMissile = require('./elements/DefenseMissile');

var _elementsDefenseMissile2 = _interopRequireDefault(_elementsDefenseMissile);

var _elementsIncomingMissile = require('./elements/IncomingMissile');

var _elementsIncomingMissile2 = _interopRequireDefault(_elementsIncomingMissile);

var _elementsScopeTarget = require('./elements/ScopeTarget');

var _elementsScopeTarget2 = _interopRequireDefault(_elementsScopeTarget);

var _elementsDefenseWeapons = require('./elements/DefenseWeapons');

var _elementsDefenseWeapons2 = _interopRequireDefault(_elementsDefenseWeapons);

var _elementsCitizenScore = require('./elements/CitizenScore');

var _elementsCitizenScore2 = _interopRequireDefault(_elementsCitizenScore);

var _elementsMissilesDestroyedScore = require('./elements/MissilesDestroyedScore');

var _elementsMissilesDestroyedScore2 = _interopRequireDefault(_elementsMissilesDestroyedScore);

var _elementsGameStatus = require('./elements/GameStatus');

var _elementsGameStatus2 = _interopRequireDefault(_elementsGameStatus);

var initialise = function initialise(game) {
  var config = game.config;
  var state = game.state;

  state.gameOver = false;
  state.resolutions = 0;

  var width = config.width;

  /* Scenery */
  game.add(_elementsScene2['default'], _elementsGround2['default'], _elementsStars2['default'], _elementsBuildings2['default']);

  /* Defense Elements */
  var defenseBaseCount = 3;
  var defenseBaseBoundaryWidth = width / defenseBaseCount;
  var halfBoundaryWidth = defenseBaseBoundaryWidth / 2;

  var defenseBaseData = (0, _util.filledArray)(defenseBaseCount).map(function (v, i) {
    var boundX = defenseBaseBoundaryWidth * (i + 1) | 0;
    var originX = boundX - halfBoundaryWidth | 0;
    return {
      boundX: boundX,
      originX: originX
    };
  });

  defenseBaseData.forEach(function (data) {
    game.add((0, _elementsDefenseBase2['default'])({ x: data.originX }));
  });

  game.add((0, _elementsScopeTarget2['default'])({ ranges: defenseBaseData }));

  /* Incoming Missiles */
  (0, _util.filledArray)(config.missileCount).forEach(function () {
    game.add(_elementsIncomingMissile2['default']);
  });

  /* Score Counters */
  game.add(_elementsDefenseWeapons2['default'], _elementsCitizenScore2['default'], _elementsMissilesDestroyedScore2['default']);

  /* Status Monitor */
  game.add(_elementsGameStatus2['default']);
};

exports['default'] = initialise;
module.exports = exports['default'];

},{"./elements/Buildings":6,"./elements/CitizenScore":7,"./elements/DefenseBase":8,"./elements/DefenseMissile":10,"./elements/DefenseWeapons":11,"./elements/GameStatus":13,"./elements/Ground":14,"./elements/IncomingMissile":15,"./elements/MissilesDestroyedScore":16,"./elements/Scene":17,"./elements/ScopeTarget":18,"./elements/Stars":19,"./util":23}],22:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _BrowserUI = require('../BrowserUI');

var _BrowserUI2 = _interopRequireDefault(_BrowserUI);

var subscribe = function subscribe(game) {
  var browserSubs = _BrowserUI2['default'].publications.subscribe;
  var gamePublish = game.publications.publish;

  browserSubs('click', function (data) {
    if (game.state.gameOver) {
      gamePublish('reset', data);
    } else {
      gamePublish('fire', data);
    }
  }, game);

  browserSubs('mouseMove', function (data) {
    gamePublish('scopeTargetMove', data);
  }, game);

  browserSubs('mouseLeave', function () {
    gamePublish('scopeTargetExit');
  }, game);
};

exports.subscribe = subscribe;
var unsubscribe = function unsubscribe(game) {
  var browserUnsubs = _BrowserUI2['default'].publications.unsubscribe;

  browserUnsubs('click', game);
  browserUnsubs('mouseMove', game);
  browserUnsubs('mouseLeave', game);
};
exports.unsubscribe = unsubscribe;

},{"../BrowserUI":1}],23:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var randomColour = function randomColour() {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var _options$r = options.r;
  var r = _options$r === undefined ? Math.random() * 255 | 0 : _options$r;
  var _options$g = options.g;
  var g = _options$g === undefined ? Math.random() * 255 | 0 : _options$g;
  var _options$b = options.b;
  var b = _options$b === undefined ? Math.random() * 255 | 0 : _options$b;
  var _options$a = options.a;
  var a = _options$a === undefined ? '0.6' : _options$a;

  return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
};

exports.randomColour = randomColour;
var filledArray = function filledArray(count) {
  var value = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

  if (typeof count !== 'number') {
    return [];
  }
  return new Array(count).fill(value);
};

exports.filledArray = filledArray;
var lerp = function lerp() {
  var start = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
  var end = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];
  var fraction = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];

  return start + fraction * (end - start);
};
exports.lerp = lerp;

},{}],24:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = {
  init: function init() {
    console.log('you are now playing serpent attack');
  },
  stop: function stop() {}
};
module.exports = exports['default'];

},{}],25:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = {
  init: function init() {
    console.log('you are now playing serpent attack');
  },
  stop: function stop() {}
};
module.exports = exports['default'];

},{}],26:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _GameEngineGameLoop = require('./GameEngine/GameLoop');

var _MissileCommandGame = require('./MissileCommand/game');

var _MissileCommandGame2 = _interopRequireDefault(_MissileCommandGame);

var _SnakeGame = require('./Snake/game');

var _SnakeGame2 = _interopRequireDefault(_SnakeGame);

var _SerpentAttackGame = require('./SerpentAttack/game');

var _SerpentAttackGame2 = _interopRequireDefault(_SerpentAttackGame);

var _sandBoxGame = require('./sandBox/game');

var _sandBoxGame2 = _interopRequireDefault(_sandBoxGame);

(function () {

  var games = {
    MissileCommand: _MissileCommandGame2['default'],
    Snake: _SnakeGame2['default'],
    SerpentAttack: _SerpentAttackGame2['default'],
    Sandbox: _sandBoxGame2['default']
  };
  var selectedGame = _MissileCommandGame2['default'];
  (0, _GameEngineGameLoop.startGame)(selectedGame);
  window.selectedGame = selectedGame;

  var actions = {
    play: _GameEngineGameLoop.startGame,
    pause: _GameEngineGameLoop.stopGame
  };
  var selectedAction = actions.play;

  var buttonGroupHandler = function buttonGroupHandler(_ref) {
    var id = _ref.id;
    var key = _ref.key;
    var data = _ref.data;
    var onUpdate = _ref.onUpdate;

    var buttonGroup = document.getElementById(id);
    buttonGroup.addEventListener('click', function (evt) {
      var el = evt.srcElement;
      var dataKey = el.dataset[key];
      if (el.tagName !== 'BUTTON' || !dataKey || !data[dataKey]) {
        return;
      }
      Array.prototype.filter.call(buttonGroup.children, function (button) {
        return button !== el;
      }).forEach(function (button) {
        button.dataset.active = false;
      });
      el.dataset.active = true;
      onUpdate(data[dataKey]);
    });
  };

  buttonGroupHandler({
    id: 'controlbuttons',
    key: 'action',
    data: actions,
    onUpdate: function onUpdate(value) {
      if (selectedAction === value) {
        return;
      } // Return if no change
      selectedAction = value;
      selectedAction(selectedGame);
    }
  });

  buttonGroupHandler({
    id: 'gamelist',
    key: 'game',
    data: games,
    onUpdate: function onUpdate(value) {
      if (selectedGame === value) {
        return;
      } // Return if no change
      (0, _GameEngineGameLoop.stopGame)(selectedGame); // Stop current game
      selectedGame = value; // Change game selection
      (0, _GameEngineGameLoop.startGame)(selectedGame); // Start new selected game
      selectedAction = actions.play; // Update button to play
      document.querySelector('[data-action="play"]').dataset.active = true;
      document.querySelector('[data-action="pause"]').dataset.active = false;
      window.selectedGame = selectedGame; // Expose selected game object
    }
  });
})();

},{"./GameEngine/GameLoop":2,"./MissileCommand/game":20,"./SerpentAttack/game":24,"./Snake/game":25,"./sandBox/game":32}],27:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _GameEngineDefineElement = require('../../GameEngine/defineElement');

var _GameEngineDefineElement2 = _interopRequireDefault(_GameEngineDefineElement);

var _util = require('../util');

var FallingBlock = (0, _GameEngineDefineElement2['default'])({
  name: 'FallingBlock',
  init: function init(_ref, game) {
    var state = _ref.state;

    state.fillStyle = (0, _util.randomColour)({ r: 255, b: 10 });
    state.positionX = Math.random() * game.config.width * 0.85;
    state.positionY = Math.random() * game.config.height * 0.2;
  },
  update: function update(_ref2, delta) {
    var state = _ref2.state;

    state.positionY += 0.01 * delta;
  },
  render: function render(state, context) {
    context.fillStyle = state.fillStyle;
    context.fillRect(state.positionX, state.positionY, 55, 50);
  },
  subscribe: {
    targetSelection: function targetSelection(data, element, game) {
      var fireX = data.x;
      var fireY = data.y;
      var _element$state = element.state;
      var positionX = _element$state.positionX;
      var positionY = _element$state.positionY;

      var insideXbounds = fireX > positionX && fireX < positionX + 55;
      var insideYbounds = fireY > positionY && fireY < positionY + 50;
      if (insideXbounds && insideYbounds) {
        game.publications.publish('fallingBlockSelected', {
          elementId: element.id
        });
      }
    },
    fallingBlockSelected: function fallingBlockSelected(data, element, game) {
      if (data.elementId !== element.id) {
        return;
      }
      var state = element.state;

      state.fillStyle = 'rgba(125,125,125,0.5)';
    }
  }
});

exports['default'] = FallingBlock;
module.exports = exports['default'];

},{"../../GameEngine/defineElement":5,"../util":35}],28:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _GameEngineDefineElement = require('../../GameEngine/defineElement');

var _GameEngineDefineElement2 = _interopRequireDefault(_GameEngineDefineElement);

var MainCharacter = (0, _GameEngineDefineElement2['default'])({
  name: 'MainCharacter',

  init: function init(_ref) {
    var state = _ref.state;

    // Let's set the starting position
    state.positionX = 100;
    // The canvas 'y' position begins from the top of the canvas
    state.positionY = 400;
  },

  render: function render(state, context) {
    var positionX = state.positionX;
    var positionY = state.positionY;

    context.fillStyle = 'green';
    context.fillRect(positionX, positionY, 40, 40);
  },

  subscribe: {
    jump: function jump(data, _ref2) {
      var state = _ref2.state;

      // When the 'jump' event happens occurs change the character's
      // state to be 'jumping'
      state.jumping = true;
    }
  },

  update: function update(_ref3, delta) {
    var state = _ref3.state;

    // ^ The 'delta' is how much time has passed since last update
    var jumping = state.jumping;
    var positionY = state.positionY;

    if (jumping) {
      state.positionY = state.positionY - 0.1 * delta;
    }
  }

});

exports['default'] = MainCharacter;
module.exports = exports['default'];

},{"../../GameEngine/defineElement":5}],29:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _GameEngineDefineElement = require('../../GameEngine/defineElement');

var _GameEngineDefineElement2 = _interopRequireDefault(_GameEngineDefineElement);

var Scene = (0, _GameEngineDefineElement2['default'])({
  name: 'Scene',
  init: function init(_ref, game) {
    var state = _ref.state;

    state.width = game.config.width;
    state.height = game.config.height;
    state.text = '';
  },
  render: function render(state, context) {
    var width = state.width;
    var height = state.height;
    var text = state.text;

    context.clearRect(0, 0, width, height);
    context.fillStyle = 'grey';
    context.textAlign = 'left';
    context.fillText('Spacebar to jump ' + text, 150, 430);
  },
  subscribe: {
    jump: function jump(data, _ref2) {
      var state = _ref2.state;

      // When the 'jump' event happens occurs change the character's
      // state to be 'jumping'
      state.text = '- Blastoff!';
    }
  }
});

exports['default'] = Scene;
module.exports = exports['default'];

},{"../../GameEngine/defineElement":5}],30:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _GameEngineDefineElement = require('../../GameEngine/defineElement');

var _GameEngineDefineElement2 = _interopRequireDefault(_GameEngineDefineElement);

var ScopeTarget = (0, _GameEngineDefineElement2['default'])({
  name: 'ScopeTarget',
  init: function init(_ref, game) {
    var state = _ref.state;

    state.fillStyle = 'rgba(255,0,255,0.8)';
    state.fillStyle2 = 'rgb(255,255,255)';
    state.positionX = 0;
    state.positionY = 0;
    state.keepAliveTime = 0;
    state.originX = game.config.width / 2;
    state.originY = game.config.height;
  },
  update: function update(_ref2, delta) {
    var state = _ref2.state;

    state.keepAliveTime -= 0.1 * delta;
  },
  render: function render(state, context) {
    if (state.keepAliveTime <= 0) {
      return;
    }

    context.beginPath();
    context.moveTo(state.positionX, state.positionY);
    context.lineTo(state.originX, state.originY);
    context.strokeStyle = state.fillStyle;
    context.stroke();

    context.fillStyle = state.fillStyle;
    context.fillRect(state.positionX - 15, state.positionY - 15, 30, 30);
    context.fillStyle = state.fillStyle2;
    context.fillRect(state.positionX - 8, state.positionY - 8, 16, 16);
    context.fillStyle = state.fillStyle;
    context.fillRect(state.positionX - 3, state.positionY - 3, 6, 6);
  },
  subscribe: {
    scopeTargetMove: function scopeTargetMove(data, element, game) {
      var state = element.state;
      var x = data.x;
      var y = data.y;

      state.positionX = x;
      state.positionY = y;
      state.keepAliveTime = 500;
    },
    scopeTargetExit: function scopeTargetExit(data, element, game) {
      var state = element.state;

      state.keepAliveTime = 0;
    }
  }
});

exports['default'] = ScopeTarget;
module.exports = exports['default'];

},{"../../GameEngine/defineElement":5}],31:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _GameEngineDefineElement = require('../../GameEngine/defineElement');

var _GameEngineDefineElement2 = _interopRequireDefault(_GameEngineDefineElement);

var _util = require('../util');

var SlidingBlock = (0, _GameEngineDefineElement2['default'])({
  name: 'SlidingBlock',
  init: function init(_ref, game) {
    var state = _ref.state;
    var config = _ref.config;
    var x = config.x;
    var y = config.y;

    state.fillStyle = (0, _util.randomColour)({ b: 255, r: 10, a: 0.4 });
    state.positionX = x || Math.random() * game.config.width * 0.5 - 200;
    state.positionY = y || game.config.height * 0.7 + Math.random() * game.config.height * 0.2;
    state.direction = 1;
  },
  update: function update(_ref2, delta) {
    var state = _ref2.state;
    var positionX = state.positionX;
    var direction = state.direction;

    state.positionX += 0.02 * delta * direction;
  },
  render: function render(state, context) {
    context.fillStyle = state.fillStyle;
    context.fillRect(state.positionX, state.positionY, 55, 50);
  },
  subscribe: {
    targetSelection: function targetSelection(data, element, game) {
      var fireX = data.x;
      var fireY = data.y;
      var _element$state = element.state;
      var positionX = _element$state.positionX;
      var positionY = _element$state.positionY;

      var insideXbounds = fireX > positionX && fireX < positionX + 55;
      var insideYbounds = fireY > positionY && fireY < positionY + 50;
      if (insideXbounds && insideYbounds) {
        game.publications.publish('slidingBlockSelected', {
          elementId: element.id
        });
      }
    },
    slidingBlockSelected: function slidingBlockSelected(data, element, game) {
      if (data.elementId !== element.id) {
        return;
      }
      var state = element.state;

      state.direction = state.direction * -1;
    }
  }
});

exports['default'] = SlidingBlock;
module.exports = exports['default'];

},{"../../GameEngine/defineElement":5,"../util":35}],32:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _GameEngineGameObject = require('../GameEngine/GameObject');

var _GameEngineGameObject2 = _interopRequireDefault(_GameEngineGameObject);

var _BrowserUI = require('../BrowserUI');

var _BrowserUI2 = _interopRequireDefault(_BrowserUI);

var _init = require('./init');

var _init2 = _interopRequireDefault(_init);

var _subscriptions = require('./subscriptions');

var game = (0, _GameEngineGameObject2['default'])('Sandbox', {
  config: {
    width: _BrowserUI2['default'].width,
    height: _BrowserUI2['default'].height
  },
  init: _init2['default'],
  renderContext: _BrowserUI2['default'].renderContext,
  subscribe: _subscriptions.subscribe,
  unsubscribe: _subscriptions.unsubscribe
});

exports['default'] = game;
module.exports = exports['default'];

},{"../BrowserUI":1,"../GameEngine/GameObject":3,"./init":33,"./subscriptions":34}],33:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _elementsScene = require('./elements/Scene');

var _elementsScene2 = _interopRequireDefault(_elementsScene);

var _elementsFallingBlock = require('./elements/FallingBlock');

var _elementsFallingBlock2 = _interopRequireDefault(_elementsFallingBlock);

var _elementsSlidingBlock = require('./elements/SlidingBlock');

var _elementsSlidingBlock2 = _interopRequireDefault(_elementsSlidingBlock);

var _elementsScopeTarget = require('./elements/ScopeTarget');

var _elementsScopeTarget2 = _interopRequireDefault(_elementsScopeTarget);

var _elementsMainCharacter = require('./elements/MainCharacter');

var _elementsMainCharacter2 = _interopRequireDefault(_elementsMainCharacter);

var initialise = function initialise(game) {
  game.add(_elementsScene2['default']);

  for (var i = 0; i < 12; i++) {
    game.add(_elementsFallingBlock2['default']);
  }

  for (var i = 0; i < 6; i++) {
    game.add(_elementsSlidingBlock2['default']);
  }
  game.add((0, _elementsSlidingBlock2['default'])({ x: 180, y: 300 }));

  game.add(_elementsMainCharacter2['default']);

  game.add(_elementsScopeTarget2['default']);
};

exports['default'] = initialise;
module.exports = exports['default'];

},{"./elements/FallingBlock":27,"./elements/MainCharacter":28,"./elements/Scene":29,"./elements/ScopeTarget":30,"./elements/SlidingBlock":31}],34:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _BrowserUI = require('../BrowserUI');

var _BrowserUI2 = _interopRequireDefault(_BrowserUI);

var subscribe = function subscribe(game) {
  var browserSubs = _BrowserUI2['default'].publications.subscribe;
  var gamePublish = game.publications.publish;

  browserSubs('click', function (data) {
    gamePublish('targetSelection', data);
  }, game);

  browserSubs('mouseMove', function (data) {
    gamePublish('scopeTargetMove', data);
  }, game);

  browserSubs('mouseLeave', function () {
    gamePublish('scopeTargetExit');
  }, game);

  browserSubs('spacebarKey', function () {
    gamePublish('jump');
  }, game);
};

exports.subscribe = subscribe;
var unsubscribe = function unsubscribe(game) {
  var browserUnsubs = _BrowserUI2['default'].publications.unsubscribe;

  browserUnsubs('click', game);
  browserUnsubs('mouseMove', game);
  browserUnsubs('mouseLeave', game);
};
exports.unsubscribe = unsubscribe;

},{"../BrowserUI":1}],35:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var randomColour = function randomColour(_ref) {
  var _ref$r = _ref.r;
  var r = _ref$r === undefined ? Math.random() * 255 | 0 : _ref$r;
  var _ref$g = _ref.g;
  var g = _ref$g === undefined ? Math.random() * 255 | 0 : _ref$g;
  var _ref$b = _ref.b;
  var b = _ref$b === undefined ? Math.random() * 255 | 0 : _ref$b;
  var _ref$a = _ref.a;
  var a = _ref$a === undefined ? '0.6' : _ref$a;

  return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
};
exports.randomColour = randomColour;

},{}]},{},[26])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvanVzdGluLmFuZGVyc29uL2Rldi9qdXN0aW4vcGxhdXNpYmxlLWdhbWUtZW5naW5lL3BsYXkvQnJvd3NlclVJLmpzIiwiL1VzZXJzL2p1c3Rpbi5hbmRlcnNvbi9kZXYvanVzdGluL3BsYXVzaWJsZS1nYW1lLWVuZ2luZS9wbGF5L0dhbWVFbmdpbmUvR2FtZUxvb3AuanMiLCIvVXNlcnMvanVzdGluLmFuZGVyc29uL2Rldi9qdXN0aW4vcGxhdXNpYmxlLWdhbWUtZW5naW5lL3BsYXkvR2FtZUVuZ2luZS9HYW1lT2JqZWN0LmpzIiwiL1VzZXJzL2p1c3Rpbi5hbmRlcnNvbi9kZXYvanVzdGluL3BsYXVzaWJsZS1nYW1lLWVuZ2luZS9wbGF5L0dhbWVFbmdpbmUvUHVibGljYXRpb25zLmpzIiwiL1VzZXJzL2p1c3Rpbi5hbmRlcnNvbi9kZXYvanVzdGluL3BsYXVzaWJsZS1nYW1lLWVuZ2luZS9wbGF5L0dhbWVFbmdpbmUvZGVmaW5lRWxlbWVudC5qcyIsIi9Vc2Vycy9qdXN0aW4uYW5kZXJzb24vZGV2L2p1c3Rpbi9wbGF1c2libGUtZ2FtZS1lbmdpbmUvcGxheS9NaXNzaWxlQ29tbWFuZC9lbGVtZW50cy9CdWlsZGluZ3MuanMiLCIvVXNlcnMvanVzdGluLmFuZGVyc29uL2Rldi9qdXN0aW4vcGxhdXNpYmxlLWdhbWUtZW5naW5lL3BsYXkvTWlzc2lsZUNvbW1hbmQvZWxlbWVudHMvQ2l0aXplblNjb3JlLmpzIiwiL1VzZXJzL2p1c3Rpbi5hbmRlcnNvbi9kZXYvanVzdGluL3BsYXVzaWJsZS1nYW1lLWVuZ2luZS9wbGF5L01pc3NpbGVDb21tYW5kL2VsZW1lbnRzL0RlZmVuc2VCYXNlLmpzIiwiL1VzZXJzL2p1c3Rpbi5hbmRlcnNvbi9kZXYvanVzdGluL3BsYXVzaWJsZS1nYW1lLWVuZ2luZS9wbGF5L01pc3NpbGVDb21tYW5kL2VsZW1lbnRzL0RlZmVuc2VFeHBsb3Npb24uanMiLCIvVXNlcnMvanVzdGluLmFuZGVyc29uL2Rldi9qdXN0aW4vcGxhdXNpYmxlLWdhbWUtZW5naW5lL3BsYXkvTWlzc2lsZUNvbW1hbmQvZWxlbWVudHMvRGVmZW5zZU1pc3NpbGUuanMiLCIvVXNlcnMvanVzdGluLmFuZGVyc29uL2Rldi9qdXN0aW4vcGxhdXNpYmxlLWdhbWUtZW5naW5lL3BsYXkvTWlzc2lsZUNvbW1hbmQvZWxlbWVudHMvRGVmZW5zZVdlYXBvbnMuanMiLCIvVXNlcnMvanVzdGluLmFuZGVyc29uL2Rldi9qdXN0aW4vcGxhdXNpYmxlLWdhbWUtZW5naW5lL3BsYXkvTWlzc2lsZUNvbW1hbmQvZWxlbWVudHMvR2FtZU92ZXIuanMiLCIvVXNlcnMvanVzdGluLmFuZGVyc29uL2Rldi9qdXN0aW4vcGxhdXNpYmxlLWdhbWUtZW5naW5lL3BsYXkvTWlzc2lsZUNvbW1hbmQvZWxlbWVudHMvR2FtZVN0YXR1cy5qcyIsIi9Vc2Vycy9qdXN0aW4uYW5kZXJzb24vZGV2L2p1c3Rpbi9wbGF1c2libGUtZ2FtZS1lbmdpbmUvcGxheS9NaXNzaWxlQ29tbWFuZC9lbGVtZW50cy9Hcm91bmQuanMiLCIvVXNlcnMvanVzdGluLmFuZGVyc29uL2Rldi9qdXN0aW4vcGxhdXNpYmxlLWdhbWUtZW5naW5lL3BsYXkvTWlzc2lsZUNvbW1hbmQvZWxlbWVudHMvSW5jb21pbmdNaXNzaWxlLmpzIiwiL1VzZXJzL2p1c3Rpbi5hbmRlcnNvbi9kZXYvanVzdGluL3BsYXVzaWJsZS1nYW1lLWVuZ2luZS9wbGF5L01pc3NpbGVDb21tYW5kL2VsZW1lbnRzL01pc3NpbGVzRGVzdHJveWVkU2NvcmUuanMiLCIvVXNlcnMvanVzdGluLmFuZGVyc29uL2Rldi9qdXN0aW4vcGxhdXNpYmxlLWdhbWUtZW5naW5lL3BsYXkvTWlzc2lsZUNvbW1hbmQvZWxlbWVudHMvU2NlbmUuanMiLCIvVXNlcnMvanVzdGluLmFuZGVyc29uL2Rldi9qdXN0aW4vcGxhdXNpYmxlLWdhbWUtZW5naW5lL3BsYXkvTWlzc2lsZUNvbW1hbmQvZWxlbWVudHMvU2NvcGVUYXJnZXQuanMiLCIvVXNlcnMvanVzdGluLmFuZGVyc29uL2Rldi9qdXN0aW4vcGxhdXNpYmxlLWdhbWUtZW5naW5lL3BsYXkvTWlzc2lsZUNvbW1hbmQvZWxlbWVudHMvU3RhcnMuanMiLCIvVXNlcnMvanVzdGluLmFuZGVyc29uL2Rldi9qdXN0aW4vcGxhdXNpYmxlLWdhbWUtZW5naW5lL3BsYXkvTWlzc2lsZUNvbW1hbmQvZ2FtZS5qcyIsIi9Vc2Vycy9qdXN0aW4uYW5kZXJzb24vZGV2L2p1c3Rpbi9wbGF1c2libGUtZ2FtZS1lbmdpbmUvcGxheS9NaXNzaWxlQ29tbWFuZC9pbml0LmpzIiwiL1VzZXJzL2p1c3Rpbi5hbmRlcnNvbi9kZXYvanVzdGluL3BsYXVzaWJsZS1nYW1lLWVuZ2luZS9wbGF5L01pc3NpbGVDb21tYW5kL3N1YnNjcmlwdGlvbnMuanMiLCIvVXNlcnMvanVzdGluLmFuZGVyc29uL2Rldi9qdXN0aW4vcGxhdXNpYmxlLWdhbWUtZW5naW5lL3BsYXkvTWlzc2lsZUNvbW1hbmQvdXRpbC5qcyIsIi9Vc2Vycy9qdXN0aW4uYW5kZXJzb24vZGV2L2p1c3Rpbi9wbGF1c2libGUtZ2FtZS1lbmdpbmUvcGxheS9TZXJwZW50QXR0YWNrL2dhbWUuanMiLCIvVXNlcnMvanVzdGluLmFuZGVyc29uL2Rldi9qdXN0aW4vcGxhdXNpYmxlLWdhbWUtZW5naW5lL3BsYXkvU25ha2UvZ2FtZS5qcyIsIi9Vc2Vycy9qdXN0aW4uYW5kZXJzb24vZGV2L2p1c3Rpbi9wbGF1c2libGUtZ2FtZS1lbmdpbmUvcGxheS9wbGF5LmpzIiwiL1VzZXJzL2p1c3Rpbi5hbmRlcnNvbi9kZXYvanVzdGluL3BsYXVzaWJsZS1nYW1lLWVuZ2luZS9wbGF5L3NhbmRCb3gvZWxlbWVudHMvRmFsbGluZ0Jsb2NrLmpzIiwiL1VzZXJzL2p1c3Rpbi5hbmRlcnNvbi9kZXYvanVzdGluL3BsYXVzaWJsZS1nYW1lLWVuZ2luZS9wbGF5L3NhbmRCb3gvZWxlbWVudHMvTWFpbkNoYXJhY3Rlci5qcyIsIi9Vc2Vycy9qdXN0aW4uYW5kZXJzb24vZGV2L2p1c3Rpbi9wbGF1c2libGUtZ2FtZS1lbmdpbmUvcGxheS9zYW5kQm94L2VsZW1lbnRzL1NjZW5lLmpzIiwiL1VzZXJzL2p1c3Rpbi5hbmRlcnNvbi9kZXYvanVzdGluL3BsYXVzaWJsZS1nYW1lLWVuZ2luZS9wbGF5L3NhbmRCb3gvZWxlbWVudHMvU2NvcGVUYXJnZXQuanMiLCIvVXNlcnMvanVzdGluLmFuZGVyc29uL2Rldi9qdXN0aW4vcGxhdXNpYmxlLWdhbWUtZW5naW5lL3BsYXkvc2FuZEJveC9lbGVtZW50cy9TbGlkaW5nQmxvY2suanMiLCIvVXNlcnMvanVzdGluLmFuZGVyc29uL2Rldi9qdXN0aW4vcGxhdXNpYmxlLWdhbWUtZW5naW5lL3BsYXkvc2FuZEJveC9nYW1lLmpzIiwiL1VzZXJzL2p1c3Rpbi5hbmRlcnNvbi9kZXYvanVzdGluL3BsYXVzaWJsZS1nYW1lLWVuZ2luZS9wbGF5L3NhbmRCb3gvaW5pdC5qcyIsIi9Vc2Vycy9qdXN0aW4uYW5kZXJzb24vZGV2L2p1c3Rpbi9wbGF1c2libGUtZ2FtZS1lbmdpbmUvcGxheS9zYW5kQm94L3N1YnNjcmlwdGlvbnMuanMiLCIvVXNlcnMvanVzdGluLmFuZGVyc29uL2Rldi9qdXN0aW4vcGxhdXNpYmxlLWdhbWUtZW5naW5lL3BsYXkvc2FuZEJveC91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7c0NDQXlCLDJCQUEyQjs7OztBQUVwRCxJQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxDQUFDOztBQUVyRCxJQUFNLFNBQVMsR0FBRztBQUNoQixlQUFhLEVBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUM7QUFDdEMsUUFBTSxFQUFFLE1BQU0sQ0FBQyxNQUFNO0FBQ3JCLE9BQUssRUFBRSxNQUFNLENBQUMsS0FBSztDQUNwQixDQUFDOztBQUVGLFNBQVMsQ0FB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QUZDLENBQUM7TUFBRCxDQUFDLDBCQUFJLEFBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEdBQUcsR0FBSSxDQUFDO2VBSEgsSUFLNUIsQ0FEQyxDQUFDO01BQUQsQ0FBQywwQkFBRyxLQUFLOztBQUVULG1CQUFlLENBQUMsU0FBSSxDQUFDLFNBQUksQ0FBQyxTQUFJLENBQUMsT0FBSTtDQUNwQyxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBQdWJsaWNhdGlvbnMgZnJvbSAnLi9HYW1lRW5naW5lL1B1YmxpY2F0aW9ucyc7XG5cbmNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYW1lY2FudmFzJyk7XG5cbmNvbnN0IGJyb3dzZXJVSSA9IHtcbiAgcmVuZGVyQ29udGV4dDogY2FudmFzLmdldENvbnRleHQoJzJkJyksXG4gIGhlaWdodDogY2FudmFzLmhlaWdodCxcbiAgd2lkdGg6IGNhbnZhcy53aWR0aCxcbn07XG5cbmJyb3dzZXJVSS5wdWJsaWNhdGlvbnMgPSBQdWJsaWNhdGlvbnMoYnJvd3NlclVJKTtcbmNvbnN0IHB1Ymxpc2ggPSBicm93c2VyVUkucHVibGljYXRpb25zLnB1Ymxpc2g7XG5cbmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldnQpID0+IHtcbiAgcHVibGlzaCgnY2xpY2snLCB7XG4gICAgeDogZXZ0Lm9mZnNldFgsXG4gICAgeTogZXZ0Lm9mZnNldFksXG4gIH0pO1xufSk7XG5cbmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCAoZXZ0KSA9PiB7XG4gIHB1Ymxpc2goJ21vdXNlTW92ZScsIHtcbiAgICB4OiBldnQub2Zmc2V0WCxcbiAgICB5OiBldnQub2Zmc2V0WSxcbiAgfSk7XG59KTtcblxuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCAoZXZ0KSA9PiB7XG4gIHB1Ymxpc2goJ21vdXNlTGVhdmUnKTtcbn0pO1xuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlwcmVzcycsIChldnQpID0+IHtcbiAgaWYgKGV2dC53aGljaCA9PT0gMzIpIHtcbiAgICBwdWJsaXNoKCdzcGFjZWJhcktleScpO1xuICB9XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgYnJvd3NlclVJO1xuIiwibGV0IGdhbWVMb29wRGVsdGEgPSAwO1xubGV0IGxhc3RGcmFtZVRpbWVNcyA9IDA7XG5cbmNvbnN0IHVwZGF0ZSA9IChnYW1lT2JqLCBkZWx0YSkgPT4ge1xuICBnYW1lT2JqLnVwZGF0aW5nRWxlbWVudHMuZm9yRWFjaCgoZWxlbWVudCkgPT4ge1xuICAgIGVsZW1lbnQudXBkYXRlKGVsZW1lbnQsIGRlbHRhLCBnYW1lT2JqKTtcbiAgfSk7XG59O1xuXG5jb25zdCByZW5kZXIgPSAoZ2FtZU9iaikgPT4ge1xuICBnYW1lT2JqLnJlbmRlcmluZ0VsZW1lbnRzLmZvckVhY2goKGVsZW1lbnQpID0+IHtcbiAgICBlbGVtZW50LnJlbmRlcihlbGVtZW50LnN0YXRlLCBnYW1lT2JqLnJlbmRlckNvbnRleHQpO1xuICB9KTtcbn07XG5cbmNvbnN0IGdhbWVMb29wID0gKHRpbWVzdGFtcCwgZ2FtZSkgPT4ge1xuXG4gIGlmICghZ2FtZS5ydW5uaW5nKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCh0aW1lc3RhbXBJbm5lcikgPT4ge1xuICAgICAgZ2FtZUxvb3AodGltZXN0YW1wSW5uZXIsIGdhbWUpO1xuICB9KTtcblxuICBnYW1lTG9vcERlbHRhID0gdGltZXN0YW1wIC0gbGFzdEZyYW1lVGltZU1zO1xuICBsYXN0RnJhbWVUaW1lTXMgPSB0aW1lc3RhbXA7XG5cbiAgdXBkYXRlKGdhbWUsIGdhbWVMb29wRGVsdGEpO1xuICByZW5kZXIoZ2FtZSk7XG5cbn07XG5cbmV4cG9ydCBjb25zdCBzdGFydEdhbWUgPSAoZ2FtZSkgPT4ge1xuXG4gIGlmIChnYW1lLmluaXRpYWxpc2VkICE9PSB0cnVlKSB7XG4gICAgaWYgKHR5cGVvZiBnYW1lLmluaXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGdhbWUuaW5pdChnYW1lKTtcbiAgICB9XG4gICAgZ2FtZS5pbml0aWFsaXNlZCA9IHRydWU7XG4gIH1cblxuICBnYW1lLnJ1bm5pbmcgPSB0cnVlO1xuXG4gIGlmIChnYW1lLnN1YnNjcmliZSkge1xuICAgIGdhbWUuc3Vic2NyaWJlKGdhbWUpO1xuICB9XG5cbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCh0aW1lc3RhbXApID0+IHtcbiAgICAgIGxhc3RGcmFtZVRpbWVNcyA9IHRpbWVzdGFtcDtcbiAgICAgIGdhbWVMb29wKHRpbWVzdGFtcCwgZ2FtZSk7XG4gIH0pO1xufVxuXG5leHBvcnQgY29uc3Qgc3RvcEdhbWUgPSAoZ2FtZSkgPT4ge1xuICBnYW1lLnJ1bm5pbmcgPSBmYWxzZTtcbiAgaWYgKGdhbWUudW5zdWJzY3JpYmUpIHtcbiAgICAgIGdhbWUudW5zdWJzY3JpYmUoZ2FtZSk7XG4gIH1cbn1cbiIsImltcG9ydCBQdWJsaWNhdGlvbnMgZnJvbSAnLi9QdWJsaWNhdGlvbnMnO1xuXG5jb25zdCBhZGRHYW1lRWxlbWVudHMgPSAoZ2FtZSwgZWxlbWVudFRvQWRkKSA9PiB7XG4gIGNvbnN0IHtcbiAgICBlbGVtZW50cyxcbiAgICB1cGRhdGluZ0VsZW1lbnRzLFxuICAgIHJlbmRlcmluZ0VsZW1lbnRzLFxuICAgIHB1YmxpY2F0aW9uc1xuICB9ID0gZ2FtZTtcblxuICBlbGVtZW50VG9BZGQuZm9yRWFjaCgoZWxlbWVudCkgPT4ge1xuXG4gICAgLy8gQ3JlYXRlIGVsZW1lbnQgb2JqZWN0IGlmIGp1c3QgdGhlIGVsZW1lbnQgZmFjdG9yeSBmdW5jdGlvblxuICAgIGlmICh0eXBlb2YgZWxlbWVudCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgZWxlbWVudCA9IGVsZW1lbnQoKTtcbiAgICB9XG5cbiAgICAvLyBJbml0aWFsaXNlIGVsZW1lbnRcbiAgICBjb25zdCBpbml0ID0gZWxlbWVudC5pbml0O1xuICAgIGlmICh0eXBlb2YgaW5pdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgaW5pdChlbGVtZW50LCBnYW1lKTtcbiAgICB9XG5cbiAgICAvLyBBZGQgdG8gZWxlbWVudCBjb2xsZWN0aW9uXG4gICAgY29uc3QgZWxlbWVudE5hbWUgPSBlbGVtZW50Lm5hbWU7XG4gICAgaWYgKCFlbGVtZW50c1tlbGVtZW50TmFtZV0pIHtcbiAgICAgIGVsZW1lbnRzW2VsZW1lbnROYW1lXSA9IFtdO1xuICAgIH1cbiAgICBlbGVtZW50c1tlbGVtZW50TmFtZV0ucHVzaChlbGVtZW50KTtcblxuICAgIC8vIC8vIEFzaWduIGdhbWUgbG9vcCBmdW5jdGlvbnNcbiAgICBpZiAodHlwZW9mIGVsZW1lbnQudXBkYXRlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB1cGRhdGluZ0VsZW1lbnRzLnB1c2goZWxlbWVudCk7XG4gICAgfVxuXG4gICAgaWYgICh0eXBlb2YgZWxlbWVudC5yZW5kZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJlbmRlcmluZ0VsZW1lbnRzLnB1c2goZWxlbWVudCk7XG4gICAgfVxuXG4gICAgLy8gQWRkIHN1YnNjcmlwdGlvbnNcbiAgICBjb25zdCBlbGVtZW50U3Vic2NyaWJlID0gZWxlbWVudC5zdWJzY3JpYmU7XG4gICAgaWYgKHR5cGVvZiBlbGVtZW50U3Vic2NyaWJlID09PSAnb2JqZWN0Jykge1xuICAgICAgT2JqZWN0LmtleXMoZWxlbWVudFN1YnNjcmliZSkuZm9yRWFjaCgoYWN0aW9uKSA9PiB7XG4gICAgICAgIGNvbnN0IGNhbGxiYWNrID0gZWxlbWVudFN1YnNjcmliZVthY3Rpb25dO1xuICAgICAgICBwdWJsaWNhdGlvbnMuc3Vic2NyaWJlKGFjdGlvbiwgY2FsbGJhY2ssIGVsZW1lbnQpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gIH0pO1xufTtcblxuY29uc3QgZmlsdGVyT3V0ID0gKGVsZW1lbnQsIGNvbGxlY3Rpb24pID0+IHtcbiAgcmV0dXJuIGNvbGxlY3Rpb24uZmlsdGVyKChlbCkgPT4ge1xuICAgIHJldHVybiBlbCAhPT0gZWxlbWVudDtcbiAgfSk7XG59O1xuXG5jb25zdCByZW1vdmVHYW1lRWxlbWVudHMgPSAoZ2FtZSwgZWxlbWVudHMpID0+IHtcbiAgZWxlbWVudHMuZm9yRWFjaCgoZWxlbWVudCkgPT4ge1xuXG4gICAgLy8gVW5zdWJzY3JpYmVcbiAgICBpZiAodHlwZW9mIGVsZW1lbnQuc3Vic2NyaWJlID09PSAnb2JqZWN0Jykge1xuICAgICAgT2JqZWN0LmtleXMoZWxlbWVudC5zdWJzY3JpYmUpLmZvckVhY2goKGFjdGlvbikgPT4ge1xuICAgICAgICBnYW1lLnB1YmxpY2F0aW9ucy51bnN1YnNjcmliZShhY3Rpb24sIGVsZW1lbnQpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIC8vIFJlbW92ZSBmcm9tIGNvbGxlY3Rpb25zXG4gICAgZ2FtZS51cGRhdGluZ0VsZW1lbnRzID0gZmlsdGVyT3V0KGVsZW1lbnQsIGdhbWUudXBkYXRpbmdFbGVtZW50cyk7XG4gICAgZ2FtZS5yZW5kZXJpbmdFbGVtZW50cyA9IGZpbHRlck91dChlbGVtZW50LCBnYW1lLnJlbmRlcmluZ0VsZW1lbnRzKTtcbiAgICBnYW1lLmVsZW1lbnRzW2VsZW1lbnQubmFtZV0gPSBmaWx0ZXJPdXQoZWxlbWVudCwgZ2FtZS5lbGVtZW50c1tlbGVtZW50Lm5hbWVdKTtcblxuICB9KTtcbn07XG5cbmNvbnN0IHJlc2V0R2FtZSA9IChnYW1lT2JqKSA9PiB7XG4gIGdhbWVPYmoucnVubmluZyA9IGZhbHNlO1xuXG4gIE9iamVjdC5rZXlzKGdhbWVPYmouZWxlbWVudHMpLmZvckVhY2goKGtleSkgPT4ge1xuICAgIGNvbnN0IGVsZW1lbnRzID0gZ2FtZU9iai5lbGVtZW50c1trZXldO1xuICAgIHJlbW92ZUdhbWVFbGVtZW50cyhnYW1lT2JqLCBlbGVtZW50cyk7XG4gIH0pO1xuXG4gIGdhbWVPYmouc3RhdGUgPSB7fTtcbiAgZ2FtZU9iai5pbml0KGdhbWVPYmopO1xuICBnYW1lT2JqLnJ1bm5pbmcgPSB0cnVlO1xufTtcblxuLy8gR2FtZSBjb25zdHJ1Y3RvciBmdW5jdGlvblxuY29uc3QgR2FtZU9iamVjdCA9IChuYW1lLCBjb25mKSA9PiB7XG4gIGNvbnN0IGdhbWVPYmogPSB7XG4gICAgYWRkKC4uLmVsZW1lbnRzKSB7XG4gICAgICBhZGRHYW1lRWxlbWVudHModGhpcywgZWxlbWVudHMpO1xuICAgIH0sXG4gICAgY29uZmlnOiBjb25mLmNvbmZpZyxcbiAgICBlbGVtZW50czoge30sXG4gICAgaW5pdDogY29uZi5pbml0LFxuICAgIGluaXRpYWxpc2VkOiBmYWxzZSxcbiAgICBuYW1lOiBuYW1lLFxuICAgIHJlbW92ZSguLi5lbGVtZW50cykge1xuICAgICAgcmVtb3ZlR2FtZUVsZW1lbnRzKHRoaXMsIGVsZW1lbnRzKTtcbiAgICB9LFxuICAgIHJlbmRlckNvbnRleHQ6IGNvbmYucmVuZGVyQ29udGV4dCxcbiAgICByZW5kZXJpbmdFbGVtZW50czogW10sXG4gICAgcmVzZXQoKSB7XG4gICAgICByZXNldEdhbWUodGhpcyk7XG4gICAgfSxcbiAgICBydW5uaW5nOiBmYWxzZSxcbiAgICBzdGF0ZToge30sXG4gICAgc3Vic2NyaWJlOiBjb25mLnN1YnNjcmliZSxcbiAgICB1cGRhdGluZ0VsZW1lbnRzIDogW10sXG4gICAgdW5zdWJzY3JpYmU6IGNvbmYudW5zdWJzY3JpYmUsXG4gIH07XG5cbiAgZ2FtZU9iai5wdWJsaWNhdGlvbnMgPSBQdWJsaWNhdGlvbnMoZ2FtZU9iaik7XG5cbiAgcmV0dXJuIGdhbWVPYmo7XG59XG5cbmV4cG9ydCBkZWZhdWx0IEdhbWVPYmplY3Q7XG4iLCJjb25zdCBQdWJsaWNhdGlvbnMgPSAocHVibGlzaGVyKSA9PiB7XG4gIGNvbnN0IHN1YnMgPSB7fTtcblxuICBjb25zdCBwdWJzID0ge1xuICAgIHB1Ymxpc2goYWN0aW9uLCBkYXRhKSB7XG4gICAgICBpZiAoIXN1YnMuaGFzT3duUHJvcGVydHkoYWN0aW9uKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBzdWJzW2FjdGlvbl0uZm9yRWFjaCgoe2NhbGxiYWNrLCBzdWJzY3JpYmVyfSkgPT4ge1xuICAgICAgICBjYWxsYmFjayhkYXRhLCBzdWJzY3JpYmVyLCBwdWJsaXNoZXIpO1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIHN1YnNjcmliZShhY3Rpb24sIGNhbGxiYWNrLCBzdWJzY3JpYmVyKSB7XG4gICAgICBpZiAoIXN1YnMuaGFzT3duUHJvcGVydHkoYWN0aW9uKSkge1xuICAgICAgICBzdWJzW2FjdGlvbl0gPSBbXTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHN1YiA9IHtcbiAgICAgICAgY2FsbGJhY2s6IGNhbGxiYWNrLFxuICAgICAgICBzdWJzY3JpYmVyOiBzdWJzY3JpYmVyXG4gICAgICB9O1xuICAgICAgc3Vic1thY3Rpb25dLnB1c2goc3ViKTtcbiAgICB9LFxuXG4gICAgdW5zdWJzY3JpYmUoYWN0aW9uLCBzdWJzY3JpYmVyKSB7XG4gICAgICBpZiAoIXN1YnMuaGFzT3duUHJvcGVydHkoYWN0aW9uKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBzdWJzW2FjdGlvbl0gPSBzdWJzW2FjdGlvbl0uZmlsdGVyKChzdWIpID0+IHtcbiAgICAgICAgcmV0dXJuIHN1Yi5zdWJzY3JpYmVyICE9PSBzdWJzY3JpYmVyO1xuICAgICAgfSk7XG4gICAgfSxcblxuICB9O1xuXG4gIHJldHVybiBwdWJzO1xuXG59XG5cbmV4cG9ydCBkZWZhdWx0IFB1YmxpY2F0aW9ucztcbiIsIi8vIEdhbWUgZWxlbWVudCBmYWN0b3J5IGZ1bmN0aW9uXG5jb25zdCBkZWZpbmVFbGVtZW50ID0gKG9wdGlvbnMpID0+IHtcblxuICBjb25zdCB7bmFtZSwgaW5pdCwgdXBkYXRlLCByZW5kZXIsIHN1YnNjcmliZX0gPSBvcHRpb25zO1xuICBsZXQgZWxlbWVudElkSW5kZXggPSAwO1xuXG4gIGNvbnN0IGZhY3RvcnkgPSAoY29uZmlnID0ge30pID0+IHtcbiAgICBjb25zdCBlbGVtZW50ID0ge307XG5cbiAgICBlbGVtZW50Lm5hbWUgPSBuYW1lO1xuXG4gICAgLy8gQXNzaWduIGlkXG4gICAgZWxlbWVudC5pZCA9IGAke2VsZW1lbnQubmFtZX1fJHtlbGVtZW50SWRJbmRleH1gO1xuICAgIGVsZW1lbnRJZEluZGV4Kys7XG5cbiAgICAvLyBJbml0aWFsaXNlIHN0YXRlXG4gICAgZWxlbWVudC5pbml0ID0gaW5pdDtcbiAgICBlbGVtZW50LmNvbmZpZyA9IGNvbmZpZztcbiAgICBlbGVtZW50LnN0YXRlID0ge307XG5cbiAgICAvLyBBc2lnbiBnYW1lIGxvb3AgZnVuY3Rpb25zXG4gICAgZWxlbWVudC51cGRhdGUgPSB1cGRhdGU7XG4gICAgZWxlbWVudC5yZW5kZXIgPSByZW5kZXI7XG5cbiAgICAvLyBBc3NpZ24gc3Vic2NyaXB0aW9uIHNldHRpbmdzXG4gICAgZWxlbWVudC5zdWJzY3JpYmUgPSBzdWJzY3JpYmU7XG5cbiAgICByZXR1cm4gZWxlbWVudDtcbiAgfVxuXG4gIHJldHVybiBmYWN0b3J5O1xufVxuXG5PYmplY3QuZnJlZXplKGRlZmluZUVsZW1lbnQpO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVFbGVtZW50O1xuIiwiaW1wb3J0IGRlZmluZUVsZW1lbnQgZnJvbSAnLi4vLi4vR2FtZUVuZ2luZS9kZWZpbmVFbGVtZW50JztcblxuY29uc3QgQnVpbGRpbmdzID0gZGVmaW5lRWxlbWVudCh7XG4gIG5hbWU6ICdCdWlsZGluZ3MnLFxuICBpbml0KHtzdGF0ZSwgY29uZmlnfSwgZ2FtZSkge1xuICAgIGNvbnN0IHsgd2lkdGg6IGdhbWVXaWR0aCwgaGVpZ2h0OiBnYW1lSGVpZ2h0IH0gPSBnYW1lLmNvbmZpZztcbiAgICBzdGF0ZS5idWlsZGluZ3MgPSBbXTtcblxuICAgIGZvciAobGV0IGl4ID0gMDsgaXggPCBnYW1lV2lkdGg7IGl4ICsrKSB7XG4gICAgICBpZiAoTWF0aC5yYW5kb20oKSA+IDAuOSkge1xuICAgICAgICBjb25zdCBidWlsZGluZ1ggPSBpeCAtIDE1O1xuICAgICAgICBjb25zdCBidWlsaW5kZ1dpZHRoID0gTWF0aC5tYXgoKE1hdGgucmFuZG9tKCkgKiAzMCkgfCAwLCAxMCk7XG4gICAgICAgIGNvbnN0IGJ1aWxkaW5nSGVpZ2h0ID0gTWF0aC5tYXgoKE1hdGgucmFuZG9tKCkgKiA0MCkgfCAwLCAxNSk7XG4gICAgICAgIHN0YXRlLmJ1aWxkaW5ncy5wdXNoKHtcbiAgICAgICAgICB4OiBidWlsZGluZ1gsXG4gICAgICAgICAgeTogZ2FtZUhlaWdodCAtIGJ1aWxkaW5nSGVpZ2h0IC0gNDAsXG4gICAgICAgICAgd2lkdGg6IGJ1aWxpbmRnV2lkdGgsXG4gICAgICAgICAgaGVpZ2h0OiBidWlsZGluZ0hlaWdodCxcbiAgICAgICAgICBkZXN0cm95ZWQ6IGZhbHNlLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHJlbmRlcihzdGF0ZSwgY29udGV4dCkge1xuICAgIGNvbnN0IHtidWlsZGluZ3N9ID0gc3RhdGU7XG4gICAgYnVpbGRpbmdzLmZvckVhY2goKGJ1aWxkaW5nKSA9PiB7XG4gICAgICBjb25zdCB7eCwgeSwgd2lkdGgsIGhlaWdodCwgZGVzdHJveWVkfSA9IGJ1aWxkaW5nO1xuICAgICAgICBpZiAoZGVzdHJveWVkKSB7XG4gICAgICAgICAgY29udGV4dC5maWxsU3R5bGUgPSAncmdiYSgxMjUsMTI1LDEyNSwwLjQpJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb250ZXh0LmZpbGxTdHlsZSA9ICdyZ2JhKDIwMCwzMCwyMDAsMC40KSc7XG4gICAgICAgIH1cbiAgICAgICAgY29udGV4dC5maWxsUmVjdCh4LCB5LCB3aWR0aCwgaGVpZ2h0KTtcbiAgICB9KTtcbiAgfSxcbiAgc3Vic2NyaWJlOiB7XG4gICAgbWlzc2lsZUdyb3VuZEltcGFjdChkYXRhLCBlbGVtZW50LCBnYW1lKSB7XG4gICAgICBjb25zdCB7c3RhdGV9ID0gZWxlbWVudDtcbiAgICAgIGNvbnN0IHtidWlsZGluZ3N9ID0gc3RhdGU7XG4gICAgICBjb25zdCB7cG9zaXRpb25YfSA9IGRhdGE7XG5cbiAgICAgIHN0YXRlLmJ1aWxkaW5ncyA9IGJ1aWxkaW5ncy5tYXAoKGJ1aWxkaW5nKSA9PiB7XG4gICAgICAgIGNvbnN0IHsgZGVzdHJveWVkLCB4LCB3aWR0aCB9ID0gYnVpbGRpbmc7XG4gICAgICAgIGlmIChkZXN0cm95ZWQpIHtcbiAgICAgICAgICByZXR1cm4gYnVpbGRpbmc7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaW5zaWRlTGVmdEJvdW5kID0gKHBvc2l0aW9uWCArIDMwKSA+PSB4O1xuICAgICAgICBjb25zdCBpbnNpZGVSaWdodEJvdW5kID0gcG9zaXRpb25YIDw9ICh4ICsgd2lkdGgpO1xuICAgICAgICBpZiAoaW5zaWRlTGVmdEJvdW5kICYmIGluc2lkZVJpZ2h0Qm91bmQpIHtcbiAgICAgICAgICBidWlsZGluZy5kZXN0cm95ZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBidWlsZGluZztcblxuICAgICAgfSk7XG4gICAgfSxcbiAgICBnYW1lT3ZlcihkYXRhLCBlbGVtZW50LCBnYW1lKSB7XG4gICAgICBjb25zdCB7c3RhdGV9ID0gZWxlbWVudDtcbiAgICAgIGNvbnN0IHtidWlsZGluZ3N9ID0gc3RhdGU7XG4gICAgICBzdGF0ZS5idWlsZGluZ3MgPSBidWlsZGluZ3MubWFwKChidWlsZGluZykgPT4ge1xuICAgICAgICBidWlsZGluZy5kZXN0cm95ZWQgPSB0cnVlO1xuICAgICAgICByZXR1cm4gYnVpbGRpbmc7XG4gICAgICB9KTtcbiAgICB9LFxuICB9LFxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IEJ1aWxkaW5ncztcbiIsImltcG9ydCBkZWZpbmVFbGVtZW50IGZyb20gJy4uLy4uL0dhbWVFbmdpbmUvZGVmaW5lRWxlbWVudCc7XG5cbmNvbnN0IENpdGl6ZW5TY29yZSA9IGRlZmluZUVsZW1lbnQoe1xuICBuYW1lOiAnQ2l0aXplblNjb3JlJyxcbiAgaW5pdCh7c3RhdGUsIGNvbmZpZ30sIGdhbWUpIHtcbiAgICBjb25zdCB7Y2l0aXplbnMgPSAxMjAwfSA9IGNvbmZpZztcbiAgICBzdGF0ZS5jaXRpemVucyA9IGNpdGl6ZW5zO1xuICAgIHN0YXRlLnggPSBnYW1lLmNvbmZpZy53aWR0aCAtIDEwO1xuICAgIHN0YXRlLnkgPSBnYW1lLmNvbmZpZy5oZWlnaHQgLSAxNTtcbiAgfSxcbiAgcmVuZGVyKHN0YXRlLCBjb250ZXh0KSB7XG4gICAgY29uc3Qge2NpdGl6ZW5zLCB4LCB5fSA9IHN0YXRlO1xuICAgIGNvbnRleHQuZm9udCA9ICcxOHB4IG1vbm9zcGFjZSc7XG4gICAgY29udGV4dC50ZXh0QWxpZ24gPSAncmlnaHQnO1xuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gJ3JnYmEoMjU1LDI1NSwyNTUsMC44KSc7XG4gICAgY29udGV4dC5maWxsVGV4dChgY2l0aXplbnMgJHtjaXRpemVuc31gLCB4LCB5KTtcbiAgfSxcbiAgc3Vic2NyaWJlOiB7XG4gICAgbWlzc2lsZUdyb3VuZEltcGFjdChkYXRhLCBlbGVtZW50LCBnYW1lKSB7XG4gICAgICBpZiAoZ2FtZS5zdGF0ZS5nYW1lT3Zlcikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCB7c3RhdGV9ID0gZWxlbWVudDtcbiAgICAgIGNvbnN0IHBvcHVsYXRpb25EYW1hZ2UgPSA1MCArICgoTWF0aC5yYW5kb20oKSAqIDUwKSB8IDApO1xuICAgICAgc3RhdGUuY2l0aXplbnMgPSBNYXRoLm1heChzdGF0ZS5jaXRpemVucyAtIHBvcHVsYXRpb25EYW1hZ2UsIDApO1xuICAgICAgaWYgKHN0YXRlLmNpdGl6ZW5zID09PSAwICYmICFnYW1lLnN0YXRlLmdhbWVPdmVyKSB7XG4gICAgICAgIGdhbWUucHVibGljYXRpb25zLnB1Ymxpc2goJ2NpdGl6ZW5zRGVzdHJveWVkJyk7XG4gICAgICB9XG4gICAgfSxcbiAgfSxcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBDaXRpemVuU2NvcmU7XG4iLCJpbXBvcnQgZGVmaW5lRWxlbWVudCBmcm9tICcuLi8uLi9HYW1lRW5naW5lL2RlZmluZUVsZW1lbnQnO1xuaW1wb3J0IHtyYW5kb21Db2xvdXJ9IGZyb20gJy4uL3V0aWwnO1xuXG5jb25zdCBEZWZlbnNlQmFzZSA9IGRlZmluZUVsZW1lbnQoe1xuICBuYW1lOiAnRGVmZW5zZUJhc2UnLFxuICBpbml0KHtzdGF0ZSwgY29uZmlnIH0sIGdhbWUpIHtcbiAgICBjb25zdCB7XG4gICAgICB4ID0gKE1hdGgucmFuZG9tKCkgKiBnYW1lLmNvbmZpZy53aWR0aCksXG4gICAgICB5ID0gKGdhbWUuY29uZmlnLmhlaWdodCAtIDUwKSxcbiAgICAgIHdpZHRoID0gMjAsXG4gICAgfSA9ICBjb25maWc7XG5cbiAgICBzdGF0ZS53aWR0aCA9IHdpZHRoO1xuICAgIHN0YXRlLnBvc2l0aW9uWCA9IHggLSAod2lkdGggLyAyKTtcbiAgICBzdGF0ZS5wb3NpdGlvblkgPSB5O1xuICB9LFxuICByZW5kZXIoc3RhdGUsIGNvbnRleHQpIHtcbiAgICBjb25zdCB7IHBvc2l0aW9uWCwgcG9zaXRpb25ZLCB3aWR0aCB9ID0gc3RhdGU7XG4gICAgY29udGV4dC5maWxsU3R5bGUgPSAncmdiKDEwMCwyMDAsMTAwKSc7XG4gICAgY29udGV4dC5maWxsUmVjdChwb3NpdGlvblgsIHBvc2l0aW9uWSwgMjAsIHdpZHRoKTtcbiAgfSxcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBEZWZlbnNlQmFzZTtcbiIsImltcG9ydCBkZWZpbmVFbGVtZW50IGZyb20gJy4uLy4uL0dhbWVFbmdpbmUvZGVmaW5lRWxlbWVudCc7XG5cbmNvbnN0IHBvaW50SW5zaWRlQ2lyY2xlID0gKHtcbiAgY2lyY2xlWCxcbiAgY2lyY2xlWSxcbiAgY2lyY2xlUmFkaXVzLFxuICBwb2ludFgsXG4gIHBvaW50WSxcbn0pID0+IHtcbiAgLy8gUG9pbnQgaXMgaW5zaWRlIGNpcmNsZSBpZiBkaXN0YW5jZSBzcXVhcmVkIGlzIGxlc3MgdGhhbiBvciBlcXVhbCB0byByIHNxdWFyZWRcbiAgLy8gcmV0dXJuIGReMiA8PSByXjJcbiAgY29uc3QgclNxdWFyZWQgPSBjaXJjbGVSYWRpdXMgKiBjaXJjbGVSYWRpdXM7XG4gIGNvbnN0IGRTcXVhcmVkID0gTWF0aC5wb3cocG9pbnRZIC0gY2lyY2xlWSwgMikgKyBNYXRoLnBvdyhwb2ludFggLSBjaXJjbGVYLCAyKTtcbiAgcmV0dXJuIGRTcXVhcmVkIDw9IHJTcXVhcmVkO1xufTtcblxuY29uc3QgZ2V0Q29ybmVyUG9pbnRzID0gKHtcbiAgcG9zaXRpb25YLFxuICBwb3NpdGlvblksXG4gIHdpZHRoXG59KSA9PiB7XG4gIHJldHVybiBbXG4gICAgeyB4OiBwb3NpdGlvblgsIHk6IHBvc2l0aW9uWSB9LFxuICAgIHsgeDogcG9zaXRpb25YICsgd2lkdGgsIHk6IHBvc2l0aW9uWSB9LFxuICAgIHsgeDogcG9zaXRpb25YLCB5OiBwb3NpdGlvblkgKyB3aWR0aCB9LFxuICAgIHsgeDogcG9zaXRpb25YICsgd2lkdGgsIHk6IHBvc2l0aW9uWSArIHdpZHRoIH1cbiAgXTtcbn07XG5cbmNvbnN0IERlZmVuc2VFeHBsb3Npb24gPSBkZWZpbmVFbGVtZW50KHtcbiAgbmFtZTogJ0RlZmVuc2VFeHBsb3Npb24nLFxuICBpbml0KHsgc3RhdGUsIGNvbmZpZyA9IHt9IH0sIGdhbWUpIHtcbiAgICBjb25zdCB7XG4gICAgICB4ID0gMCxcbiAgICAgIHkgPSAwLFxuICAgIH0gPSBjb25maWc7XG4gICAgc3RhdGUueCA9IHg7XG4gICAgc3RhdGUueSA9IHk7XG4gICAgc3RhdGUuc2l6ZSA9IDM7XG4gICAgc3RhdGUuYWxwaGEgPSAxO1xuICB9LFxuICB1cGRhdGUoZWxlbWVudCwgZGVsdGEsIGdhbWUpIHtcbiAgICBjb25zdCB7IHN0YXRlIH0gPSBlbGVtZW50O1xuICAgIGNvbnN0IHsgc2l6ZSwgYWxwaGEgfSA9IHN0YXRlO1xuXG4gICAgaWYgKHNpemUgPj0gMzUpIHtcbiAgICAgIGdhbWUucHVibGljYXRpb25zLnB1Ymxpc2goJ2V4cGxvc2lvbkNvbXBsZXRlJywge1xuICAgICAgICBlbGVtZW50SWQ6IGVsZW1lbnQuaWRcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHN0YXRlLnNpemUgPSBzaXplICsgKGRlbHRhICogMC4xKTtcblxuICAgIGlmIChhbHBoYSA+IDApIHtcbiAgICAgIHN0YXRlLmFscGhhID0gYWxwaGEgLSAoZGVsdGEgKiAwLjAwMik7XG4gICAgfVxuXG4gICAgY29uc3QgeyB4LCB5IH0gPSBzdGF0ZTtcblxuICAgIGdhbWUuZWxlbWVudHMuSW5jb21pbmdNaXNzaWxlLmZvckVhY2goKG1pc3NpbGUpID0+IHtcbiAgICAgIGlmIChtaXNzaWxlLnN0YXRlLmRlc3Ryb3llZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHsgcG9zaXRpb25YLCBwb3NpdGlvblkgfSA9IG1pc3NpbGUuc3RhdGU7XG4gICAgICBjb25zdCBjb3JuZXJQb2ludHMgPSBnZXRDb3JuZXJQb2ludHMoe1xuICAgICAgICBwb3NpdGlvblg6IHBvc2l0aW9uWCxcbiAgICAgICAgcG9zaXRpb25ZOiBwb3NpdGlvblksXG4gICAgICAgIHdpZHRoOiAzMFxuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IGluc2lkZUV4cGxvc2lvbiA9IGNvcm5lclBvaW50cy5zb21lKChwb2ludCkgPT4ge1xuICAgICAgICByZXR1cm4gcG9pbnRJbnNpZGVDaXJjbGUoe1xuICAgICAgICAgIGNpcmNsZVg6IHgsXG4gICAgICAgICAgY2lyY2xlWTogeSxcbiAgICAgICAgICBjaXJjbGVSYWRpdXM6IHNpemUsXG4gICAgICAgICAgcG9pbnRYOiBwb2ludC54LFxuICAgICAgICAgIHBvaW50WTogcG9pbnQueSxcbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgICAgaWYgKGluc2lkZUV4cGxvc2lvbikge1xuICAgICAgICBnYW1lLnB1YmxpY2F0aW9ucy5wdWJsaXNoKCdtaXNzaWxlRGVzdHJveWVkJywge1xuICAgICAgICAgIGVsZW1lbnRJZDogbWlzc2lsZS5pZFxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgIH0pO1xuXG4gIH0sXG4gIHJlbmRlcihzdGF0ZSwgY29udGV4dCkge1xuICAgIGNvbnN0IHsgeCwgeSwgc2l6ZSwgYWxwaGEgfSA9IHN0YXRlO1xuXG4gICAgY29udGV4dC5maWxsU3R5bGUgPSBgcmdiYSgyNTUsMjU1LDI1NSwke2FscGhhfSlgO1xuICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgY29udGV4dC5hcmMoeCwgeSwgc2l6ZSwgMCwgTWF0aC5QSSAqIDIsIHRydWUpO1xuICAgIGNvbnRleHQuY2xvc2VQYXRoKCk7XG4gICAgY29udGV4dC5maWxsKCk7XG5cbiAgfSxcbiAgc3Vic2NyaWJlOiB7XG4gICAgZXhwbG9zaW9uQ29tcGxldGUoZGF0YSwgZWxlbWVudCwgZ2FtZSkge1xuICAgICAgaWYgKGRhdGEuZWxlbWVudElkICE9PSBlbGVtZW50LmlkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGdhbWUucmVtb3ZlKGVsZW1lbnQpO1xuICAgIH0sXG4gIH0sXG59KTtcblxuZXhwb3J0IGRlZmF1bHQgRGVmZW5zZUV4cGxvc2lvbjtcbiIsImltcG9ydCBkZWZpbmVFbGVtZW50IGZyb20gJy4uLy4uL0dhbWVFbmdpbmUvZGVmaW5lRWxlbWVudCc7XG5pbXBvcnQge3JhbmRvbUNvbG91cn0gZnJvbSAnLi4vdXRpbCc7XG5cbmNvbnN0IERlZmVuc2VNaXNzaWxlID0gZGVmaW5lRWxlbWVudCh7XG4gIG5hbWU6ICdEZWZlbnNlTWlzc2lsZScsXG4gIGluaXQoeyBzdGF0ZSwgY29uZmlnID0ge30gfSwgZ2FtZSkge1xuICAgIGNvbnN0IHtcbiAgICAgIG9yaWdpblggPSAwLFxuICAgICAgb3JpZ2luWSA9IDAsXG4gICAgICB0YXJnZXRYID0gMTAsXG4gICAgICB0YXJnZXRZID0gMTAsXG4gICAgfSA9ICBjb25maWc7XG4gICAgc3RhdGUub3JpZ2luWCA9IG9yaWdpblg7XG4gICAgc3RhdGUub3JpZ2luWSA9IG9yaWdpblk7XG4gICAgc3RhdGUucG9zaXRpb25YID0gb3JpZ2luWDtcbiAgICBzdGF0ZS5wb3NpdGlvblkgPSBvcmlnaW5ZO1xuICAgIHN0YXRlLnRhcmdldFggPSB0YXJnZXRYO1xuICAgIHN0YXRlLnRhcmdldFkgPSB0YXJnZXRZO1xuICAgIHN0YXRlLmR4ID0gLSh0YXJnZXRYIC0gb3JpZ2luWCkgLyAodGFyZ2V0WSAtIG9yaWdpblkpO1xuICAgIHN0YXRlLmR5ID0gLTE7XG4gICAgc3RhdGUuZmlsbFN0eWxlID0gcmFuZG9tQ29sb3VyKHtiOjI1NSwgcjoxMCwgYTowLjR9KTtcbiAgfSxcbiAgdXBkYXRlKGVsZW1lbnQsIGRlbHRhLCBnYW1lKSB7XG4gICAgY29uc3Qge3N0YXRlLCBjb25maWd9ID0gZWxlbWVudDtcbiAgICBjb25zdCB7IHBvc2l0aW9uWCwgcG9zaXRpb25ZLCBkeCwgZHkgfSA9IHN0YXRlO1xuICAgIGNvbnN0IHsgdGFyZ2V0WCwgdGFyZ2V0WSB9ID0gY29uZmlnO1xuICAgIHN0YXRlLnBvc2l0aW9uWCArPSBkeDtcbiAgICBzdGF0ZS5wb3NpdGlvblkgKz0gZHk7XG5cbiAgICBjb25zdCBwYXN0VGFyZ2V0WCA9IChkeCA+IDApID8gKHBvc2l0aW9uWCA+PSB0YXJnZXRYKSA6IChwb3NpdGlvblggPCB0YXJnZXRYKTtcbiAgICBjb25zdCBwYXN0VGFyZ2V0WSA9IChwb3NpdGlvblkgPD0gdGFyZ2V0WSk7XG5cbiAgICBpZiAocGFzdFRhcmdldFggJiYgcGFzdFRhcmdldFkpIHtcbiAgICAgIGdhbWUucHVibGljYXRpb25zLnB1Ymxpc2goJ21pc3NpbGVBdFRhcmdldCcsIHtcbiAgICAgICAgZWxlbWVudElkOiBlbGVtZW50LmlkXG4gICAgICB9KTtcbiAgICB9XG5cbiAgfSxcbiAgcmVuZGVyKHN0YXRlLCBjb250ZXh0KSB7XG4gICAgY29uc3Qge1xuICAgICAgb3JpZ2luWCwgb3JpZ2luWSxcbiAgICAgIHBvc2l0aW9uWCwgcG9zaXRpb25ZLFxuICAgICAgdGFyZ2V0WCwgdGFyZ2V0WSxcbiAgICAgIGZpbGxTdHlsZSxcbiAgICB9ID0gc3RhdGU7XG5cbiAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gJ3JnYmEoMjU1LDI1NSwyNTUsMC44KSc7XG5cbiAgICAvLyBUYXJnZXQgb3V0ZXJcbiAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgIGNvbnRleHQuYXJjKHRhcmdldFgsIHRhcmdldFksIDEwLCAwLCBNYXRoLlBJICogMiwgdHJ1ZSk7XG4gICAgY29udGV4dC5zdHJva2UoKTtcbiAgICAvLyBUYXJnZXQgSW5uZXJcbiAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgIGNvbnRleHQuYXJjKHRhcmdldFgsIHRhcmdldFksIDMsIDAsIE1hdGguUEkgKiAyLCB0cnVlKTtcbiAgICBjb250ZXh0LnN0cm9rZSgpO1xuXG4gICAgLy8gTWlzc2lsZSBwYXRoXG4gICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICBjb250ZXh0Lm1vdmVUbyhvcmlnaW5YLCBvcmlnaW5ZKTtcbiAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gJ2Rhc2hlZCc7XG4gICAgY29udGV4dC5saW5lVG8ocG9zaXRpb25YLCBwb3NpdGlvblkpO1xuICAgIGNvbnRleHQuc3Ryb2tlKCk7XG5cbiAgICAvLyBNaXNzaWxlXG4gICAgY29udGV4dC5maWxsU3R5bGUgPSBmaWxsU3R5bGU7XG4gICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICBjb250ZXh0LmFyYyhwb3NpdGlvblgsIHBvc2l0aW9uWSwgNCwgMCwgTWF0aC5QSSAqIDIsIHRydWUpO1xuICAgIGNvbnRleHQuY2xvc2VQYXRoKCk7XG4gICAgY29udGV4dC5zdHJva2UoKTtcbiAgICBjb250ZXh0LmZpbGwoKTtcblxuICB9LFxuICBzdWJzY3JpYmU6IHtcbiAgICBtaXNzaWxlQXRUYXJnZXQoZGF0YSwgZWxlbWVudCwgZ2FtZSkge1xuICAgICAgaWYgKGRhdGEuZWxlbWVudElkICE9PSBlbGVtZW50LmlkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHsgdGFyZ2V0WCwgdGFyZ2V0WSB9ID0gZWxlbWVudC5jb25maWc7XG4gICAgICBjb25zdCB7IGZpbGxTdHlsZSB9ID0gZWxlbWVudC5zdGF0ZTtcbiAgICAgIGdhbWUucHVibGljYXRpb25zLnB1Ymxpc2goJ2NyZWF0ZUV4cGxvc2lvbicsIHtcbiAgICAgICAgeDogdGFyZ2V0WCxcbiAgICAgICAgeTogdGFyZ2V0WVxuICAgICAgfSk7XG4gICAgICBnYW1lLnJlbW92ZShlbGVtZW50KTtcbiAgICB9LFxuICB9XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgRGVmZW5zZU1pc3NpbGU7XG4iLCJpbXBvcnQgZGVmaW5lRWxlbWVudCBmcm9tICcuLi8uLi9HYW1lRW5naW5lL2RlZmluZUVsZW1lbnQnO1xuaW1wb3J0IERlZmVuc2VNaXNzaWxlIGZyb20gJy4vRGVmZW5zZU1pc3NpbGUnO1xuXG5jb25zdCBEZWZlbnNlV2VhcG9ucyA9IGRlZmluZUVsZW1lbnQoe1xuICBuYW1lOiAnRGVmZW5zZVdlYXBvbnMnLFxuICBpbml0KHtzdGF0ZSwgY29uZmlnID0ge319LCBnYW1lKSB7XG4gICAgY29uc3Qge1xuICAgICAgd2VhcG9ucyA9IGdhbWUuY29uZmlnLm1pc3NpbGVDb3VudFxuICAgIH0gPSBjb25maWc7XG5cbiAgICBjb25zdCB7aGVpZ2h0fSA9IGdhbWUuY29uZmlnO1xuICAgIHN0YXRlLndlYXBvbnMgPSB3ZWFwb25zO1xuICAgIHN0YXRlLnggPSAxMDtcbiAgICBzdGF0ZS55ID0gaGVpZ2h0IC0gMTU7XG4gIH0sXG4gIHJlbmRlcihzdGF0ZSwgY29udGV4dCkge1xuICAgIGNvbnN0IHt3ZWFwb25zLCB4LCB5fSA9IHN0YXRlO1xuICAgIGNvbnRleHQuZm9udCA9ICcxOHB4IG1vbm9zcGFjZSc7XG4gICAgY29udGV4dC50ZXh0QWxpZ24gPSAnbGVmdCc7XG4gICAgY29udGV4dC5maWxsU3R5bGUgPSAncmdiYSgyNTUsMjU1LDI1NSwwLjgpJztcbiAgICBjb250ZXh0LmZpbGxUZXh0KGBtaXNzaWxlcyAke3dlYXBvbnN9YCwgeCwgeSk7XG4gIH0sXG4gIHN1YnNjcmliZToge1xuICAgIGZpcmUoZGF0YSwgZWxlbWVudCwgZ2FtZSkge1xuICAgICAgY29uc3QgeyBzdGF0ZSB9ID0gIGVsZW1lbnQ7XG4gICAgICBjb25zdCB7IHdlYXBvbnMgfSA9IHN0YXRlO1xuXG4gICAgICBpZiAod2VhcG9ucyA9PT0gMCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBzdGF0ZS53ZWFwb25zID0gTWF0aC5tYXgoc3RhdGUud2VhcG9ucyAtIDEsIDApO1xuXG4gICAgICBjb25zdCB7IHgsIHkgfSA9IGRhdGE7XG5cbiAgICAgIGxldCBvcmlnaW5YID0gMDtcbiAgICAgIGxldCBvcmlnaW5ZID0gMDtcbiAgICAgIGlmIChnYW1lLmVsZW1lbnRzLlNjb3BlVGFyZ2V0XG4gICAgICAgICYmIGdhbWUuZWxlbWVudHMuU2NvcGVUYXJnZXQubGVuZ3RoID4gMFxuICAgICAgKSB7XG4gICAgICAgIGxldCBzY29wZVN0YXRlID0gZ2FtZS5lbGVtZW50cy5TY29wZVRhcmdldFswXS5zdGF0ZTtcbiAgICAgICAgb3JpZ2luWCA9IHNjb3BlU3RhdGUub3JpZ2luWDtcbiAgICAgICAgb3JpZ2luWSA9IHNjb3BlU3RhdGUub3JpZ2luWTtcbiAgICAgIH1cblxuICAgICAgZ2FtZS5hZGQoXG4gICAgICAgIERlZmVuc2VNaXNzaWxlKHtcbiAgICAgICAgICB0YXJnZXRYOiB4LFxuICAgICAgICAgIHRhcmdldFk6IHksXG4gICAgICAgICAgb3JpZ2luWDogb3JpZ2luWCxcbiAgICAgICAgICBvcmlnaW5ZOiBvcmlnaW5ZXG4gICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgfSxcbiAgfSxcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBEZWZlbnNlV2VhcG9ucztcbiIsImltcG9ydCBkZWZpbmVFbGVtZW50IGZyb20gJy4uLy4uL0dhbWVFbmdpbmUvZGVmaW5lRWxlbWVudCc7XG5cbmNvbnN0IEdhbWVPdmVyID0gZGVmaW5lRWxlbWVudCh7XG4gIG5hbWU6ICdHYW1lT3ZlcicsXG4gIGluaXQoe3N0YXRlLCBjb25maWd9LCBnYW1lKSB7XG4gICAgY29uc3Qge3dpZHRoLCBoZWlnaHR9ID0gZ2FtZS5jb25maWc7XG4gICAgc3RhdGUueCA9IHdpZHRoIC8gMjtcbiAgICBzdGF0ZS55ID0gaGVpZ2h0IC8gMlxuICAgIHN0YXRlLndpZHRoID0gd2lkdGg7XG4gICAgc3RhdGUuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgIGlmIChjb25maWcud2lubmVyKSB7XG4gICAgICAgIHN0YXRlLnN0YXR1c1RleHQgPSAnWW91IHN1cnZpdmVkISdcbiAgICB9IGVsc2Uge1xuICAgICAgc3RhdGUuc3RhdHVzVGV4dCA9ICdZb3UgbG9zdCdcbiAgICB9XG4gIH0sXG4gIHJlbmRlcihzdGF0ZSwgY29udGV4dCkge1xuICAgIGNvbnN0IHt4LCB5LCB3aWR0aCwgaGVpZ2h0LCBzdGF0dXNUZXh0fSA9IHN0YXRlO1xuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gJ3JnYmEoMCwwLDAsMC41KSc7XG4gICAgY29udGV4dC5maWxsUmVjdCgwLCAwLCB3aWR0aCwgaGVpZ2h0KTtcbiAgICBjb250ZXh0LmZvbnQgPSAnMzBweCBtb25vc3BhY2UnXG4gICAgY29udGV4dC50ZXh0QWxpZ24gPSAnY2VudGVyJztcbiAgICBjb250ZXh0LmZpbGxTdHlsZSA9ICdyZ2JhKDI1NSwyNTUsMjU1LDAuOCknO1xuICAgIGNvbnRleHQuZmlsbFRleHQoJ0dhbWUgT3ZlcicsIHgsIHkgLSAyMCk7O1xuICAgIGNvbnRleHQuZmlsbFRleHQoc3RhdHVzVGV4dCwgeCwgeSArIDIwKTs7XG4gICAgY29udGV4dC5mb250ID0gJzE0cHggbW9ub3NwYWNlJ1xuICAgIGNvbnRleHQuZmlsbFRleHQoJyhjbGljayB0byBwbGF5IGFnYWluKScsIHgsIHkgKyA1MCk7O1xuICB9LFxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IEdhbWVPdmVyO1xuIiwiaW1wb3J0IGRlZmluZUVsZW1lbnQgZnJvbSAnLi4vLi4vR2FtZUVuZ2luZS9kZWZpbmVFbGVtZW50JztcbmltcG9ydCBHYW1lT3ZlciBmcm9tICcuL0dhbWVPdmVyJztcbmltcG9ydCBEZWZlbnNlRXhwbG9zaW9uIGZyb20gJy4vRGVmZW5zZUV4cGxvc2lvbic7XG5cbmNvbnN0IEdhbWVTdGF0dXMgPSBkZWZpbmVFbGVtZW50KHtcbiAgbmFtZTogJ0dhbWVTdGF0dXMnLFxuICBpbml0KHtzdGF0ZSwgY29uZmlnfSwgZ2FtZSkge1xuICAgIGNvbnN0IHtyZXNvbHV0aW9ucyA9IDB9ID0gY29uZmlnO1xuICAgIHN0YXRlLnJlc29sdXRpb25zID0gcmVzb2x1dGlvbnM7XG4gIH0sXG4gIHN1YnNjcmliZToge1xuICAgIG1pc3NpbGVSZXNvbHZlZChkYXRhLCBlbGVtZW50LCBnYW1lKSB7XG4gICAgICBjb25zdCB7c3RhdGV9ID0gZWxlbWVudDtcbiAgICAgIHN0YXRlLnJlc29sdXRpb25zID0gc3RhdGUucmVzb2x1dGlvbnMgKyAxO1xuICAgICAgaWYgKCFnYW1lLnN0YXRlLmdhbWVPdmVyICYmIChzdGF0ZS5yZXNvbHV0aW9ucyA9PT0gZ2FtZS5jb25maWcubWlzc2lsZUNvdW50KSApIHtcbiAgICAgICAgZ2FtZS5wdWJsaWNhdGlvbnMucHVibGlzaCgnZ2FtZU92ZXInLCB7IHdpbm5lcjogdHJ1ZX0pO1xuICAgICAgfVxuICAgIH0sXG4gICAgY2l0aXplbnNEZXN0cm95ZWQoZGF0YSwgZWxlbWVudCwgZ2FtZSkge1xuICAgICAgZ2FtZS5wdWJsaWNhdGlvbnMucHVibGlzaCgnZ2FtZU92ZXInLCB7IHdpbm5lcjogZmFsc2V9KTtcbiAgICB9LFxuICAgIGdhbWVPdmVyKGRhdGEsIGVsZW1lbnQsIGdhbWUpIHtcbiAgICAgIGdhbWUuc3RhdGUuZ2FtZU92ZXIgPSB0cnVlO1xuICAgICAgZ2FtZS5hZGQoIEdhbWVPdmVyKHt3aW5uZXI6IGRhdGEud2lubmVyfSkgKTtcbiAgICB9LFxuICAgIHJlc2V0KGRhdGEsIGVsZW1lbnQsIGdhbWUpIHtcbiAgICAgIGdhbWUucmVzZXQoKTtcbiAgICB9LFxuICAgIGNyZWF0ZUV4cGxvc2lvbihkYXRhLCBlbGVtZW50LCBnYW1lKSB7XG4gICAgICBjb25zdCB7IHgsIHksIHN0cm9rZSB9ID0gZGF0YTtcbiAgICAgIGdhbWUuYWRkKFxuICAgICAgICBEZWZlbnNlRXhwbG9zaW9uKHtcbiAgICAgICAgICB4OiB4LFxuICAgICAgICAgIHk6IHlcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgfVxuICB9LFxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IEdhbWVTdGF0dXM7XG4iLCJpbXBvcnQgZGVmaW5lRWxlbWVudCBmcm9tICcuLi8uLi9HYW1lRW5naW5lL2RlZmluZUVsZW1lbnQnO1xuXG5jb25zdCBHcm91bmQgPSBkZWZpbmVFbGVtZW50KHtcbiAgbmFtZTogJ0dyb3VuZCcsXG4gIGluaXQoe3N0YXRlLCBjb25maWd9LCBnYW1lKSB7XG4gICAgc3RhdGUueCA9IDA7XG4gICAgc3RhdGUueSA9IChnYW1lLmNvbmZpZy5oZWlnaHQgLSA0MCksXG4gICAgc3RhdGUud2lkdGggPSBnYW1lLmNvbmZpZy53aWR0aDtcbiAgICBzdGF0ZS5oZWlnaHQgPSA0MDtcbiAgICBzdGF0ZS5kYW1hZ2VMZXZlbCA9IDA7XG4gICAgc3RhdGUuZmlsbFN0eWxlID0gJ3JnYmEoMTAwLDIwMCwxMDAsMC42KSc7XG4gICAgc3RhdGUuZmlsbFN0eWxlMiA9ICdyZ2JhKDEwMCwyMDAsMTAwLDEpJztcbiAgfSxcbiAgcmVuZGVyKHN0YXRlLCBjb250ZXh0KSB7XG4gICAgY29uc3QgeyBmaWxsU3R5bGUsIGZpbGxTdHlsZTIsIHgsIHksIHdpZHRoLCBoZWlnaHQgfSA9IHN0YXRlO1xuXG4gICAgY29uc3QgZ3JhZGllbnQgPSBjb250ZXh0LmNyZWF0ZUxpbmVhckdyYWRpZW50KHgsIHksIHgsIHkgKyBoZWlnaHQpO1xuICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCgwLCBmaWxsU3R5bGUpO1xuICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCgwLjc1LCBmaWxsU3R5bGUyKTtcblxuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gZ3JhZGllbnQ7XG4gICAgY29udGV4dC5maWxsUmVjdCh4LCB5LCB3aWR0aCwgaGVpZ2h0KTtcbiAgfSxcbiAgc3Vic2NyaWJlOiB7XG4gICAgbWlzc2lsZUdyb3VuZEltcGFjdChkYXRhLCBlbGVtZW50LCBnYW1lKSB7XG4gICAgICBpZiAoZ2FtZS5zdGF0ZS5nYW1lT3Zlcikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCB7c3RhdGV9ID0gZWxlbWVudDtcbiAgICAgIHN0YXRlLmRhbWFnZUxldmVsID0gc3RhdGUuZGFtYWdlTGV2ZWwgKyAzMDtcbiAgICAgIGNvbnN0IHJlZEZpbGwgPSBNYXRoLm1pbigxMDAgKyBzdGF0ZS5kYW1hZ2VMZXZlbCwgMjU1KTtcbiAgICAgIHN0YXRlLmZpbGxTdHlsZSA9IGByZ2JhKCR7cmVkRmlsbH0sMjAwLDEwMCwwLjYpYDtcbiAgICB9LFxuICB9LFxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IEdyb3VuZDtcbiIsImltcG9ydCBkZWZpbmVFbGVtZW50IGZyb20gJy4uLy4uL0dhbWVFbmdpbmUvZGVmaW5lRWxlbWVudCc7XG5pbXBvcnQge3JhbmRvbUNvbG91cn0gZnJvbSAnLi4vdXRpbCc7XG5cbmNvbnN0IEluY29taW5nTWlzc2lsZSA9IGRlZmluZUVsZW1lbnQoe1xuICBuYW1lOiAnSW5jb21pbmdNaXNzaWxlJyxcbiAgaW5pdCh7c3RhdGUsIGNvbmZpZ30sIGdhbWUpIHtcbiAgICBzdGF0ZS5kZXN0cm95ZWQgPSBmYWxzZTtcbiAgICBzdGF0ZS5pbXBhY3RlZCA9IGZhbHNlO1xuICAgIHN0YXRlLmZpbGxTdHlsZSA9IHJhbmRvbUNvbG91cih7cjoyNTUsIGI6MTB9KTtcbiAgICBzdGF0ZS5wb3NpdGlvblggPSBNYXRoLnJhbmRvbSgpICogZ2FtZS5jb25maWcud2lkdGggLSAyMDtcbiAgICBzdGF0ZS5wb3NpdGlvblkgPSBNYXRoLnJhbmRvbSgpICogZ2FtZS5jb25maWcuaGVpZ2h0ICogMC41IC0gZ2FtZS5jb25maWcuaGVpZ2h0ICogMC41O1xuICAgIHN0YXRlLmdyb3VuZFkgPSBnYW1lLmVsZW1lbnRzLkdyb3VuZFswXS5zdGF0ZS55O1xuICB9LFxuICB1cGRhdGUoZWxlbWVudCwgZGVsdGEsIGdhbWUpIHtcbiAgICBjb25zdCB7c3RhdGV9ID0gZWxlbWVudDtcbiAgICBzdGF0ZS5wb3NpdGlvblkgKz0gMC4wMjc1ICogZGVsdGE7XG5cbiAgICBjb25zdCB7cG9zaXRpb25YLCBwb3NpdGlvblksIGRlc3Ryb3llZCwgaW1wYWN0ZWQsIGdyb3VuZFl9ID0gc3RhdGU7XG4gICAgaWYgKCFkZXN0cm95ZWQgJiYgIWltcGFjdGVkICYmIGdyb3VuZFkpIHtcbiAgICAgIGlmICgocG9zaXRpb25ZICsgMzApID4gZ3JvdW5kWSkge1xuICAgICAgICBnYW1lLnB1YmxpY2F0aW9ucy5wdWJsaXNoKCdtaXNzaWxlR3JvdW5kSW1wYWN0Jywge1xuICAgICAgICAgIGVsZW1lbnRJZDogZWxlbWVudC5pZCxcbiAgICAgICAgICBwb3NpdGlvblg6IHBvc2l0aW9uWFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHJlbmRlcihzdGF0ZSwgY29udGV4dCkge1xuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gc3RhdGUuZmlsbFN0eWxlO1xuICAgIGNvbnRleHQuZmlsbFJlY3Qoc3RhdGUucG9zaXRpb25YLCBzdGF0ZS5wb3NpdGlvblksIDMwLCAzMCk7XG4gIH0sXG4gIHN1YnNjcmliZToge1xuICAgIG1pc3NpbGVEZXN0cm95ZWQoZGF0YSwgZWxlbWVudCwgZ2FtZSkge1xuICAgICAgY29uc3Qge3N0YXRlfSA9IGVsZW1lbnQ7XG4gICAgICBpZiAoZGF0YS5lbGVtZW50SWQgIT09IGVsZW1lbnQuaWQgfHwgc3RhdGUuZGVzdHJveWVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHN0YXRlLmRlc3Ryb3llZCA9IHRydWU7XG4gICAgICBzdGF0ZS5maWxsU3R5bGUgPSAncmdiYSgxMjUsMTI1LDEyNSwwLjUpJztcbiAgICAgIGdhbWUucHVibGljYXRpb25zLnB1Ymxpc2goJ3VwZGF0ZU1pc3NpbGVEZXN0cm95ZWRTY29yZScpO1xuICAgIH0sXG4gICAgbWlzc2lsZUdyb3VuZEltcGFjdChkYXRhLCBlbGVtZW50LCBnYW1lKSB7XG4gICAgICBpZiAoZGF0YS5lbGVtZW50SWQgIT09IGVsZW1lbnQuaWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgZ2FtZS5yZW1vdmUoZWxlbWVudCk7XG4gICAgICBnYW1lLnB1YmxpY2F0aW9ucy5wdWJsaXNoKCdtaXNzaWxlUmVzb2x2ZWQnKTtcbiAgICB9LFxuICB9LFxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IEluY29taW5nTWlzc2lsZTtcbiIsImltcG9ydCBkZWZpbmVFbGVtZW50IGZyb20gJy4uLy4uL0dhbWVFbmdpbmUvZGVmaW5lRWxlbWVudCc7XG5cbmNvbnN0IE1pc3NpbGVzRGVzdHJveWVkU2NvcmUgPSBkZWZpbmVFbGVtZW50KHtcbiAgbmFtZTogJ01pc3NpbGVzRGVzdHJveWVkU2NvcmUnLFxuICBpbml0KHtzdGF0ZSwgY29uZmlnfSwgZ2FtZSkge1xuICAgIGNvbnN0IHtkZXN0cm95ZWRTY29yZSA9IDB9ID0gY29uZmlnO1xuICAgIHN0YXRlLmRlc3Ryb3llZFNjb3JlID0gZGVzdHJveWVkU2NvcmU7XG4gICAgc3RhdGUueCA9IGdhbWUuY29uZmlnLndpZHRoIC0gMTA7XG4gIH0sXG4gIHJlbmRlcihzdGF0ZSwgY29udGV4dCkge1xuICAgIGNvbnN0IHtkZXN0cm95ZWRTY29yZSwgeH0gPSBzdGF0ZTtcbiAgICBjb250ZXh0LmZvbnQgPSBcIjE4cHggbW9ub3NwYWNlXCI7XG4gICAgY29udGV4dC50ZXh0QWxpZ24gPSAncmlnaHQnO1xuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gXCJyZ2JhKDI1NSwyNTUsMjU1LDAuOClcIjtcbiAgICBjb250ZXh0LmZpbGxUZXh0KGAke2Rlc3Ryb3llZFNjb3JlfWAsIHgsIDI1KTs7XG4gIH0sXG4gIHN1YnNjcmliZToge1xuICAgIHVwZGF0ZU1pc3NpbGVEZXN0cm95ZWRTY29yZShkYXRhLCBlbGVtZW50LCBnYW1lKSB7XG4gICAgICBjb25zdCB7c3RhdGV9ID0gZWxlbWVudDtcbiAgICAgIHN0YXRlLmRlc3Ryb3llZFNjb3JlID0gc3RhdGUuZGVzdHJveWVkU2NvcmUgKyAxO1xuICAgICAgaWYgKCFnYW1lLnN0YXRlLmdhbWVPdmVyKSB7XG4gICAgICAgICAgZ2FtZS5wdWJsaWNhdGlvbnMucHVibGlzaCgnbWlzc2lsZVJlc29sdmVkJyk7XG4gICAgICB9XG4gICAgfSxcbiAgfSxcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBNaXNzaWxlc0Rlc3Ryb3llZFNjb3JlO1xuIiwiaW1wb3J0IGRlZmluZUVsZW1lbnQgZnJvbSAnLi4vLi4vR2FtZUVuZ2luZS9kZWZpbmVFbGVtZW50JztcblxuY29uc3QgU2NlbmUgPSBkZWZpbmVFbGVtZW50KHtcbiAgbmFtZTogJ1NjZW5lJyxcbiAgaW5pdCh7c3RhdGV9LCBnYW1lKSB7XG4gICAgc3RhdGUuZmlsbFN0eWxlID0gJ3JnYig1MCwgNTAsIDUwKSc7XG4gICAgc3RhdGUud2lkdGggPSBnYW1lLmNvbmZpZy53aWR0aDtcbiAgICBzdGF0ZS5oZWlnaHQgPSBnYW1lLmNvbmZpZy5oZWlnaHQ7XG4gIH0sXG4gIHJlbmRlcihzdGF0ZSwgY29udGV4dCkge1xuICAgIGNvbnN0IHt3aWR0aCwgaGVpZ2h0LCBmaWxsU3R5bGV9ID0gc3RhdGU7XG4gICAgY29udGV4dC5jbGVhclJlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCk7XG4gICAgY29udGV4dC5maWxsU3R5bGUgPSBmaWxsU3R5bGU7XG4gICAgY29udGV4dC5maWxsUmVjdCgwLCAwLCB3aWR0aCwgaGVpZ2h0KTtcbiAgfSxcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBTY2VuZTtcbiIsImltcG9ydCBkZWZpbmVFbGVtZW50IGZyb20gJy4uLy4uL0dhbWVFbmdpbmUvZGVmaW5lRWxlbWVudCc7XG5cbmNvbnN0IFNjb3BlVGFyZ2V0ID0gZGVmaW5lRWxlbWVudCh7XG4gIG5hbWU6ICdTY29wZVRhcmdldCcsXG4gIGluaXQoe3N0YXRlLCBjb25maWd9LCBnYW1lKSB7XG5cbiAgICBjb25zdCB7aGVpZ2h0fSA9IGdhbWUuY29uZmlnO1xuICAgIGNvbnN0IHtcbiAgICAgIHJhbmdlcyA9IFt7XG4gICAgICAgIGJvdW5kWDogMCxcbiAgICAgICAgb3JpZ2luWDogMFxuICAgICAgfV1cbiAgICB9ID0gY29uZmlnO1xuXG4gICAgc3RhdGUuZmlsbFN0eWxlID0gJ3JnYmEoNTAsMjU1LDEyNSwwLjYpJztcbiAgICBzdGF0ZS5wb3NpdGlvblggPSAwO1xuICAgIHN0YXRlLnBvc2l0aW9uWSA9IDA7XG4gICAgc3RhdGUua2VlcEFsaXZlVGltZSA9IDA7XG5cbiAgICBzdGF0ZS5vcmlnaW5ZID0gaGVpZ2h0IC0gNTA7XG4gICAgc3RhdGUub3JpZ2luWCA9IHJhbmdlc1swXS5vcmlnaW5YO1xuICB9LFxuICB1cGRhdGUoe3N0YXRlfSwgZGVsdGEpIHtcbiAgICBzdGF0ZS5rZWVwQWxpdmVUaW1lIC09IDAuMSAqIGRlbHRhO1xuICB9LFxuICByZW5kZXIoc3RhdGUsIGNvbnRleHQpIHtcbiAgICBpZiAoc3RhdGUua2VlcEFsaXZlVGltZSA8PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qge1xuICAgICAgcG9zaXRpb25YLCBwb3NpdGlvblksIG9yaWdpblgsIG9yaWdpblksIGZpbGxTdHlsZVxuICAgIH0gPSBzdGF0ZTtcbiAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgIGNvbnRleHQubW92ZVRvKHBvc2l0aW9uWCwgcG9zaXRpb25ZKTtcbiAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gJ2Rhc2hlZCc7XG4gICAgY29udGV4dC5saW5lVG8ob3JpZ2luWCwgb3JpZ2luWSk7XG4gICAgY29udGV4dC5zdHJva2VTdHlsZSA9IGZpbGxTdHlsZTtcbiAgICBjb250ZXh0LnN0cm9rZSgpO1xuXG4gICAgY29udGV4dC5maWxsU3R5bGUgPSBmaWxsU3R5bGU7XG4gICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICBjb250ZXh0LmFyYyhwb3NpdGlvblgsIHBvc2l0aW9uWSwgMTAsIDAsIE1hdGguUEkgKiAyLCB0cnVlKTtcbiAgICBjb250ZXh0LnN0cm9rZSgpO1xuXG4gICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICBjb250ZXh0LmFyYyhwb3NpdGlvblgsIHBvc2l0aW9uWSwgMywgMCwgTWF0aC5QSSAqIDIsIHRydWUpO1xuICAgIGNvbnRleHQuc3Ryb2tlKCk7XG4gICAgLy8gY29udGV4dC5zdHJva2VSZWN0KHBvc2l0aW9uWCAtIDEwLCBwb3NpdGlvblkgLSAxMCwgMjAsIDIwKTtcbiAgICAvLyBjb250ZXh0LnN0cm9rZVJlY3QocG9zaXRpb25YIC0gMywgcG9zaXRpb25ZIC0gMywgNiwgNilcblxuICB9LFxuICBzdWJzY3JpYmU6IHtcbiAgICBzY29wZVRhcmdldE1vdmUoZGF0YSwgZWxlbWVudCwgZ2FtZSkge1xuICAgICAgY29uc3Qge3N0YXRlLCBjb25maWcgPSB7fX0gPSBlbGVtZW50O1xuXG4gICAgICBpZiAoZ2FtZS5zdGF0ZS5nYW1lT3Zlcikge1xuICAgICAgICBzdGF0ZS5rZWVwQWxpdmVUaW1lID0gMDtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB7eCwgeX0gPSBkYXRhO1xuICAgICAgc3RhdGUucG9zaXRpb25YID0geDtcbiAgICAgIHN0YXRlLnBvc2l0aW9uWSA9IHk7XG5cbiAgICAgIGNvbnN0IHsgcmFuZ2VzID0gW10gfSA9IGNvbmZpZztcbiAgICAgIGNvbnN0IHJhbmdlID0gcmFuZ2VzLmZpbmQoKHsgYm91bmRYIH0pID0+IHtcbiAgICAgICAgcmV0dXJuIHggPCBib3VuZFg7XG4gICAgICB9KTtcbiAgICAgIGlmIChyYW5nZSkge1xuICAgICAgICBzdGF0ZS5vcmlnaW5YID0gcmFuZ2Uub3JpZ2luWDtcbiAgICAgIH1cblxuICAgICAgc3RhdGUua2VlcEFsaXZlVGltZSA9IDUwMDtcbiAgICB9LFxuICAgIHNjb3BlVGFyZ2V0RXhpdChkYXRhLCBlbGVtZW50LCBnYW1lKSB7XG4gICAgICBpZiAoZ2FtZS5zdGF0ZS5nYW1lT3Zlcikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCB7c3RhdGV9ID0gZWxlbWVudDtcbiAgICAgIHN0YXRlLmtlZXBBbGl2ZVRpbWUgPSAwO1xuICAgIH0sXG4gIH0sXG59KTtcblxuZXhwb3J0IGRlZmF1bHQgU2NvcGVUYXJnZXQ7XG4iLCJpbXBvcnQgZGVmaW5lRWxlbWVudCBmcm9tICcuLi8uLi9HYW1lRW5naW5lL2RlZmluZUVsZW1lbnQnO1xuXG5jb25zdCBTdGFycyA9IGRlZmluZUVsZW1lbnQoe1xuICBuYW1lOiAnU3RhcnMnLFxuICBpbml0KHtzdGF0ZSwgY29uZmlnfSwgZ2FtZSkge1xuICAgIHN0YXRlLnggPSAxO1xuICAgIHN0YXRlLnkgPSAxLFxuICAgIHN0YXRlLndpZHRoID0gZ2FtZS5jb25maWcud2lkdGg7XG4gICAgc3RhdGUuaGVpZ2h0ID0gKGdhbWUuY29uZmlnLmhlaWdodCAtIDQwKTtcbiAgICBzdGF0ZS5maWxsU3R5bGUgPSAncmdiYSgyMzAsMjMwLDIzMCwwLjYpJztcbiAgICBzdGF0ZS5zdGFycyA9IFtdO1xuICAgIGZvciAobGV0IGl5ID0gc3RhdGUueTsgaXkgPCBzdGF0ZS5oZWlnaHQ7IGl5KyspIHtcbiAgICAgIGZvciAobGV0IGl4ID0gc3RhdGUueDsgaXggPCBzdGF0ZS53aWR0aDsgaXgrKykge1xuICAgICAgICBsZXQgZGVuc2l0eUNoYW5jZSA9ICgxIC0gKGl5IC8gc3RhdGUuaGVpZ2h0KSkgKiBNYXRoLnJhbmRvbSgpO1xuICAgICAgICBpZiAoZGVuc2l0eUNoYW5jZSA+IDAuMTUgJiYgTWF0aC5yYW5kb20oKSA+IDAuOTk3KSB7XG4gICAgICAgICAgc3RhdGUuc3RhcnMucHVzaCh7XG4gICAgICAgICAgICB4OiBpeCxcbiAgICAgICAgICAgIHk6IGl5XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHJlbmRlcihzdGF0ZSwgY29udGV4dCkge1xuICAgIGNvbnN0IHsgZmlsbFN0eWxlLCBzdGFycyB9ID0gc3RhdGU7XG5cbiAgICBjb250ZXh0LmZpbGxTdHlsZSA9IHN0YXRlLmZpbGxTdHlsZTtcbiAgICBzdGFycy5mb3JFYWNoKChzdGFyKSA9PiB7XG4gICAgICAgIGNvbnRleHQuZmlsbFJlY3Qoc3Rhci54LCBzdGFyLnksIDIsIDIpO1xuICAgIH0pO1xuXG4gIH0sXG59KTtcblxuZXhwb3J0IGRlZmF1bHQgU3RhcnM7XG4iLCJpbXBvcnQgR2FtZU9iamVjdCBmcm9tICcuLi9HYW1lRW5naW5lL0dhbWVPYmplY3QnO1xuaW1wb3J0IGJyb3dzZXJVSSBmcm9tICcuLi9Ccm93c2VyVUknO1xuaW1wb3J0IGluaXQgZnJvbSAnLi9pbml0JztcbmltcG9ydCB7c3Vic2NyaWJlLCB1bnN1YnNjcmliZX0gZnJvbSAnLi9zdWJzY3JpcHRpb25zJztcblxuY29uc3QgZ2FtZSA9IEdhbWVPYmplY3QoJ01pc3NpbGUgQ29tbWFuZCcsIHtcbiAgY29uZmlnOiB7XG4gICAgd2lkdGg6IGJyb3dzZXJVSS53aWR0aCxcbiAgICBoZWlnaHQ6IGJyb3dzZXJVSS5oZWlnaHQsXG4gICAgbWlzc2lsZUNvdW50OiA0MCxcbiAgfSxcbiAgaW5pdDogaW5pdCxcbiAgcmVuZGVyQ29udGV4dDogYnJvd3NlclVJLnJlbmRlckNvbnRleHQsXG4gIHN1YnNjcmliZTogc3Vic2NyaWJlLFxuICB1bnN1YnNjcmliZTogdW5zdWJzY3JpYmUsXG59KTtcblxuZXhwb3J0IGRlZmF1bHQgZ2FtZTtcbiIsImltcG9ydCB7IGZpbGxlZEFycmF5IH0gZnJvbSAnLi91dGlsJztcblxuaW1wb3J0IFNjZW5lIGZyb20gJy4vZWxlbWVudHMvU2NlbmUnO1xuaW1wb3J0IEdyb3VuZCBmcm9tICcuL2VsZW1lbnRzL0dyb3VuZCc7XG5pbXBvcnQgU3RhcnMgZnJvbSAnLi9lbGVtZW50cy9TdGFycyc7XG5pbXBvcnQgQnVpbGRpbmdzIGZyb20gJy4vZWxlbWVudHMvQnVpbGRpbmdzJztcbmltcG9ydCBEZWZlbnNlQmFzZSBmcm9tICcuL2VsZW1lbnRzL0RlZmVuc2VCYXNlJztcbmltcG9ydCBEZWZlbnNlTWlzc2lsZSBmcm9tICcuL2VsZW1lbnRzL0RlZmVuc2VNaXNzaWxlJztcbmltcG9ydCBJbmNvbWluZ01pc3NpbGUgZnJvbSAnLi9lbGVtZW50cy9JbmNvbWluZ01pc3NpbGUnO1xuaW1wb3J0IFNjb3BlVGFyZ2V0IGZyb20gJy4vZWxlbWVudHMvU2NvcGVUYXJnZXQnO1xuaW1wb3J0IERlZmVuc2VXZWFwb25zIGZyb20gJy4vZWxlbWVudHMvRGVmZW5zZVdlYXBvbnMnO1xuaW1wb3J0IENpdGl6ZW5TY29yZSBmcm9tICcuL2VsZW1lbnRzL0NpdGl6ZW5TY29yZSc7XG5pbXBvcnQgTWlzc2lsZXNEZXN0cm95ZWRTY29yZSBmcm9tICcuL2VsZW1lbnRzL01pc3NpbGVzRGVzdHJveWVkU2NvcmUnO1xuaW1wb3J0IEdhbWVTdGF0dXMgZnJvbSAnLi9lbGVtZW50cy9HYW1lU3RhdHVzJztcblxuY29uc3QgaW5pdGlhbGlzZSA9IChnYW1lKSA9PiB7XG5cbiAgY29uc3Qge2NvbmZpZywgc3RhdGV9ID0gZ2FtZTtcblxuICBzdGF0ZS5nYW1lT3ZlciA9IGZhbHNlO1xuICBzdGF0ZS5yZXNvbHV0aW9ucyA9IDA7XG5cbiAgY29uc3Qge3dpZHRofSA9IGNvbmZpZztcblxuICAvKiBTY2VuZXJ5ICovXG4gIGdhbWUuYWRkKFxuICAgIFNjZW5lLFxuICAgIEdyb3VuZCxcbiAgICBTdGFycyxcbiAgICBCdWlsZGluZ3NcbiAgKTtcblxuICAvKiBEZWZlbnNlIEVsZW1lbnRzICovXG4gIGNvbnN0IGRlZmVuc2VCYXNlQ291bnQgPSAzO1xuICBjb25zdCBkZWZlbnNlQmFzZUJvdW5kYXJ5V2lkdGggPSB3aWR0aCAvIGRlZmVuc2VCYXNlQ291bnQ7XG4gIGNvbnN0IGhhbGZCb3VuZGFyeVdpZHRoID0gZGVmZW5zZUJhc2VCb3VuZGFyeVdpZHRoIC8gMjtcblxuICBjb25zdCBkZWZlbnNlQmFzZURhdGEgPSBmaWxsZWRBcnJheShkZWZlbnNlQmFzZUNvdW50KVxuICAgIC5tYXAoKHYsIGkpID0+IHtcbiAgICAgIGNvbnN0IGJvdW5kWCA9IChkZWZlbnNlQmFzZUJvdW5kYXJ5V2lkdGggKiAoaSArIDEpKSB8IDA7XG4gICAgICBjb25zdCBvcmlnaW5YID0gKGJvdW5kWCAtIGhhbGZCb3VuZGFyeVdpZHRoKSB8IDA7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBib3VuZFg6IGJvdW5kWCxcbiAgICAgICAgb3JpZ2luWDogb3JpZ2luWFxuICAgICAgfTtcbiAgICB9KTtcblxuICBkZWZlbnNlQmFzZURhdGEuZm9yRWFjaCgoZGF0YSkgPT4ge1xuICAgIGdhbWUuYWRkKFxuICAgICAgRGVmZW5zZUJhc2UoeyB4OiBkYXRhLm9yaWdpblggfSlcbiAgICApO1xuICB9KTtcblxuICBnYW1lLmFkZChcbiAgICBTY29wZVRhcmdldCh7cmFuZ2VzOiBkZWZlbnNlQmFzZURhdGF9KVxuICApO1xuXG4gIC8qIEluY29taW5nIE1pc3NpbGVzICovXG4gIGZpbGxlZEFycmF5KGNvbmZpZy5taXNzaWxlQ291bnQpXG4gICAgLmZvckVhY2goKCkgPT4ge1xuICAgICAgZ2FtZS5hZGQoSW5jb21pbmdNaXNzaWxlKTtcbiAgICB9KTtcblxuICAvKiBTY29yZSBDb3VudGVycyAqL1xuICBnYW1lLmFkZChcbiAgICBEZWZlbnNlV2VhcG9ucyxcbiAgICBDaXRpemVuU2NvcmUsXG4gICAgTWlzc2lsZXNEZXN0cm95ZWRTY29yZVxuICApO1xuXG4gIC8qIFN0YXR1cyBNb25pdG9yICovXG4gIGdhbWUuYWRkKEdhbWVTdGF0dXMpO1xuXG59XG5cbmV4cG9ydCBkZWZhdWx0IGluaXRpYWxpc2U7XG4iLCJpbXBvcnQgYnJvd3NlclVJIGZyb20gJy4uL0Jyb3dzZXJVSSc7XG5cbmV4cG9ydCBjb25zdCBzdWJzY3JpYmUgPSAoZ2FtZSkgPT4ge1xuICBjb25zdCBicm93c2VyU3VicyA9IGJyb3dzZXJVSS5wdWJsaWNhdGlvbnMuc3Vic2NyaWJlO1xuICBjb25zdCBnYW1lUHVibGlzaCA9IGdhbWUucHVibGljYXRpb25zLnB1Ymxpc2g7XG5cbiAgYnJvd3NlclN1YnMoJ2NsaWNrJywgKGRhdGEpID0+IHtcbiAgICBpZiAoZ2FtZS5zdGF0ZS5nYW1lT3Zlcikge1xuICAgICAgZ2FtZVB1Ymxpc2goJ3Jlc2V0JywgZGF0YSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGdhbWVQdWJsaXNoKCdmaXJlJywgZGF0YSk7XG4gICAgfVxuICB9LCBnYW1lKTtcblxuICBicm93c2VyU3VicygnbW91c2VNb3ZlJywgKGRhdGEpID0+IHtcbiAgICBnYW1lUHVibGlzaCgnc2NvcGVUYXJnZXRNb3ZlJywgZGF0YSk7XG4gIH0sIGdhbWUpO1xuXG4gIGJyb3dzZXJTdWJzKCdtb3VzZUxlYXZlJywgKCkgPT4ge1xuICAgIGdhbWVQdWJsaXNoKCdzY29wZVRhcmdldEV4aXQnKTtcbiAgfSwgZ2FtZSk7XG59O1xuXG5leHBvcnQgY29uc3QgdW5zdWJzY3JpYmUgPSAoZ2FtZSkgPT4ge1xuICBjb25zdCBicm93c2VyVW5zdWJzID0gYnJvd3NlclVJLnB1YmxpY2F0aW9ucy51bnN1YnNjcmliZTtcblxuICBicm93c2VyVW5zdWJzKCdjbGljaycsIGdhbWUpO1xuICBicm93c2VyVW5zdWJzKCdtb3VzZU1vdmUnLCBnYW1lKTtcbiAgYnJvd3NlclVuc3VicygnbW91c2VMZWF2ZScsIGdhbWUpO1xufTtcbiIsImV4cG9ydCBjb25zdCByYW5kb21Db2xvdXIgPSAob3B0aW9ucyA9IHt9KSA9PiB7XG4gIGNvbnN0IHtcbiAgICByID0gKChNYXRoLnJhbmRvbSgpICogMjU1KSB8IDApLFxuICAgIGcgPSAoKE1hdGgucmFuZG9tKCkgKiAyNTUpIHwgMCksXG4gICAgYiA9ICgoTWF0aC5yYW5kb20oKSAqIDI1NSkgfCAwKSxcbiAgICBhID0gJzAuNicsXG4gIH0gPSBvcHRpb25zO1xuICByZXR1cm4gYHJnYmEoJHtyfSwke2d9LCR7Yn0sJHthfSlgO1xufTtcblxuZXhwb3J0IGNvbnN0IGZpbGxlZEFycmF5ID0gKGNvdW50LCB2YWx1ZSA9IHRydWUpID0+IHtcbiAgaWYgKHR5cGVvZiBjb3VudCAhPT0gJ251bWJlcicpIHtcbiAgICByZXR1cm4gW107XG4gIH1cbiAgcmV0dXJuIChuZXcgQXJyYXkoY291bnQpKS5maWxsKHZhbHVlKTtcbn07XG5cbmV4cG9ydCBjb25zdCBsZXJwID0gKHN0YXJ0ID0gMCwgZW5kID0gMSwgZnJhY3Rpb24gPSAxKSA9PiB7XG4gIHJldHVybiBzdGFydCArIGZyYWN0aW9uICogKGVuZCAtIHN0YXJ0KTtcbn07XG4iLCJleHBvcnQgZGVmYXVsdCB7XG4gIGluaXQoKSB7XG4gICAgY29uc29sZS5sb2coJ3lvdSBhcmUgbm93IHBsYXlpbmcgc2VycGVudCBhdHRhY2snKTtcbiAgfSxcbiAgc3RvcCgpIHtcblxuICB9XG59O1xuIiwiZXhwb3J0IGRlZmF1bHQge1xuICBpbml0KCkge1xuICAgIGNvbnNvbGUubG9nKCd5b3UgYXJlIG5vdyBwbGF5aW5nIHNlcnBlbnQgYXR0YWNrJyk7XG4gIH0sXG4gIHN0b3AoKSB7XG5cbiAgfVxufTtcbiIsImltcG9ydCB7c3RhcnRHYW1lLCBzdG9wR2FtZX0gZnJvbSAnLi9HYW1lRW5naW5lL0dhbWVMb29wJztcbmltcG9ydCBtaXNzaWxlQ29tbWFuZCBmcm9tICcuL01pc3NpbGVDb21tYW5kL2dhbWUnO1xuaW1wb3J0IHNuYWtlIGZyb20gJy4vU25ha2UvZ2FtZSc7XG5pbXBvcnQgc2VycGVudEF0dGFjayBmcm9tICcuL1NlcnBlbnRBdHRhY2svZ2FtZSc7XG5pbXBvcnQgc2FuZEJveCBmcm9tICcuL3NhbmRCb3gvZ2FtZSc7XG5cbigoKSA9PiB7XG5cbiAgY29uc3QgZ2FtZXMgPSB7XG4gICAgTWlzc2lsZUNvbW1hbmQ6IG1pc3NpbGVDb21tYW5kLFxuICAgIFNuYWtlOiBzbmFrZSxcbiAgICBTZXJwZW50QXR0YWNrOiBzZXJwZW50QXR0YWNrLFxuICAgIFNhbmRib3g6IHNhbmRCb3gsXG4gIH07XG4gIGxldCBzZWxlY3RlZEdhbWUgPSBtaXNzaWxlQ29tbWFuZDtcbiAgc3RhcnRHYW1lKHNlbGVjdGVkR2FtZSk7XG4gIHdpbmRvdy5zZWxlY3RlZEdhbWUgPSBzZWxlY3RlZEdhbWU7XG5cbiAgY29uc3QgYWN0aW9ucyA9IHtcbiAgICAgIHBsYXk6IHN0YXJ0R2FtZSxcbiAgICAgIHBhdXNlOiBzdG9wR2FtZSxcbiAgfTtcbiAgbGV0IHNlbGVjdGVkQWN0aW9uID0gYWN0aW9ucy5wbGF5O1xuXG5cbiAgY29uc3QgYnV0dG9uR3JvdXBIYW5kbGVyID0gKHsgaWQsIGtleSwgZGF0YSwgb25VcGRhdGV9KSA9PiB7XG4gICAgICBjb25zdCBidXR0b25Hcm91cCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcbiAgICAgIGJ1dHRvbkdyb3VwLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2dCkgPT4ge1xuICAgICAgICBjb25zdCBlbCA9IGV2dC5zcmNFbGVtZW50O1xuICAgICAgICBjb25zdCBkYXRhS2V5ID0gZWwuZGF0YXNldFtrZXldO1xuICAgICAgICBpZiAoIGVsLnRhZ05hbWUgIT09ICdCVVRUT04nIHx8ICFkYXRhS2V5IHx8ICFkYXRhW2RhdGFLZXldKSB7IHJldHVybjsgfVxuICAgICAgICBBcnJheS5wcm90b3R5cGVcbiAgICAgICAgICAuZmlsdGVyLmNhbGwoYnV0dG9uR3JvdXAuY2hpbGRyZW4sIChidXR0b24pID0+IGJ1dHRvbiAhPT0gZWwpXG4gICAgICAgICAgLmZvckVhY2goKGJ1dHRvbikgPT4geyBidXR0b24uZGF0YXNldC5hY3RpdmUgPSBmYWxzZTsgfSk7XG4gICAgICAgIGVsLmRhdGFzZXQuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgb25VcGRhdGUoZGF0YVtkYXRhS2V5XSk7XG4gICAgICB9KTtcbiAgfTtcblxuICBidXR0b25Hcm91cEhhbmRsZXIoe1xuICAgIGlkOiAnY29udHJvbGJ1dHRvbnMnLFxuICAgIGtleTogJ2FjdGlvbicsXG4gICAgZGF0YTogYWN0aW9ucyxcbiAgICBvblVwZGF0ZSh2YWx1ZSkge1xuICAgICAgaWYgKHNlbGVjdGVkQWN0aW9uID09PSB2YWx1ZSkgeyByZXR1cm47IH0gLy8gUmV0dXJuIGlmIG5vIGNoYW5nZVxuICAgICAgc2VsZWN0ZWRBY3Rpb24gPSB2YWx1ZTtcbiAgICAgIHNlbGVjdGVkQWN0aW9uKHNlbGVjdGVkR2FtZSk7XG4gICAgfVxuICB9KTtcblxuICBidXR0b25Hcm91cEhhbmRsZXIoe1xuICAgIGlkOiAnZ2FtZWxpc3QnLFxuICAgIGtleTogJ2dhbWUnLFxuICAgIGRhdGE6IGdhbWVzLFxuICAgIG9uVXBkYXRlKHZhbHVlKSB7XG4gICAgICBpZiAoc2VsZWN0ZWRHYW1lID09PSB2YWx1ZSkgeyByZXR1cm47IH0gLy8gUmV0dXJuIGlmIG5vIGNoYW5nZVxuICAgICAgc3RvcEdhbWUoc2VsZWN0ZWRHYW1lKTsgLy8gU3RvcCBjdXJyZW50IGdhbWVcbiAgICAgIHNlbGVjdGVkR2FtZSA9IHZhbHVlOyAvLyBDaGFuZ2UgZ2FtZSBzZWxlY3Rpb25cbiAgICAgIHN0YXJ0R2FtZShzZWxlY3RlZEdhbWUpOyAvLyBTdGFydCBuZXcgc2VsZWN0ZWQgZ2FtZVxuICAgICAgc2VsZWN0ZWRBY3Rpb24gPSBhY3Rpb25zLnBsYXk7IC8vIFVwZGF0ZSBidXR0b24gdG8gcGxheVxuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignW2RhdGEtYWN0aW9uPVwicGxheVwiXScpLmRhdGFzZXQuYWN0aXZlID0gdHJ1ZTtcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWFjdGlvbj1cInBhdXNlXCJdJykuZGF0YXNldC5hY3RpdmUgPSBmYWxzZTtcbiAgICAgIHdpbmRvdy5zZWxlY3RlZEdhbWUgPSBzZWxlY3RlZEdhbWU7IC8vIEV4cG9zZSBzZWxlY3RlZCBnYW1lIG9iamVjdFxuICAgIH1cbiAgfSk7XG5cbn0oKSk7XG4iLCJpbXBvcnQgZGVmaW5lRWxlbWVudCBmcm9tICcuLi8uLi9HYW1lRW5naW5lL2RlZmluZUVsZW1lbnQnO1xuaW1wb3J0IHtyYW5kb21Db2xvdXJ9IGZyb20gJy4uL3V0aWwnO1xuXG5jb25zdCBGYWxsaW5nQmxvY2sgPSBkZWZpbmVFbGVtZW50KHtcbiAgbmFtZTogJ0ZhbGxpbmdCbG9jaycsXG4gIGluaXQoe3N0YXRlfSwgZ2FtZSkge1xuICAgIHN0YXRlLmZpbGxTdHlsZSA9IHJhbmRvbUNvbG91cih7cjoyNTUsIGI6MTB9KTtcbiAgICBzdGF0ZS5wb3NpdGlvblggPSBNYXRoLnJhbmRvbSgpICogZ2FtZS5jb25maWcud2lkdGggKiAwLjg1O1xuICAgIHN0YXRlLnBvc2l0aW9uWSA9IE1hdGgucmFuZG9tKCkgKiBnYW1lLmNvbmZpZy5oZWlnaHQgKiAwLjI7XG4gIH0sXG4gIHVwZGF0ZSh7c3RhdGV9LCBkZWx0YSkge1xuICAgIHN0YXRlLnBvc2l0aW9uWSArPSAwLjAxICogZGVsdGE7XG4gIH0sXG4gIHJlbmRlcihzdGF0ZSwgY29udGV4dCkge1xuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gc3RhdGUuZmlsbFN0eWxlO1xuICAgIGNvbnRleHQuZmlsbFJlY3Qoc3RhdGUucG9zaXRpb25YLCBzdGF0ZS5wb3NpdGlvblksIDU1LCA1MCk7XG4gIH0sXG4gIHN1YnNjcmliZToge1xuICAgIHRhcmdldFNlbGVjdGlvbihkYXRhLCBlbGVtZW50LCBnYW1lKSB7XG4gICAgICBjb25zdCB7IHg6IGZpcmVYLCB5OiBmaXJlWSB9ID0gZGF0YTtcbiAgICAgIGNvbnN0IHtzdGF0ZTogeyBwb3NpdGlvblgsIHBvc2l0aW9uWSB9fSA9IGVsZW1lbnQ7XG4gICAgICBjb25zdCBpbnNpZGVYYm91bmRzID0gKGZpcmVYID4gcG9zaXRpb25YICYmIGZpcmVYIDwgcG9zaXRpb25YICsgNTUpO1xuICAgICAgY29uc3QgaW5zaWRlWWJvdW5kcyA9IChmaXJlWSA+IHBvc2l0aW9uWSAmJiBmaXJlWSA8IHBvc2l0aW9uWSArIDUwKTtcbiAgICAgIGlmIChpbnNpZGVYYm91bmRzICYmIGluc2lkZVlib3VuZHMpIHtcbiAgICAgICAgZ2FtZS5wdWJsaWNhdGlvbnMucHVibGlzaCgnZmFsbGluZ0Jsb2NrU2VsZWN0ZWQnLCB7XG4gICAgICAgICAgZWxlbWVudElkOiBlbGVtZW50LmlkXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sXG4gICAgZmFsbGluZ0Jsb2NrU2VsZWN0ZWQoZGF0YSwgZWxlbWVudCwgZ2FtZSkge1xuICAgICAgaWYgKGRhdGEuZWxlbWVudElkICE9PSBlbGVtZW50LmlkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHtzdGF0ZX0gPSBlbGVtZW50O1xuICAgICAgc3RhdGUuZmlsbFN0eWxlID0gJ3JnYmEoMTI1LDEyNSwxMjUsMC41KSc7XG4gICAgfSxcbiAgfSxcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBGYWxsaW5nQmxvY2s7XG4iLCJpbXBvcnQgZGVmaW5lRWxlbWVudCBmcm9tICcuLi8uLi9HYW1lRW5naW5lL2RlZmluZUVsZW1lbnQnO1xuXG5jb25zdCBNYWluQ2hhcmFjdGVyID0gZGVmaW5lRWxlbWVudCh7XG4gIG5hbWU6ICdNYWluQ2hhcmFjdGVyJyxcblxuICBpbml0KHsgc3RhdGUgfSkge1xuICAgIC8vIExldCdzIHNldCB0aGUgc3RhcnRpbmcgcG9zaXRpb25cbiAgICBzdGF0ZS5wb3NpdGlvblggPSAxMDA7XG4gICAgLy8gVGhlIGNhbnZhcyAneScgcG9zaXRpb24gYmVnaW5zIGZyb20gdGhlIHRvcCBvZiB0aGUgY2FudmFzXG4gICAgc3RhdGUucG9zaXRpb25ZID0gNDAwO1xuICB9LFxuXG4gIHJlbmRlciggc3RhdGUsIGNvbnRleHQgKSB7XG4gICAgY29uc3QgeyBwb3NpdGlvblgsIHBvc2l0aW9uWSB9ID0gc3RhdGU7XG4gICAgY29udGV4dC5maWxsU3R5bGUgPSAnZ3JlZW4nO1xuICAgIGNvbnRleHQuZmlsbFJlY3QocG9zaXRpb25YLCBwb3NpdGlvblksIDQwLCA0MCk7XG4gIH0sXG5cbiAgc3Vic2NyaWJlOiB7XG4gICAganVtcChkYXRhLCB7IHN0YXRlIH0pIHtcbiAgICAgIC8vIFdoZW4gdGhlICdqdW1wJyBldmVudCBoYXBwZW5zIG9jY3VycyBjaGFuZ2UgdGhlIGNoYXJhY3RlcidzXG4gICAgICAvLyBzdGF0ZSB0byBiZSAnanVtcGluZydcbiAgICAgIHN0YXRlLmp1bXBpbmcgPSB0cnVlO1xuICAgIH0sXG4gIH0sXG5cbiAgdXBkYXRlKHsgc3RhdGUgfSwgZGVsdGEpIHtcbiAgICAvLyBeIFRoZSAnZGVsdGEnIGlzIGhvdyBtdWNoIHRpbWUgaGFzIHBhc3NlZCBzaW5jZSBsYXN0IHVwZGF0ZVxuICAgIGNvbnN0IHsganVtcGluZywgcG9zaXRpb25ZIH0gPSBzdGF0ZTtcbiAgICBpZiAoIGp1bXBpbmcgKSB7XG4gICAgICAgIHN0YXRlLnBvc2l0aW9uWSA9IHN0YXRlLnBvc2l0aW9uWSAtICgwLjEgKiBkZWx0YSk7XG4gICAgfVxuICB9LFxuXG59KTtcblxuZXhwb3J0IGRlZmF1bHQgTWFpbkNoYXJhY3RlcjtcbiIsImltcG9ydCBkZWZpbmVFbGVtZW50IGZyb20gJy4uLy4uL0dhbWVFbmdpbmUvZGVmaW5lRWxlbWVudCc7XG5cbmNvbnN0IFNjZW5lID0gZGVmaW5lRWxlbWVudCh7XG4gIG5hbWU6ICdTY2VuZScsXG4gIGluaXQoe3N0YXRlfSwgZ2FtZSkge1xuICAgIHN0YXRlLndpZHRoID0gZ2FtZS5jb25maWcud2lkdGg7XG4gICAgc3RhdGUuaGVpZ2h0ID0gZ2FtZS5jb25maWcuaGVpZ2h0O1xuICAgIHN0YXRlLnRleHQgPSAnJztcbiAgfSxcbiAgcmVuZGVyKHN0YXRlLCBjb250ZXh0KSB7XG4gICAgY29uc3QgeyB3aWR0aCwgaGVpZ2h0LCB0ZXh0IH0gPSBzdGF0ZTtcbiAgICBjb250ZXh0LmNsZWFyUmVjdCgwLCAwLCB3aWR0aCwgaGVpZ2h0KTtcbiAgICBjb250ZXh0LmZpbGxTdHlsZSA9ICdncmV5JztcbiAgICBjb250ZXh0LnRleHRBbGlnbiA9ICdsZWZ0JztcbiAgICBjb250ZXh0LmZpbGxUZXh0KGBTcGFjZWJhciB0byBqdW1wICR7dGV4dH1gLCAxNTAsIDQzMCk7XG4gIH0sXG4gIHN1YnNjcmliZToge1xuICAgIGp1bXAoZGF0YSwgeyBzdGF0ZSB9KSB7XG4gICAgICAvLyBXaGVuIHRoZSAnanVtcCcgZXZlbnQgaGFwcGVucyBvY2N1cnMgY2hhbmdlIHRoZSBjaGFyYWN0ZXInc1xuICAgICAgLy8gc3RhdGUgdG8gYmUgJ2p1bXBpbmcnXG4gICAgICBzdGF0ZS50ZXh0ID0gJy0gQmxhc3RvZmYhJztcbiAgICB9LFxuICB9LFxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IFNjZW5lO1xuIiwiaW1wb3J0IGRlZmluZUVsZW1lbnQgZnJvbSAnLi4vLi4vR2FtZUVuZ2luZS9kZWZpbmVFbGVtZW50JztcblxuY29uc3QgU2NvcGVUYXJnZXQgPSBkZWZpbmVFbGVtZW50KHtcbiAgbmFtZTogJ1Njb3BlVGFyZ2V0JyxcbiAgaW5pdCh7c3RhdGV9LCBnYW1lKSB7XG4gICAgc3RhdGUuZmlsbFN0eWxlID0gJ3JnYmEoMjU1LDAsMjU1LDAuOCknO1xuICAgIHN0YXRlLmZpbGxTdHlsZTIgPSAncmdiKDI1NSwyNTUsMjU1KSc7XG4gICAgc3RhdGUucG9zaXRpb25YID0gMDtcbiAgICBzdGF0ZS5wb3NpdGlvblkgPSAwO1xuICAgIHN0YXRlLmtlZXBBbGl2ZVRpbWUgPSAwO1xuICAgIHN0YXRlLm9yaWdpblggPSBnYW1lLmNvbmZpZy53aWR0aCAvIDI7XG4gICAgc3RhdGUub3JpZ2luWSA9IGdhbWUuY29uZmlnLmhlaWdodDtcbiAgfSxcbiAgdXBkYXRlKHtzdGF0ZX0sIGRlbHRhKSB7XG4gICAgc3RhdGUua2VlcEFsaXZlVGltZSAtPSAwLjEgKiBkZWx0YTtcbiAgfSxcbiAgcmVuZGVyKHN0YXRlLCBjb250ZXh0KSB7XG4gICAgaWYgKHN0YXRlLmtlZXBBbGl2ZVRpbWUgPD0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgY29udGV4dC5tb3ZlVG8oc3RhdGUucG9zaXRpb25YLCBzdGF0ZS5wb3NpdGlvblkpO1xuICAgIGNvbnRleHQubGluZVRvKHN0YXRlLm9yaWdpblgsIHN0YXRlLm9yaWdpblkpO1xuICAgIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSBzdGF0ZS5maWxsU3R5bGU7XG4gICAgY29udGV4dC5zdHJva2UoKTtcblxuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gc3RhdGUuZmlsbFN0eWxlO1xuICAgIGNvbnRleHQuZmlsbFJlY3Qoc3RhdGUucG9zaXRpb25YIC0gMTUsIHN0YXRlLnBvc2l0aW9uWSAtIDE1LCAzMCwgMzApO1xuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gc3RhdGUuZmlsbFN0eWxlMjtcbiAgICBjb250ZXh0LmZpbGxSZWN0KHN0YXRlLnBvc2l0aW9uWCAtIDgsIHN0YXRlLnBvc2l0aW9uWSAtIDgsIDE2LCAxNik7XG4gICAgY29udGV4dC5maWxsU3R5bGUgPSBzdGF0ZS5maWxsU3R5bGU7XG4gICAgY29udGV4dC5maWxsUmVjdChzdGF0ZS5wb3NpdGlvblggLSAzLCBzdGF0ZS5wb3NpdGlvblkgLSAzLCA2LCA2KVxuXG4gIH0sXG4gIHN1YnNjcmliZToge1xuICAgIHNjb3BlVGFyZ2V0TW92ZShkYXRhLCBlbGVtZW50LCBnYW1lKSB7XG4gICAgICBsZXQge3N0YXRlfSA9IGVsZW1lbnQ7XG4gICAgICBsZXQge3gsIHl9ID0gZGF0YTtcbiAgICAgIHN0YXRlLnBvc2l0aW9uWCA9IHg7XG4gICAgICBzdGF0ZS5wb3NpdGlvblkgPSB5O1xuICAgICAgc3RhdGUua2VlcEFsaXZlVGltZSA9IDUwMDtcbiAgICB9LFxuICAgIHNjb3BlVGFyZ2V0RXhpdChkYXRhLCBlbGVtZW50LCBnYW1lKSB7XG4gICAgICBsZXQge3N0YXRlfSA9IGVsZW1lbnQ7XG4gICAgICBzdGF0ZS5rZWVwQWxpdmVUaW1lID0gMDtcbiAgICB9LFxuICB9LFxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IFNjb3BlVGFyZ2V0O1xuIiwiaW1wb3J0IGRlZmluZUVsZW1lbnQgZnJvbSAnLi4vLi4vR2FtZUVuZ2luZS9kZWZpbmVFbGVtZW50JztcbmltcG9ydCB7cmFuZG9tQ29sb3VyfSBmcm9tICcuLi91dGlsJztcblxuY29uc3QgU2xpZGluZ0Jsb2NrID0gZGVmaW5lRWxlbWVudCh7XG4gIG5hbWU6ICdTbGlkaW5nQmxvY2snLFxuICBpbml0KHtzdGF0ZSwgY29uZmlnfSwgZ2FtZSkge1xuICAgIGNvbnN0IHt4LCB5fSA9IGNvbmZpZztcbiAgICBzdGF0ZS5maWxsU3R5bGUgPSByYW5kb21Db2xvdXIoe2I6MjU1LCByOjEwLCBhOjAuNH0pO1xuICAgIHN0YXRlLnBvc2l0aW9uWCA9IHggfHwgKE1hdGgucmFuZG9tKCkgKiBnYW1lLmNvbmZpZy53aWR0aCAqIDAuNSkgLSAyMDA7XG4gICAgc3RhdGUucG9zaXRpb25ZID0geSB8fCBnYW1lLmNvbmZpZy5oZWlnaHQgKiAwLjcgKyBNYXRoLnJhbmRvbSgpICogZ2FtZS5jb25maWcuaGVpZ2h0ICogMC4yO1xuICAgIHN0YXRlLmRpcmVjdGlvbiA9IDE7XG4gIH0sXG4gIHVwZGF0ZSh7c3RhdGV9LCBkZWx0YSkge1xuICAgIGNvbnN0IHsgcG9zaXRpb25YLCAgZGlyZWN0aW9uIH0gPSBzdGF0ZTtcbiAgICBzdGF0ZS5wb3NpdGlvblggKz0gMC4wMiAqIGRlbHRhICogZGlyZWN0aW9uO1xuICB9LFxuICByZW5kZXIoc3RhdGUsIGNvbnRleHQpIHtcbiAgICBjb250ZXh0LmZpbGxTdHlsZSA9IHN0YXRlLmZpbGxTdHlsZTtcbiAgICBjb250ZXh0LmZpbGxSZWN0KHN0YXRlLnBvc2l0aW9uWCwgc3RhdGUucG9zaXRpb25ZLCA1NSwgNTApO1xuICB9LFxuICBzdWJzY3JpYmU6IHtcbiAgICB0YXJnZXRTZWxlY3Rpb24oZGF0YSwgZWxlbWVudCwgZ2FtZSkge1xuICAgICAgY29uc3QgeyB4OiBmaXJlWCwgeTogZmlyZVkgfSA9IGRhdGE7XG4gICAgICBjb25zdCB7c3RhdGU6IHsgcG9zaXRpb25YLCBwb3NpdGlvblkgfX0gPSBlbGVtZW50O1xuICAgICAgY29uc3QgaW5zaWRlWGJvdW5kcyA9IChmaXJlWCA+IHBvc2l0aW9uWCAmJiBmaXJlWCA8IHBvc2l0aW9uWCArIDU1KTtcbiAgICAgIGNvbnN0IGluc2lkZVlib3VuZHMgPSAoZmlyZVkgPiBwb3NpdGlvblkgJiYgZmlyZVkgPCBwb3NpdGlvblkgKyA1MCk7XG4gICAgICBpZiAoaW5zaWRlWGJvdW5kcyAmJiBpbnNpZGVZYm91bmRzKSB7XG4gICAgICAgIGdhbWUucHVibGljYXRpb25zLnB1Ymxpc2goJ3NsaWRpbmdCbG9ja1NlbGVjdGVkJywge1xuICAgICAgICAgIGVsZW1lbnRJZDogZWxlbWVudC5pZFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHNsaWRpbmdCbG9ja1NlbGVjdGVkKGRhdGEsIGVsZW1lbnQsIGdhbWUpIHtcbiAgICAgIGlmIChkYXRhLmVsZW1lbnRJZCAhPT0gZWxlbWVudC5pZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCB7c3RhdGV9ID0gZWxlbWVudDtcbiAgICAgIHN0YXRlLmRpcmVjdGlvbiA9IHN0YXRlLmRpcmVjdGlvbiAqIC0xO1xuICAgIH0sXG4gIH0sXG59KTtcblxuZXhwb3J0IGRlZmF1bHQgU2xpZGluZ0Jsb2NrO1xuIiwiaW1wb3J0IEdhbWVPYmplY3QgZnJvbSAnLi4vR2FtZUVuZ2luZS9HYW1lT2JqZWN0JztcbmltcG9ydCBicm93c2VyVUkgZnJvbSAnLi4vQnJvd3NlclVJJztcbmltcG9ydCBpbml0IGZyb20gJy4vaW5pdCc7XG5pbXBvcnQge3N1YnNjcmliZSwgdW5zdWJzY3JpYmV9IGZyb20gJy4vc3Vic2NyaXB0aW9ucyc7XG5cbmxldCBnYW1lID0gR2FtZU9iamVjdCgnU2FuZGJveCcsIHtcbiAgY29uZmlnOiB7XG4gICAgd2lkdGg6IGJyb3dzZXJVSS53aWR0aCxcbiAgICBoZWlnaHQ6IGJyb3dzZXJVSS5oZWlnaHQsXG4gIH0sXG4gIGluaXQ6IGluaXQsXG4gIHJlbmRlckNvbnRleHQ6IGJyb3dzZXJVSS5yZW5kZXJDb250ZXh0LFxuICBzdWJzY3JpYmU6IHN1YnNjcmliZSxcbiAgdW5zdWJzY3JpYmU6IHVuc3Vic2NyaWJlLFxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IGdhbWU7XG4iLCJpbXBvcnQgU2NlbmUgZnJvbSAnLi9lbGVtZW50cy9TY2VuZSc7XG5pbXBvcnQgRmFsbGluZ0Jsb2NrIGZyb20gJy4vZWxlbWVudHMvRmFsbGluZ0Jsb2NrJztcbmltcG9ydCBTbGlkaW5nQmxvY2sgZnJvbSAnLi9lbGVtZW50cy9TbGlkaW5nQmxvY2snO1xuaW1wb3J0IFNjb3BlVGFyZ2V0IGZyb20gJy4vZWxlbWVudHMvU2NvcGVUYXJnZXQnO1xuaW1wb3J0IE1haW5DaGFyYWN0ZXIgZnJvbSAnLi9lbGVtZW50cy9NYWluQ2hhcmFjdGVyJztcblxuY29uc3QgaW5pdGlhbGlzZSA9IChnYW1lKSA9PiB7XG4gIGdhbWUuYWRkKFNjZW5lKTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IDEyOyBpKyspIHtcbiAgICAgIGdhbWUuYWRkKEZhbGxpbmdCbG9jayk7XG4gIH1cblxuICBmb3IgKGxldCBpID0gMDsgaSA8IDY7IGkrKykge1xuICAgICAgZ2FtZS5hZGQoU2xpZGluZ0Jsb2NrKTtcbiAgfVxuICBnYW1lLmFkZChcbiAgICBTbGlkaW5nQmxvY2soe3g6IDE4MCwgeTogMzAwfSlcbiAgKTtcblxuICBnYW1lLmFkZChNYWluQ2hhcmFjdGVyKTtcblxuICBnYW1lLmFkZChTY29wZVRhcmdldCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGluaXRpYWxpc2U7XG4iLCJpbXBvcnQgYnJvd3NlclVJIGZyb20gJy4uL0Jyb3dzZXJVSSc7XG5cbmV4cG9ydCBjb25zdCBzdWJzY3JpYmUgPSAoZ2FtZSkgPT4ge1xuICBjb25zdCBicm93c2VyU3VicyA9IGJyb3dzZXJVSS5wdWJsaWNhdGlvbnMuc3Vic2NyaWJlO1xuICBjb25zdCBnYW1lUHVibGlzaCA9IGdhbWUucHVibGljYXRpb25zLnB1Ymxpc2g7XG5cbiAgYnJvd3NlclN1YnMoJ2NsaWNrJywgKGRhdGEpID0+IHtcbiAgICBnYW1lUHVibGlzaCgndGFyZ2V0U2VsZWN0aW9uJywgZGF0YSk7XG4gIH0sIGdhbWUpO1xuXG4gIGJyb3dzZXJTdWJzKCdtb3VzZU1vdmUnLCAoZGF0YSkgPT4ge1xuICAgIGdhbWVQdWJsaXNoKCdzY29wZVRhcmdldE1vdmUnLCBkYXRhKTtcbiAgfSwgZ2FtZSk7XG5cbiAgYnJvd3NlclN1YnMoJ21vdXNlTGVhdmUnLCAoKSA9PiB7XG4gICAgZ2FtZVB1Ymxpc2goJ3Njb3BlVGFyZ2V0RXhpdCcpO1xuICB9LCBnYW1lKTtcblxuICBicm93c2VyU3Vicygnc3BhY2ViYXJLZXknLCAoKSA9PiB7XG4gICAgZ2FtZVB1Ymxpc2goJ2p1bXAnKTtcbiAgfSwgZ2FtZSk7XG5cbn07XG5cbmV4cG9ydCBjb25zdCB1bnN1YnNjcmliZSA9IChnYW1lKSA9PiB7XG4gIGNvbnN0IGJyb3dzZXJVbnN1YnMgPSBicm93c2VyVUkucHVibGljYXRpb25zLnVuc3Vic2NyaWJlO1xuXG4gIGJyb3dzZXJVbnN1YnMoJ2NsaWNrJywgZ2FtZSk7XG4gIGJyb3dzZXJVbnN1YnMoJ21vdXNlTW92ZScsIGdhbWUpO1xuICBicm93c2VyVW5zdWJzKCdtb3VzZUxlYXZlJywgZ2FtZSk7XG59O1xuIiwiZXhwb3J0IGNvbnN0IHJhbmRvbUNvbG91ciA9ICh7XG4gIHIgPSAoKE1hdGgucmFuZG9tKCkgKiAyNTUpIHwgMCksXG4gIGcgPSAoKE1hdGgucmFuZG9tKCkgKiAyNTUpIHwgMCksXG4gIGIgPSAoKE1hdGgucmFuZG9tKCkgKiAyNTUpIHwgMCksXG4gIGEgPSAnMC42Jyxcbn0pID0+IHtcbiAgcmV0dXJuIGByZ2JhKCR7cn0sJHtnfSwke2J9LCR7YX0pYDtcbn07XG4iXX0=
