export { higherFirst };
export { lowerFirst };
export { makeFirst };
declare function higherFirst<T>(getValue: (element: T) => number): (element1: T, element2: T) => 0 | 1 | -1;
declare function lowerFirst<T>(getValue: (element: T) => number): (element1: T, element2: T) => 0 | 1 | -1;
declare function makeFirst<T>(getValue: (element: T) => boolean): (element1: T, element2: T) => 0 | 1 | -1;
//# sourceMappingURL=sorter.d.ts.map