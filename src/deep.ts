import { v4 as uuidv4 } from 'uuid';
import { Observable } from '@gullerya/object-observer';
import On, { OnI } from './on.js';

let isSymbol = it => typeof it === "symbol";
let isUndefined = it => it === undefined;
let isPromise = it => it instanceof Promise;
let isBoolean = it => typeof it === "boolean";
let isString = it => typeof it === "string";
let isNumber = it => typeof it === "number";
let isBigInt = it => typeof it === "bigint";
let isSet = it => it instanceof Set;
let isWeakSet = it => it instanceof WeakSet;
let isMap = it => it instanceof Map;
let isWeakMap = it => it instanceof WeakMap;
let isArray = it => Array.isArray(it);
let isObject = it => typeof it === "object" && it !== null;
let isFunction = it => typeof it === "function";

const makeIterator = (it) => {
  if (isSet(it) || isMap(it)) return it.values();
  if (isObject(it)) {
    let data = it;
    if (!isArray(data)) data = Object.values(data);
    var index = -1;
    return {
      next: () => ({ value: data[++index], done: !(index in data) })
    };
  } else {
    let data = it;
    return {
      next: () => {
        data = undefined;
        return { value: data, done: !data };
      },
    };
  }
};

let isPlainObject = it => it?.constructor === Object;
let isDeep = it => typeof(it) === 'object' && it instanceof Deep;
let isValue = it => !isDeep(it) && !isUndefined(it);

/**
 * Index class provides a dual-indexing system for managing relationships between values.
 * It maintains both one-to-one and one-to-many mappings between keys and values.
 */
export class Index {
  /** Internal map for one-to-many relationships */
  _many = new Map<any, Set<any>>;
  
  /** Internal map for one-to-one relationships */
  _one = new Map<any, any>;

  /**
   * Retrieves or creates a Set for storing multiple values associated with a key
   * @param key The key to get or create a Set for
   * @returns A Set containing all values associated with the key
   */
  many(key: any): Set<any> {
    let set = this._many.get(key);
    if (!set) {
      this._many.set(key, set = new Set());
    }
    return set;
  }

  /**
   * Associates a key with a value and maintains the reverse mapping
   * @param key The key to associate
   * @param value The value to associate with the key
   * @returns The value that was set
   */
  set(key: any, value: any): any {
    this._one.set(key, value);
    const set = this._many.get(value) || new Set();
    this._many.set(value, set);
    set.add(key);
    return value;
  }

  /**
   * Retrieves the value associated with a key
   * @param key The key to look up
   * @returns The value associated with the key
   */
  get(key: any): any {
    return this._one.get(key);
  }

  /**
   * Removes the association between a key and its value
   * @param key The key to remove
   */
  unset(key) {
    const value = this._one.get(key);
    this._one.delete(key);
    const set = this._many.get(value);
    if (set) set.delete(key);
  }
}

/**
 * Memory class manages the internal state and relationships of Deep instances.
 * It maintains indices for values, types, and relationships between nodes.
 */
export class Memory {
  /** Index for storing and retrieving values associated with Deep instances */
  values: Index;
  
  /** Index for managing type relationships between Deep instances */
  types: Index;
  
  /** Index for tracking outgoing relationships (from -> to) */
  froms: Index;
  
  /** Index for tracking incoming relationships (to -> from) */
  tos: Index;
  
  /** Set containing all Deep instances in memory */
  all: Set<any>;

  /**
   * Initializes a new Memory instance with empty indices for values, types,
   * and relationships. Creates a new storage space for Deep instances.
   */
  constructor() {
    this.values = this.values || new Index();
    this.types = this.types || new Index();
    this.froms = this.froms || new Index();
    this.tos = this.tos || new Index();
    this.all = this.all || new Set();
  }
}

export interface DeepEvent {
  name: 'change';
  deep: Deep;
  prev: {
    id?: string;
    type?: Deep;
    from?: Deep;
    to?: Deep;
    value?: any;
  };
  next: {
    id?: string;
    type?: Deep;
    from?: Deep;
    to?: Deep;
    value?: any;
  };
}

interface Pack {
  deep: Array<{
    id: string;
    type?: string;
    from?: string;
    to?: string;
    value?: number;
  }>;
  values: Array<{
    value?: any;
    type: string;
  }>;
}

export class Deep {
  [key: string]: any;

  /**
   * Checks if the given value is a Deep instance
   * @param it - Value to check
   * @returns True if the value is a Deep instance
   */
  isDeep(it) { return isDeep(it); }

  /**
   * Checks if the given value is a non-Deep value and not undefined
   * @param it - Value to check
   * @returns True if the value is neither Deep nor undefined
   */
  isValue(it) { return isValue(it); }

  deep: Deep;
  memory: Memory;
  _events?: boolean;
  
