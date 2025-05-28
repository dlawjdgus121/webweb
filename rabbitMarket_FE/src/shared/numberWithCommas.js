export function numberWithCommas(x) {
  if (x === null || x === undefined) return '';
  const before = new String(x);

  const edited = x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return edited;
}
