# Deep API Reference

## Overview

Deep is a powerful semantic computing framework that enables the creation and manipulation of semantic graphs.
This API documentation covers the core functionality of the Deep framework.

## Installation

```bash
npm install @deep-foundation/deep
```

## API Documentation

@deep-foundation/deep

# @deep-foundation/deep

## Table of contents

### Classes

- Contains
- Deep

### Interfaces

- DeepEvent

---

@deep-foundation/deep / Contains

# Class: Contains

Contains class for managing contains relationships

## Indexable

▪ [key: `string`]: `Deep`

## Table of contents

### Constructors

- constructor

### Properties

- deep
- \_proxy

## Constructors

### constructor

• **new Contains**(`deep`): `Contains`

#### Parameters

| Name | Type |
| :------ | :------ |
| `deep` | `any` |

#### Returns

`Contains`

#### Defined in



## Properties

### deep

• **deep**: `Deep`

#### Defined in



___

### \_proxy

▪ `Static` **\_proxy**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `get` | (`target`: `any`, `key`: `any`, `receiver`: `any`) => `any` |
| `set` | (`target`: `any`, `key`: `any`, `value`: `any`, `receiver`: `any`) => `boolean` |

#### Defined in

---

@deep-foundation/deep / Deep

# Class: Deep

## Indexable

▪ [key: `string`]: `any`

## Table of contents

### Constructors

- constructor

### Properties

- \_events
- deep
- memory

### Accessors

- call
- contains
- first
- from
- fullName
- ids
- in
- keys
- last
- name
- on
- out
- size
- to
- type
- typed
- value
- valued
- values

### Methods

