import defineElement from '../../GameEngine/defineElement';
import GameOver from './GameOver';
import DefenseExplosion from './DefenseExplosion';

const GameStatus = defineElement({
  name: 'GameStatus',
  init({state, config}, game) {
    const {resolutions = 0} = config;
    state.resolutions = resolutions;
  },
  subscribe: {
    missileResolved(data, element, game) {
      const {state} = element;
      state.resolutions = state.resolutions + 1;
      if (!game.state.gameOver && (state.resolutions === game.config.missileCount) ) {
        game.publications.publish('gameOver', { winner: true});
      }
    },
    citizensDestroyed(data, element, game) {
      game.publications.publish('gameOver', { winner: false});
    },
    gameOver(data, element, game) {
      game.state.gameOver = true;
      game.add( GameOver({winner: data.winner}) );
    },
    reset(data, element, game) {
      game.reset();
    },
    createExplosion(data, element, game) {
      const { x, y, stroke } = data;
      game.add(
        DefenseExplosion({
          x: x,
          y: y
        })
      );
    }
  },
});

export default GameStatus;
