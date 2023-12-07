const getSecondDiff = (d1, d2) => {
  const t1 = d1.getTime();
  const t2 = d2.getTime();
  return parseInt((t2 - t1) / 1000);
};


export {getSecondDiff};