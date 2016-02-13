import defineElement from '../../GameEngine/defineElement';

const MissilesDestroyedScore = defineElement({
  name: 'MissilesDestroyedScore',
  init({state, config}, game) {
    const {destroyedScore = 0} = config;
    state.destroyedScore = destroyedScore;
    state.x = game.config.width - 10;
  },
  render(state, context) {
    const {destroyedScore, x} = state;
    context.font = "18px monospace";
    context.textAlign = 'right';
    context.fillStyle = "rgba(255,255,255,0.8)";
    context.fillText(`${destroyedScore}`, x, 25);;
  },
  subscribe: {
    updateMissileDestroyedScore(data, element, game) {
      const {state} = element;
      state.destroyedScore = state.destroyedScore + 1;
      if (!game.state.gameOver) {
          game.publications.publish('missileResolved');
      }
    },
  },
});

export default MissilesDestroyedScore;