  /**
   * Creates a new Deep instance with the given deep as the root agent Deep with memory index.
   * @param deep - Parent Deep instance
   */
  constructor(deep?: Deep) {
    this.deep = deep || this;
    if (this == this.deep) {
      const deep = this.deep;
      deep.memory = new Memory();

      const _insert = (type?: any, from?: any, to?: any, value?: any) => {
        const next = type.new();
        if (type) next.type = type;
        if (from) next.from = from;
        if (to) next.to = to;
        if (value) next.value = value;
        return next;
      };

      const Value = deep.new();

      deep.Symbol = Value.new();
      deep.Undefined = Value.new();
      deep.Promise = Value.new();
      deep.Boolean = Value.new();
      deep.String = Value.new();
      deep.Number = Value.new();
      deep.BigInt = Value.new();
      deep.Set = Value.new();
      deep.WeakSet = Value.new();
      deep.Map = Value.new();
      deep.WeakMap = Value.new();
      deep.Array = Value.new();
      deep.Object = Value.new();
      deep.Function = Value.new();

      const Contain = deep.new(); const c = deep.new();
      c.type = Contain; c.from = deep; c.to = Contain; c.value = 'Contain';

      deep.Contain = deep.contains.Contain = this.Contain = Contain;

      const deepName = _insert(Contain, deep, deep, 'deep');

      const Everything = deep.Everything = deep.contains.Everything = deep.wrap(deep.memory.all);
      const Nothing = deep.Nothing = deep.contains.Nothing = deep.new();
      const Unxpected = deep.Unxpected = deep.contains.Unxpected = deep.new();
      const Any = deep.contains.Any = deep.new();

      deep.contains.Value = Value;

      const Id = deep.Id = deep.contains.Id = deep.new();

      const Exp = deep.Exp = deep.contains.Exp = deep.new();
      const Selection = deep.Selection = deep.contains.Selection = _insert(deep, Value);

      const Relation = deep.Relation = deep.contains.Relation = deep.new();

      deep.Many = deep.contains.Many = Relation.new();
      deep.One = deep.contains.One = Relation.new();

      deep.contains.id = deep.__id = Relation.new();

      deep.contains.type = deep.__type = deep.contains.One.new();
      deep.contains.typed = deep.__typed = deep.contains.Many.new();
      deep.contains.from = deep.__from = deep.contains.One.new();
      deep.contains.out = deep.__out = deep.contains.Many.new();
      deep.contains.to = deep.__to = deep.contains.One.new();
      deep.contains.in = deep.__in = deep.contains.Many.new();
      deep.contains.value = deep.__value = deep.contains.One.new();
      deep.contains.valued = deep.__valued = deep.contains.Many.new();

      const Condition = deep.Condition = deep.contains.Condition = Relation.new();

      // deep.contains.eq = Condition.new();
      // deep.contains.neq = Condition.new();
      // deep.contains.gt = Condition.new();
      // deep.contains.lt = Condition.new();
      // deep.contains.gte = Condition.new();
      // deep.contains.lte = Condition.new();
      // deep.contains.in = Condition.new();
      // deep.contains.nin = Condition.new();

      const Logic = deep.Logic = deep.contains.Logic = Relation.new();

      const and = deep.contains.and = Logic.new();
      const or = deep.contains.or = Logic.new();
      const not = deep.contains.not = Logic.new();

      const Order = deep.Order = deep.contains.Order = Relation.new();

      deep.contains.relations = deep.new({
        'type': { one: true, many: false, invert: 'typed' },
        'typed': { one: true, many: false, invert: 'type' },
        'from': { one: true, many: false, invert: 'out' },
        'out': { one: true, many: false, invert: 'from' },
        'to': { one: true, many: false, invert: 'in' },
        'in': { one: true, many: false, invert: 'to' },
        'value': { one: true, many: false, invert: 'valued' },
        'valued': { one: true, many: false, invert: 'value' },
      });

      deep.contains.Symbol = deep.Symbol;
      deep.contains.Undefined = deep.Undefined;
      deep.contains.Promise = deep.Promise;
      deep.contains.Boolean = deep.Boolean;
      deep.contains.String = deep.String;
      deep.contains.Number = deep.Number;
      deep.contains.BigInt = deep.BigInt;
      deep.contains.Set = deep.Set;
      deep.contains.WeakSet = deep.WeakSet;
      deep.contains.Map = deep.Map;
      deep.contains.WeakMap = deep.WeakMap;
      deep.contains.Array = deep.Array;
      deep.contains.Object = deep.Object;
      deep.contains.Function = deep.Function;

      deep.contains.Unexpected = deep.new();

      const Is = deep.contains.Is = deep.new();

      deep.contains.isSymbol = _insert(Is, undefined, undefined, isSymbol);
      deep.contains.isUndefined = _insert(Is, undefined, undefined, isUndefined);
      deep.contains.isPromise = _insert(Is, undefined, undefined, isPromise);
      deep.contains.isBoolean = _insert(Is, undefined, undefined, isBoolean);
      deep.contains.isString = _insert(Is, undefined, undefined, isString);
      deep.contains.isNumber = _insert(Is, undefined, undefined, isNumber);
      deep.contains.isBigInt = _insert(Is, undefined, undefined, isBigInt);
      deep.contains.isSet = _insert(Is, undefined, undefined, isSet);
      deep.contains.isWeakSet = _insert(Is, undefined, undefined, isWeakSet);
      deep.contains.isMap = _insert(Is, undefined, undefined, isMap);
      deep.contains.isWeakMap = _insert(Is, undefined, undefined, isWeakMap);
      deep.contains.isArray = _insert(Is, undefined, undefined, isArray);
      deep.contains.isObject = _insert(Is, undefined, undefined, isObject);
      deep.contains.isFunction = _insert(Is, undefined, undefined, isFunction);

      deep.contains.isDeep = Is.new(isDeep);
      deep.contains.isValue = Is.new(isValue);

      deep.orderIs = deep.contains.orderIs = deep.new([
        deep.contains.isSymbol,
        deep.contains.isUndefined,
        deep.contains.isPromise,
        deep.contains.isBoolean,
        deep.contains.isString,
        deep.contains.isNumber,
        deep.contains.isBigInt,
        deep.contains.isSet,
        deep.contains.isWeakSet,
        deep.contains.isMap,
        deep.contains.isWeakMap,
        deep.contains.isArray,
        deep.contains.isObject,
        deep.contains.isFunction,
      ]);

      const Isable = deep.Isable = deep.contains.Isable = deep.new();

      _insert(Isable, deep.contains.isSymbol, deep.contains.Symbol);
      _insert(Isable, deep.contains.isUndefined, deep.contains.Undefined);
      _insert(Isable, deep.contains.isPromise, deep.contains.Promise);
      _insert(Isable, deep.contains.isBoolean, deep.contains.Boolean);
      _insert(Isable, deep.contains.isString, deep.contains.String);
      _insert(Isable, deep.contains.isNumber, deep.contains.Number);
      _insert(Isable, deep.contains.isBigInt, deep.contains.BigInt);
      _insert(Isable, deep.contains.isSet, deep.contains.Set);
      _insert(Isable, deep.contains.isWeakSet, deep.contains.WeakSet);
      _insert(Isable, deep.contains.isMap, deep.contains.Map);
      _insert(Isable, deep.contains.isWeakMap, deep.contains.WeakMap);
      _insert(Isable, deep.contains.isArray, deep.contains.Array);
      _insert(Isable, deep.contains.isObject, deep.contains.Object);
      _insert(Isable, deep.contains.isFunction, deep.contains.Function);

      const Method = deep.contains.Method = deep.new();

      deep.contains.MethodHas = Method.new()
      deep.contains.MethodGet = Method.new()
      deep.contains.MethodSize = Method.new()
      deep.contains.MethodMap = Method.new()
      deep.contains.MethodAdd = Method.new()
      deep.contains.MethodSet = Method.new()
      deep.contains.MethodUnset = Method.new()
      deep.contains.MethodKeys = Method.new()
      deep.contains.MethodValues = Method.new()
      deep.contains.MethodFind = Method.new()
      deep.contains.MethodFilter = Method.new()
      deep.contains.MethodEach = Method.new()
      deep.contains.MethodSort = Method.new()
      deep.contains.MethodReduce = Method.new()
      deep.contains.MethodFirst = Method.new()
      deep.contains.MethodLast = Method.new()
      deep.contains.MethodJoin = Method.new()
      deep.contains.MethodToString = Method.new()
      deep.contains.MethodValueOf = Method.new()
      
      deep.Compatable = deep.contains.Compatable = _insert(deep, Any, Any);

      // Any
    
      deep.contains.AnyHas = deep.contains.MethodHas.new((current, it) => current.call === it);
      _insert(deep.contains.Compatable, deep.contains.AnyHas, deep.contains.Any);

      deep.contains.AnyGet = deep.contains.MethodGet.new((current, it) => current.call === it ? it : undefined);
      _insert(deep.contains.Compatable, deep.contains.AnyGet, deep.contains.Any);

      deep.contains.AnySize = deep.contains.MethodSize.new((current) => 1);
      _insert(deep.contains.Compatable, deep.contains.AnySize, deep.contains.Any);

      deep.contains.AnyMap = deep.contains.MethodMap.new((current, callback = (value, key) => value) => [callback(current.call, current.call)]);
      _insert(deep.contains.Compatable, deep.contains.AnyMap, deep.contains.Any);

      deep.contains.AnyAdd = deep.contains.MethodAdd.new((current, it) => it);
      _insert(deep.contains.Compatable, deep.contains.AnyAdd, deep.contains.Any);

      deep.contains.AnySet = deep.contains.MethodSet.new((current, key, value) => current.call);
      _insert(deep.contains.Compatable, deep.contains.AnySet, deep.contains.Any);

      deep.contains.AnyUnset = deep.contains.MethodUnset.new((current, key) => false);
      _insert(deep.contains.Compatable, deep.contains.AnyUnset, deep.contains.Any);

      deep.contains.AnyKeys = deep.contains.MethodKeys.new((current) => []);
      _insert(deep.contains.Compatable, deep.contains.AnyKeys, deep.contains.Any);

      deep.contains.AnyValues = deep.contains.MethodValues.new((current) => [current.call]);
      _insert(deep.contains.Compatable, deep.contains.AnyValues, deep.contains.Any);

      deep.contains.AnyFind = deep.contains.MethodFind.new((current, callback: (value: any, key: any) => boolean): any => !!callback(current.call, current.call) ? current.call : undefined);
      _insert(deep.contains.Compatable, deep.contains.AnyFind, deep.contains.Any);

      deep.contains.AnyFilter = deep.contains.MethodFilter.new((current, callback: (value: any, key: any) => boolean): any => !!callback(current.call, current.call) ? [current.call] : []);
      _insert(deep.contains.Compatable, deep.contains.AnyFilter, deep.contains.Any);

      deep.contains.AnyEach = deep.contains.MethodEach.new((current, callback: (value: any, key: any) => boolean): any => (callback(current.call, current.call), undefined));
      _insert(deep.contains.Compatable, deep.contains.AnyEach, deep.contains.Any);

      deep.contains.AnySort = deep.contains.MethodSort.new((current, callback: (a: any, b: any) => boolean): any => [current.callback]);
      _insert(deep.contains.Compatable, deep.contains.AnySort, deep.contains.Any);

      deep.contains.AnyReduce = deep.contains.MethodReduce.new((current, callback: (accumulator: any, currentValue?: any) => any, initialValue?: any): any => callback(initialValue, current.call));
      _insert(deep.contains.Compatable, deep.contains.AnyReduce, deep.contains.Any);

      deep.contains.AnyFirst = deep.contains.MethodFirst.new((current): any => current.call);
      _insert(deep.contains.Compatable, deep.contains.AnyFirst, deep.contains.Any);

      deep.contains.AnyLast = deep.contains.MethodLast.new((current): any => current.call);
      _insert(deep.contains.Compatable, deep.contains.AnyLast, deep.contains.Any);

      deep.contains.AnyJoin = deep.contains.MethodJoin.new((current): any => (current.call).toString());
      _insert(deep.contains.Compatable, deep.contains.AnyJoin, deep.contains.Any);

      deep.contains.AnyToString = deep.contains.MethodToString.new((current): any => (current.call).toString());
      _insert(deep.contains.Compatable, deep.contains.AnyToString, deep.contains.Any);

      deep.contains.AnyValueOf = deep.contains.MethodJoin.new((current): any => (current.call));
      _insert(deep.contains.Compatable, deep.contains.AnyValueOf, deep.contains.Any);

      // Undefined

      // Promise
      
      // Boolean

      deep.contains.BooleanSize = deep.contains.MethodSize.new((current) => current.call ? 1 : 0);
      _insert(deep.contains.Compatable, deep.contains.BooleanSize, deep.contains.Boolean);
      
      // String

      deep.contains.StringSize = deep.contains.MethodSize.new((current) => current.call.length);
      _insert(deep.contains.Compatable, deep.contains.StringSize, deep.contains.String);
      
      // Number

      deep.contains.NumberSize = deep.contains.MethodSize.new((current) => String(current.call).length);
      _insert(deep.contains.Compatable, deep.contains.NumberSize, deep.contains.Number);

      // BigInt
      _insert(deep.contains.Compatable, deep.contains.NumberSize, deep.contains.BigInt);

      // Set

      deep.contains.SetHas = deep.contains.MethodHas.new((current, it) => { return current.call.has(it); });
      _insert(deep.contains.Compatable, deep.contains.SetHas, deep.contains.Set);

      deep.contains.SetGet = deep.contains.MethodGet.new((current, key) => { return current.call.has(key) ? key : undefined; });
      _insert(deep.contains.Compatable, deep.contains.SetGet, deep.contains.Set);

      deep.contains.SetSize = deep.contains.MethodSize.new((current, it) => { return current.call.size; });
      _insert(deep.contains.Compatable, deep.contains.SetSize, deep.contains.Set);

      deep.contains.SetMap = deep.contains.MethodMap.new((current, callback = (v, k) => v) => {
        const result: any = [];
        for (let value of current.call) { result.push(callback(value, value)); }
        return result;
      });
      _insert(deep.contains.Compatable, deep.contains.SetMap, deep.contains.Set);

      deep.contains.SetAdd = deep.contains.MethodAdd.new((current, value) => {
        const exists = current.call.has(value);
        if (!exists) current.call.add(value);
        return !exists;
      });
      _insert(deep.contains.Compatable, deep.contains.SetAdd, deep.contains.Set);

      deep.contains.SetSet = deep.contains.MethodSet.new((current, key, value) => {
        if (key !== value) throw new Error(` Can't set into Set when key != value`);
        current.call.add(value);
        return current;
      });
      _insert(deep.contains.Compatable, deep.contains.SetSet, deep.contains.Set);

      deep.contains.SetUnset = deep.contains.MethodUnset.new((current, key) => {
        return current.call.delete(key);
      });
      _insert(deep.contains.Compatable, deep.contains.SetUnset, deep.contains.Set);

      deep.contains.SetKeys = deep.contains.MethodKeys.new((current) => {
        return current.map((value, key) => key);
      });
      _insert(deep.contains.Compatable, deep.contains.SetKeys, deep.contains.Set);

      deep.contains.SetValues = deep.contains.MethodValues.new((current) => {
        return current.map((value, key) => value);
      });
      _insert(deep.contains.Compatable, deep.contains.SetValues, deep.contains.Set);

      deep.contains.SetFind = deep.contains.MethodFind.new((current, callback: (value: any, key: any) => boolean) => {
        for (let value of current.call) {
          const answer = callback(value, value);
          if (answer) return value;
        }
        return undefined;
      });
      _insert(deep.contains.Compatable, deep.contains.SetFind, deep.contains.Set);

      deep.contains.SetFilter = deep.contains.MethodFilter.new((current, callback: (value: any, key: any) => boolean): any => {
        const result: any = [];
        for (let value of current.call) {
          if (callback(value, value)) result.push(value);
        }
        return result;
      });
      _insert(deep.contains.Compatable, deep.contains.SetFilter, deep.contains.Set);

      deep.contains.SetEach = deep.contains.MethodEach.new((current, callback: (value: any, key: any) => boolean) => {
        current.call.forEach((value) => {
          callback(value, value);
        });
      });
      _insert(deep.contains.Compatable, deep.contains.SetEach, deep.contains.Set);

      deep.contains.SetSort = deep.contains.MethodSort.new((current, callback: (a: any, b: any) => -1 | 0 | 1): any[] => {
        return current.map().sort(callback);
      });
      _insert(deep.contains.Compatable, deep.contains.SetSort, deep.contains.Set);

      deep.contains.SetReduce = deep.contains.MethodReduce.new((current, callback: (accumulator: any, currentValue?: any) => any, initialValue?: any): any => {
        return current.map().reduce((accumulator, currentValue) => callback(accumulator, currentValue), initialValue);
      });
      _insert(deep.contains.Compatable, deep.contains.SetReduce, deep.contains.Set);

      deep.contains.SetFirst = deep.contains.MethodFirst.new((current): any => {
        return current.call?.values()?.next()?.value || undefined;
      });
      _insert(deep.contains.Compatable, deep.contains.SetFirst, deep.contains.Set);

      deep.contains.SetLast = deep.contains.MethodLast.new((current): any => {
        return current.call?.values()?.next()?.value || undefined;
      });
      _insert(deep.contains.Compatable, deep.contains.SetLast, deep.contains.Set);

      deep.contains.SetJoin = deep.contains.MethodJoin.new((current, separator = ','): any => {
        current.map().join(separator);
      });
      _insert(deep.contains.Compatable, deep.contains.SetJoin, deep.contains.Set);

      // WeakSet

      _insert(deep.contains.Compatable, deep.contains.SetHas, deep.contains.WeakSet);
      _insert(deep.contains.Compatable, deep.contains.SetGet, deep.contains.WeakSet);
      _insert(deep.contains.Compatable, deep.contains.SetSize, deep.contains.WeakSet);
      _insert(deep.contains.Compatable, deep.contains.SetMap, deep.contains.WeakSet);
      _insert(deep.contains.Compatable, deep.contains.SetAdd, deep.contains.WeakSet);
      _insert(deep.contains.Compatable, deep.contains.SetSet, deep.contains.WeakSet);
      _insert(deep.contains.Compatable, deep.contains.SetUnset, deep.contains.WeakSet);
      _insert(deep.contains.Compatable, deep.contains.SetKeys, deep.contains.WeakSet);
      _insert(deep.contains.Compatable, deep.contains.SetValues, deep.contains.WeakSet);
      _insert(deep.contains.Compatable, deep.contains.SetFind, deep.contains.WeakSet);
      _insert(deep.contains.Compatable, deep.contains.SetFilter, deep.contains.WeakSet);
      _insert(deep.contains.Compatable, deep.contains.SetEach, deep.contains.WeakSet);
      _insert(deep.contains.Compatable, deep.contains.SetSort, deep.contains.WeakSet);
      _insert(deep.contains.Compatable, deep.contains.SetReduce, deep.contains.WeakSet);
      _insert(deep.contains.Compatable, deep.contains.SetFirst, deep.contains.WeakSet);
      _insert(deep.contains.Compatable, deep.contains.SetLast, deep.contains.WeakSet);
      _insert(deep.contains.Compatable, deep.contains.SetJoin, deep.contains.WeakSet);

      // Map

      _insert(deep.contains.Compatable, deep.contains.SetHas, deep.contains.Map);

      deep.contains.MapGet = deep.contains.MethodGet.new((current, key) => {
        return current.call.get(key);
      });
      _insert(deep.contains.Compatable, deep.contains.MapGet, deep.contains.Map);

      _insert(deep.contains.Compatable, deep.contains.SetSize, deep.contains.Map);

      deep.contains.MapMap = deep.contains.MethodMap.new((current, callback = (v, k) => v) => {
        const result: any = [];
        for (let [key, value] of current.call) { result.push(callback(value, key)); }
        return result;
      });
      _insert(deep.contains.Compatable, deep.contains.MapMap, deep.contains.Map);

      deep.contains.MapAdd = deep.contains.MethodAdd.new((current, value) => {
        const exists = current.call.has(value);
        if (!exists) current.call.set(value, value);
        return !exists;
      });
      _insert(deep.contains.Compatable, deep.contains.MapAdd, deep.contains.Map);

      deep.contains.MapSet = deep.contains.MethodSet.new((current, key, value) => {
        current.call.set(key, value);
        return current;
      });
      _insert(deep.contains.Compatable, deep.contains.MapSet, deep.contains.Map);

      deep.contains.MapUnset = deep.contains.MethodUnset.new((current, key) => {
        return current.call.delete(key);
      });
      _insert(deep.contains.Compatable, deep.contains.MapUnset, deep.contains.Map);

      _insert(deep.contains.Compatable, deep.contains.SetKeys, deep.contains.Map);

      _insert(deep.contains.Compatable, deep.contains.SetValues, deep.contains.Map);

      deep.contains.MapFind = deep.contains.MethodFind.new((current, callback: (value: any, key: any) => boolean) => {
        for (let [key, value] of current.call) {
          if (callback(value, key)) return value;
        }
        return undefined;
      });
      _insert(deep.contains.Compatable, deep.contains.MapFind, deep.contains.Map);

      deep.contains.MapFilter = deep.contains.MethodFilter.new((current, callback: (value: any, key: any) => boolean) => {
        const result: any = [];
        for (let [key, value] of current.call) {
          if (callback(value, key)) result.push(value);
        }
        return result;
      });
      _insert(deep.contains.Compatable, deep.contains.MapFilter, deep.contains.Map);

      deep.contains.MapEach = deep.contains.MethodEach.new((current, callback: (value: any, key: any) => boolean) => {
        for (let [key, value] of current.call) callback(value, key);
      });
      _insert(deep.contains.Compatable, deep.contains.MapEach, deep.contains.Map);

      _insert(deep.contains.Compatable, deep.contains.SetSort, deep.contains.Map);

      _insert(deep.contains.Compatable, deep.contains.SetReduce, deep.contains.Map);

      deep.contains.MapFirst = deep.contains.MethodFirst.new((current) => {
        return current.call?.entries()?.next()?.value;
      });
      _insert(deep.contains.Compatable, deep.contains.MapFirst, deep.contains.Map);

      deep.contains.MapLast = deep.contains.MethodLast.new((current) => {
        return  Array.from(this.values()).pop();
      });
      _insert(deep.contains.Compatable, deep.contains.MapLast, deep.contains.Map);

      _insert(deep.contains.Compatable, deep.contains.SetJoin, deep.contains.Map);

      // WeakMap

      _insert(deep.contains.Compatable, deep.contains.SetHas, deep.contains.WeakMap);
      _insert(deep.contains.Compatable, deep.contains.SetGet, deep.contains.WeakMap);
      _insert(deep.contains.Compatable, deep.contains.SetSize, deep.contains.WeakMap);
      _insert(deep.contains.Compatable, deep.contains.SetMap, deep.contains.WeakMap);
      _insert(deep.contains.Compatable, deep.contains.SetAdd, deep.contains.WeakMap);
      _insert(deep.contains.Compatable, deep.contains.SetSet, deep.contains.WeakMap);
      _insert(deep.contains.Compatable, deep.contains.SetUnset, deep.contains.WeakMap);
      _insert(deep.contains.Compatable, deep.contains.SetKeys, deep.contains.WeakMap);
      _insert(deep.contains.Compatable, deep.contains.SetValues, deep.contains.WeakMap);
      _insert(deep.contains.Compatable, deep.contains.SetFind, deep.contains.WeakMap);
      _insert(deep.contains.Compatable, deep.contains.SetFilter, deep.contains.WeakMap);
      _insert(deep.contains.Compatable, deep.contains.SetEach, deep.contains.WeakMap);
      _insert(deep.contains.Compatable, deep.contains.SetSort, deep.contains.WeakMap);
      _insert(deep.contains.Compatable, deep.contains.SetReduce, deep.contains.WeakMap);
      _insert(deep.contains.Compatable, deep.contains.SetFirst, deep.contains.WeakMap);
      _insert(deep.contains.Compatable, deep.contains.SetLast, deep.contains.WeakMap);
      _insert(deep.contains.Compatable, deep.contains.SetJoin, deep.contains.WeakMap);

      // Array

      deep.contains.ArrayHas = deep.contains.MethodHas.new((current, key) => {
        return current.call.hasOwnProperty(key);
      });
      _insert(deep.contains.Compatable, deep.contains.ArrayHas, deep.contains.Array);

      deep.contains.ArrayGet = deep.contains.MethodGet.new((current, key) => {
        return current.call[key];
      });
      _insert(deep.contains.Compatable, deep.contains.ArrayGet, deep.contains.Array);

      _insert(deep.contains.Compatable, deep.contains.StringSize, deep.contains.Array);

      deep.contains.ArrayMap = deep.contains.MethodMap.new((current, callback = (v, k) => v) => {
        return current.call.map(callback);
      });
      _insert(deep.contains.Compatable, deep.contains.ArrayMap, deep.contains.Array);

      deep.contains.ArrayAdd = deep.contains.MethodAdd.new((current, value) => {
        current.call.push(value);
        return current.call.length - 1;
      });
      _insert(deep.contains.Compatable, deep.contains.ArrayAdd, deep.contains.Array);

      deep.contains.ArraySet = deep.contains.MethodSet.new((current, key, value) => {
        current.call[key] = value;
        return current;
      });
      _insert(deep.contains.Compatable, deep.contains.ArraySet, deep.contains.Array);

      deep.contains.ArrayUnset = deep.contains.MethodUnset.new((current, key) => {
        const exists = current.call.hasOwnProperty(key);
        if (!exists) return false;
        current.call.splice(key, 1);
        return true;
      });
      _insert(deep.contains.Compatable, deep.contains.ArrayUnset, deep.contains.Array);

      deep.contains.ArrayKeys = deep.contains.MethodKeys.new((current) => {
        return current.call.map((v,k) => k);
      });
      _insert(deep.contains.Compatable, deep.contains.ArrayKeys, deep.contains.Array);

      deep.contains.ArrayValues = deep.contains.MethodValues.new((current) => {
        return current.call.map((v,k) => v);
      });
      _insert(deep.contains.Compatable, deep.contains.ArrayValues, deep.contains.Array);

      deep.contains.ArrayFind = deep.contains.MethodFind.new((current, callback: (value: any, key: any) => boolean) => {
        return current.call.find(callback);
      });
      _insert(deep.contains.Compatable, deep.contains.ArrayFind, deep.contains.Array);

      deep.contains.ArrayFilter = deep.contains.MethodFilter.new((current, callback: (value: any, key: any) => boolean) => {
        return current.call.filter(callback);
      });
      _insert(deep.contains.Compatable, deep.contains.ArrayFilter, deep.contains.Array);

      deep.contains.ArrayEach = deep.contains.MethodEach.new((current, callback: (value: any, key: any) => boolean) => {
        current.call.forEach(callback);
      });
      _insert(deep.contains.Compatable, deep.contains.ArrayEach, deep.contains.Array);

      deep.contains.ArraySort = deep.contains.MethodSort.new((current, callback: (value: any, key: any) => boolean) => {
        return current.call.sort(callback);
      });
      _insert(deep.contains.Compatable, deep.contains.ArraySort, deep.contains.Array);

      deep.contains.ArrayReduce = deep.contains.MethodReduce.new((current, callback: (accumulator: any, currentValue?: any) => any, initialValue?: any) => {
        return current.call.reduce((accumulator, currentValue) => callback(accumulator, currentValue), initialValue);
      });
      _insert(deep.contains.Compatable, deep.contains.ArrayReduce, deep.contains.Array);

      deep.contains.ArrayFirst = deep.contains.MethodFirst.new((current) => {
        return current.call[0];
      });
      _insert(deep.contains.Compatable, deep.contains.ArrayFirst, deep.contains.Array);

      deep.contains.ArrayLast = deep.contains.MethodLast.new((current) => {
        return  current.call[current.call.length - 1];
      });
      _insert(deep.contains.Compatable, deep.contains.ArrayLast, deep.contains.Array);

      deep.contains.ArrayJoin = deep.contains.MethodLast.new((current, separator = ',') => {
        return  current.call.join(separator);
      });
      _insert(deep.contains.Compatable, deep.contains.ArrayJoin, deep.contains.Array);
      
      // Object
      
      _insert(deep.contains.Compatable, deep.contains.ArrayHas, deep.contains.Object);

      _insert(deep.contains.Compatable, deep.contains.ArrayGet, deep.contains.Object);

      deep.contains.ObjectSize = deep.contains.MethodSize.new((current) => {
        let count = 0;
        for (let key in current.call) count++;
        return count;
      });
      _insert(deep.contains.Compatable, deep.contains.ObjectSize, deep.contains.Object);

      deep.contains.ObjectMap = deep.contains.MethodMap.new((current, callback = (v, k) => v) => {
        const result: any = [];
        for (const key in current.call) {
          result.push(callback(current.call[key], key));
        }
        return result;
      });
      _insert(deep.contains.Compatable, deep.contains.ObjectMap, deep.contains.Object);

      deep.contains.ObjectAdd = deep.contains.MethodAdd.new((current, value) => {
        const key = uuidv4(); // TODO check not used key
        current.call[key] = value;
        return key;
      });
      _insert(deep.contains.Compatable, deep.contains.ObjectAdd, deep.contains.Object);

      deep.contains.ObjectSet = deep.contains.MethodSet.new((current, key, value) => {
        current.call[key] = value;
        return current;
      });
      _insert(deep.contains.Compatable, deep.contains.ObjectSet, deep.contains.Object);

      deep.contains.ObjectUnset = deep.contains.MethodUnset.new((current, key) => {
        if (!current.call.hasOwnProperty(key)) return false;
        delete current.call[key];
        return true;
      });
      _insert(deep.contains.Compatable, deep.contains.ObjectUnset, deep.contains.Object);

      deep.contains.ObjectKeys = deep.contains.MethodKeys.new((current, key) => {
        return Object.keys(current.call);
      });
      _insert(deep.contains.Compatable, deep.contains.ObjectKeys, deep.contains.Object);

      deep.contains.ObjectValues = deep.contains.MethodValues.new((current, key) => {
        return Object.values(current.call);
      });
      _insert(deep.contains.Compatable, deep.contains.ObjectValues, deep.contains.Object);

      deep.contains.ObjectFind = deep.contains.MethodFind.new((current, callback: (value: any, key: any) => boolean) => {
        for (let key in current.call) {
          if (callback(current.call[key], key)) { return current.call[key]; }
        }
        return undefined;
      });
      _insert(deep.contains.Compatable, deep.contains.ObjectFind, deep.contains.Object);

      deep.contains.ObjectFilter = deep.contains.MethodFilter.new((current, callback: (value: any, key: any) => boolean) => {
        const results: any = [];
        for (let key in current.call) {
          const k = key;
          const v = current.call[key];
          if (callback(v, k)) results.push(v);
        }
        return results;
      });
      _insert(deep.contains.Compatable, deep.contains.ObjectFilter, deep.contains.Object);

      deep.contains.ObjectEach = deep.contains.MethodEach.new((current, callback: (value: any, key: any) => boolean) => {
        for (let key in current.call) {
          callback(current.call[key], key);
        }
      });
      _insert(deep.contains.Compatable, deep.contains.ObjectEach, deep.contains.Object);

      deep.contains.ObjectSort = deep.contains.MethodSort.new((current, callback: (a: any, b: any) => -1 | 0 | 1) => {
        return Object.values(current.call).sort(callback);
      });
      _insert(deep.contains.Compatable, deep.contains.ObjectSort, deep.contains.Object);

      deep.contains.ObjectReduce = deep.contains.MethodReduce.new((current, callback: (accumulator: any, currentValue?: any) => any, initialValue?: any) => {
        return Object.values(current.call).reduce(callback, initialValue);
      });
      _insert(deep.contains.Compatable, deep.contains.ObjectReduce, deep.contains.Object);

      deep.contains.ObjectFirst = deep.contains.MethodFirst.new((current, callback: (accumulator: any, currentValue?: any) => any, initialValue?: any) => {
        for (let k in current.call) return current.call[k];
      });
      _insert(deep.contains.Compatable, deep.contains.ObjectFirst, deep.contains.Object);

      deep.contains.ObjectLast = deep.contains.MethodLast.new((current, callback: (accumulator: any, currentValue?: any) => any, initialValue?: any) => {
        let last;
        for (let k in current.call) last = current.call[k];
        return last;
      });
      _insert(deep.contains.Compatable, deep.contains.ObjectLast, deep.contains.Object);

      deep.contains.ObjectJoin = deep.contains.MethodJoin.new((current, separator = ',') => {
        return Object.values(current.call).join(separator);
      });
      _insert(deep.contains.Compatable, deep.contains.ObjectJoin, deep.contains.Object);

      deep._events = true;
    }
  }

