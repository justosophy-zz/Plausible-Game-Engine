import Publications from './Publications';

const addGameElements = (game, elementToAdd) => {
  const {
    elements,
    updatingElements,
    renderingElements,
    publications
  } = game;

  elementToAdd.forEach((element) => {

    // Create element object if just the element factory function
    if (typeof element === 'function') {
      element = element();
    }

    // Initialise element
    const init = element.init;
    if (typeof init === 'function') {
      init(element, game);
    }

    // Add to element collection
    const elementName = element.name;
    if (!elements[elementName]) {
      elements[elementName] = [];
    }
    elements[elementName].push(element);

    // // Asign game loop functions
    if (typeof element.update === 'function') {
      updatingElements.push(element);
    }

    if  (typeof element.render === 'function') {
      renderingElements.push(element);
    }

    // Add subscriptions
    const elementSubscribe = element.subscribe;
    if (typeof elementSubscribe === 'object') {
      Object.keys(elementSubscribe).forEach((action) => {
        const callback = elementSubscribe[action];
        publications.subscribe(action, callback, element);
      });
    }

  });
};

const filterOut = (element, collection) => {
  return collection.filter((el) => {
    return el !== element;
  });
};

const removeGameElements = (game, elements) => {
  elements.forEach((element) => {

    // Unsubscribe
    if (typeof element.subscribe === 'object') {
      Object.keys(element.subscribe).forEach((action) => {
        game.publications.unsubscribe(action, element);
      });
    }
    // Remove from collections
    game.updatingElements = filterOut(element, game.updatingElements);
    game.renderingElements = filterOut(element, game.renderingElements);
    game.elements[element.name] = filterOut(element, game.elements[element.name]);

  });
};

const resetGame = (gameObj) => {
  gameObj.running = false;

  Object.keys(gameObj.elements).forEach((key) => {
    const elements = gameObj.elements[key];
    removeGameElements(gameObj, elements);
  });

  gameObj.state = {};
  gameObj.init(gameObj);
  gameObj.running = true;
};

// Game constructor function
const GameObject = (name, conf) => {
  const gameObj = {
    add(...elements) {
      addGameElements(this, elements);
    },
    config: conf.config,
    elements: {},
    init: conf.init,
    initialised: false,
    name: name,
    remove(...elements) {
      removeGameElements(this, elements);
    },
    renderContext: conf.renderContext,
    renderingElements: [],
    reset() {
      resetGame(this);
    },
    running: false,
    state: {},
    subscribe: conf.subscribe,
    updatingElements : [],
    unsubscribe: conf.unsubscribe,
  };

  gameObj.publications = Publications(gameObj);

  return gameObj;
}

export default GameObject;
