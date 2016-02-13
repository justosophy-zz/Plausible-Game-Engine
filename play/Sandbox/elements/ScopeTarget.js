import defineElement from '../../GameEngine/defineElement';

const ScopeTarget = defineElement({
  name: 'ScopeTarget',
  init({state}, game) {
    state.fillStyle = 'rgba(255,0,255,0.8)';
    state.fillStyle2 = 'rgb(255,255,255)';
    state.positionX = 0;
    state.positionY = 0;
    state.keepAliveTime = 0;
    state.originX = game.config.width / 2;
    state.originY = game.config.height;
  },
  update({state}, delta) {
    state.keepAliveTime -= 0.1 * delta;
  },
  render(state, context) {
    if (state.keepAliveTime <= 0) {
      return;
    }

    context.beginPath();
    context.moveTo(state.positionX, state.positionY);
    context.lineTo(state.originX, state.originY);
    context.strokeStyle = state.fillStyle;
    context.stroke();

    context.fillStyle = state.fillStyle;
    context.fillRect(state.positionX - 15, state.positionY - 15, 30, 30);
    context.fillStyle = state.fillStyle2;
    context.fillRect(state.positionX - 8, state.positionY - 8, 16, 16);
    context.fillStyle = state.fillStyle;
    context.fillRect(state.positionX - 3, state.positionY - 3, 6, 6)

  },
  subscribe: {
    scopeTargetMove(data, element, game) {
      let {state} = element;
      let {x, y} = data;
      state.positionX = x;
      state.positionY = y;
      state.keepAliveTime = 500;
    },
    scopeTargetExit(data, element, game) {
      let {state} = element;
      state.keepAliveTime = 0;
    },
  },
});

export default ScopeTarget;
