import defineElement from '../../GameEngine/defineElement';
import {randomColour} from '../util';

const DefenseMissile = defineElement({
  name: 'DefenseMissile',
  init({ state, config = {} }, game) {
    const {
      originX = 0,
      originY = 0,
      targetX = 10,
      targetY = 10,
    } =  config;
    state.originX = originX;
    state.originY = originY;
    state.positionX = originX;
    state.positionY = originY;
    state.targetX = targetX;
    state.targetY = targetY;
    state.dx = -(targetX - originX) / (targetY - originY);
    state.dy = -1;
    state.fillStyle = randomColour({b:255, r:10, a:0.4});
  },
  update(element, delta, game) {
    const {state, config} = element;
    const { positionX, positionY, dx, dy } = state;
    const { targetX, targetY } = config;
    state.positionX += dx;
    state.positionY += dy;

    const pastTargetX = (dx > 0) ? (positionX >= targetX) : (positionX < targetX);
    const pastTargetY = (positionY <= targetY);

    if (pastTargetX && pastTargetY) {
      game.publications.publish('missileAtTarget', {
        elementId: element.id
      });
    }

  },
  render(state, context) {
    const {
      originX, originY,
      positionX, positionY,
      targetX, targetY,
      fillStyle,
    } = state;

    context.strokeStyle = 'rgba(255,255,255,0.8)';

    // Target outer
    context.beginPath();
    context.arc(targetX, targetY, 10, 0, Math.PI * 2, true);
    context.stroke();
    // Target Inner
    context.beginPath();
    context.arc(targetX, targetY, 3, 0, Math.PI * 2, true);
    context.stroke();

    // Missile path
    context.beginPath();
    context.moveTo(originX, originY);
    context.strokeStyle = 'dashed';
    context.lineTo(positionX, positionY);
    context.stroke();

    // Missile
    context.fillStyle = fillStyle;
    context.beginPath();
    context.arc(positionX, positionY, 4, 0, Math.PI * 2, true);
    context.closePath();
    context.stroke();
    context.fill();

  },
  subscribe: {
    missileAtTarget(data, element, game) {
      if (data.elementId !== element.id) {
        return;
      }
      const { targetX, targetY } = element.config;
      const { fillStyle } = element.state;
      game.publications.publish('createExplosion', {
        x: targetX,
        y: targetY
      });
      game.remove(element);
    },
  }
});

export default DefenseMissile;
