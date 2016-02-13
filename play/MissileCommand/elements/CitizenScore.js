import defineElement from '../../GameEngine/defineElement';

const CitizenScore = defineElement({
  name: 'CitizenScore',
  init({state, config}, game) {
    const {citizens = 1200} = config;
    state.citizens = citizens;
    state.x = game.config.width - 10;
    state.y = game.config.height - 15;
  },
  render(state, context) {
    const {citizens, x, y} = state;
    context.font = '18px monospace';
    context.textAlign = 'right';
    context.fillStyle = 'rgba(255,255,255,0.8)';
    context.fillText(`citizens ${citizens}`, x, y);
  },
  subscribe: {
    missileGroundImpact(data, element, game) {
      if (game.state.gameOver) {
        return;
      }
      const {state} = element;
      const populationDamage = 50 + ((Math.random() * 50) | 0);
      state.citizens = Math.max(state.citizens - populationDamage, 0);
      if (state.citizens === 0 && !game.state.gameOver) {
        game.publications.publish('citizensDestroyed');
      }
    },
  },
});

export default CitizenScore;
