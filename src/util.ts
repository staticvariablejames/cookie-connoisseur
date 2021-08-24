/* Given a list of strings,
 * return a string->number object inverseMap such that
 *  inverseMap[map[i]] == i
 * for all i.
 */
export function invertMap( map: string[] ) : { [key: string] : number } {
    let inverseMap: { [name: string] : number } = {};
    for(let i in map) {
        inverseMap[map[i]] = Number(i);
    }
    return inverseMap;
}

export type ErrorHandler = (msg: string) => void;

/* Simple implementation of an ErrorHandler,
 * which simply throws an error with the given message.
 */
export const throwOnError: ErrorHandler = (msg: string) => {
    throw new Error(msg);
}

/* This is essentially a strict Object.assign.
 * Every attribute of the source is assigned to the corresponding attribute of the target,
 * but the attribute must exist in the target,
 * the types must match,
 * and the attribute must be a string, number or boolean
 * (so functions, arrays and objects are ignored).
 *
 * If either the target or the source are null (or not objects),
 * the target is returned unmodified.
 *
 * The subobjectName attribute is used to generate more helpful error messages.
 * By default, the function complains that e.g. "source.amount is not a number".
 * Setting subobjectName to '.wrinklers' changes it to "source.wrinklers.amount is not a number".
 */
export function pseudoObjectAssign<T>(
    target: T,
    source: any,
    onError: ErrorHandler,
    subobjectName: string = ''): T
{
    // TODO: improve typings
    let _target = target as any;
    if(_target === null || source === null) return _target;
    if(typeof _target != 'object' || _target == null) {
        onError('target is not an object');
        return _target;
    }
    if(typeof source != 'object' || source == null) {
        onError('source is not an object');
        return _target;
    }

    // Copy valid keys
    const validTypes = new Set(['number', 'boolean', 'string']);
    for(let key of Object.keys(_target)) {
        if(!(key in source)) continue;
        if(!validTypes.has(typeof _target[key])) continue;
        if(typeof _target[key] == typeof source[key]) {
            _target[key] = source[key];
        } else {
            onError(`source${subobjectName}.${key} is not a ${typeof _target[key]}`);
        }
    }

    // Complain about keys which don't exist on the target
    for(let key of Object.keys(source)) {
        if(!(key in _target)) {
            onError(`target${subobjectName}.${key} does not exist (typo?)`);
        }
    }

    return _target;
}
