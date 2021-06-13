import cs from './cs';

it('removes null and undefined', () => {
    const input = ['name', false, null, 'name1'];
    const result = cs(...input);
    const expected = 'name name1';

    expect(result).toEqual(expected);
});

it('remove false values from object', () => {
    const input = ['name', false, { 'name1': true, 'name2': false }];
    const result = cs(...input);
    const expected = 'name name1';

    expect(result).toEqual(expected);
});

it('remove false values from array', () => {
    const input = ['name', false, [ 'name1', true], [ 'name2', false]];
    const result = cs(...input);
    const expected = 'name name1';

    expect(result).toEqual(expected);
});

it('works in single value', () => {
    const input = ['name'];
    const result = cs(...input);
    const expected = 'name';

    expect(result).toEqual(expected);
});
