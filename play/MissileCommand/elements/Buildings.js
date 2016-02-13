import defineElement from '../../GameEngine/defineElement';

const Buildings = defineElement({
  name: 'Buildings',
  init({state, config}, game) {
    const { width: gameWidth, height: gameHeight } = game.config;
    state.buildings = [];

    for (let ix = 0; ix < gameWidth; ix ++) {
      if (Math.random() > 0.9) {
        const buildingX = ix - 15;
        const builindgWidth = Math.max((Math.random() * 30) | 0, 10);
        const buildingHeight = Math.max((Math.random() * 40) | 0, 15);
        state.buildings.push({
          x: buildingX,
          y: gameHeight - buildingHeight - 40,
          width: builindgWidth,
          height: buildingHeight,
          destroyed: false,
        });
      }
    }
  },
  render(state, context) {
    const {buildings} = state;
    buildings.forEach((building) => {
      const {x, y, width, height, destroyed} = building;
        if (destroyed) {
          context.fillStyle = 'rgba(125,125,125,0.4)';
        } else {
          context.fillStyle = 'rgba(200,30,200,0.4)';
        }
        context.fillRect(x, y, width, height);
    });
  },
  subscribe: {
    missileGroundImpact(data, element, game) {
      const {state} = element;
      const {buildings} = state;
      const {positionX} = data;

      state.buildings = buildings.map((building) => {
        const { destroyed, x, width } = building;
        if (destroyed) {
          return building;
        }
        const insideLeftBound = (positionX + 30) >= x;
        const insideRightBound = positionX <= (x + width);
        if (insideLeftBound && insideRightBound) {
          building.destroyed = true;
        }
        return building;

      });
    },
    gameOver(data, element, game) {
      const {state} = element;
      const {buildings} = state;
      state.buildings = buildings.map((building) => {
        building.destroyed = true;
        return building;
      });
    },
  },
});

export default Buildings;
