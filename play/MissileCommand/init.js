import { filledArray } from './util';

import Scene from './elements/Scene';
import Ground from './elements/Ground';
import Stars from './elements/Stars';
import Buildings from './elements/Buildings';
import DefenseBase from './elements/DefenseBase';
import DefenseMissile from './elements/DefenseMissile';
import IncomingMissile from './elements/IncomingMissile';
import ScopeTarget from './elements/ScopeTarget';
import DefenseWeapons from './elements/DefenseWeapons';
import CitizenScore from './elements/CitizenScore';
import MissilesDestroyedScore from './elements/MissilesDestroyedScore';
import GameStatus from './elements/GameStatus';

const initialise = (game) => {

  const {config, state} = game;

  state.gameOver = false;
  state.resolutions = 0;

  const {width} = config;

  /* Scenery */
  game.add(
    Scene,
    Ground,
    Stars,
    Buildings
  );

  /* Defense Elements */
  const defenseBaseCount = 3;
  const defenseBaseBoundaryWidth = width / defenseBaseCount;
  const halfBoundaryWidth = defenseBaseBoundaryWidth / 2;

  const defenseBaseData = filledArray(defenseBaseCount)
    .map((v, i) => {
      const boundX = (defenseBaseBoundaryWidth * (i + 1)) | 0;
      const originX = (boundX - halfBoundaryWidth) | 0;
      return {
        boundX: boundX,
        originX: originX
      };
    });

  defenseBaseData.forEach((data) => {
    game.add(
      DefenseBase({ x: data.originX })
    );
  });

  game.add(
    ScopeTarget({ranges: defenseBaseData})
  );

  /* Incoming Missiles */
  filledArray(config.missileCount)
    .forEach(() => {
      game.add(IncomingMissile);
    });

  /* Score Counters */
  game.add(
    DefenseWeapons,
    CitizenScore,
    MissilesDestroyedScore
  );

  /* Status Monitor */
  game.add(GameStatus);

}

export default initialise;
