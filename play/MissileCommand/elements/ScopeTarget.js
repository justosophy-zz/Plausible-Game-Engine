import defineElement from '../../GameEngine/defineElement';

const ScopeTarget = defineElement({
  name: 'ScopeTarget',
  init({state, config}, game) {

    const {height} = game.config;
    const {
      ranges = [{
        boundX: 0,
        originX: 0
      }]
    } = config;

    state.fillStyle = 'rgba(50,255,125,0.6)';
    state.positionX = 0;
    state.positionY = 0;
    state.keepAliveTime = 0;

    state.originY = height - 50;
    state.originX = ranges[0].originX;
  },
  update({state}, delta) {
    state.keepAliveTime -= 0.1 * delta;
  },
  render(state, context) {
    if (state.keepAliveTime <= 0) {
      return;
    }

    const {
      positionX, positionY, originX, originY, fillStyle
    } = state;
    context.beginPath();
    context.moveTo(positionX, positionY);
    context.strokeStyle = 'dashed';
    context.lineTo(originX, originY);
    context.strokeStyle = fillStyle;
    context.stroke();

    context.fillStyle = fillStyle;
    context.beginPath();
    context.arc(positionX, positionY, 10, 0, Math.PI * 2, true);
    context.stroke();

    context.beginPath();
    context.arc(positionX, positionY, 3, 0, Math.PI * 2, true);
    context.stroke();
    // context.strokeRect(positionX - 10, positionY - 10, 20, 20);
    // context.strokeRect(positionX - 3, positionY - 3, 6, 6)

  },
  subscribe: {
    scopeTargetMove(data, element, game) {
      const {state, config = {}} = element;

      if (game.state.gameOver) {
        state.keepAliveTime = 0;
        return;
      }

      const {x, y} = data;
      state.positionX = x;
      state.positionY = y;

      const { ranges = [] } = config;
      const range = ranges.find(({ boundX }) => {
        return x < boundX;
      });
      if (range) {
        state.originX = range.originX;
      }

      state.keepAliveTime = 500;
    },
    scopeTargetExit(data, element, game) {
      if (game.state.gameOver) {
        return;
      }
      const {state} = element;
      state.keepAliveTime = 0;
    },
  },
});

export default ScopeTarget;
