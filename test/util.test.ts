import { test, expect } from '@playwright/test';
import { invertMap } from '../src/util';

test('invertMap inverts maps', () => {
    let map = ['zero', 'one', 'two'];
    let inverseMap = invertMap(map);
    expect(inverseMap).toEqual({
        'zero': 0,
        'one': 1,
        'two': 2,
    });
});
