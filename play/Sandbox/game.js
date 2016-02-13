import GameObject from '../GameEngine/GameObject';
import browserUI from '../BrowserUI';
import init from './init';
import {subscribe, unsubscribe} from './subscriptions';

const game = GameObject('Sandbox', {
  init: init,
  /* ^ The 'init' function runs when the game is started for the first
    time and calls game.add to add in all the starting elements
    See 'play/Sandbox/init.js' for the definition.
  */

  renderContext: browserUI.renderContext,
  /* ^ The 'renderContext' tells the game which canvas context to
    render into. See 'play/BrowserUI.js' for the definition.
  */

  config: {
    width: browserUI.width,
    height: browserUI.height,
  },
  /* ^ We can pass any important details into the configuration that
    might be changed. Such as height and width, or 'difficultyLevel'.
  */

  subscribe: subscribe,
  /* ^ The game subscribes to mouse and keyboard events in the
    browser. See 'play/subscriptions.js' for the definition.
  */

  unsubscribe: unsubscribe,
  /* ^ When the game stops playing, it unsubscribes from browser
    events. See 'play/subscriptions.js' for the definition.
  */

});

export default game;