  /**
   * Creates a change event for this Deep instance
   * @param name - Event name
   * @param field - Field name
   * @param previousValue - Previous value
   * @param currentValue - Current value
   * @returns Change event
   */
  private _createChangeEvent(
    name: 'new' | 'change' | 'kill',
    field?: 'id' | 'type' | 'from' | 'to' | 'value',
    previousValue?: any,
    currentValue?: any
  ): DeepEvent {
    const event: DeepEvent = {
      name: 'change',
      deep: this,
      prev: {},
      next: {},
    };

    if (field) {
      event.prev[field] = previousValue;
      event.next[field] = currentValue;
    }

    return event;
  }

  /**
   * Gets the deep.Id instance .to this Deep instance .from current this.deep agent. If no ID is set, one will be created.
   * @param value - Optional ID value
   * @param agent - Optional agent Deep instance
   * @returns ID value
   */
  id(value?: string, agent: Deep = this.deep): string {
    const ids = this.ids;
    let previous;
    for (let id of this.ids) {
      if (id.from === agent) previous = id.call;
    }
    if (!ids.size || arguments.length) {
      const id = this.deep.Id.new(value || uuidv4());
      id.from = agent;
      id.to = this;
      const current = id.call;
      if (previous !== current) {
        this.on.emit(this._createChangeEvent('change', 'id', previous, current));
      }
      return current;
    } else {
      for (let id of ids) return id.call;
      throw new Error(` Unexpected, ids can't be empty here.`);
    }
  }

