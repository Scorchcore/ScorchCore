/**
 * Geodes Constants Tests
 * 
 * Verificar integridad de constantes de geodas
 */

import { describe, it, expect } from 'vitest';
import { CATEGORY_INFO, AXIE_CLASS_INFO, AxieClass, GeodeCategory } from '../geodes';

describe('CATEGORY_INFO', () => {
  it('should have info defined for all geode categories', () => {
    expect(CATEGORY_INFO).toBeDefined();
    expect(Object.keys(CATEGORY_INFO).length).toBe(5); // 5 categorías
  });

  it('should have valid structure for each category', () => {
    Object.values(CATEGORY_INFO).forEach(category => {
      expect(category).toHaveProperty('id');
      expect(category).toHaveProperty('name');
      expect(category).toHaveProperty('displayName');
      expect(category).toHaveProperty('rarity');
      expect(category).toHaveProperty('maxSupply');
      expect(category).toHaveProperty('miningPower');
      
      expect(typeof category.name).toBe('string');
      expect(typeof category.maxSupply).toBe('number');
      expect(typeof category.miningPower).toBe('number');
      expect(category.maxSupply).toBeGreaterThan(0);
      expect(category.miningPower).toBeGreaterThan(0);
    });
  });

  it('should have valid IDs matching enum', () => {
    expect(CATEGORY_INFO[GeodeCategory.PETIT]).toBeDefined();
    expect(CATEGORY_INFO[GeodeCategory.ALTO]).toBeDefined();
    expect(CATEGORY_INFO[GeodeCategory.ANIMAL]).toBeDefined();
    expect(CATEGORY_INFO[GeodeCategory.ULTRAMECH]).toBeDefined();
    expect(CATEGORY_INFO[GeodeCategory.TANQUE]).toBeDefined();
  });
});

describe('AXIE_CLASS_INFO', () => {
  it('should have info for all axie classes', () => {
    expect(AXIE_CLASS_INFO).toBeDefined();
    expect(Object.keys(AXIE_CLASS_INFO).length).toBe(9); // 9 clases de Axie
  });

  it('should have complete info for each class', () => {
    const allClasses = [
      AxieClass.BEAST,
      AxieClass.AQUA,
      AxieClass.BIRD,
      AxieClass.REPTILE,
      AxieClass.BUG,
      AxieClass.PLANT,
      AxieClass.MECH,
      AxieClass.DUSK,
      AxieClass.DAWN,
    ];

    allClasses.forEach(axieClass => {
      const classInfo = AXIE_CLASS_INFO[axieClass];
      expect(classInfo).toBeDefined();
      expect(classInfo).toHaveProperty('id');
      expect(classInfo).toHaveProperty('name');
      expect(classInfo).toHaveProperty('displayName');
      expect(classInfo).toHaveProperty('icon');
      expect(classInfo).toHaveProperty('color');
      
      expect(typeof classInfo.name).toBe('string');
      expect(typeof classInfo.displayName).toBe('string');
      expect(typeof classInfo.icon).toBe('string');
      expect(typeof classInfo.color).toBe('string');
      
      expect(classInfo.name.length).toBeGreaterThan(0);
      expect(classInfo.icon).toContain('/images/');
      expect(classInfo.color).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  it('should have unique IDs for each class', () => {
    const allClasses = Object.values(AxieClass).filter(v => typeof v === 'number') as AxieClass[];
    const ids = allClasses.map(cls => AXIE_CLASS_INFO[cls].id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  it('should have unique names for each class', () => {
    const allClasses = Object.values(AxieClass).filter(v => typeof v === 'number') as AxieClass[];
    const names = allClasses.map(cls => AXIE_CLASS_INFO[cls].name);
    const uniqueNames = new Set(names);
    expect(names.length).toBe(uniqueNames.size);
  });

  describe('Specific Classes', () => {
    it('should have BEAST class', () => {
      expect(AXIE_CLASS_INFO[AxieClass.BEAST]).toBeDefined();
      expect(AXIE_CLASS_INFO[AxieClass.BEAST].name).toBe('Beast');
    });

    it('should have AQUA class', () => {
      expect(AXIE_CLASS_INFO[AxieClass.AQUA]).toBeDefined();
      expect(AXIE_CLASS_INFO[AxieClass.AQUA].name).toBe('Aqua');
    });

    it('should have BIRD class', () => {
      expect(AXIE_CLASS_INFO[AxieClass.BIRD]).toBeDefined();
      expect(AXIE_CLASS_INFO[AxieClass.BIRD].name).toBe('Bird');
    });
  });
});

describe('Constants Consistency', () => {
  it('should have matching number of categories and IDs', () => {
    const categoryKeys = Object.keys(CATEGORY_INFO);
    const categoryEnumValues = Object.values(GeodeCategory).filter(v => typeof v === 'number');
    expect(categoryKeys.length).toBe(categoryEnumValues.length);
  });

  it('should have matching number of axie classes and IDs', () => {
    const classKeys = Object.keys(AXIE_CLASS_INFO);
    const classEnumValues = Object.values(AxieClass).filter(v => typeof v === 'number');
    expect(classKeys.length).toBe(classEnumValues.length);
  });
});
