// Game element factory function
const defineElement = (options) => {

  const {name, init, update, render, subscribe} = options;
  let elementIdIndex = 0;

  const factory = (config = {}) => {
    const element = {};

    element.name = name;

    // Assign id
    element.id = `${element.name}_${elementIdIndex}`;
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
  }

  return factory;
}

Object.freeze(defineElement);

export default defineElement;
