import Publications from './GameEngine/Publications';

const canvas = document.getElementById('gamecanvas');

const browserUI = {
  renderContext: canvas.getContext('2d'),
  height: canvas.height,
  width: canvas.width,
};

browserUI.publications = Publications(browserUI);
const publish = browserUI.publications.publish;

canvas.addEventListener('click', (evt) => {
  publish('click', {
    x: evt.offsetX,
    y: evt.offsetY,
  });
});

canvas.addEventListener('mousemove', (evt) => {
  publish('mouseMove', {
    x: evt.offsetX,
    y: evt.offsetY,
  });
});

canvas.addEventListener('mouseleave', (evt) => {
  publish('mouseLeave');
});

document.addEventListener('keypress', (evt) => {
  if (evt.which === 32) {
    publish('spacebarKey');
  }
});

export default browserUI;
