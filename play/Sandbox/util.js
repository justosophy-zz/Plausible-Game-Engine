export const randomColour = ({
  r = ((Math.random() * 255) | 0),
  g = ((Math.random() * 255) | 0),
  b = ((Math.random() * 255) | 0),
  a = '0.6',
}) => {
  return `rgba(${r},${g},${b},${a})`;
};
