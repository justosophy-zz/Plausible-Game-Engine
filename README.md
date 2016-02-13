# Plausible Game Engine

Plausible Game Engine (PGE) is a light-touch educational library for
writing HTML5 canvas games in JavaScript (ES2015).
To get started [see 1. USAGE](#1-usage).

I wrote PGE as an educational tool while teaching JavaScript and game
development concepts at the 2015 ['Sydney JavaScript Study Group'
meet-up](http://www.meetup.com/Sydney-JavaScript-Study-Group/).

It's a '*plausible*' game engine because the focus is on understanding
game development concepts
( [see 2. DEVELOPING](#2-developing) ),
more than catering to higher performance and complexity concerns
( [see 3. IMPROVEMENTS](#3-improvements) ).

LICENSE:
MIT

AUTHOR:
Justin Anderson
( [@justosophy](https://twitter.com/justosophy) )

[See Demo](http://justosophy.github.io/Plausible-Game-Engine/)

## 1. USAGE

1. Clone and navigate to the repository
```bash
  git clone https://github.com/justosophy/plausible-game-engine.git
```
```bash
  cd plausible-game-engine
```

2. Install the node packages
( [requires Node.js](https://nodejs.org) )
```bash
npm install
```

3. Build the project
```bash
gulp build
```

4. Open `index.html` in your browser.


## 2. DEVELOPING

A typical arcade-style game has a lot happening at once. Often there
are the players, enemies, the scene, score updates, visual effects and
more all changing and interacting with each other over time. PGE
simplifies a complex game by helping you think in terms of the
individual game *elements* and their *behaviours*.

Tips:

- Try modifying elements in the example games to get a feel for how
things work.
- Run `gulp watch` on the command line in the PGE directory to
continuously build the application as you make changes.

### Defining Game Elements

Use the `defineElement` function to define a new game element.

One element in a game could be the main character who jumps around
the screen. This character might have a number of different game
behaviours to think about:

1. What happens when the character is added to the game? Where should
their staring position be?
2. How should the character look when rendered to the screen?
3. What happens to the character when someone presses the 'jump' key?
4. As time passes by, does anything change or update for the player?

In PGE we can define our main character like this:

```JavaScript
const mainCharacter = defineElement({
  name: 'MainCharacter',
});
```
This element can be found in the Sandbox game under
`play/Sandbox/elements/MainCharacter.js`.

When the character is initially added to the game we can define the
expected state we want the character to be in through the `init`
method.
```JavaScript
const mainCharacter = defineElement({
  init({ state }) {
    // Let's set the starting position
    state.positionX = 100;
    // The canvas 'y' position begins from the top of the canvas
    state.positionY = 400;
  },
});
```

When the character is rendered to the screen, let's draw them as a
40px green square by using the canvas `fillRect` function inside the
`render` method.
```JavaScript
const mainCharacter = defineElement({
  render( state, context ) {
    const { positionX, positionY } = state;
    context.fillStyle = 'green';
    context.fillRect(positionX, positionY, 40, 40);
  },
});
```

When someone presses the 'jump' key our character can listen out for
it and respond by adding a `jump` method to its `subscribe` list.
```JavaScript
const mainCharacter = defineElement({
  subscribe: {
    jump(data, { state }) {
      // When the 'jump' event occurs change the character's
      // state to be 'jumping'
      state.jumping = true;
    },
  },
});
```

As time passes by let's update the character. If the character is
suppose to be jumping then then let's move their position up the
screen using the `update` method.
```JavaScript
const mainCharacter = defineElement({
  update({ state }, delta) {
    // ^ The 'delta' is how much time has passed since last update
    const { jumping, positionY } = state;
    if ( jumping ) {
        state.positionY = state.positionY - (0.1 * delta);
    }
  },
});
```
Notice above the y-position gets smaller when the character is jumping
higher because the y-position begins at the top in canvas. In our case
once our main character starts to jump, they will continue to float
off into space as we haven't programmed any way for them to fall back
down again.

Putting it all together our Main Character element looks like this:
```JavaScript
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
```

### Adding elements to the game

With our elements defined we can add them to the game using the `add`
method like this:

```JavaScript
game.add( MainCharacter );
```
See `play/Sandbox/init.js` to see where MainCharacter is added to the
Sandbox game.


### Creating the game

PGE can create many different types of games. Use the `GameObject`
function to create a new game object like this:

```JavaScript
const game = GameObject('Sandbox');
```

See `play/Sandbox/game.js` to see where the Sandbox game is created.

Just like elements, a game object usually has a number of different
behaviours to think about:

1. What happens when the game is started for the first time? Which
elements should it add to the game?
2. What HTML5 canvas context should it render into?
3. Are there any configuration settings to specify about the game like
height and width?
4. What happens in the game when someone presses a keyboard key in the
browser or moves their mouse around the browser?

The complete Sandbox game object looks like this:

```JavaScript
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
```

### Starting the game

Use the `startGame` and `startGame` functions like this:
```JavaScript
startGame(sandBox);
```

The Sandbox and other games are started and stopped in `play/play.js`.

### Start developing

The easiest way to get a feel for PGE and game development concepts is
to start developing. Remember to think in terms of individual elements
and separate out the different concerns like initialisation,
rendering, updating, responding to events.

Tell me how you go! Have fun and make something plausible.


## 3. IMPROVEMENTS

In the list below are some educational suggestions to try out:

- Modify one of the example games do so something different.
- Make your own game.
- Add your own graphics functions / drawing library instead using of
the raw canvas.
- Update the game loop function to prevent 'clipping' (constant
deltas).
- Add your own physics interactions.
- Interact using a game controller in the browser.
- Add sound features.
- Reduce the amount of memory used by the elements through techniques
like bitmasking. Measure the differences.
- Extend the PGE to have immutable state during render.
- Try using a different build tool instead of gulp/browserify.
