# Deep API Reference

## Overview

Deep is a powerful semantic computing framework that enables the creation and manipulation of semantic graphs.
This API documentation covers the core functionality of the Deep framework.

## Installation

```bash
npm install @deep-foundation/deep
```

## Table of Contents

- [Contains](#contains)
- [Deep](#deep)
- [Index](#index)
- [Memory](#memory)

## API Documentation

## Contains

Contains class for managing contains relationships

### Constructor

```typescript
constructornew Contains(deep: any): Contains
```

### Properties

### _proxy

**Type:** `object`

### deep

**Type:** `Deep`

## Deep

### Constructor

```typescript
constructornew Deep(deep?: Deep): Deep
```

Creates a new Deep instance with the given deep as the root agent Deep with memory index.

### Properties

### _events

**Type:** `boolean`

**Optional**

### call

### contains

### deep

**Type:** `Deep`

### first

### from

### fullName

### ids

### in

### keys

### last

### memory

**Type:** `Memory`

### name

### on

### out

### size

### to

### type

### typed

### value

### valued

### values

### Methods

### _is

Determines the Deep type of a given value

```typescript
_is(value: any): Deep
```

**Parameters:**

- `value` (`any`): 

### _method

Gets a method implementation for this Deep instance

```typescript
_method(name: string): any
```

**Parameters:**

- `name` (`string`): 

### [iterator]

Gets an iterator for this Deep instance's value, any Deep instance can be iterated in for of.

```typescript
[iterator](): any
```

### add

Adds a value to this Deep instance

```typescript
add(args: any[]): any
```

**Parameters:**

- `args` (`any[]`): 

### each

Executes a callback for each value in this Deep instance

```typescript
each(args: any[]): any
```

**Parameters:**

- `args` (`any[]`): 

### emit

Emits an event from this Deep instance

```typescript
emit(args: any[]): void
```

**Parameters:**

- `args` (`any[]`): 

### exp

Expands input into a deep.Exp.

```typescript
exp(input: any, selection: Deep): any
```

**Parameters:**

- `input` (`any`): 
- `selection` (`Deep`): 

### filter

Filters values in this Deep instance

```typescript
filter(args: any[]): any
```

**Parameters:**

- `args` (`any[]`): 

### find

Finds a value in this Deep instance

```typescript
find(args: any[]): any
```

**Parameters:**

- `args` (`any[]`): 

### get

Gets a value from this Deep instance

```typescript
get(args: any[]): any
```

**Parameters:**

- `args` (`any[]`): 

### has

Checks if this Deep instance has a specific value

```typescript
has(args: any[]): any
```

**Parameters:**

- `args` (`any[]`): 

### id

Gets the deep.Id instance .to this Deep instance .from current this.deep agent. If no ID is set, one will be created.

```typescript
id(value?: string, agent: Deep): string
```

**Parameters:**

- `value` (`string`): 
- `agent` (`Deep`): 

### inof

Returns a Deep instance containing a Set of nodes that have incoming links of the specified type

```typescript
inof(type: Deep): Deep
```

**Parameters:**

- `type` (`Deep`): 

### is

Determines the type of a value based on deep.Isable.

```typescript
is(value: any): any
```

**Parameters:**

- `value` (`any`): 

### isDeep

Checks if the given value is a Deep instance

```typescript
isDeep(it: any): boolean
```

**Parameters:**

- `it` (`any`): 

### isValue

Checks if the given value is a non-Deep value and not undefined

```typescript
isValue(it: any): boolean
```

**Parameters:**

- `it` (`any`): 

### join

Joins values in this Deep instance

```typescript
join(args: any[]): any
```

**Parameters:**

- `args` (`any[]`): 

### kill

Removes this Deep instance and all its references, also kill event emitting.

```typescript
kill(): void
```

### map

Maps over values in this Deep instance

```typescript
map(args: any[]): any
```

**Parameters:**

- `args` (`any[]`): 

### new

Creates a new Deep instance of this type

```typescript
new(value?: any): Deep
```

**Parameters:**

- `value` (`any`): 

### outof

Returns a Deep instance containing a Set of nodes that have outgoing links of the specified type

```typescript
outof(type: Deep): Deep
```

**Parameters:**

- `type` (`Deep`): 

### reduce

Reduces values in this Deep instance

```typescript
reduce(args: any[]): any
```

**Parameters:**

- `args` (`any[]`): 

### select

Selects based on input criteria

```typescript
select(input: any): any
```

**Parameters:**

- `input` (`any`): 

### selection

Creates a new selection. Can be observed by selection.on(event => {}), and recalculated with selection.call();

```typescript
selection(): any
```

### set

Sets a value in this Deep instance

```typescript
set(args: any[]): any
```

**Parameters:**

- `args` (`any[]`): 

### sort

Sorts values in this Deep instance

```typescript
sort(args: any[]): any
```

**Parameters:**

- `args` (`any[]`): 

### toString

Converts this Deep instance to a string

```typescript
toString(args: any[]): any
```

**Parameters:**

- `args` (`any[]`): 

### typeof

Checks if this Deep instance is of a specific type

```typescript
typeof(check: any): any
```

**Parameters:**

- `check` (`any`): 

### typeofs

Gets an array of all types in the type hierarchy up.

```typescript
typeofs(array: any[]): any
```

**Parameters:**

- `array` (`any[]`): 

### unset

Removes a value from this Deep instance

```typescript
unset(args: any[]): any
```

**Parameters:**

- `args` (`any[]`): 

### Value

Creates a new Deep instance of the appropriate type for a value

```typescript
Value(value: any): any
```

**Parameters:**

- `value` (`any`): 

### valueOf

Gets the primitive value of this Deep instance

```typescript
valueOf(args: any[]): any
```

**Parameters:**

- `args` (`any[]`): 

### wrap

Wraps a value in a Deep instance if it isn't already, or returns existing Deep instance.

```typescript
wrap(value?: any): any
```

**Parameters:**

- `value` (`any`): 

## Index

Index class provides a dual-indexing system for managing relationships between values.
It maintains both one-to-one and one-to-many mappings between keys and values.

### Constructor

```typescript
constructornew Index(): Index
```

### Properties

### _many

Internal map for one-to-many relationships

**Type:** `Map`

### _one

Internal map for one-to-one relationships

**Type:** `Map`

### Methods

### get

Retrieves the value associated with a key

```typescript
get(key: any): any
```

**Parameters:**

- `key` (`any`): 

### many

Retrieves or creates a Set for storing multiple values associated with a key

```typescript
many(key: any): Set
```

**Parameters:**

- `key` (`any`): 

### set

Associates a key with a value and maintains the reverse mapping

```typescript
set(key: any, value: any): any
```

**Parameters:**

- `key` (`any`): 
- `value` (`any`): 

### unset

Removes the association between a key and its value

```typescript
unset(key: any): void
```

**Parameters:**

- `key` (`any`): 

## Memory

Memory class manages the internal state and relationships of Deep instances.
It maintains indices for values, types, and relationships between nodes.

### Constructor

```typescript
constructornew Memory(): Memory
```

Initializes a new Memory instance with empty indices for values, types,
and relationships. Creates a new storage space for Deep instances.

### Properties

### all

Set containing all Deep instances in memory

**Type:** `Set`

### froms

Index for tracking outgoing relationships (from -> to)

**Type:** `Index`

### tos

Index for tracking incoming relationships (to -> from)

**Type:** `Index`

### types

Index for managing type relationships between Deep instances

**Type:** `Index`

### values

Index for storing and retrieving values associated with Deep instances

**Type:** `Index`

