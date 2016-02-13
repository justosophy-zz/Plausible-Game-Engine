import defineElement from '../../GameEngine/defineElement';

const Scene = defineElement({
  name: 'Scene',
  init({state}, game) {
    state.fillStyle = 'rgb(50, 50, 50)';
    state.width = game.config.width;
    state.height = game.config.height;
  },
  render(state, context) {
    const {width, height, fillStyle} = state;
    context.clearRect(0, 0, width, height);
    context.fillStyle = fillStyle;
    context.fillRect(0, 0, width, height);
  },
});

export default Scene;
