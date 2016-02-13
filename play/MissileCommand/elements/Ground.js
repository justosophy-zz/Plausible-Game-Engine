import defineElement from '../../GameEngine/defineElement';

const Ground = defineElement({
  name: 'Ground',
  init({state, config}, game) {
    state.x = 0;
    state.y = (game.config.height - 40),
    state.width = game.config.width;
    state.height = 40;
    state.damageLevel = 0;
    state.fillStyle = 'rgba(100,200,100,0.6)';
    state.fillStyle2 = 'rgba(100,200,100,1)';
  },
  render(state, context) {
    const { fillStyle, fillStyle2, x, y, width, height } = state;

    const gradient = context.createLinearGradient(x, y, x, y + height);
    gradient.addColorStop(0, fillStyle);
    gradient.addColorStop(0.75, fillStyle2);

    context.fillStyle = gradient;
    context.fillRect(x, y, width, height);
  },
  subscribe: {
    missileGroundImpact(data, element, game) {
      if (game.state.gameOver) {
        return;
      }
      const {state} = element;
      state.damageLevel = state.damageLevel + 30;
      const redFill = Math.min(100 + state.damageLevel, 255);
      state.fillStyle = `rgba(${redFill},200,100,0.6)`;
    },
  },
});

export default Ground;
