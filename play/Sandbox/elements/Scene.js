import defineElement from '../../GameEngine/defineElement';

const Scene = defineElement({
  name: 'Scene',
  init({state}, game) {
    state.width = game.config.width;
    state.height = game.config.height;
    state.text = '';
  },
  render(state, context) {
    const { width, height, text } = state;
    context.clearRect(0, 0, width, height);
    context.fillStyle = 'grey';
    context.textAlign = 'left';
    context.fillText(`Spacebar to jump ${text}`, 150, 430);
  },
  subscribe: {
    jump(data, { state }) {
      // When the 'jump' event happens occurs change the character's
      // state to be 'jumping'
      state.text = '- Blastoff!';
    },
  },
});

export default Scene;
