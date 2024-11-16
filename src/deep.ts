import { v4 as uuidv4 } from 'uuid';
import { Observable } from '@gullerya/object-observer';
import On, { OnI } from './on';

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

class Index {
  _many = new Map<any, Set<any>>;
  _one = new Map<any, any>;
  many(key: any): Set<any> {
    let set = this._many.get(key);
    if (!set) {
      this._many.set(key, set = new Set());
    }
    return set;
  }
  set(key: any, value: any): any {
    this._one.set(key, value);
    const set = this._many.get(value) || new Set();
    this._many.set(value, set);
    set.add(key);
    return value;
  }
  get(key: any): any {
    return this._one.get(key);
  }
  unset(key) {
    const value = this._one.get(key);
    this._one.delete(key);
    const set = this._many.get(value);
    if (set) set.delete(key);
  }
}

class Memory {
  values: Index;
  types: Index;
  froms: Index;
  tos: Index;
  all: Set<any>;
  constructor() {
    this.values = this.values || new Index();
    this.types = this.types || new Index();
    this.froms = this.froms || new Index();
    this.tos = this.tos || new Index();
    this.all = this.all || new Set();
  }
}

export class Deep {
  [key: string]: any;

  isDeep(it) { return isDeep(it); }
  isValue(it) { return isValue(it); }

