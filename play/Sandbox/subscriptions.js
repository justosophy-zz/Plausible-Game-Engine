import browserUI from '../BrowserUI';

export const subscribe = (game) => {
  const browserSubs = browserUI.publications.subscribe;
  const gamePublish = game.publications.publish;

  browserSubs('click', (data) => {
    gamePublish('targetSelection', data);
  }, game);

  browserSubs('mouseMove', (data) => {
    gamePublish('scopeTargetMove', data);
  }, game);

  browserSubs('mouseLeave', () => {
    gamePublish('scopeTargetExit');
  }, game);

  browserSubs('spacebarKey', () => {
    gamePublish('jump');
  }, game);

};

export const unsubscribe = (game) => {
  const browserUnsubs = browserUI.publications.unsubscribe;

  browserUnsubs('click', game);
  browserUnsubs('mouseMove', game);
  browserUnsubs('mouseLeave', game);
};
