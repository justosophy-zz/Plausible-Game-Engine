import defineElement from '../../GameEngine/defineElement';

const GameOver = defineElement({
  name: 'GameOver',
  init({state, config}, game) {
    const {width, height} = game.config;
    state.x = width / 2;
    state.y = height / 2
    state.width = width;
    state.height = height;
    if (config.winner) {
        state.statusText = 'You survived!'
    } else {
      state.statusText = 'You lost'
    }
  },
  render(state, context) {
    const {x, y, width, height, statusText} = state;
    context.fillStyle = 'rgba(0,0,0,0.5)';
    context.fillRect(0, 0, width, height);
    context.font = '30px monospace'
    context.textAlign = 'center';
    context.fillStyle = 'rgba(255,255,255,0.8)';
    context.fillText('Game Over', x, y - 20);;
    context.fillText(statusText, x, y + 20);;
    context.font = '14px monospace'
    context.fillText('(click to play again)', x, y + 50);;
  },
});

export default GameOver;