  /**
   * Gets a Deep instance by its id
   * @param id - ID value to search for
   * @param agent - Optional agent Deep instance, default this.deep
   * @returns Deep instance with the specified id, or undefined if not found
   */
  getById(value: string, agent: Deep = this.deep): Deep | undefined {
    for (let id of this.deep.Id.typed) {
      if (id.value == value && id.from == agent) return id.to;
    }
    return undefined;
  }

  /**
   * Gets the value stored in this Deep instance, can be other Deep instance.
   * @returns Stored value
   */
  get value() {
    return this.deep.memory.values.get(this);
  }

  /**
   * Sets the value in this Deep instance. Value wrap into untyped Deep instance, if this Deep is typed. Values not duplicating inside this.deep.memory.
   * @param value - Value to set
   */
  set value(value) {
    const previous = this.call;
    if (isUndefined(value)) {
      if (isValue(this.value)) throw new Error(` If .value is Value, it's can't be ereised!`);
      this.deep.memory.values.unset(this);
    } else if (isValue(value) && this.type == this.deep.Id) {
      this.deep.memory.values.unset(this);
      this.deep.memory.values.set(this, value);
    } else if (isValue(value)) {
      this.deep.memory.values.unset(this);
      this.deep.memory.values.set(this, this.wrap(value));
    } else if (isDeep(value) && isValue(value.value)) {
      this.deep.memory.values.unset(this);
      this.deep.memory.values.set(this, value);
    } else throw new Error(' Value must be isValue(value) or isValue(value.value) or isUndefined(value)');
    const current = this.value;
    if (previous !== current) {
      const event = this._createChangeEvent('change', 'value', previous, current);
      this.on.emit(event);
    }
  }

