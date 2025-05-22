export const transformDate = (date) => {
  const current = new Date();
  const original = new Date(date);
  const delta = Math.abs(current - original);
  const seconds = Math.floor((delta / 1000) % 60);
  const minutes = Math.floor((delta / (1000 * 60)) % 60);
  const hours = Math.floor((delta / (1000 * 60 * 60)) % 24);
  const days = Math.floor(delta / (1000 * 60 * 60 * 24));

  if (days > 0) {
    return `${days} 일 전`;
  } else if (hours > 1) {
    return `${hours} 시간 전`;
  } else if (minutes > 59) {
    return `${hours} 시간전`;
  } else if (minutes > 4) {
    return `${minutes} 분전`;
  } else {
    return '방금 전 ';
  }
};
