export function getNowDate() {
  const now = new Date();
  const year = now.getFullYear(), month = now.getMonth() + 1, date = now.getDate();
  const Time = `${year}-${month < 10 ? `0${month}` : month}-${date < 10 ? `0${date}` : date}`;
  return Time;
}