  /**
   * Gets the type of this Deep instance
   * @returns Type Deep instance
   */
  get type() { return this.deep.memory.types.get(this); }

  /**
   * Sets the type of this Deep instance
   * @param it - Type to set
   */
  set type(it: Deep | undefined) {
    const previous = this.type;
    if (isUndefined(it)) this.deep.memory.types.unset(this);
    else this.deep.memory.types.set(this, it);
    if (!this.deep._events) return;
    if ((this.type != this.deep.Selection && this.type != this.deep.Id) && previous !== it) {
      this.on.emit(this._createChangeEvent('change', 'type', previous, it));
    }
    let notifiedSelections = new Set();
    for (let d of this.deep.memory.types.many(this.deep.__type)) {
      if (d?.to?.to && d.to.type == this.deep.Selection && d.to.to.call.has(it)) {
        d.emit(this._createChangeEvent('change', 'type', previous, it));
        notifiedSelections.add(d.to);
      } else if (d.to == it || d.to == previous) {
        d.emit(this._createChangeEvent('change', 'type', previous, it));
        notifiedSelections.add(d.from);
      }
    }
    for (let selection of this.deep.memory.types.many(this.deep.Selection)) {
      if (!notifiedSelections.has(notifiedSelections) && selection.to && !isArray(selection.to.call) && selection.to.call.has(this)) selection.emit(this._createChangeEvent('change', 'type', previous, it));
    }
  }

  /**
   * Gets the 'from' reference of this Deep instance
   * @returns From Deep instance
   */
  get from() { return this.deep.memory.froms.get(this); }

  /**
   * Sets the 'from' reference of this Deep instance
   * @param it - From Deep instance to set
   */
  set from(it: Deep | undefined) {
    const previous = this.from;
    if (isUndefined(it)) this.deep.memory.froms.unset(this);
    else this.deep.memory.froms.set(this, it);
    if (!this.deep._events) return;
    if ((this.type != this.deep.Selection && this.type != this.deep.Id) && previous !== it) {
      this.on.emit(this._createChangeEvent('change', 'from', previous, it));
    }
    let notifiedSelections = new Set();
    for (let d of this.deep.memory.types.many(this.deep.__from)) {
      if (d?.to?.to && d.to.type == this.deep.Selection && d.to.to.call.has(it)) {
        d.emit(this._createChangeEvent('change', 'from', previous, it));
        notifiedSelections.add(d.to);
      } else if (d.to == it || d.to == previous) {
        d.emit(this._createChangeEvent('change', 'from', previous, it));
        notifiedSelections.add(d.from);
      }
    }
    for (let selection of this.deep.memory.types.many(this.deep.Selection)) {
      if (!notifiedSelections.has(notifiedSelections) && selection.to && !isArray(selection.to.call) && selection.to.call.has(this)) selection.emit(this._createChangeEvent('change', 'from', previous, it));
    }
  }

  /**
   * Gets the 'to' reference of this Deep instance
   * @returns To Deep instance
   */
  get to() { return this.deep.memory.tos.get(this); }