  deep: Deep;
  memory: Memory;
  _events?: boolean;
  constructor(deep: Deep = this) {
    this.deep = deep;
    if (this == deep) {
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

      deep.Symbol = _insert(Value);
      deep.Undefined = _insert(Value);
      deep.Promise = _insert(Value);
      deep.Boolean = _insert(Value);
      deep.String = _insert(Value);
      deep.Number = _insert(Value);
      deep.BigInt = _insert(Value);
      deep.Set = _insert(Value);
      deep.WeakSet = _insert(Value);
      deep.Map = _insert(Value);
      deep.WeakMap = _insert(Value);
      deep.Array = _insert(Value);
      deep.Object = _insert(Value);
      deep.Function = _insert(Value);

      const Contain = deep.new(); const c = deep.new();
      c.type = Contain; c.from = deep; c.to = Contain; c.value = 'Contain';

      deep.contains.Contain = this.Contain = Contain;

      const deepName = _insert(Contain, deep, deep, 'deep');

      const Everything = deep.contains.Everything = deep.wrap(deep.memory.all);
      const Nothing = deep.contains.Nothing = deep.new();
      const Any = deep.contains.Any = deep.new();

      deep.contains.Value = Value;

      const Id = deep.contains.Id = deep.new();

      const Exp = deep.contains.Exp = deep.new();
      const Selection = deep.contains.Selection = _insert(deep, Value);

      const Relation = deep.contains.Relation = deep.new();

      deep.contains.Many = Relation.new();
      deep.contains.One = Relation.new();

      deep.contains.type = deep.contains.One.new();
      deep.contains.typed = deep.contains.Many.new();
      deep.contains.from = deep.contains.One.new();
      deep.contains.out = deep.contains.Many.new();
      deep.contains.to = deep.contains.One.new();
      deep.contains.out = deep.contains.Many.new();
      deep.contains.value = deep.contains.One.new();
      deep.contains.valued = deep.contains.Many.new();

      const Condition = deep.contains.Condition = Relation.new();

      deep.contains.eq = Condition.new();
      deep.contains.neq = Condition.new();
      deep.contains.gt = Condition.new();
      deep.contains.lt = Condition.new();
      deep.contains.gte = Condition.new();
      deep.contains.lte = Condition.new();
      deep.contains.in = Condition.new();
      deep.contains.nin = Condition.new();

      const Logic = deep.contains.Logic = Relation.new();

      const and = deep.contains.and = Logic.new();
      const or = deep.contains.or = Logic.new();
      const not = deep.contains.not = Logic.new();

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

      deep.contains.orderIs = deep.new([
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

      const Isable = deep.contains.Isable = deep.new();

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
      
      deep.contains.Compatable = _insert(deep, Any, Any);

      // Any
    
      deep.contains.AnyHas = deep.contains.MethodHas.new((current, it) => current.call === it);
      _insert(deep.contains.Compatable, deep.contains.AnyHas, deep.contains.Any);

      deep.contains.AnyGet = deep.contains.MethodGet.new((current, it) => current.call === it ? it : it);
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

      deep.contains.AnyReduce = deep.contains.MethodReduce.new((current, callback: (accumulator?: any, currentValue?: any) => any, initialValue?: any): any => callback(initialValue, current.call));
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
        if (key !== value) throw new Error(`💁 Can't set into Set when key != value`);
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

      deep.contains.SetEach = deep.contains.MethodEach.new((current, callback: (value: any, key: any) => void) => {
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

      deep.contains.ArrayReduce = deep.contains.MethodSort.new((current, callback: (accumulator: any, currentValue?: any) => any, initialValue?: any) => {
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

  private _contains: Contains;
  get contains() {
    if (!this._contains) {
      const _contains = new Contains(this);
      this._contains = new Proxy(_contains, Contains._proxy);
    }
    return this._contains;
  }

  id(value?: string, agent: Deep = this.deep): string {
    const ids = this.ids;
    if (!ids.size || arguments.length) {
      const id = this.deep.contains.Id.new(value || uuidv4());
      id.from = agent;
      id.to = this;
      return id.call;
    } else {
      for (let id of ids) return id.call;
      throw new Error(`🤔 Unexpected, ids can't be empty here.`);
    }
  }
  get ids(): Set<Deep> {
    const ids = new Set<Deep>();
    this.in.each(i => i.type === this.deep.contains.Id && ids.add(i));
    // for (let i of this.in) {
    //   if (i.type === this.deep.contains.Id) {
    //     ids.add(i);
    //   }
    // }
    return ids;
  }

  get name(): string {
    let name: string = '';
    for (let i of this.in.call) {
      if (i.type === this.deep.contains.Contain) {
        name = i.call;
        break;
      }
    }
    // if (this.type && this.type != this) {
    //   name += `(${this.type.name})`;
    // }
    return name;
  }

  new(value?: any) {
    const deep = new Deep(this.deep);
    this.deep.memory.all.add(deep);
    deep.type = this;
    if (arguments.length) deep.value = value;
    return deep;
  }

  wrap(value?: any) {
    if (isDeep(value)) return value;
    else {
      const valued = this.deep.memory.values.many(value);
      if (valued.size) {
        if (!valued.size) throw new Error(`🤔 Unexpected, value can't be in all, but not values.`);
        if (valued.size != 1) throw new Error(`🤔 Unexpected, value can only one Deep in .memory.values.many.`);
        for (let v of valued) {
          return v;
        }
      } else return this.Value(value);
    }
  }

  kill() {
    this.deep.memory.all.delete(this);
    this.deep.memory.values.unset(this);
    this.type = undefined;
    this.from = undefined;
    this.to = undefined;
    if (this._on) this._on.kill();
  }

  get iterator() { return makeIterator(this.call); };
  [Symbol.iterator]() { return this.iterator; };

  get call() {
    let value = this.value;
    if (isDeep(value)) value = value.value;
    return value;
  }
  get value() {
    return this.deep.memory.values.get(this);
  }
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
  set value(value) {
    if (isUndefined(value)) {
      if (isValue(this.value)) throw new Error(`🤦 If .value is Value, it's can't be ereised!`);
      this.deep.memory.values.unset(this);
    } else if (isValue(value)) {
      this.deep.memory.values.unset(this);
      this.value = this.Value(value);
    } else if (isDeep(value) && isValue(value.value)) {
      this.deep.memory.values.unset(this);
      this.deep.memory.values.set(this, value);
    } else throw new Error('🙅 Value must be isValue(value) or isValue(value.value) or isUndefined(value)');
  }
  get valued() {
    return this.wrap(this.deep.memory.values.many(this));
  }
  get type() { return this.deep.memory.types.get(this); }
  set type(it: Deep | undefined) {
    const prev = this.type;
    if (isUndefined(it)) this.deep.memory.types.unset(this);
    else this.deep.memory.types.set(this, it);
    if (!this.deep._events) return;
    let notifiedSelections = new Set();
    for (let d of this.deep.memory.types.many(this.deep.contains.type)) {
      if (d?.to?.to && d.to.type == this.deep.contains.Selection && d.to.to.call.has(it)) {
        d.emit();
        notifiedSelections.add(d.to);
      } else if (d.to == it || d.to == prev) {
        d.emit();
        notifiedSelections.add(d.from);
      }
    }
    for (let selection of this.deep.memory.types.many(this.deep.contains.Selection)) {
      if (!notifiedSelections.has(notifiedSelections) && selection.to && selection.to.call.has(this)) selection.emit();
    }
  }
  get typed() { return this.wrap(this.deep.memory.types.many(this)); }
  get from() { return this.deep.memory.froms.get(this); }
  set from(it: Deep | undefined) {
    const prev = this.from;
    if (isUndefined(it)) this.deep.memory.froms.unset(this);
    else this.deep.memory.froms.set(this, it);
    if (!this.deep._events) return;
    let notifiedSelections = new Set();
    for (let d of this.deep.memory.types.many(this.deep.contains.from)) {
      if (d?.to?.to && d.to.type == this.deep.contains.Selection && d.to.to.has(it)) {
        d.emit();
        notifiedSelections.add(d.to);
      } else if (d.to == it || d.to == prev) {
        d.emit();
        notifiedSelections.add(d.from);
      }
    }
    for (let selection of this.deep.memory.types.many(this.deep.contains.Selection)) {
      if (!notifiedSelections.has(notifiedSelections) && selection.to && selection.to.call.has(this)) selection.emit();
    }
  }
  get out() { return this.wrap(this.deep.memory.froms.many(this)); }
  get to() { return this.deep.memory.tos.get(this); }
  set to(it: Deep | undefined) {
    const prev = this.type;
    if (isUndefined(it)) this.deep.memory.tos.unset(this);
    else this.deep.memory.tos.set(this, it);
    if (!this.deep._events) return;
    let notifiedSelections = new Set();
    for (let d of this.deep.memory.types.many(this.deep.contains.to)) {
      if (d?.to?.to && d.to.type == this.deep.contains.Selection && d.to.to.has(it)) {
        d.emit();
        notifiedSelections.add(d.to);
      } else if (d.to == it || d.to == prev) {
        d.emit();
        notifiedSelections.add(d.from);
      }
    }
    for (let selection of this.deep.memory.types.many(this.deep.contains.Selection)) {
      if (!notifiedSelections.has(notifiedSelections) && selection.to && selection.to.call.has(this)) selection.emit();
    }
  }
  get in() { return this.wrap(this.deep.memory.tos.many(this)); }

  typeof(check) {
    if (!check) return false;
    const type = this?.type;
    if (type === check) return true;
    if (type && type != this) return type.typeof(check);
    return false;
  }
  typeofs(array: any[] = []) {
    const type = this.type;
    if (type && type != this) {
      array.push(type);
      return type.typeofs(array);
    }
    return array;
  }

  is(value) {
    if (isDeep(value)) return Deep;
    else {
      // TODO orderId must be links not array
      for (let is of this.deep.contains.orderIs.call) {
        if (is.call(value)) {
          const outs = is.out.call;
          for (let out of outs) {
            if (out.type === this.deep.contains.Isable) return out.to;
          }
        }
      }
      return this.deep.contains.Unxpected;
    }
  }

  _method(name: string): any {
    const Type = this._is(this.call);
    const typedMethods = this.deep.contains[`Method${name}`].typed;
    for (let method of typedMethods.call) {
      for (let out of method.out.call) {
        if (out.type === this.deep.contains.Compatable && out.to === Type) {
          return method?.call;
        }
      }
    }
    return this.deep.contains[`Any${name}`].call;
  }

  has(...args) { return this._method('Has')(this, ...args); }
  get(...args) { return this._method('Get')(this, ...args); }
  get size() { return this._method('Size')(this); }
  map(...args) { return this._method('Map')(this, ...args); }
  add(...args) { return this._method('Add')(this, ...args); }
  set(...args) { return this._method('Set')(this, ...args); }
  unset(...args) { return this._method('Unset')(this, ...args); }
  get keys() { return this._method('Keys')(this); }
  get values() { return this._method('Values')(this); }
  find(...args) { return this._method('Find')(this, ...args); }
  filter(...args) { return this._method('Filter')(this, ...args); }
  each(...args) { return this._method('Each')(this, ...args); }
  sort(...args) { return this._method('Sort')(this, ...args); }
  reduce(...args) { return this._method('Reduce')(this, ...args); }
  get first() { return this._method('First')(this); }
  get last() { return this._method('Last')(this); }
  join(...args) { return this._method('Join')(this, ...args); }
  toString(...args) { return this._method('ToString')(this, ...args); }
  valueOf(...args) { return this._method('ValueOf')(this, ...args); }

  exp(input: any, selection: Deep) {
    if (isDeep(input) || !isPlainObject(input)) throw new Error(`🙅 Exp must be plain object`);
    const exp: any = this.deep.contains.Exp.new({});
    for (let key in this.deep.contains.relations.call) {
      if (input.hasOwnProperty(key)) {
        const relation = this.deep.contains[key].new();
        if (isDeep(input[key])) {
          exp.call[key] = input[key];
        } else if (isPlainObject(input[key])) {
          const nestedSelection = this.selection();
          this.exp(input[key], nestedSelection);
          exp.call[key] = nestedSelection;
          nestedSelection.on(() => relation.emit());
        } else throw new Error(`🙅 Only Deep or plain objects Exp can be value in exp (${key})!`);
        relation.from = selection;
        relation.to = exp.call[key];
        relation.on(() => selection.emit());
      }
    }
    return exp;
  }

  selection() {
    const rels = this.deep.contains.relations.call;
    const selection = this.deep.contains.Selection.new(() => {
      const relations = selection.out;
      let set;
      for (let relation of relations) {
        if (relation.typeof(this.deep.contains.Relation)) {
          if (relation.typeof(this.deep.contains.Many)) {
            const nextSet = new Set([relation.to[rels[relation.type.name].invert]]);
            set = set ? set.intersection(nextSet) : nextSet;
          } else if (relation.typeof(this.deep.contains.One)) {
            const nextSet = relation.to.type === this.deep.contains.Selection ?
            relation.to.call().reduce((result, d) => result.union(d[rels[relation.type.name].invert].call), new Set()) :
            relation.to[rels[relation.type.name].invert].call;
            set = set ? set.intersection(nextSet) : nextSet;
          } else if (relation.typeof(this.deep.contains.Condition)) {
            
          } else if (relation.typeof(this.deep.contains.Logic)) {
            
          }
        }
      }
      if (!set) set = this.deep.contains.Everything;
      const result = this.wrap(set);
      selection.to = result;
      return selection.to;
    });
    return selection;
  }
  select(input: any) {
    let selection;
    if (isDeep(input) && input.type === this.deep.contains.Selection) selection = input;
    else if (!isDeep(input) && isObject(input)) {
      const rels = this.deep.contains.relations.call;
      selection = this.selection();
      const exp = this.exp(input, selection);
      selection.from = exp;
      selection.call();
    }
    else throw new Error(`🙅 Exp must be an object!`);
    return selection;
  }

  _on: OnI;
  get on() {
    if (!this._on) this._on = On();
    return this._on;
  }
  emit(...args) {
    if (this._on) this._on.emit(...args);
  }
}

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
      if (key === 'deep') throw new Error('🙅 Key "deep" is reserved in contains!');
      if (!isDeep(value)) throw new Error('🙅 Value must be Deep!');
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
