import defineElement from '../../GameEngine/defineElement';
import {randomColour} from '../util';

const IncomingMissile = defineElement({
  name: 'IncomingMissile',
  init({state, config}, game) {
    state.destroyed = false;
    state.impacted = false;
    state.fillStyle = randomColour({r:255, b:10});
    state.positionX = Math.random() * game.config.width - 20;
    state.positionY = Math.random() * game.config.height * 0.5 - game.config.height * 0.5;
    state.groundY = game.elements.Ground[0].state.y;
  },
  update(element, delta, game) {
    const {state} = element;
    state.positionY += 0.0275 * delta;

    const {positionX, positionY, destroyed, impacted, groundY} = state;
    if (!destroyed && !impacted && groundY) {
      if ((positionY + 30) > groundY) {
        game.publications.publish('missileGroundImpact', {
          elementId: element.id,
          positionX: positionX
        });
      }
    }
  },
  render(state, context) {
    context.fillStyle = state.fillStyle;
    context.fillRect(state.positionX, state.positionY, 30, 30);
  },
  subscribe: {
    missileDestroyed(data, element, game) {
      const {state} = element;
      if (data.elementId !== element.id || state.destroyed) {
        return;
      }
      state.destroyed = true;
      state.fillStyle = 'rgba(125,125,125,0.5)';
      game.publications.publish('updateMissileDestroyedScore');
    },
    missileGroundImpact(data, element, game) {
      if (data.elementId !== element.id) {
        return;
      }
      game.remove(element);
      game.publications.publish('missileResolved');
    },
  },
});

export default IncomingMissile;