  /**
   * Sets the 'to' reference of this Deep instance
   * @param it - To Deep instance to set
   */
  set to(it: Deep | undefined) {
    const previous = this.to;
    if (isUndefined(it)) this.deep.memory.tos.unset(this);
    else this.deep.memory.tos.set(this, it);
    if (!this.deep._events) return;
    if ((this.type != this.deep.Selection && this.type != this.deep.Id) && previous !== it) {
      this.on.emit(this._createChangeEvent('change', 'to', previous, it));
    }
    let notifiedSelections = new Set();
    for (let d of this.deep.memory.types.many(this.deep.__to)) {
      if (d?.to?.to && d.to.type == this.deep.Selection && d.to.to.call.has(it)) {
        d.emit(this._createChangeEvent('change', 'to', previous, it));
        notifiedSelections.add(d.to);
      } else if (d.to == it || d.to == previous) {
        d.emit(this._createChangeEvent('change', 'to', previous, it));
        notifiedSelections.add(d.from);
      }
    }
    for (let selection of this.deep.memory.types.many(this.deep.Selection)) {
      if (!notifiedSelections.has(notifiedSelections) && selection.to && !isArray(selection.to.call) && selection.to.call.has(this)) selection.emit(this._createChangeEvent('change', 'to', previous, it));
    }
  }

  /**
   * Gets Deep instances that have this instance as a value
   * @returns Deep instance with .call == set of results.
   */
  get valued() {
    return this.wrap(this.deep.memory.values.many(this));
  }

  /**
   * Gets Deep instances that have this instance as a type.
   * @returns Deep instance with .call == set of results.
   */
  get typed() { return this.wrap(this.deep.memory.types.many(this)); }

  /**
   * Gets Deep instances that have this instance as their 'from' reference
   * @returns Deep instance with .call == set of results.
   */
  get out() { return this.wrap(this.deep.memory.froms.many(this)); }

  /**
   * Gets Deep instances that have this instance as their 'to' reference
   * @returns Deep instance with .call == set of results.
   */
  get in() { return this.wrap(this.deep.memory.tos.many(this)); }


  /**
   * Determines the Deep type of a given value
   * @param value - Value to check type of
   * @returns Deep instance representing the type, instance of this.deep.contains.Value
   */
  _is(value: any): Deep {
    if (isSymbol(value)) return this.deep.Symbol;
    else if (isUndefined(value)) return this.deep.Undefined;
    else if (isPromise(value)) return this.deep.Promise;
    else if (isBoolean(value)) return this.deep.Boolean;
    else if (isString(value)) return this.deep.String;
    else if (isNumber(value)) return this.deep.Number;
    else if (isBigInt(value)) return this.deep.BigInt;
    else if (isSet(value)) return this.deep.Set;
    else if (isWeakSet(value)) return this.deep.WeakSet;
    else if (isMap(value)) return this.deep.Map;
    else if (isWeakMap(value)) return this.deep.WeakMap;
    else if (isArray(value)) return this.deep.Array;
    else if (isObject(value)) return this.deep.Object;
    else if (isFunction(value)) return this.deep.Function;
    return this.Unexpected;
  }

  /**
   * Gets the container for managing contains relationships, based on this.deep.Contain where .from is parent, and .to is children.
   * @returns Contains instance
   */
  get contains() {
    if (!this._contains) {
      const _contains = new Contains(this);
      this._contains = new Proxy(_contains, Contains._proxy);
    }
    return this._contains;
  }

  /**
   * Gets all deep.Id isntances where .to = this.
   * @returns Set of Deep instances representing IDs
   */
  get ids(): Set<Deep> {
    const ids = new Set<Deep>();
    this.in.each(i => i.type === this.deep.Id && ids.add(i));
    // for (let i of this.in) {
    //   if (i.type === this.deep.Id) {
    //     ids.add(i);
    //   }
    // }
    return ids;
  }

  /**
   * Gets the first founded name of this Deep instance based on its contain relationships.
   * @returns Name string
   */
  get name(): string {
    let name: string = '';
    for (let i of this.in.call) {
      if (i.type === this.deep.Contain) {
        name = i.call;
        break;
      }
    }
    return name;
  }

  /**
   * Gets the full name including recursive by types information
   * @returns Full name string as CurrentName(TypeName(TypeTypeName))
   */
  get fullName(): string {
    let name: string = this.name;
    if (this.type && this.type != this) {
      name += `(${this.type.fullName})`;
    }
    return name;
  }

  /**
   * Creates a new Deep instance of this type
   * @param value - Optional initial value
   * @returns New Deep instance
   */
  new(value?: any) {
    const deep = new Deep(this.deep);
    this.deep.memory.all.add(deep);
    deep.type = this;
    if (arguments.length) deep.value = value;
    if (this.deep._events) {
      this.deep.memory.tos.many(this).forEach(d => {
        if (d.type === this.deep.Selection) {
          deep.on.emit(d._createChangeEvent('new'));
        }
      });
    }
    return deep;
  }

  /**
   * Wraps a value in a Deep instance if it isn't already, or returns existing Deep instance.
   * @param value - Value to wrap
   * @returns Deep instance containing the value
   */
  wrap(value?: any) {
    if (isDeep(value)) return value;
    else {
      const valued = this.deep.memory.values.many(value);
      if (valued.size) {
        if (!valued.size) throw new Error(` Unexpected, value can't be in all, but not values.`);
        if (valued.size != 1) throw new Error(` Unexpected, value can only one Deep in .memory.values.many.`);
        for (let v of valued) {
          return v;
        }
      } else return this.Value(value);
    }
  }

  /**
   * Removes this Deep instance and all its references, also kill event emitting.
   */
  kill() {
    this.deep.memory.all.delete(this);
    this.deep.memory.values.unset(this);
    this.from = undefined;
    this.to = undefined;
    this.type = undefined;
    if (this._on) this._on.kill();
  }

  /**
   * Gets an iterator for this Deep instance's value, any Deep instance can be iterated in for of.
   * @returns Iterator
   */
  [Symbol.iterator]() { return makeIterator(this.call); };

  /**
   * Gets the value of this Deep instance, resolving Deep values recursively by deeps to their primitive js value.
   * @returns Resolved value
   */
  get call() {
    let value = this.value;
    if (isDeep(value)) value = value.value;
    return value;
  }

  /**
   * Creates a new Deep instance of the appropriate type for a value
   * @param value - Value to create Deep instance for
   * @returns New Deep instance
   */
  Value(value) {
    const set = this.deep.memory.values.many(value);
    if (!set.size) {
      const Type = this._is(value);
      const v = Type.new();
      this.deep.memory.values.set(v, value);
      return v;
    } else {
      for (let v of set) {
        return v;
      }
    }
  }
  /**
   * Checks if this Deep instance is of a specific type
   * @param check - Type to check against
   * @returns True if instance is of the specified type
   */
  typeof(check) {
    if (!check) return false;
    const type = this?.type;
    if (type === check) return true;
    if (type && type != this) return type.typeof(check);
    return false;
  }

  /**
   * Gets an array of all types in the type hierarchy up.
   * @param array - Optional array to append types to
   * @returns Array of types
   */
  typeofs(array: any[] = []) {
    const type = this.type;
    if (type && type != this) {
      array.push(type);
      return type.typeofs(array);
    }
    return array;
  }

  /**
   * Determines the type of a value based on deep.Isable.
   * @param value - Value to check
   * @returns Deep type instance
   */
  is(value) {
    if (isDeep(value)) return Deep;
    else {
      // TODO orderId must be links not array
      for (let is of this.deep.orderIs.call) {
        if (is.call(value)) {
          const outs = is.out.call;
          for (let out of outs) {
            if (out.type === this.deep.Isable) return out.to;
          }
        }
      }
      return this.deep.Unxpected;
    }
  }

  /**
   * Gets a method implementation for this Deep instance
   * @param name - Method name
   * @returns Method implementation
   */
  _method(name: string): any {
    const Type = this._is(this.call);
    const typedMethods = this.deep.contains[`Method${name}`].typed;
    for (let method of typedMethods.call) {
      for (let out of method.out.call) {
        if (out.type === this.deep.Compatable && out.to === Type) {
          return method?.call;
        }
      }
    }
    return this.deep.contains[`Any${name}`].call;
  }

  /**
   * Checks if this Deep instance has a specific value
   * @param args - Arguments for has check
   * @returns Result of has check
   */
  has(...args) { return this._method('Has')(this, ...args); }

  /**
   * Gets a value from this Deep instance
   * @param args - Arguments for get operation
   * @returns Retrieved value
   */
  get(...args) { return this._method('Get')(this, ...args); }

  /**
   * Gets the size of this Deep instance's value
   * @returns Size value
   */
  get size() { return this._method('Size')(this); }

