# Deep

Universal solution for working with any meaning

[🚀 View Product Strategy & Solutions](./PRODUCTS.md)
[📚 API Documentation](./API.md)

## How to Use

Install the package:
```bash
npm install @deep-foundation/deep
# or
yarn add @deep-foundation/deep
```

Import and use in your code:
```javascript
// ESM
import { Deep } from '@deep-foundation/deep';

// CommonJS
const { Deep } = require('@deep-foundation/deep');

// Create a new Deep instance
const deep = new Deep();
```

### Using CLI

You can interact with Deep through its CLI interface:
```bash
npx @deep-foundation/deep --cli
```

Once in the REPL session, you can explore and manipulate your Deep instance. Here's an example of finding and displaying all relations:

```typescript
> const deep = new Deep()
> const allRelations = deep.select({})
> console.log(`Found ${allRelations.size} relations in total`)
> 
> // Display relations grouped by type
> const byType = new Map()
> allRelations.each(rel => {
    const type = rel.type?.value || 'untyped'
    byType.set(type, (byType.get(type) || 0) + 1)
  })
> 
> console.log('\nRelations by type:')
> byType.forEach((count, type) => {
    console.log(`${type}: ${count} relations`)
  })
```

This will show you all relations in your Deep instance, organized by their types.

## Concept

Deep is a universal system for representing and connecting any form of meaning - from basic data types to complex systems and behaviors. Just as our consciousness naturally associates different concepts, sensations, and ideas in a unified space, Deep creates a pure semantic space where everything is interconnected and accessible in a uniform way. It's designed to seamlessly handle any type of data or behavior - whether it's running code across different languages and platforms, managing distributed systems, or synchronizing with various data sources. 

At its core, Deep aims to become a universal memory and perception system for both human and artificial intelligence. It provides AI systems with dynamic context mapping and intuitive navigation through semantic space, allowing any AI to perceive and operate on its designated memory region as if it were its own long-term and working memory. This unified approach to memory and perception enables seamless integration between different AI systems, letting them share and process information in a natural, context-aware manner.

In its visual incarnations across desktop, mobile platforms, and extensions, Deep provides a universal perception layer where the space itself and every element within it is an associative link to a React component. These components dynamically reflect various states of the associative memory, seamlessly integrating with Material-UI, Apache ECharts, and numerous other frameworks. This modular approach allows for complete visual customization without modifying the core engine - new visualization capabilities can be added simply by connecting additional dependencies, making Deep's visual representation as flexible as its underlying semantic structure.

### Current and Planned Features

Core Functionality:
- [x] Universal associative graph data structure
- [x] Uniform interface for all data types
- [x] Reactive event system
- [x] Complex querying with logical operators
- [x] Chainable operations on collections
- [ ] Transaction support
- [ ] Distributed computation support

Data Integration:
- [ ] File system watch/sync
- [ ] SQL databases sync
- [ ] MongoDB sync
- [ ] JSON import/export
- [ ] Custom data format adapters

Runtime and Execution:
- [ ] Multi-language code execution
- [ ] Process management
- [ ] Docker container integration
- [ ] Container orchestration
- [ ] Hierarchical behavior management
- [ ] State monitoring

API and Connectivity:
- [ ] HTTP API
- [ ] WebSocket support
- [ ] GraphQL interface
- [ ] Subscription system
- [ ] Access control and permissions

Platform Support:
- [x] Node.js runtime
- [x] Next.js web applications
- [x] iOS (Capacitor)
- [x] Android (Capacitor)
- [x] Electron desktop
- [ ] Browser extensions
- [ ] IDE plugins
- [ ] Serverless functions
- [ ] Container deployments

AI Integration:
- [ ] Universal AI memory interface
  - [ ] Long-term memory simulation
  - [ ] Working memory allocation
  - [ ] Memory region permissions
- [ ] Dynamic context mapping
  - [ ] Real-time context updates
  - [ ] Context inheritance
  - [ ] Multi-dimensional context layers
- [ ] Semantic space navigation
  - [ ] Natural language queries
  - [ ] Semantic similarity search
  - [ ] Contextual relevance scoring
- [ ] Memory region isolation and sharing
  - [ ] Secure memory boundaries
  - [ ] Controlled memory access
  - [ ] Cross-region synchronization
