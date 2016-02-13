import defineElement from '../../GameEngine/defineElement';
import {randomColour} from '../util';

const DefenseBase = defineElement({
  name: 'DefenseBase',
  init({state, config }, game) {
    const {
      x = (Math.random() * game.config.width),
      y = (game.config.height - 50),
      width = 20,
    } =  config;

    state.width = width;
    state.positionX = x - (width / 2);
    state.positionY = y;
  },
  render(state, context) {
    const { positionX, positionY, width } = state;
    context.fillStyle = 'rgb(100,200,100)';
    context.fillRect(positionX, positionY, 20, width);
  },
});

export default DefenseBase;
