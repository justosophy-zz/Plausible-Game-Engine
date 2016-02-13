import GameObject from '../GameEngine/GameObject';
import browserUI from '../BrowserUI';
import init from './init';
import {subscribe, unsubscribe} from './subscriptions';

const game = GameObject('Missile Command', {
  config: {
    width: browserUI.width,
    height: browserUI.height,
    missileCount: 40,
  },
  init: init,
  renderContext: browserUI.renderContext,
  subscribe: subscribe,
  unsubscribe: unsubscribe,
});

export default game;
