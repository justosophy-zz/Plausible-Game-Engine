import defineElement from '../../GameEngine/defineElement';
import {randomColour} from '../util';

const SlidingBlock = defineElement({
  name: 'SlidingBlock',
  init({state, config}, game) {
    const {x, y} = config;
    state.fillStyle = randomColour({b:255, r:10, a:0.4});
    state.positionX = x || (Math.random() * game.config.width * 0.5) - 200;
    state.positionY = y || game.config.height * 0.7 + Math.random() * game.config.height * 0.2;
    state.direction = 1;
  },
  update({state}, delta) {
    const { positionX,  direction } = state;
    state.positionX += 0.02 * delta * direction;
  },
  render(state, context) {
    context.fillStyle = state.fillStyle;
    context.fillRect(state.positionX, state.positionY, 55, 50);
  },
  subscribe: {
    targetSelection(data, element, game) {
      const { x: fireX, y: fireY } = data;
      const {state: { positionX, positionY }} = element;
      const insideXbounds = (fireX > positionX && fireX < positionX + 55);
      const insideYbounds = (fireY > positionY && fireY < positionY + 50);
      if (insideXbounds && insideYbounds) {
        game.publications.publish('slidingBlockSelected', {
          elementId: element.id
        });
      }
    },
    slidingBlockSelected(data, element, game) {
      if (data.elementId !== element.id) {
        return;
      }
      const {state} = element;
      state.direction = state.direction * -1;
    },
  },
});

export default SlidingBlock;
