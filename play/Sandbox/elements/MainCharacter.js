import defineElement from '../../GameEngine/defineElement';

const MainCharacter = defineElement({
  name: 'MainCharacter',

  init({ state }) {
    // Let's set the starting position
    state.positionX = 100;
    // The canvas 'y' position begins from the top of the canvas
    state.positionY = 400;
  },

  render( state, context ) {
    const { positionX, positionY } = state;
    context.fillStyle = 'green';
    context.fillRect(positionX, positionY, 40, 40);
  },

  subscribe: {
    jump(data, { state }) {
      // When the 'jump' event occurs change the character's
      // state to be 'jumping'
      state.jumping = true;
    },
  },

  update({ state }, delta) {
    // ^ The 'delta' is how much time has passed since last update
    const { jumping, positionY } = state;
    if ( jumping ) {
        state.positionY = state.positionY - (0.1 * delta);
    }
  },

});

export default MainCharacter;
