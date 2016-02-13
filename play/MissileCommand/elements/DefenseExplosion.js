import defineElement from '../../GameEngine/defineElement';

const pointInsideCircle = ({
  circleX,
  circleY,
  circleRadius,
  pointX,
  pointY,
}) => {
  // Point is inside circle if distance squared is less than or equal to r squared
  // return d^2 <= r^2
  const rSquared = circleRadius * circleRadius;
  const dSquared = Math.pow(pointY - circleY, 2) + Math.pow(pointX - circleX, 2);
  return dSquared <= rSquared;
};

const getCornerPoints = ({
  positionX,
  positionY,
  width
}) => {
  return [
    { x: positionX, y: positionY },
    { x: positionX + width, y: positionY },
    { x: positionX, y: positionY + width },
    { x: positionX + width, y: positionY + width }
  ];
};

const DefenseExplosion = defineElement({
  name: 'DefenseExplosion',
  init({ state, config = {} }, game) {
    const {
      x = 0,
      y = 0,
    } = config;
    state.x = x;
    state.y = y;
    state.size = 3;
    state.alpha = 1;
  },
  update(element, delta, game) {
    const { state } = element;
    const { size, alpha } = state;

    if (size >= 35) {
      game.publications.publish('explosionComplete', {
        elementId: element.id
      });
      return;
    }

    state.size = size + (delta * 0.1);

    if (alpha > 0) {
      state.alpha = alpha - (delta * 0.002);
    }

    const { x, y } = state;

    game.elements.IncomingMissile.forEach((missile) => {
      if (missile.state.destroyed) {
        return;
      }

      const { positionX, positionY } = missile.state;
      const cornerPoints = getCornerPoints({
        positionX: positionX,
        positionY: positionY,
        width: 30
      });

      const insideExplosion = cornerPoints.some((point) => {
        return pointInsideCircle({
          circleX: x,
          circleY: y,
          circleRadius: size,
          pointX: point.x,
          pointY: point.y,
        });
      });

      if (insideExplosion) {
        game.publications.publish('missileDestroyed', {
          elementId: missile.id
        });
      }

    });

  },
  render(state, context) {
    const { x, y, size, alpha } = state;

    context.fillStyle = `rgba(255,255,255,${alpha})`;
    context.beginPath();
    context.arc(x, y, size, 0, Math.PI * 2, true);
    context.closePath();
    context.fill();

  },
  subscribe: {
    explosionComplete(data, element, game) {
      if (data.elementId !== element.id) {
        return;
      }
      game.remove(element);
    },
  },
});

export default DefenseExplosion;