- [ ] Multi-model perception layers
  - [ ] Text understanding
  - [ ] Image recognition
  - [ ] Audio processing
  - [ ] Multimodal fusion
- [ ] Standard AI protocols support
  - [ ] LangChain integration
  - [ ] AutoGPT compatibility
  - [ ] Custom LLM integration
  - [ ] Vector embeddings
  - [ ] Neural network state persistence
- [ ] AI-to-AI communication protocols
  - [ ] Semantic message passing
  - [ ] Shared memory spaces
  - [ ] Collaborative reasoning
- [ ] Context-aware memory allocation
  - [ ] Dynamic memory scaling
  - [ ] Priority-based allocation
  - [ ] Resource optimization
- [ ] Intuitive memory visualization
  - [ ] Interactive memory maps
  - [ ] Relationship graphs
  - [ ] Context hierarchies
  - [ ] Real-time memory monitoring

### Key Components

The **Deep** class is the core of the system - it represents a universal agent capable of performing operations on any type of data. Each instance of Deep is an active agent that can interact with any other Deep instance or data type through a rich set of methods:

### Data Operations

All methods work uniformly across different data types, treating single items as collections of one element where the item serves as both key and value. This approach allows for consistent data manipulation regardless of whether you're working with a single item or a collection.

#### Value Methods
- `has(item)` → boolean - Checks if item exists in the collection
- `get(key)` → value - Returns value by key, for single items the key is the item itself
- `set(key, value)` → value - Sets value by key, returns the value
- `unset(key)` → boolean - Removes value by key, returns success status
- `add(value)` → value - Adds value to collection, for single items replaces the value
- `size()` → number - Returns collection size, for single items returns 1 or 0
- `keys()` → Array<any> - Returns array of keys, empty for single items
- `values()` → Array<any> - Returns array of values, for single items returns array with one item
- `map(callback(value, key))` → Array<any> - Maps over collection with callback, returns new array
- `find(callback(value, key))` → any - Returns first item where callback returns true
- `filter(callback(value, key))` → Array<any> - Returns array of items where callback returns true
- `each(callback(value, key))` → void - Iterates over collection with callback
- `reduce(callback(accumulator, value), initial)` → any - Reduces collection to single value
- `sort(callback(a, b))` → Array<any> - Returns sorted array based on callback comparison
- `first()` → any - Returns first item of collection or the item itself for single items
- `last()` → any - Returns last item of collection or the item itself for single items
- `join()` → string - Converts collection to string, for single items calls toString()
- `toString()` → string - Returns string representation
- `valueOf()` → any - Returns primitive value if possible

### Operations

#### Select
- `select(expression)` → Selection - Creates a reactive selection of links based on expression
  - Expression can be:
    - Direct (One to one) relations:
      - [x] `type` - Get or set link type (returns Deep instance or undefined)
      - [x] `from` - Get or set source node (returns Deep instance or undefined)
      - [x] `to` - Get or set target node (returns Deep instance or undefined)
      - [x] `value` - Get or set link value (returns Deep instance or JS primitive)
    - Reverse (One to many) relations:
      - [x] `typed` - Get links that have this as their type
      - [x] `out` - Get links that have this as their from
      - [x] `in` - Get links that have this as their to
      - [x] `valued` - Get links that have this as their value
    - Logical operators for filtering:
      - [x] `and` - Array of expressions that all must match
      - [x] `not` - Expression that must not match
      - [x] `or` - Array of expressions where at least one must match
    - Condition types (comparison operators):
      - [ ] `eq` - Equal to
      - [ ] `neq` - Not equal to
      - [ ] `gt` - Greater than
      - [ ] `lt` - Less than
      - [ ] `gte` - Greater than or equal to
      - [ ] `lte` - Less than or equal to
      - [ ] `in` - Value is in array
      - [ ] `nin` - Value is not in array
  - Selection is reactive - automatically updates when matching links change
  - Returns a Selection instance that contains matching links
  - Examples:
    ```typescript
    // Direct (One to one) relations
    const linkType = someLink.type // returns Deep instance or undefined
    const linkFrom = someLink.from // returns Deep instance or undefined
    const linkTo = someLink.to // returns Deep instance or undefined
    const linkValue = someLink.value // returns Deep instance or JS primitive

    // Reverse (One to many) relations
    const linksOfThisType = someLink.typed.call() // get all links that use this as their type
    const linksFromThis = someLink.out.call() // get all links that start from this
    const linksToThis = someLink.in.call() // get all links that point to this
    const linksWithThisValue = someLink.valued.call() // get all links that have this as value

    // Complex query combining both types of relations
    const complexQuery = deep.select({
      and: [
        { type: someType }, // direct relation
        { not: { in: someTarget }}, // exclude links pointing to someTarget (reverse relation)
        { valued: someValue } // include links having someValue (reverse relation)
      ]
    })
    complexQuery.call() // returns Deep instance with multiple results
    ```

