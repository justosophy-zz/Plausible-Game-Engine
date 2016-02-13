import defineElement from '../../GameEngine/defineElement';
import DefenseMissile from './DefenseMissile';

const DefenseWeapons = defineElement({
  name: 'DefenseWeapons',
  init({state, config = {}}, game) {
    const {
      weapons = game.config.missileCount
    } = config;

    const {height} = game.config;
    state.weapons = weapons;
    state.x = 10;
    state.y = height - 15;
  },
  render(state, context) {
    const {weapons, x, y} = state;
    context.font = '18px monospace';
    context.textAlign = 'left';
    context.fillStyle = 'rgba(255,255,255,0.8)';
    context.fillText(`missiles ${weapons}`, x, y);
  },
  subscribe: {
    fire(data, element, game) {
      const { state } =  element;
      const { weapons } = state;

      if (weapons === 0) {
        return;
      }
      state.weapons = Math.max(state.weapons - 1, 0);

      const { x, y } = data;

      let originX = 0;
      let originY = 0;
      if (game.elements.ScopeTarget
        && game.elements.ScopeTarget.length > 0
      ) {
        let scopeState = game.elements.ScopeTarget[0].state;
        originX = scopeState.originX;
        originY = scopeState.originY;
      }

      game.add(
        DefenseMissile({
          targetX: x,
          targetY: y,
          originX: originX,
          originY: originY
        })
      );

    },
  },
});

export default DefenseWeapons;
