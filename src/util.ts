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
 *
 * This is the default value of the onError argument for the .fromObject static methods.
 * Rationale:
 * The intended usage of CCSave.fromObject is in test cases,
 * always passing an object defined locally
 * (as opposed to e.g. user input).
 * So having the function loudly crash the test ensures correctness,
 * as opposed to silently igonring the error.
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
 * If either the target or the source are null or undefined,
 * the target is returned unmodified.
 * Otherwise, if either the target or the source are not objects,
 * the function still returns the target unmodified but complains to onError first.
 *
 * The subobjectName attribute is used to generate more helpful error messages.
 * By default, the function complains that e.g. "source.amount is not a number".
 * Setting subobjectName to '.wrinklers' changes it to "source.wrinklers.amount is not a number".
 *
 *
 * Rationale:
 *
 * The classes in `ccsave.ts` have many attributes, but all of them have default values.
 * It makes sense to provide a way to construct objects of those classes
 * by choosing a few values, and leave the remaining values with their default value.
 * This function is meant to aid this operation;
 * `target` is meant to be a default-constructed object,
 * and `source` is meant to be a list of attributes to override.
 * Complaining about extraneous keys in `source` avoids typos,
 * and type-checking allows for `source` to be any object, including the output from JSON.parse.
 *
 * This function does not operate on attributes which are functions, arrays and objects
 * because these have more complex behavior and should be handled manually.
 *
 * Since it is expected that many of those nested objects to be handled using pseudoObjectAssign,
 * the argument subobjectName makes the error messages more helpful.
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
    if(_target === undefined || source === undefined) return _target;
    if(typeof _target != 'object') {
        onError(`target${subobjectName} is not an object`);
        return _target;
    }
    if(typeof source != 'object') {
        onError(`source${subobjectName} is not an object`);
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
