import defineElement from '../../GameEngine/defineElement';
import {randomColour} from '../util';

const FallingBlock = defineElement({
  name: 'FallingBlock',
  init({state}, game) {
    state.fillStyle = randomColour({r:255, b:10});
    state.positionX = Math.random() * game.config.width * 0.85;
    state.positionY = Math.random() * game.config.height * 0.2;
  },
  update({state}, delta) {
    state.positionY += 0.01 * delta;
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
        game.publications.publish('fallingBlockSelected', {
          elementId: element.id
        });
      }
    },
    fallingBlockSelected(data, element, game) {
      if (data.elementId !== element.id) {
        return;
      }
      const {state} = element;
      state.fillStyle = 'rgba(125,125,125,0.5)';
    },
  },
});

export default FallingBlock;
