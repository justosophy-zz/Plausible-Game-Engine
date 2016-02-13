export const randomColour = (options = {}) => {
  const {
    r = ((Math.random() * 255) | 0),
    g = ((Math.random() * 255) | 0),
    b = ((Math.random() * 255) | 0),
    a = '0.6',
  } = options;
  return `rgba(${r},${g},${b},${a})`;
};

export const filledArray = (count, value = true) => {
  if (typeof count !== 'number') {
    return [];
  }
  return (new Array(count)).fill(value);
};

export const lerp = (start = 0, end = 1, fraction = 1) => {
  return start + fraction * (end - start);
};