#### Modify (Coming Soon)
- `insert({ type, from, to, value })` → Deep - Creates new link
- `update({ type?, from?, to?, value? })` → Deep - Updates existing link
- `delete()` → boolean - Removes link

### Relations

Relations in Deep allow you to create complex interconnected structures. Here's an example with types A, B, C and their instances:

```typescript
// Define types
const A = deep.new();
const B = deep.new();
const C = deep.new();

// Create instances
const a1 = A.new();
const b1 = B.new();
const c1 = C.new();

// (If we create a1,b1,c1 from deep.new(), not from A,B,C.new()), type can be setted manually:
// a1.type = A;  // a1 is of type A
// b1.type = B;  // b1 is of type B
// c1.type = C;  // c1 is of type C

// Create relationships
a1.from = b1;  // a1 points from b1
b1.to = c1;    // b1 points to c1
c1.from = a1;  // c1 points from a1

// Direct traversals
a1.type;   // → A (get type of a1)
a1.from;   // → b1 (get source node)
a1.to;     // → undefined (no target node)
a1.typed;  // → [a1] (get all instances of same type)
a1.out;    // → [c1] (get all outgoing connections)
a1.in;     // → [b1] (get all incoming connections)

// Multiple traversals
// You can chain traversals to navigate through the graph
a1.out;         // → [c1] (get outgoing connections)
a1.out.tos;     // → [] (get 'to' nodes of outgoing connections)
a1.out.froms;   // → [a1] (get 'from' nodes of outgoing connections)
a1.out.types;   // → [C] (get types of outgoing connections)

// Complex traversal example
// Get all nodes that are targets of our outgoing connections
// and then get their outgoing connections
a1.out.call.forEach(node => {
  console.log(node.out.call); // show outgoing connections of each node
});
```

In this example:
- We have three types: A, B, C
- Instances a1, b1, c1 form a triangle of relationships
- We can traverse these relationships using direct properties (type, from, to, etc.)
- We can perform multiple traversals by chaining operations
- Each traversal returns a Deep instance that can be further queried

### Uniform Data Handling

A key feature of Deep is its uniform approach to handling both single items and collections:
- When working with a single item, it's treated as a collection of one element where the item serves as both key and value
- The same methods work consistently across different data types (Symbol, Promise, Boolean, String, Number, BigInt, Set, Map, Array, Object, Function)
- This uniformity allows for seamless transitions between single and multiple data operations

### Association in Deep

An association (link) consists of the following components:
- **type** - link type (also a Deep)
- **from** - link source (Deep)
- **to** - link target (Deep)
- **value** - link value (can be any data type)

### Association Capabilities
- Creating new associations
- Modifying properties (type, from, to, value)
- Tracking changes through event system
- Iterating through links
- Searching links by various parameters

### Project Features
- Support for various data types (Symbol, Promise, Boolean, String, Number, BigInt, Set, Map, Array, Object, Function)
- Event system
- Change observation
- Support for both web and native platforms (iOS, Android, Electron)
- Graph visualization
- Modern UI

### Technical Characteristics
- TypeScript as the main language
- React for UI
- Next.js for server-side
- Cross-platform development support
- Event system for reactive programming

### Unique Properties
- Universality: can work with any data types
- Extensibility: ability to create custom link types
- Reactivity: automatic updates on changes
- Indexing: fast access to links through various indexes
- Cross-platform: works everywhere, from browser to mobile applications

# License

This is free and unencumbered software released into the public domain under the Unlicense license.

For more information, please refer to the [LICENSE](LICENSE) file or visit <https://unlicense.org>.
