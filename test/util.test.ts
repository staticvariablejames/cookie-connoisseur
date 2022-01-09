import { test, expect } from '@playwright/test';
import { invertMap, pseudoObjectAssign, throwOnError, sha1sumFromBuffer } from '../src/util';

test('invertMap inverts maps', () => {
    let map = ['zero', 'one', 'two'];
    let inverseMap = invertMap(map);
    expect(inverseMap).toEqual({
        'zero': 0,
        'one': 1,
        'two': 2,
    });
});

test.describe('pseudoObjectAssign', () => {
    // Simple mocking
    function makeOnErrorMock() {
        let obj = {
            msg: '',
            onError: (msg: string) => {
                obj.msg = msg;
            },
        };
        return obj;
    }

    test('works for full copy', () => {
        let mock = makeOnErrorMock();
        let target = {a: 6, b: 'six', c: false};
        let source = {a: 5, b: 'five', c: true};
        let out = pseudoObjectAssign(target, source, mock.onError);
        expect(out).toBe(target);
        expect(out).toEqual(source);
        expect(mock.msg).toEqual('');
    });

    test('works for partial copy', () => {
        let mock = makeOnErrorMock();
        let target = {a: 6, b: 'six', c: false};
        let out = pseudoObjectAssign(target, {a: 7}, mock.onError);
        expect(out).toEqual({a: 7, b: 'six', c: false});
        expect(mock.msg).toEqual('');

        out = pseudoObjectAssign(target, {b: 'seven', c: true}, mock.onError);
        expect(out).toEqual({a: 7, b: 'seven', c: true});
        expect(mock.msg).toEqual('');
    });

    test('ignores null and undefined', () => {
        let mock = makeOnErrorMock();
        expect(pseudoObjectAssign({a: 5}, null, mock.onError)).toMatchObject({a: 5});
        expect(mock.msg == '');

        mock = makeOnErrorMock();
        expect(pseudoObjectAssign(null, {a: 5}, mock.onError)).toBeNull();
        expect(mock.msg == '');

        mock = makeOnErrorMock();
        expect(pseudoObjectAssign({a: 5}, undefined, mock.onError)).toMatchObject({a: 5});
        expect(mock.msg == '');

        mock = makeOnErrorMock();
        expect(pseudoObjectAssign(undefined, {a: 5}, mock.onError)).toBeUndefined();
        expect(mock.msg == '');
    });

    test('complains about mismatched types', () => {
        let mock = makeOnErrorMock();
        let out = pseudoObjectAssign({a: 5}, {a: true}, mock.onError);
        expect(mock.msg).toContain('source.a is not a number');
        expect(out).toEqual({a: 5});
    });

    test('complains about extraneous keys', () => {
        let mock = makeOnErrorMock();
        let out = pseudoObjectAssign({a: 5}, {a: 3, b: true}, mock.onError);
        expect(mock.msg).toContain('target.b does not exist');
        expect(out).toEqual({a: 3}); // Complains but do its job
    });

    test('complains if arguments are not objects', () => {
        let mock = makeOnErrorMock();
        pseudoObjectAssign('a', {}, mock.onError);
        expect(mock.msg).toContain('target is not an object');

        mock = makeOnErrorMock();
        pseudoObjectAssign({}, 'a', mock.onError);
        expect(mock.msg).toContain('source is not an object');
    });

    test('leaves alone arrays, functions, and objects', () => {
        let mock = makeOnErrorMock();
        let originalTarget = {
            a: [1],
            b: (x: number) => 2 * x,
            c: {d: 5},
        };
        let target = {...originalTarget};
        let source = {
            a: [2],
            b: (x: number) => 3 * x,
            c: {d: 6},
        };
        let obj = pseudoObjectAssign(target, source, mock.onError);
        expect(obj).toEqual(originalTarget);
        expect(mock.msg).toBe('');
    });

    test('complains multiple times if needed', () => {
        let messages: string[] = [];
        let onError = (msg: string) => {messages.push(msg)};
        pseudoObjectAssign({a: true}, {a: 'true', b: false}, onError);
        expect(messages.length).toBe(2);
        expect(messages[0]).toContain('source.a is not a boolean');
        expect(messages[1]).toContain('target.b does not exist');
    });

    test('modifies its complaints according to subobjectName', () => {
        let mock = makeOnErrorMock();
        pseudoObjectAssign({}, {a: 1}, mock.onError, '.wrinklers');
        expect(mock.msg).toContain('target.wrinklers.a does not exist');

        mock = makeOnErrorMock();
        pseudoObjectAssign({a: 1}, {a: true}, mock.onError, '["Wizard towers"]');
        expect(mock.msg).toContain('source["Wizard towers"].a is not a number');

        mock = makeOnErrorMock();
        pseudoObjectAssign({a: 1}, true, mock.onError, '.prefs');
        expect(mock.msg).toContain('source.prefs is not an object');

        mock = makeOnErrorMock();
        pseudoObjectAssign(false, {a: 1}, mock.onError, '.prefs');
        expect(mock.msg).toContain('target.prefs is not an object');
    });
});

test('sha1sumFromBuffer', () => {
    let str = 'abcde';
    let buffer = Buffer.from(str, 'utf8');
    expect(sha1sumFromBuffer(buffer)).toEqual('03de6c570bfe24bfc328ccd7ca46b76eadaf4334');
});
