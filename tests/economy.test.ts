import { describe, it, expect } from 'vitest';
import { VISAS, ALL_VISAS } from '../src/data/visas';
import { GOODS } from '../src/data/goods';

describe('Economy & Data Integrity', () => {
  it('should have exactly 10 visas', () => {
    expect(ALL_VISAS.length).toBe(10);
  });

  it('every visa produces a valid good', () => {
    ALL_VISAS.forEach(visa => {
      expect(GOODS[visa.produces]).toBeDefined();
    });
  });

  it('every visa requires valid goods', () => {
    ALL_VISAS.forEach(visa => {
      visa.requires.forEach(reqId => {
        expect(GOODS[reqId]).toBeDefined();
      });
    });
  });

  it('should have no direct self-dependency (visa requires its own produced good)', () => {
    ALL_VISAS.forEach(visa => {
      expect(visa.requires.includes(visa.produces)).toBe(false);
    });
  });

  it('should have base prices scaling with rarity', () => {
    const simple = VISAS['zhiest'];
    const collection = VISAS['time2359'];
    expect(GOODS[collection.produces].basePrice).toBeGreaterThan(GOODS[simple.produces].basePrice);
    expect(collection.rentPrice).toBeGreaterThan(simple.rentPrice);
  });
});