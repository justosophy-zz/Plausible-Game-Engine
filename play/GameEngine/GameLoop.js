let gameLoopDelta = 0;
let lastFrameTimeMs = 0;

const update = (gameObj, delta) => {
  gameObj.updatingElements.forEach((element) => {
    element.update(element, delta, gameObj);
  });
};

const render = (gameObj) => {
  gameObj.renderingElements.forEach((element) => {
    element.render(element.state, gameObj.renderContext);
  });
};

const gameLoop = (timestamp, game) => {

  if (!game.running) {
    return;
  }

  requestAnimationFrame((timestampInner) => {
      gameLoop(timestampInner, game);
  });

  gameLoopDelta = timestamp - lastFrameTimeMs;
  lastFrameTimeMs = timestamp;

  update(game, gameLoopDelta);
  render(game);

};

export const startGame = (game) => {

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

  requestAnimationFrame((timestamp) => {
      lastFrameTimeMs = timestamp;
      gameLoop(timestamp, game);
  });
}

export const stopGame = (game) => {
  game.running = false;
  if (game.unsubscribe) {
      game.unsubscribe(game);
  }
}
