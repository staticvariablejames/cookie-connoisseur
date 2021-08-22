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
