[@deep-foundation/deep](../README.md) / Deep

# Class: Deep

## Indexable

▪ [key: `string`]: `any`

## Table of contents

### Constructors

- [constructor](Deep.md#constructor)

### Properties

- [\_events](Deep.md#_events)
- [deep](Deep.md#deep)
- [memory](Deep.md#memory)

### Accessors

- [call](Deep.md#call)
- [contains](Deep.md#contains)
- [first](Deep.md#first)
- [from](Deep.md#from)
- [fullName](Deep.md#fullname)
- [ids](Deep.md#ids)
- [in](Deep.md#in)
- [keys](Deep.md#keys)
- [last](Deep.md#last)
- [name](Deep.md#name)
- [on](Deep.md#on)
- [out](Deep.md#out)
- [size](Deep.md#size)
- [to](Deep.md#to)
- [type](Deep.md#type)
- [typed](Deep.md#typed)
- [value](Deep.md#value)
- [valued](Deep.md#valued)
- [values](Deep.md#values)

### Methods

- [Value](Deep.md#value-1)
- [[iterator]](Deep.md#[iterator])
- [\_is](Deep.md#_is)
- [\_method](Deep.md#_method)
- [add](Deep.md#add)
- [each](Deep.md#each)
- [emit](Deep.md#emit)
- [exp](Deep.md#exp)
- [filter](Deep.md#filter)
- [find](Deep.md#find)
- [get](Deep.md#get)
- [has](Deep.md#has)
- [id](Deep.md#id)
- [is](Deep.md#is)
- [isDeep](Deep.md#isdeep)
- [isValue](Deep.md#isvalue)
- [join](Deep.md#join)
- [kill](Deep.md#kill)
- [map](Deep.md#map)
- [new](Deep.md#new)
- [reduce](Deep.md#reduce)
- [select](Deep.md#select)
- [selection](Deep.md#selection)
- [set](Deep.md#set)
- [sort](Deep.md#sort)
- [toString](Deep.md#tostring)
- [typeof](Deep.md#typeof)
- [typeofs](Deep.md#typeofs)
- [unset](Deep.md#unset)
- [valueOf](Deep.md#valueof)
- [wrap](Deep.md#wrap)

## Constructors

### constructor

• **new Deep**(`deep?`): [`Deep`](Deep.md)

Creates a new Deep instance with the given deep as the root agent Deep with memory index.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `deep` | [`Deep`](Deep.md) | Parent Deep instance |

#### Returns

[`Deep`](Deep.md)

#### Defined in

[deep.ts:131](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L131)

## Properties

### \_events

• `Optional` **\_events**: `boolean`

#### Defined in

[deep.ts:125](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L125)

___

### deep

• **deep**: [`Deep`](Deep.md)

#### Defined in

[deep.ts:123](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L123)

___

### memory

• **memory**: `Memory`

#### Defined in

[deep.ts:124](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L124)

## Accessors

### call

• `get` **call**(): `any`

Gets the value of this Deep instance, resolving Deep values recursively by deeps to their primitive js value.

#### Returns

`any`

Resolved value

#### Defined in

[deep.ts:1141](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L1141)

___

### contains

• `get` **contains**(): `any`

Gets the container for managing contains relationships, based on this.deep.Contain where .from is parent, and .to is children.

#### Returns

`any`

Contains instance

#### Defined in

[deep.ts:1030](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L1030)

___

### first

• `get` **first**(): `any`

Gets the first value in this Deep instance

#### Returns

`any`

First value

#### Defined in

[deep.ts:1357](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L1357)

___

### from

• `get` **from**(): [`Deep`](Deep.md)

Gets the 'from' reference of this Deep instance

#### Returns

[`Deep`](Deep.md)

From Deep instance

#### Defined in

[deep.ts:941](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L941)

• `set` **from**(`it`): `void`

Sets the 'from' reference of this Deep instance

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `it` | [`Deep`](Deep.md) | From Deep instance to set |

#### Returns

`void`

#### Defined in

[deep.ts:947](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L947)

___

### fullName

• `get` **fullName**(): `string`

Gets the full name including recursive by types information

#### Returns

`string`

Full name string as CurrentName(TypeName(TypeTypeName))

#### Defined in

[deep.ts:1072](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L1072)

___

### ids

• `get` **ids**(): `Set`\<[`Deep`](Deep.md)\>

Gets all deep.Id isntances where .to = this.

#### Returns

`Set`\<[`Deep`](Deep.md)\>

Set of Deep instances representing IDs

#### Defined in

[deep.ts:1042](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L1042)

___

### in

• `get` **in**(): `any`

Gets Deep instances that have this instance as their 'to' reference

#### Returns

`any`

Deep instance with .call == set of results.

#### Defined in

[deep.ts:1190](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L1190)

___

### keys

• `get` **keys**(): `any`

Gets the keys of this Deep instance's value

#### Returns

`any`

Keys

#### Defined in

[deep.ts:1310](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L1310)

___

### last

• `get` **last**(): `any`

Gets the last value in this Deep instance

#### Returns

`any`

Last value

#### Defined in

[deep.ts:1363](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L1363)

___

### name

• `get` **name**(): `string`

Gets the first founded name of this Deep instance based on its contain relationships.

#### Returns

`string`

Name string

#### Defined in

[deep.ts:1057](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L1057)

___

### on

• `get` **on**(): `any`

Gets, or creates if not exists the event emitter for this Deep instance

#### Returns

`any`

Event emitter instance

#### Defined in

[deep.ts:1509](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L1509)

___

### out

• `get` **out**(): `any`

Gets Deep instances that have this instance as their 'from' reference

#### Returns

`any`

Deep instance with .call == set of results.

#### Defined in

[deep.ts:1184](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L1184)

___

### size

• `get` **size**(): `any`

Gets the size of this Deep instance's value

#### Returns

`any`

Size value

#### Defined in

[deep.ts:1276](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L1276)

___

### to

• `get` **to**(): [`Deep`](Deep.md)

Gets the 'to' reference of this Deep instance

#### Returns

[`Deep`](Deep.md)

To Deep instance

#### Defined in

[deep.ts:974](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L974)

• `set` **to**(`it`): `void`

Sets the 'to' reference of this Deep instance

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `it` | [`Deep`](Deep.md) | To Deep instance to set |

#### Returns

`void`

#### Defined in

[deep.ts:980](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L980)

___

### type

• `get` **type**(): [`Deep`](Deep.md)

Gets the type of this Deep instance

#### Returns

[`Deep`](Deep.md)

Type Deep instance

#### Defined in

[deep.ts:908](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L908)

• `set` **type**(`it`): `void`

Sets the type of this Deep instance

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `it` | [`Deep`](Deep.md) | Type to set |

#### Returns

`void`

#### Defined in

[deep.ts:914](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L914)

___

### typed

• `get` **typed**(): `any`

Gets Deep instances that have this instance as a type.

#### Returns

`any`

Deep instance with .call == set of results.

#### Defined in

[deep.ts:1178](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L1178)

___

### value

• `get` **value**(): `any`

Gets the value stored in this Deep instance, can be other Deep instance.

#### Returns

`any`

Stored value

#### Defined in

[deep.ts:874](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L874)

• `set` **value**(`value`): `void`

Sets the value in this Deep instance. Value wrap into untyped Deep instance, if this Deep is typed. Values not duplicating inside this.deep.memory.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `any` | Value to set |

#### Returns

`void`

#### Defined in

[deep.ts:882](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L882)

___

### valued

• `get` **valued**(): `any`

Gets Deep instances that have this instance as a value

#### Returns

`any`

Deep instance with .call == set of results.

#### Defined in

[deep.ts:1170](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L1170)

___

### values

• `get` **values**(): `any`

Gets the values of this Deep instance

#### Returns

`any`

Values

#### Defined in

[deep.ts:1316](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L1316)

## Methods

### Value

▸ **Value**(`value`): `any`

Creates a new Deep instance of the appropriate type for a value

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `any` | Value to create Deep instance for |

#### Returns

`any`

New Deep instance

#### Defined in

[deep.ts:1152](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L1152)

___

### [iterator]

▸ **[iterator]**(): `SetIterator`\<`any`\> \| \{ `next`: () => \{ `done`: `boolean` = !(index in data); `value`: `any`  }  }

Gets an iterator for this Deep instance's value, any Deep instance can be iterated in for of.

#### Returns

`SetIterator`\<`any`\> \| \{ `next`: () => \{ `done`: `boolean` = !(index in data); `value`: `any`  }  }

Iterator

#### Defined in

[deep.ts:1135](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L1135)

___

### \_is

▸ **_is**(`value`): [`Deep`](Deep.md)

Determines the Deep type of a given value

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `any` | Value to check type of |

#### Returns

[`Deep`](Deep.md)

Deep instance representing the type, instance of this.deep.contains.Value

#### Defined in

[deep.ts:1008](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L1008)

___

### \_method

▸ **_method**(`name`): `any`

Gets a method implementation for this Deep instance

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `name` | `string` | Method name |

#### Returns

`any`

Method implementation

#### Defined in

[deep.ts:1245](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L1245)

___

### add

▸ **add**(`...args`): `any`

Adds a value to this Deep instance

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...args` | `any`[] | Arguments for add operation |

#### Returns

`any`

Result of add operation

#### Defined in

[deep.ts:1290](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L1290)

___

### each

▸ **each**(`...args`): `any`

Executes a callback for each value in this Deep instance

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...args` | `any`[] | Arguments for each operation |

#### Returns

`any`

Result of each operation

#### Defined in

[deep.ts:1337](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L1337)

___

### emit

▸ **emit**(`...args`): `void`

Emits an event from this Deep instance

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...args` | `any`[] | Event arguments |

#### Returns

`void`

#### Defined in

[deep.ts:1518](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L1518)

___

### exp

▸ **exp**(`input`, `selection`): `any`

Expands input into a deep.Exp.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `input` | `any` | Plain expression object. |
| `selection` | [`Deep`](Deep.md) | Instance of deep.Selection. |

#### Returns

`any`

Expanded deep.Exp

#### Defined in

[deep.ts:1392](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L1392)

___

### filter

▸ **filter**(`...args`): `any`

Filters values in this Deep instance

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...args` | `any`[] | Arguments for filter operation |

#### Returns

`any`

Filtered values

#### Defined in

[deep.ts:1330](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L1330)

___

### find

▸ **find**(`...args`): `any`

Finds a value in this Deep instance

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...args` | `any`[] | Arguments for find operation |

#### Returns

`any`

Found value

#### Defined in

[deep.ts:1323](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L1323)

___

### get

▸ **get**(`...args`): `any`

Gets a value from this Deep instance

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...args` | `any`[] | Arguments for get operation |

#### Returns

`any`

Retrieved value

#### Defined in

[deep.ts:1270](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L1270)

___

### has

▸ **has**(`...args`): `any`

Checks if this Deep instance has a specific value

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...args` | `any`[] | Arguments for has check |

#### Returns

`any`

Result of has check

#### Defined in

[deep.ts:1263](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L1263)

___

### id

▸ **id**(`value?`, `agent?`): `string`

Gets the deep.Id instance .to this Deep instance .from current this.deep agent. If no ID is set, one will be created.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value?` | `string` | Optional ID value |
| `agent` | [`Deep`](Deep.md) | Optional agent Deep instance |

#### Returns

`string`

ID value

#### Defined in

[deep.ts:849](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L849)

___

### is

▸ **is**(`value`): `any`

Determines the type of a value based on deep.Isable.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `any` | Value to check |

#### Returns

`any`

Deep type instance

#### Defined in

[deep.ts:1224](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L1224)

___

### isDeep

▸ **isDeep**(`it`): it is Deep

Checks if the given value is a Deep instance

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `it` | `any` | Value to check |

#### Returns

it is Deep

True if the value is a Deep instance

#### Defined in

[deep.ts:114](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L114)

___

### isValue

▸ **isValue**(`it`): `boolean`

Checks if the given value is a non-Deep value and not undefined

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `it` | `any` | Value to check |

#### Returns

`boolean`

True if the value is neither Deep nor undefined

#### Defined in

[deep.ts:121](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L121)

___

### join

▸ **join**(`...args`): `any`

Joins values in this Deep instance

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...args` | `any`[] | Arguments for join operation |

#### Returns

`any`

Joined string

#### Defined in

[deep.ts:1370](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L1370)

___

### kill

▸ **kill**(): `void`

Removes this Deep instance and all its references, also kill event emitting.

#### Returns

`void`

#### Defined in

[deep.ts:1122](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L1122)

___

### map

▸ **map**(`...args`): `any`

Maps over values in this Deep instance

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...args` | `any`[] | Arguments for map operation |

#### Returns

`any`

Mapped values

#### Defined in

[deep.ts:1283](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L1283)

___

### new

▸ **new**(`value?`): [`Deep`](Deep.md)

Creates a new Deep instance of this type

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value?` | `any` | Optional initial value |

#### Returns

[`Deep`](Deep.md)

New Deep instance

#### Defined in

[deep.ts:1085](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L1085)

___

### reduce

▸ **reduce**(`...args`): `any`

Reduces values in this Deep instance

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...args` | `any`[] | Arguments for reduce operation |

#### Returns

`any`

Reduced value

#### Defined in

[deep.ts:1351](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L1351)

___

### select

▸ **select**(`input`): `any`

Selects based on input criteria

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `input` | `any` | Plain expression object. |

#### Returns

`any`

Instance of deep.Selection

#### Defined in

[deep.ts:1492](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L1492)

___

### selection

▸ **selection**(): `any`

Creates a new selection. Can be observed by selection.on(event => {}), and recalculated with selection.call();

#### Returns

`any`

New selection Deep instance

#### Defined in

[deep.ts:1444](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L1444)

___

### set

▸ **set**(`...args`): `any`

Sets a value in this Deep instance

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...args` | `any`[] | Arguments for set operation |

#### Returns

`any`

Result of set operation

#### Defined in

[deep.ts:1297](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L1297)

___

### sort

▸ **sort**(`...args`): `any`

Sorts values in this Deep instance

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...args` | `any`[] | Arguments for sort operation |

#### Returns

`any`

Sorted values

#### Defined in

[deep.ts:1344](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L1344)

___

### toString

▸ **toString**(`...args`): `any`

Converts this Deep instance to a string

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...args` | `any`[] | Arguments for toString operation |

#### Returns

`any`

String representation

#### Defined in

[deep.ts:1377](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L1377)

___

### typeof

▸ **typeof**(`check`): `any`

Checks if this Deep instance is of a specific type

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `check` | `any` | Type to check against |

#### Returns

`any`

True if instance is of the specified type

#### Defined in

[deep.ts:1197](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L1197)

___

### typeofs

▸ **typeofs**(`array?`): `any`

Gets an array of all types in the type hierarchy up.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `array` | `any`[] | `[]` | Optional array to append types to |

#### Returns

`any`

Array of types

#### Defined in

[deep.ts:1210](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L1210)

___

### unset

▸ **unset**(`...args`): `any`

Removes a value from this Deep instance

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...args` | `any`[] | Arguments for unset operation |

#### Returns

`any`

Result of unset operation

#### Defined in

[deep.ts:1304](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L1304)

___

### valueOf

▸ **valueOf**(`...args`): `any`

Gets the primitive value of this Deep instance

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...args` | `any`[] | Arguments for valueOf operation |

#### Returns

`any`

Primitive value

#### Defined in

[deep.ts:1384](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L1384)

___

### wrap

▸ **wrap**(`value?`): `any`

Wraps a value in a Deep instance if it isn't already, or returns existing Deep instance.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value?` | `any` | Value to wrap |

#### Returns

`any`

Deep instance containing the value

#### Defined in

[deep.ts:1105](https://github.com/ivansglazunov/deep7/blob/db4835e6af403f61b6c01a9c90183552c707b1c1/src/deep.ts#L1105)
