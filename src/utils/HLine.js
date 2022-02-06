import { handlePrefix } from "./HandlePrefix";


export const getHLine = (result) => {
  const lines = result.split("\n");

  const data = lines
    .map((line) => line.split(",").map((item) => item.trim()))
    .filter((line) => line.length > 2);
  const titles = data.shift();

  // Signals Data Structure
  // ex: {title: 'SFX', columnIndex: 2}
  const prefixSignals = titles
    .map((title, columnIndex) => ({ title, columnIndex }))
    .filter((obj) => obj.columnIndex > 1 && obj.title !== "");

  const dataSignals = prefixSignals.map((signal) => {
    const { title, columnIndex } = signal;
    return {
      title,
      data: data.map((line) => ({
        value: line[columnIndex],
        trailingTexture: handlePrefix(line[0]) + "_" + line[1],
      })),
    };
  });

  const dataTextureObjs = dataSignals.map((signal) => {
    const { title, data } = signal;
    return {
      title,
      data: data.map(({ value, trailingTexture }) => {
        let valueNumber = 0;
        try {
          valueNumber = Number.parseInt(value);
        } catch (err) { }

        const textures = [];
        for (let i = 1; i <= valueNumber; i++) {
          const valueNumberTexture = i < 10 ? `0${i}` : `${i}`;
          textures.push(title + valueNumberTexture + "_" + trailingTexture);
        }
        return textures;
      }),
    };
  });

  const HLine = dataTextureObjs
    .reduce((prev, cur) => [...prev, ...cur.data], [])
    .reduce((prev, cur) => [...prev, ...cur], []);
  return HLine;
}