import { getPropertyValue } from '../src';

interface Person {
  age: number;
  name: {
    first: string;
    middle?: string;
    last: string;
  };
}

describe('property-value', () => {
  describe('getPropertyValue', () => {
    it('should return a string containing the message', () => {
      const p: Person = {
        age: 15,
        name: {
          first: 'Yuyi',
          last: 'Xue',
        },
      };

      const firstName = getPropertyValue(p, 'name.first');
      expect(firstName).toStrictEqual('Yuyi');

      const age = getPropertyValue(p, 'age');
      expect<number>(age).toBe(15);
    });
  });
});
