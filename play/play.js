import {startGame, stopGame} from './GameEngine/GameLoop';
import missileCommand from './MissileCommand/game';
import snake from './Snake/game';
import serpentAttack from './SerpentAttack/game';
import sandBox from './sandBox/game';

(() => {

  const games = {
    MissileCommand: missileCommand,
    Snake: snake,
    SerpentAttack: serpentAttack,
    Sandbox: sandBox,
  };
  let selectedGame = missileCommand;
  startGame(selectedGame);
  window.selectedGame = selectedGame;

  const actions = {
      play: startGame,
      pause: stopGame,
  };
  let selectedAction = actions.play;


  const buttonGroupHandler = ({ id, key, data, onUpdate}) => {
      const buttonGroup = document.getElementById(id);
      buttonGroup.addEventListener('click', (evt) => {
        const el = evt.srcElement;
        const dataKey = el.dataset[key];
        if ( el.tagName !== 'BUTTON' || !dataKey || !data[dataKey]) { return; }
        Array.prototype
          .filter.call(buttonGroup.children, (button) => button !== el)
          .forEach((button) => { button.dataset.active = false; });
        el.dataset.active = true;
        onUpdate(data[dataKey]);
      });
  };

  buttonGroupHandler({
    id: 'controlbuttons',
    key: 'action',
    data: actions,
    onUpdate(value) {
      if (selectedAction === value) { return; } // Return if no change
      selectedAction = value;
      selectedAction(selectedGame);
    }
  });

  buttonGroupHandler({
    id: 'gamelist',
    key: 'game',
    data: games,
    onUpdate(value) {
      if (selectedGame === value) { return; } // Return if no change
      stopGame(selectedGame); // Stop current game
      selectedGame = value; // Change game selection
      startGame(selectedGame); // Start new selected game
      selectedAction = actions.play; // Update button to play
      document.querySelector('[data-action="play"]').dataset.active = true;
      document.querySelector('[data-action="pause"]').dataset.active = false;
      window.selectedGame = selectedGame; // Expose selected game object
    }
  });

}());
