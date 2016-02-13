import defineElement from '../../GameEngine/defineElement';

const Stars = defineElement({
  name: 'Stars',
  init({state, config}, game) {
    state.x = 1;
    state.y = 1,
    state.width = game.config.width;
    state.height = (game.config.height - 40);
    state.fillStyle = 'rgba(230,230,230,0.6)';
    state.stars = [];
    for (let iy = state.y; iy < state.height; iy++) {
      for (let ix = state.x; ix < state.width; ix++) {
        let densityChance = (1 - (iy / state.height)) * Math.random();
        if (densityChance > 0.15 && Math.random() > 0.997) {
          state.stars.push({
            x: ix,
            y: iy
          });
        }
      }
    }
  },
  render(state, context) {
    const { fillStyle, stars } = state;

    context.fillStyle = state.fillStyle;
    stars.forEach((star) => {
        context.fillRect(star.x, star.y, 2, 2);
    });

  },
});

export default Stars;
