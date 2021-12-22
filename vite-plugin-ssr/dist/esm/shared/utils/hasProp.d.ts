export { hasProp };
declare function hasProp<ObjectType, PropName extends PropertyKey>(obj: ObjectType, prop: PropName, type: 'boolean'): obj is ObjectType & Record<PropName, boolean>;
declare function hasProp<ObjectType, PropName extends PropertyKey>(obj: ObjectType, prop: PropName, type: 'number'): obj is ObjectType & Record<PropName, number>;
declare function hasProp<ObjectType, PropName extends PropertyKey>(obj: ObjectType, prop: PropName, type: 'string'): obj is ObjectType & Record<PropName, string>;
declare function hasProp<ObjectType, PropName extends PropertyKey>(obj: ObjectType, prop: PropName, type: 'object'): obj is ObjectType & Record<PropName, Record<string, unknown>>;
declare function hasProp<ObjectType, PropName extends PropertyKey>(obj: ObjectType, prop: PropName, type: 'array'): obj is ObjectType & Record<PropName, unknown[]>;
declare function hasProp<ObjectType, PropName extends PropertyKey>(obj: ObjectType, prop: PropName, type: 'string[]'): obj is ObjectType & Record<PropName, string[]>;
declare function hasProp<ObjectType, PropName extends PropertyKey>(obj: ObjectType, prop: PropName, type: 'function'): obj is ObjectType & Record<PropName, (...args: any[]) => unknown>;
declare function hasProp<ObjectType, PropName extends PropertyKey>(obj: ObjectType, prop: PropName, type: 'null'): obj is ObjectType & Record<PropName, null>;
declare function hasProp<ObjectType, PropName extends PropertyKey, Enum>(obj: ObjectType, prop: PropName, type: Enum[]): obj is ObjectType & Record<PropName, Enum>;
declare function hasProp<ObjectType, PropName extends PropertyKey>(obj: ObjectType, prop: PropName): obj is ObjectType & Record<PropName, unknown>;
//# sourceMappingURL=hasProp.d.ts.map