  /**
   * Maps over values in this Deep instance
   * @param args - Arguments for map operation
   * @returns Mapped values
   */
  map(...args) { return this._method('Map')(this, ...args); }

  /**
   * Adds a value to this Deep instance
   * @param args - Arguments for add operation
   * @returns Result of add operation
   */
  add(...args) { return this._method('Add')(this, ...args); }

  /**
   * Sets a value in this Deep instance
   * @param args - Arguments for set operation
   * @returns Result of set operation
   */
  set(...args) { return this._method('Set')(this, ...args); }

  /**
   * Removes a value from this Deep instance
   * @param args - Arguments for unset operation
   * @returns Result of unset operation
   */
  unset(...args) { return this._method('Unset')(this, ...args); }

  /**
   * Gets the keys of this Deep instance's value
   * @returns Keys
   */
  get keys() { return this._method('Keys')(this); }

  /**
   * Gets the values of this Deep instance
   * @returns Values
   */
  get values() { return this._method('Values')(this); }

  /**
   * Finds a value in this Deep instance
   * @param args - Arguments for find operation
   * @returns Found value
   */
  find(...args) { return this._method('Find')(this, ...args); }

  /**
   * Filters values in this Deep instance
   * @param args - Arguments for filter operation
   * @returns Filtered values
   */
  filter(...args) { return this._method('Filter')(this, ...args); }

  /**
   * Executes a callback for each value in this Deep instance
   * @param args - Arguments for each operation
   * @returns Result of each operation
   */
  each(...args) { return this._method('Each')(this, ...args); }

  /**
   * Sorts values in this Deep instance
   * @param args - Arguments for sort operation
   * @returns Sorted values
   */
  sort(...args) { return this._method('Sort')(this, ...args); }

  /**
   * Reduces values in this Deep instance
   * @param args - Arguments for reduce operation
   * @returns Reduced value
   */
  reduce(...args) { return this._method('Reduce')(this, ...args); }

  /**
   * Gets the first value in this Deep instance
   * @returns First value
   */
  get first() { return this._method('First')(this); }

  /**
   * Gets the last value in this Deep instance
   * @returns Last value
   */
  get last() { return this._method('Last')(this); }

  /**
   * Joins values in this Deep instance
   * @param args - Arguments for join operation
   * @returns Joined string
   */
  join(...args) { return this._method('Join')(this, ...args); }

  /**
   * Converts this Deep instance to a string
   * @param args - Arguments for toString operation
   * @returns String representation
   */
  toString(...args) { return this._method('ToString')(this, ...args); }

  /**
   * Gets the primitive value of this Deep instance
   * @param args - Arguments for valueOf operation
   * @returns Primitive value
   */
  valueOf(...args) { return this._method('ValueOf')(this, ...args); }

  /**
   * Expands input into a deep.Exp.
   * @param input - Plain expression object.
   * @param selection - Instance of deep.Selection.
   * @returns Expanded deep.Exp
   */
  exp(input: any, selection: Deep) {
    let exp;
    if (isDeep(input)) {
      return this.exp({ id: input }, selection);
    } else if (isArray(input)) {
      exp = this.deep.Exp.new([]);
      for (let i in input) {
        const e = input[i];
        const nestedSelection = this.selection();
        const relation = this.deep.Order.new();
        this.exp(e, nestedSelection);
        exp.call[i] = nestedSelection;
        relation.from = selection;
        relation.to = nestedSelection;
        relation.value = i;
        relation.on((e) => selection.emit(e));
      }
    } else {
      exp = this.deep.Exp.new({});
      if (input.hasOwnProperty('id')) {
        if (isDeep(input.id) || isString(input.id)) {
          exp.call.id = input.id;
          const relation = this.deep.__id.new();
          relation.from = selection;
          relation.to = input.id;
          relation.on((e) => selection.emit(e));
        } else throw new Error(` Only Deep or string can be value in exp (id)!`);
      }
      for (let key in this.deep.contains.relations.call) {
        if (input.hasOwnProperty(key)) {
          const relation = this.deep.contains[key].new();
          if (isDeep(input[key]) || isPlainObject(input[key])) {
            const nestedSelection = this.selection();
            this.exp(input[key], nestedSelection);
            exp.call[key] = nestedSelection;
            nestedSelection.on((e) => relation.emit(e));
          } else throw new Error(` Only Deep or plain objects Exp can be value in exp (${key})!`);
          relation.from = selection;
          relation.to = exp.call[key]; // nestedSelection
          relation.on((e) => selection.emit(e));
        }
      }
      for (let logic of this.deep.Logic.typed) {
        if (input.hasOwnProperty(logic.name)) {
          const relation = logic.new();
          const nestedSelection = this.selection();
          const value = input[logic.name];
          this.exp(value, nestedSelection);
          exp.call[logic.name] = nestedSelection;
          relation.from = selection;
          relation.to = exp.call[logic.name];
          relation.on((e) => selection.emit(e));
        }
      }
    }
    return exp;
  }

  /**
   * Creates a new selection. Can be observed by selection.on(event => {}), and recalculated with selection.call();
   * @returns New selection Deep instance
   */
  selection() {
    const rels = this.deep.contains.relations.call;
    const selection = this.deep.Selection.new(() => {
      const relations = selection.out;
      let set;
      for (let relation of relations) {
        if (relation.typeof(this.deep.Relation)) {
          if (relation.typeof(this.deep.__id)) {
            if (isDeep(relation.to)) {
              set = set ? set.intersection(new Set([relation.to])) : new Set([relation.to]);
            } else if (isString(relation.to.call)) {
              throw new Error(' Sorry not relized yet.');
            } else throw new Error(' Only Deep and string can be .id');
          } else if (relation.typeof(this.deep.Many)) {
            const nextSet = relation.to.call()[`${rels[relation.type.name].invert}s`].call;
            set = set ? set.intersection(nextSet) : nextSet;
          } else if (relation.typeof(this.deep.One)) {
            const nextSet = relation.to.type === this.deep.Selection ?
            relation.to.call().reduce((result, d) => result.union(d[rels[relation.type.name].invert].call), new Set()) :
            relation.to[rels[relation.type.name].invert].call;
            set = set ? set.intersection(nextSet) : nextSet;
          } else if (relation.typeof(this.deep.Condition)) {
            
          } else if (relation.typeof(this.deep.Logic)) {
            if (relation.typeof(this.deep.contains.not)) {
              const currentSet = set || this.deep.Everything.call;
              const notSet = relation.to.call().call;
              set = currentSet.difference(notSet);
            } else if (relation.typeof(this.deep.contains.and)) {
              const currentSet = set || this.deep.Everything.call;
              const arrayOfSets = relation.to.call();
              set = arrayOfSets.reduce((result, set) => {
                return result.intersection(set.call);
              }, currentSet);
            } else if (relation.typeof(this.deep.contains.or)) {
              const arrayOfSets = relation.to.call();
              set = arrayOfSets.reduce((result, item) => {
                const itemSet = item.call;
                return result ? new Set([...result, ...itemSet]) : itemSet;
              }, set);
            }
          } else if (relation.typeof(this.deep.Order)) {
            const nextSet = relation.to.call();
            set = set ? (set.push(nextSet), set) : [nextSet];
          }
        }
      }
      if (!set) set = this.deep.Everything.call;
      const result = this.wrap(set);
      selection.to = result;
      return selection.to;
    });
    return selection;
  }

  /**
   * Selects based on input criteria
   * @param input - Plain expression object.
   * @returns Instance of deep.Selection
   */
  select(input: any) {
    let selection;
    if (isDeep(input) && input.type === this.deep.Selection) selection = input;
    else if (!isDeep(input) && isObject(input)) {
      selection = this.selection();
      const exp = this.exp(input, selection);
      selection.from = exp;
      selection.call();
    }
    else throw new Error(` Exp must be an object!`);
    return selection;
  }

  /**
   * Gets, or creates if not exists the event emitter for this Deep instance
   * @returns Event emitter instance
   */
  get on() {
    if (!this._on) this._on = On();
    return this._on;
  }

  /**
   * Emits an event from this Deep instance
   * @param args - Event arguments
   */
  emit(...args) {
    if (this._on) this._on.emit(...args);
  }

  /**
   * Returns a Deep instance containing a Set of nodes that have incoming links of the specified type
   * @param type - The type of incoming links to filter by
   * @returns Deep instance wrapping a Set of nodes with incoming links of the specified type
   */
  inof(type: Deep): Deep {
    const result = new Set<Deep>();
    for (const link of this.in.call) {
      if (link.type === type) {
        result.add(link.from);
      }
    }
    return this.wrap(result);
  }

  /**
   * Returns a Deep instance containing a Set of nodes that have outgoing links of the specified type
   * @param type - The type of outgoing links to filter by
   * @returns Deep instance wrapping a Set of nodes with outgoing links of the specified type
   */
  outof(type: Deep): Deep {
    const result = new Set<Deep>();
    for (const link of this.out.call) {
      if (link.type === type) {
        result.add(link.to);
      }
    }
    return this.wrap(result);
  }