- Value
- [[iterator]](Deep.md#[iterator])
- \_is
- \_method
- add
- each
- emit
- exp
- filter
- find
- get
- has
- id
- is
- isDeep
- isValue
- join
- kill
- map
- new
- reduce
- select
- selection
- set
- sort
- toString
- typeof
- typeofs
- unset
- valueOf
- wrap

## Constructors

### constructor

• **new Deep**(`deep?`): `Deep`

Creates a new Deep instance with the given deep as the root agent Deep with memory index.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `deep` | `Deep` | Parent Deep instance |

#### Returns

`Deep`

#### Defined in



## Properties

### \_events

• `Optional` **\_events**: `boolean`

#### Defined in



___

### deep

• **deep**: `Deep`

#### Defined in



___

### memory

• **memory**: `Memory`

#### Defined in



## Accessors

### call

• `get` **call**(): `any`

Gets the value of this Deep instance, resolving Deep values recursively by deeps to their primitive js value.

#### Returns

`any`

Resolved value

#### Defined in



___

### contains

• `get` **contains**(): `any`

Gets the container for managing contains relationships, based on this.deep.Contain where .from is parent, and .to is children.

#### Returns

`any`

Contains instance

#### Defined in



___

### first

• `get` **first**(): `any`

Gets the first value in this Deep instance

#### Returns

`any`

First value

#### Defined in



___

### from

• `get` **from**(): `Deep`

Gets the 'from' reference of this Deep instance

#### Returns

`Deep`

From Deep instance

#### Defined in



• `set` **from**(`it`): `void`

Sets the 'from' reference of this Deep instance

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `it` | `Deep` | From Deep instance to set |

#### Returns

`void`

#### Defined in



___

### fullName

• `get` **fullName**(): `string`

Gets the full name including recursive by types information

#### Returns

`string`

Full name string as CurrentName(TypeName(TypeTypeName))

#### Defined in



___

### ids

• `get` **ids**(): `Set`\<`Deep`\>

Gets all deep.Id isntances where .to = this.

#### Returns

`Set`\<`Deep`\>

Set of Deep instances representing IDs

#### Defined in



___

### in

• `get` **in**(): `any`

Gets Deep instances that have this instance as their 'to' reference

#### Returns

`any`

Deep instance with .call == set of results.

#### Defined in



___

### keys

• `get` **keys**(): `any`

Gets the keys of this Deep instance's value

#### Returns

`any`

Keys

#### Defined in



___

### last

• `get` **last**(): `any`

Gets the last value in this Deep instance

#### Returns

`any`

Last value

#### Defined in



___

### name

• `get` **name**(): `string`

Gets the first founded name of this Deep instance based on its contain relationships.

#### Returns

`string`

Name string

#### Defined in



___

### on

• `get` **on**(): `any`

Gets, or creates if not exists the event emitter for this Deep instance

#### Returns

`any`

Event emitter instance

#### Defined in



___

### out

• `get` **out**(): `any`

Gets Deep instances that have this instance as their 'from' reference

#### Returns

`any`

Deep instance with .call == set of results.

#### Defined in



___

### size

• `get` **size**(): `any`

Gets the size of this Deep instance's value

#### Returns

`any`

Size value

#### Defined in



___

### to

• `get` **to**(): `Deep`

Gets the 'to' reference of this Deep instance

#### Returns

`Deep`

To Deep instance

#### Defined in



• `set` **to**(`it`): `void`

Sets the 'to' reference of this Deep instance

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `it` | `Deep` | To Deep instance to set |

#### Returns

`void`

#### Defined in



___

### type

• `get` **type**(): `Deep`

Gets the type of this Deep instance

#### Returns

`Deep`

Type Deep instance

#### Defined in



• `set` **type**(`it`): `void`

Sets the type of this Deep instance

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `it` | `Deep` | Type to set |

#### Returns

`void`

#### Defined in



___

### typed

• `get` **typed**(): `any`

Gets Deep instances that have this instance as a type.

#### Returns

`any`

Deep instance with .call == set of results.

#### Defined in



___

### value

• `get` **value**(): `any`

Gets the value stored in this Deep instance, can be other Deep instance.

#### Returns

`any`

Stored value

#### Defined in



• `set` **value**(`value`): `void`

Sets the value in this Deep instance. Value wrap into untyped Deep instance, if this Deep is typed. Values not duplicating inside this.deep.memory.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `any` | Value to set |

#### Returns

`void`

#### Defined in



___

### valued

• `get` **valued**(): `any`

Gets Deep instances that have this instance as a value

#### Returns

`any`

Deep instance with .call == set of results.

#### Defined in



___

### values

• `get` **values**(): `any`

Gets the values of this Deep instance

#### Returns

`any`

Values

#### Defined in



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



___

### [iterator]

▸ **[iterator]**(): `SetIterator`\<`any`\> \| \{ `next`: () => \{ `done`: `boolean` = !(index in data); `value`: `any`  }  }

Gets an iterator for this Deep instance's value, any Deep instance can be iterated in for of.

#### Returns

`SetIterator`\<`any`\> \| \{ `next`: () => \{ `done`: `boolean` = !(index in data); `value`: `any`  }  }

Iterator

#### Defined in



___

### \_is

▸ **_is**(`value`): `Deep`

Determines the Deep type of a given value

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `any` | Value to check type of |

#### Returns

`Deep`

Deep instance representing the type, instance of this.deep.contains.Value

#### Defined in



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



___

### exp

▸ **exp**(`input`, `selection`): `any`

Expands input into a deep.Exp.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `input` | `any` | Plain expression object. |
| `selection` | `Deep` | Instance of deep.Selection. |

#### Returns

`any`

Expanded deep.Exp

#### Defined in



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



___

### id

▸ **id**(`value?`, `agent?`): `string`

Gets the deep.Id instance .to this Deep instance .from current this.deep agent. If no ID is set, one will be created.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value?` | `string` | Optional ID value |
| `agent` | `Deep` | Optional agent Deep instance |

#### Returns

`string`

ID value

#### Defined in



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



___

### kill

▸ **kill**(): `void`

Removes this Deep instance and all its references, also kill event emitting.

#### Returns

`void`

#### Defined in



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



___

### new

▸ **new**(`value?`): `Deep`

Creates a new Deep instance of this type

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value?` | `any` | Optional initial value |

#### Returns

`Deep`

New Deep instance

#### Defined in



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



___

### selection

▸ **selection**(): `any`

Creates a new selection. Can be observed by selection.on(event => {}), and recalculated with selection.call();

#### Returns

`any`

New selection Deep instance

#### Defined in



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

---

@deep-foundation/deep / DeepEvent

# Interface: DeepEvent

## Table of contents

### Properties

- deep
- name
- next
- prev

## Properties

### deep

• **deep**: `Deep`

#### Defined in



___

### name

• **name**: ``"change"``

#### Defined in



___

### next

• **next**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `from?` | `Deep` |
| `id?` | `string` |
| `to?` | `Deep` |
| `type?` | `Deep` |
| `value?` | `any` |

#### Defined in



___

### prev

• **prev**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `from?` | `Deep` |
| `id?` | `string` |
| `to?` | `Deep` |
| `type?` | `Deep` |
| `value?` | `any` |

#### Defined in

---

