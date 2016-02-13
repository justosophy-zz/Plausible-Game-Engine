import Scene from './elements/Scene';
import FallingBlock from './elements/FallingBlock';
import SlidingBlock from './elements/SlidingBlock';
import ScopeTarget from './elements/ScopeTarget';
import MainCharacter from './elements/MainCharacter';

const initialise = (game) => {
  game.add(Scene);

  for (let i = 0; i < 12; i++) {
      game.add(FallingBlock);
  }

  for (let i = 0; i < 6; i++) {
      game.add(SlidingBlock);
  }
  game.add(
    SlidingBlock({x: 180, y: 300})
  );

  game.add(MainCharacter);

  game.add(ScopeTarget);
}

export default initialise;