  /**
   * Gets a set of all unique types from this Deep structure
   * @returns Deep instance with .call == set of unique types
   */
  get types() {
    const set = new Set<Deep>();
    for (const deep of this) {
      const type = deep.type;
      if (type) set.add(type);
    }
    return this.wrap(set);
  }

  /**
   * Gets a set of all unique from references from this Deep structure
   * @returns Deep instance with .call == set of unique from references
   */
  get froms() {
    const set = new Set<Deep>();
    for (const deep of this) {
      const from = deep.from;
      if (from) set.add(from);
    }
    return this.wrap(set);
  }

  /**
   * Gets a set of all unique to references from this Deep structure
   * @returns Deep instance with .call == set of unique to references
   */
  get tos() {
    const set = new Set<Deep>();
    for (const deep of this) {
      const to = deep.to;
      if (to) set.add(to);
    }
    return this.wrap(set);
  }

  /**
   * Gets a set of all unique typed references from this Deep structure
   * @returns Deep instance with .call == set of unique out references
   */
  get typeds() {
    const set = new Set<Deep>();
    for (const deep of this) {
      for (const s of deep.typed) {
        set.add(s);
      }
    }
    return this.wrap(set);
  }

  /**
   * Gets a set of all unique out references from this Deep structure
   * @returns Deep instance with .call == set of unique out references
   */
  get outs() {
    const set = new Set<Deep>();
    for (const deep of this) {
      for (const s of deep.out) {
        set.add(s);
      }
    }
    return this.wrap(set);
  }

  /**
   * Gets a set of all unique in references from this Deep structure
   * @returns Deep instance with .call == set of unique in references
   */
  get ins() {
    const set = new Set<Deep>();
    for (const deep of this) {
      for (const s of deep.in) {
        set.add(s);
      }
    }
    return this.wrap(set);
  }

  /**
   * Converts a Deep value into a Pack Value object
   * @param deep - Deep instance containing the value
   * @returns Pack Value object with type and serialized value
   */
  valuePack(deep: Deep): Pack['values'][0] {
    try {
      const value = deep.value;
      const typeDeep = this._is(value);
      const typeName = typeDeep.name;

      switch(typeName) {
        case 'Symbol':
          return { type: typeName };
        case 'Function':
          return { value: value.toString(), type: typeName };
        case 'Set':
        case 'WeakSet':
          return { value: Array.from(value), type: typeName };
        case 'Map':
        case 'WeakMap':
          return { value: Array.from(value.entries()), type: typeName };
        default:
          return { value, type: typeName };
      }
    } catch(error) {
      throw new Error(` Error packing value: ${error.message}`);
    }
  }

  /**
   * Converts a Pack Value object back into a Deep value
   * @param packedValue - Pack Value object with type and value
   * @returns Deep instance with unpacked value
   */
  valueUnpack(packedValue: Pack['values'][0]): Deep {
    let typeDeep;
    for (const type of this.deep.contains.Value.typed) {
      if (type.name === packedValue.type) {
        typeDeep = type;
        break;
      }
    }
    if (!typeDeep) {
      throw new Error(` Unknown type ${packedValue.type} for value`);
    }
    try {
      switch(packedValue.type) {
        case 'Symbol':
          return this.wrap(Symbol());
        case 'Function':
          try {
            const fn = eval(`(${packedValue.value})`);
            return this.wrap(fn);
          } catch (error) {
            throw new Error(` Error evaluating function: ${error.message}`);
          }
        case 'Set':
          return this.wrap(new Set(packedValue.value));
        case 'WeakSet':
          const weakSet = new WeakSet();
          for (const item of packedValue.value) {
            if (typeof item === 'object' && item !== null) {
              weakSet.add(item);
            }
          }
          return this.wrap(weakSet);
        case 'Map':
          return this.wrap(new Map(packedValue.value));
        case 'WeakMap':
          const weakMap = new WeakMap();
          for (const [key, value] of packedValue.value) {
            if (typeof key === 'object' && key !== null) {
              weakMap.set(key, value);
            }
          }
          return this.wrap(weakMap);
        default:
          return this.wrap(packedValue.value);
      }
    } catch(error) {
      throw new Error(` Error unpacking value: ${error.message}`);
    }
  }

  /**
   * Packs a Selection into a serializable format
   * @returns An object containing serialized deep links and their values
   * @throws Error if input is not a Deep instance or Selection
   */
  get pack(): Pack {
    if (!isDeep(this) || !(this as Deep).typeof(this.deep.Selection)) {
      throw new Error('pack() requires a Deep instance or Selection');
    }

    const result: Pack = {
      deep: [],
      values: []
    };

    for (const item of this.to) {
      const link: Pack['deep'][0] = {
        id: item.id()
      };

      if (item.type) {
        link.type = item.type.id();
      }

      if (item.from) {
        link.from = item.from.id();
      }

      if (item.to) {
        link.to = item.to.id();
      }

      const call = item.call;
      if (call !== undefined) {
        const packedValue = this.valuePack(item.value);
        let valueIndex = result.values.findIndex(v => 
          v.value === packedValue.value && v.type === packedValue.type
        );
        if (valueIndex < 0) {
          valueIndex = result.values.push(packedValue) - 1;
        }
        link.value = valueIndex;
      }

      result.deep.push(link);
    }
    return result;
  }

  /**
   * Unpacks a serialized Pack format back into a Selection
   * @param pckg - The package to unpack, containing deep links and values
   * @param agent - Optional agent Deep instance, default this.deep
   * @returns A Selection containing the unpacked Deep instances
   */
  unpack(pckg: Pack, agent: Deep = this.deep): Deep {
    const deepsMap = new Map<string, Deep>();
    const or = [];

    const getOrCreateDeep = (deepData: Pack['deep'][0]): Deep => {
      let deep = deepsMap.get(deepData.id);
      if (deep) return deep;

      deep = this.getById(deepData.id, agent);
      if (deep) {
        deepsMap.set(deepData.id, deep);
        return deep;
      }
      if (!deep) deep = this.new();
      if (deepData.value !== undefined) {
        const packedValue = pckg.values[deepData.value];
        deep.value = this.valueUnpack(packedValue);
      }
      
      deep.id(deepData.id, agent);
      deepsMap.set(deepData.id, deep);
      
      return deep;
    };

    for (const deepData of pckg.deep) {
      const deep = getOrCreateDeep(deepData);
      or.push(deep);
    }

    for (const deepData of pckg.deep) {
      const deep = deepsMap.get(deepData.id);
      if (!deep) continue;

      if (deepData.type) {
        const type = deepsMap.get(deepData.type) || this.getById(deepData.type, agent);
        if (type) deep.type = type;
      }

      if (deepData.from) {
        const from = deepsMap.get(deepData.from) || this.getById(deepData.from, agent);
        if (from) deep.from = from;
      }

      if (deepData.to) {
        const to = deepsMap.get(deepData.to) || this.getById(deepData.to, agent);
        if (to) deep.to = to;
      }
    }

    return this.select({ or });
  }

  /**
   * Проходит по пути из строк через contains и возвращает найденный deep или undefined
   * @param paths массив строк, представляющих путь через contains
   * @returns найденный deep или undefined
   */
  go(...paths: string[]): Deep | undefined {
    let current: Deep = this;
    for (const p of paths) {
      if (!current?.contains?.[p]) return undefined;
      current = current.contains[p];
    }
    return current;
  }
}

/**
 * Contains class for managing contains relationships
 */
export class Contains {
  [key: string]: Deep;
  static _proxy = {
    get(target, key, receiver) {
      if (key === 'deep') return target.deep;
      let founded: Deep | void = undefined;
      const Contain = target.deep.deep.Contain;
      for (let contain of target.deep.out.call) {
        if (contain.type === Contain && contain.value.value === key) {
          founded = contain.to;
        }
      }
      // if (!founded) {
      //   founded = target.deep.new();
      //   const c = target.deep.new();
      //   c.type = Contain; c.from = target.deep; c.to = founded; c.value = key;
      // }
      return founded;
    },
    set(target, key, value, receiver) {
      if (key === 'deep') throw new Error(' Key "deep" is reserved in contains!');
      if (!isDeep(value)) throw new Error(' Value must be Deep!');
      let founded: Deep | void = undefined;
      const Contain = target.deep.deep.Contain;
      for (let contain of target.deep.out.call) {
        if (contain.type === Contain && contain.value.value === key) {
          founded = contain.to;
        }
      }
      if (!founded) {
        founded = value;
        const c = target.deep.deep.Contain.new();
        c.from = target.deep; c.to = founded; c.value = key;
      }
      return true;
    },
  };
  deep: Deep;
  constructor(deep) {
    this.deep = deep;
  }
}
