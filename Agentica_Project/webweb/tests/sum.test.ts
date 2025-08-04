import { sum } from '../functions/sum';

test('sum(2, 3)은 5를 반환해야 함', () => {
  expect(sum(2, 3)).toBe(5);
});

test('sum(-1, 1)은 0을 반환해야 함', () => {
  expect(sum(-1, 1)).toBe(0);
});
