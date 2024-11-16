// "use client"

// import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
// import { useDebounceCallback } from '@react-hook/debounce';
// import Image from "next/image";
// import cytoscape from 'cytoscape';

// import d3Force from 'cytoscape-d3-force';
// import elk from 'cytoscape-elk';
// import euler from 'cytoscape-euler';
// // import cola from 'cytoscape-cola';

// import { Deep } from '../deep';

// import pckg from '../../package.json';
// import { useValueRef, useValueState } from '../hooks/use-value';
// import { Box } from '@mui/material';

// const IDS = false;
// const doteriaze = (string) => string.length > 10 ? string.slice(0, 10) + '...' : string;

// const layouts: any = {
// };

// // layouts.elk = {
// //   name: 'elk',

// //   nodeDimensionsIncludeLabels: false, // Boolean which changes whether label dimensions are included when calculating node dimensions
// //   fit: false, // Whether to fit
// //   padding: 20, // Padding on fit
// //   animate: false, // Whether to transition the node positions
// //   animateFilter: function (node, i) { return true; }, // Whether to animate specific nodes when animation is on; non-animated nodes immediately go to their final positions
// //   animationDuration: 500, // Duration of animation in ms if enabled
// //   animationEasing: undefined, // Easing of animation if enabled
// //   transform: function (node, pos) { return pos; }, // A function that applies a transform to the final node position
// //   ready: undefined, // Callback on layoutready
// //   stop: undefined, // Callback on layoutstop
// //   nodeLayoutOptions: undefined, // Per-node options function
// //   elk: {
// //     // All options are available at http://www.eclipse.org/elk/reference.html
// //     //
// //     // 'org.eclipse.' can be dropped from the identifier. The subsequent identifier has to be used as property key in quotes.
// //     // E.g. for 'org.eclipse.elk.direction' use:
// //     // 'elk.direction'
// //     //
// //     // Enums use the name of the enum as string e.g. instead of Direction.DOWN use:
// //     // 'elk.direction': 'DOWN'
// //     //
// //     // The main field to set is `algorithm`, which controls which particular layout algorithm is used.
// //     // Example (downwards layered layout):
// //     'algorithm': 'layered',
// //     'elk.direction': 'DOWN',
// //   },
// //   priority: function (edge) { return null; }, // Edges with a non-nil value are skipped when geedy edge cycle breaking is enabled
// // };

// // layouts.d3 = {
// //   animate: true, // whether to show the layout as it's running; special 'end' value makes the layout animate like a discrete layout
// //   // maxIterations: 0, // max iterations before the layout will bail out
// //   // maxSimulationTime: 0, // max length in ms to run the layout
// //   ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
// //   fixedAfterDragging: false, // fixed node after dragging
// //   fit: false, // on every layout reposition of nodes, fit the viewport
// //   padding: 30, // padding around the simulation
// //   boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
// //   /**d3-force API**/
// //   name: 'd3-force',
// //   // alpha: 0.8, // sets the current alpha to the specified number in the range [0,1]
// //   // alphaMin: 0.001, // sets the minimum alpha to the specified number in the range [0,1]
// //   // alphaDecay: 0.5, // sets the alpha decay rate to the specified number in the range [0,1]
// //   // // alphaDecay: 1 - Math.pow(0.001, 1 / 300), // sets the alpha decay rate to the specified number in the range [0,1]
// //   // alphaTarget: 0.1, // sets the current target alpha to the specified number in the range [0,1]
// //   // // alphaTarget: 0, // sets the current target alpha to the specified number in the range [0,1]
// //   // velocityDecay: 0.6, // sets the velocity decay factor to the specified number in the range [0,1]
// //   // velocityDecay: 0.4, // sets the velocity decay factor to the specified number in the range [0,1]
// //   // collideRadius: 1, // sets the radius accessor to the specified number or function
// //   // collideStrength: 0.7, // sets the force strength to the specified number in the range [0,1]
// //   // collideIterations: 1, // sets the number of iterations per application to the specified number
// //   linkId: function id(d) {
// //     return d.id;
// //   }, // sets the node id accessor to the specified function
// //   linkDistance: 100, // sets the distance accessor to the specified number or function
// //   // // linkStrength: function strength(link) {
// //   // //   return 1 / Math.min(count(link.source), count(link.target));
// //   // // }, // sets the strength accessor to the specified number or function
// //   // linkIterations: 1, // sets the number of iterations per application to the specified number
// //   manyBodyStrength: -2000, // sets the strength accessor to the specified number or function
// //   // manyBodyTheta: 0.9, // sets the Barnes–Hut approximation criterion to the specified number
// //   // manyBodyDistanceMin: 1, // sets the minimum distance between nodes over which this force is considered
// //   // manyBodyDistanceMax: Infinity, // sets the maximum distance between nodes over which this force is considered
// //   xStrength: 0.09, // sets the strength accessor to the specified number or function
// //   xX: 0, // sets the x-coordinate accessor to the specified number or function
// //   yStrength: 0.09, // sets the strength accessor to the specified number or function
// //   yY: 0, // sets the y-coordinate accessor to the specified number or function
// //   // radialStrength: 0.1, // sets the strength accessor to the specified number or function
// //   // // radialRadius: [radius]// sets the circle radius to the specified number or function
// //   // radialX: 0, // sets the x-coordinate of the circle center to the specified number
// //   // radialY: 0, // sets the y-coordinate of the circle center to the specified number
// //   // // layout event callbacks
// //   ready: function () { console.log('cytoscale d3 ready'); }, // on layoutready
// //   stop: function () { console.log('cytoscale d3 stop'); }, // on layoutstop
// //   tick: function (progress) { }, // on every iteration
// //   // // positioning options
// //   randomize: false, // use random node positions at beginning of layout
// //   // // infinite layout options
// //   infinite: false // overrides all other options for a forces-all-the-time mode
// // };

// layouts.cosa = {
//   animate: true, // whether to show the layout as it's running
//   refresh: 1, // number of ticks per frame; higher is faster but more jerky
//   maxSimulationTime: 4000, // max length in ms to run the layout
//   ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
//   fit: true, // on every layout reposition of nodes, fit the viewport
//   padding: 30, // padding around the simulation
//   boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
//   nodeDimensionsIncludeLabels: false, // whether labels should be included in determining the space used by a node

//   // layout event callbacks
//   ready: function(){}, // on layoutready
//   stop: function(){}, // on layoutstop

//   // positioning options
//   randomize: false, // use random node positions at beginning of layout
//   avoidOverlap: true, // if true, prevents overlap of node bounding boxes
//   handleDisconnected: true, // if true, avoids disconnected components from overlapping
//   convergenceThreshold: 0.01, // when the alpha value (system energy) falls below this value, the layout stops
//   nodeSpacing: function( node ){ return 10; }, // extra spacing around nodes
//   flow: undefined, // use DAG/tree flow layout if specified, e.g. { axis: 'y', minSeparation: 30 }
//   alignment: undefined, // relative alignment constraints on nodes, e.g. {vertical: [[{node: node1, offset: 0}, {node: node2, offset: 5}]], horizontal: [[{node: node3}, {node: node4}], [{node: node5}, {node: node6}]]}
//   gapInequalities: undefined, // list of inequality constraints for the gap between the nodes, e.g. [{"axis":"y", "left":node1, "right":node2, "gap":25}]
//   centerGraph: true, // adjusts the node positions initially to center the graph (pass false if you want to start the layout from the current position)

//   // different methods of specifying edge length
//   // each can be a constant numerical value or a function like `function( edge ){ return 2; }`
//   edgeLength: undefined, // sets edge length directly in simulation
//   edgeSymDiffLength: undefined, // symmetric diff edge length in simulation
//   edgeJaccardLength: undefined, // jaccard edge length in simulation

//   // iterations of cola algorithm; uses default values on undefined
//   unconstrIter: undefined, // unconstrained initial layout iterations
//   userConstIter: undefined, // initial layout iterations with user-specified constraints
//   allConstIter: undefined, // initial layout iterations with all constraints including non-overlap
// };

// const layout = layouts.euler = {
//   name: 'euler',

//   // The ideal length of a spring
//   // - This acts as a hint for the edge length
//   // - The edge length can be longer or shorter if the forces are set to extreme values
//   springLength: edge => 80,

//   // Hooke's law coefficient
//   // - The value ranges on [0, 1]
//   // - Lower values give looser springs
//   // - Higher values give tighter springs
//   springCoeff: edge => 0.0008,

//   // The mass of the node in the physics simulation
//   // - The mass affects the gravity node repulsion/attraction
//   mass: node => 9,

//   // Coulomb's law coefficient
//   // - Makes the nodes repel each other for negative values
//   // - Makes the nodes attract each other for positive values
//   gravity: -10,

//   // A force that pulls nodes towards the origin (0, 0)
//   // Higher values keep the components less spread out
//   pull: 0.00001,

//   // Theta coefficient from Barnes-Hut simulation
//   // - Value ranges on [0, 1]
//   // - Performance is better with smaller values
//   // - Very small values may not create enough force to give a good result
//   theta: 0.666,

//   // Friction / drag coefficient to make the system stabilise over time
//   dragCoeff: 0.02,

//   // When the total of the squared position deltas is less than this value, the simulation ends
//   movementThreshold: 1,

//   // The amount of time passed per tick
//   // - Larger values result in faster runtimes but might spread things out too far
//   // - Smaller values produce more accurate results
//   timeStep: 20,

//   // The number of ticks per frame for animate:true
//   // - A larger value reduces rendering cost but can be jerky
//   // - A smaller value increases rendering cost but is smoother
//   refresh: 10,

//   // Whether to animate the layout
//   // - true : Animate while the layout is running
//   // - false : Just show the end result
//   // - 'end' : Animate directly to the end result
//   animate: false,

//   // Animation duration used for animate:'end'
//   animationDuration: undefined,

//   // Easing for animate:'end'
//   animationEasing: undefined,

//   // Maximum iterations and time (in ms) before the layout will bail out
//   // - A large value may allow for a better result
//   // - A small value may make the layout end prematurely
//   // - The layout may stop before this if it has settled
//   maxIterations: 1000,
//   maxSimulationTime: 4000,

//   // Prevent the user grabbing nodes during the layout (usually with animate:true)
//   ungrabifyWhileSimulating: false,

//   // Whether to fit the viewport to the repositioned graph
//   // true : Fits at end of layout for animate:false or animate:'end'; fits on each frame for animate:true
//   fit: false,

//   // Padding in rendered co-ordinates around the layout
//   padding: 30,

//   // Constrain layout bounds with one of
//   // - { x1, y1, x2, y2 }
//   // - { x1, y1, w, h }
//   // - undefined / null : Unconstrained
//   boundingBox: undefined,

//   // Layout event callbacks; equivalent to `layout.one('layoutready', callback)` for example
//   ready: function(){}, // on layoutready
//   stop: function(){}, // on layoutstop

//   // Whether to randomize the initial positions of the nodes
//   // true : Use random positions within the bounding box
//   // false : Use the current node positions as the initial positions
//   randomize: false
// };

// export function Cytoscape() {
//   const ref = useRef<any>();
//   const [deep, setDeep] = useValueRef<Deep>();
//   const [cy, setCy] = useValueState<any>();
//   const layoutRef = useRef<any>();

//   const relayout = useDebounceCallback(() => {
//     if (!cy()) return;
//     cy().$(':not(:locked),:not(:selected)').layout(layout).run();
//     // cy().style(stylify());
//     // let lay = layoutRef.current;
//     // if (lay) {
//     //   lay.stop && lay.stop();
//     //   lay.destroy && lay.destroy();
//     // }
//     // layoutRef.current = lay = cy().elements().layout(layout);
//     // lay.run();
//     // cy().once('layoutready', () => setTimeout(() => { console.log('RELAYOUT'); }, 300));
//     // callback && callback();
//   }, 300);

//   const defineNode = useCallback((d) => {
//     const id = d.id();
//     const exists = !!cy().$id(id).length;
//     const num = 123;
//     if (!exists) {
//       let label: string[] = [];
//       if (IDS) label.push(`${d.id()}`);

//       const isSymbol = deep().is(d) === deep().contains.Symbol;
//       const isUndefined = deep().is(d) === deep().contains.Undefined;
//       const isPromise = deep().is(d) === deep().contains.Promise;
//       const isBoolean = deep().is(d) === deep().contains.Boolean;
//       const isString = deep().is(d) === deep().contains.String;
//       const isNumber = deep().is(d) === deep().contains.Number;
//       const isBigint = deep().is(d) === deep().contains.Bigint;
//       const isSet = deep().is(d) === deep().contains.Set;
//       const isWeakSet = deep().is(d) === deep().contains.WeakSet;
//       const isMap = deep().is(d) === deep().contains.Map;
//       const isWeakMap = deep().is(d) === deep().contains.WeakMap;
//       const isArray = deep().is(d) === deep().contains.Array;
//       const isObject = deep().is(d) === deep().contains.Object;
//       const isFunction = deep().is(d) === deep().contains.Function;

//       label.push(
//         isSymbol ? `Symbol()` :
//         isUndefined ? `undefined` :
//         isPromise ? `Promise` :
//         isBoolean ? `${d}` :
//         isString ? `"${doteriaze(d)}"` :
//         isNumber ? `${d}` :
//         isBigint ? `${d}` :
//         isSet ? `Set(${d.size})` :
//         isWeakSet ? `Set(${d.size})` :
//         isMap ? `Map(${d.size})` :
//         isWeakMap ? `Map(${d.size})` :
//         isArray ? `Array(${d.length})` :
//         isObject ? `Object(${d.size()})` :
//         isFunction ? `${doteriaze(d.toString())}` :
//         `?`
//       );

//       const name = d?.name;
//       const typeName = d?.type?.name;

//       const _name: string[] = [];
//       if (name) _name.push(name);
//       if (typeName) _name.push(`(${typeName})`);
//       if (_name.length) label.push(_name.join(' '))

//       const color = (
//         isSymbol ? `lightblue` :
//         isUndefined ? `darkmagenta` :
//         isPromise ? `darkred` :
//         isBoolean ? `darkmagenta` :
//         isString ? `yellow` :
//         isNumber ? `darkmagenta` :
//         isBigint ? `darkmagenta` :
//         isSet ? `brown` :
//         isWeakSet ? `brown` :
//         isMap ? `brown` :
//         isWeakMap ? `brown` :
//         isArray ? `brown` :
//         isObject ? `brown` :
//         isFunction ? `lightgreen` :
//         `white`
//       );

//       cy().add({
//         data: { id, label: label.join('\n'), color, deep: d },
//       });
//     }
//   }, [cy])

//   const defineEdge = useCallback((source, target, it, classes) => {
//     const edges = cy().$(`edge[source="${source}"][target="${target}"]`);
//     if (!edges.length) cy().add({ data: { source, target, it }, classes });
//   }, [cy]);

//   const defineDeep = useCallback((d) => {
//     defineNode(d);
//     if (d.type) {
//       defineNode(d.type);
//       defineEdge(d.id(), d.type.id(), d, 'type');
//     }
//     if (d.from) {
//       defineNode(d.from);
//       defineEdge(d.id(), d.from.id(), d, 'from');
//     }
//     if (d.to) {
//       defineNode(d.to);
//       defineEdge(d.id(), d.to.id(), d, 'to');
//     }
//   }, [cy]);

//   const setRef = useRef(new Set());

//   const cytoscapify = useCallback((d, set = setRef.current) => {
//     console.log('cytoscapify', d, d.name, set);
//     if (set.has(d) || set.size > 150) return;
//     defineDeep(d);
//     set.add(d);
//     // if (d.type) {
//     //   cytoscapify(d.type, set);
//     // }
//     // if (d.from) {
//     //   cytoscapify(d.from, set);
//     // }
//     // if (d.to) {
//     //   cytoscapify(d.to, set);
//     // }
//     // cytoscapifyAround(d, set);
//   }, [cy]);

//   const cytoscapifyAround = useCallback((d, set = setRef.current) => {
//     console.log('cytoscapifyAround', d, d.name);
//     d.typed.forEach(d => {
//       cytoscapify(d, set);
//     });
//     d.out.forEach(d => {
//       cytoscapify(d, set);
//     });
//     d.in.forEach(d => {
//       cytoscapify(d, set);
//     });
//   }, [cy]);

//   const stylify = useCallback(() => {
//     const style: any = [
//       {
//         selector: 'node',
//         style: {
//           label: 'data(label)',
//           color: 'data(color)',
//           width: 30,
//           height: 30,
//           'font-size': 16,
//           // 'text-margin-y': 23, // -4
//           // 'text-margin-x': -2,
//           "text-wrap": "wrap",
//           // 'background-image': 'https://live.staticflickr.com/3063/2751740612_af11fb090b_b.jpg',
//           'background-fit': 'cover',
//           'background-opacity': 1,
//           'background-color': '#fff',
//         },
//       },
//       {
//         selector: 'node:selected',
//         style: {
//           'background-color': 'cyan',
//         },
//       },
//       {
//         selector: 'node.hover',
//         style: {
//           width: 35, height: 35,
//         }
//       },
//       {
//         selector: 'edge',
//         style: {
//           color: 'white',
//         },
//       },
//       {
//         selector: 'edge:selected',
//         style: {
//           color: 'cyan',
//         },
//       },
//       {
//         selector: '.to',
//         style: {
//           'target-arrow-shape': 'triangle',
//         }
//       },
//       {
//         selector: '.from',
//         style: {
//           'target-arrow-shape': 'tee',
//         }
//       },
//       {
//         selector: '.type',
//         style: {
//           'target-arrow-shape': 'triangle',
//           'line-style': 'dashed',
//           'line-dash-pattern': [5, 5]
//         }
//       },
//       {
//         selector: 'edge',
//         style: {
//           width: 1,
//           'curve-style': 'bezier',
//           'target-distance-from-node': 8,
//           'source-distance-from-node': 1,
//         }
//       },
//     ];
//     // if (cy() && cy().$('node:locked').length) {
//     //   style.push({
//     //     selector: 'node:unlocked',
//     //     style: {
//     //       opacity: 0.5,
//     //     },
//     //   });
//     // }
//     return style;
//   }, []);

//   useEffect(() => {
//     if (cy()) return;

//     (async () => {
//       cytoscape.use(d3Force);
//       cytoscape.use(elk);
//       cytoscape.use(euler);
//       // cytoscape.use(cola);
//       cytoscape.use(await import('cytoscape-lasso'));

//       const deep = new Deep();
//       setDeep(deep);

//       const object = {
//         container: ref.current,
//         elements: [],
//         style: stylify(),
//         layout: layoutRef,
//       };
//       setCy(cytoscape(object));
//       global.cy = cy();
//       global.deep = deep;
//       global.layout = layout;

//       relayout();

//       cy().on('mouseover', 'node', (e) => {
//         e.target.addClass('hover');
//       });
//       cy().on('mouseout', 'node', (e) => {
//         e.target.removeClass('hover');
//       });
//       // cy().on('select', 'node', (e) => e.target.lock());
//       // cy().on('unselect', 'node', (e) => {
//       //   console.log('unselect', e.target == cy(), e.target.id());
//       // });
//       // cy().on('lock', 'node', (e) => relayout());
//       // cy().on('unlock', 'node', (e) => relayout());

//       cy().on('click', 'node', (e) => {
//         cytoscapifyAround(e.target.data().deep);
//         // console.log(e.target.json())
//         // deep().each(e.target.data().deep().typed(), d => defineDeep(d));
//         // relayout();
//       });
//       cy().on('dragfree', 'node', (e) => {
//         console.log('dragfree', e.target.id());
//         // relayout();
//       });

//       const modify = (handle: (set) => void) => {
//         const next: Set<string>[] = [...selections()];
//         const set = next[selection()];
//         if (set) handle(set);
//         setSelections(next);
//         return next;
//       };

//       cy().on('select', 'node', (e) => {
//         if (e.target === cy()) return;
//         setSelections(modify(set => set.add(e.target.data().deep)));
//         // modify(set => set.add(e.target.id()));
//         // e.target.lock();
//       });
//       cy().on('unselect', 'node', (e) => {
//         if (e.target === cy()) return;
//         modify(set => set.delete(e.target.data().deep));
//         // e.target.lock();
//       });
//       cy().on('tap', (e) => {
//         if (e.target == cy()) {
//           // const next = [...selections()]
//           // deep.unset(next, selection());
//           // console.log('background click', selections(), next, selection());
//           // setSelections(next);
//           // setSelection(-1);
//           // setSelections([ ...selections(), new Set() ]);
//           // setSelection(selection() + 1);
//         }
//       });

//       cytoscapify(deep);
//     })();
//   }, [deep]);

//   const [lasso, setLasso] = useState<boolean>(false);
//   useEffect(() => {
//     if (cy()?.lassoSelectionEnabled && cy()?.lassoSelectionEnabled() != lasso) {
//       cy().lassoSelectionEnabled(lasso);
//     }
//   }, [lasso, cy]);

//   const setToSelector = (set: any) => {
//     const result: string[] = [];
//     for (let it of set) {
//       result.push(`#${deep().id(it)}`);
//     }
//     return result.join(',');
//   }

//   const [selections, setSelections] = useValueState<Set<any>[]>(useMemo(() => [new Set()], []));
//   const [selection, setSelection] = useValueState<number>(0);
//   useEffect(() => {
//     console.log('on selection change', 'cy', cy(), selection());
//     if (!cy()) return;
//     const ids = setToSelector(selections()[selection()]);
//     cy().$(`:selected${ids ? `:not(${ids})` : ''}`).unselect();
//     if (!!ids) cy().$(`${ids}`).select();
//   }, [selection]);
//   useEffect(() => {
//     if (!selections().length) {
//       setSelections([new Set()]);
//       setSelection(0);
//     }
//   }, [selections]);

//   console.log('selection', selection());
//   console.log('selections', selections());

//   const [contains, setContains] = useState<boolean>(false);

//   return (<>
//     <Box ref={ref} sx={{ width: '100%', height: '100%', position: 'fixed', left: 0, top: 0 }}></Box>
//     {/* <Box position='absolute' left='1em' top='1em'>
//       <InputGroup flex="1" endElement={<><Kbd>⌘K</Kbd></>}>
//         <Input disabled bg='black' rounded='3em' placeholder="Search"/>
//       </InputGroup>
//     </Box>
//     <Box position='absolute' right='1em' top='1em'>
//       <VStack>
//         <Box position="relative">
//           <IconButton rounded='full' variant='surface' onClick={() => {
//             setLasso(!lasso);
//           }}>
//             {lasso ? '✎' : '▢'}
//           </IconButton>
//           <Center position='absolute' right='calc(100% + 1em)' top='0' h='100%'>
//             <Kbd>(⌘|shift|ctrl)+mouse</Kbd>
//           </Center>
//         </Box>
//         <VStack>
//           {selections().map((s, i) => {
//             const isActive = selection() === i;
//             const button = <Button
//               p='0' rounded='full'
//               variant={isActive ? 'solid' : 'surface'}
//               bg={isActive ? 'cyan' : undefined}
//               onClick={() => setSelection(i)}
//             >({s ? s.size : `0?`})</Button>;
//             return <Box key={i}>
//               {isActive ? <MenuRoot positioning={{ placement: 'left-start' }} onSelect={({ value }) => {
//                 let _prev: any, prev: string[], next: string[];
//                 _prev = deep().map(selections()[selection()]);
//                 if (value === 'forgot') {
//                   next = setToSelector(_prev);
//                   if (next) cy().$(next).unselect();
//                   setSelections(selections().filter((v,k) => k !== selection()));
//                   setSelection(selection()-1);
//                 }
//               }}>
//                 <MenuTrigger asChild>
//                   {button}
//                 </MenuTrigger>
//                 <MenuContent>
//                   {['id', 'type', 'typed', 'from', 'out', 'to', 'in', 'view'].map(key => (
//                     <MenuRoot key={key} positioning={{ placement: "right-start", gutter: 2 }} onSelect={({ value }) => {
//                       let _prev: any, prev: string[], next: string[];
//                       _prev = deep().map(selections()[selection()]);
//                       if (value === 'jump') {
//                         prev = setToSelector(_prev);
//                         if (prev) cy().$(prev).unselect();
//                       }
//                       if (value === 'add' || value === 'jump') {
//                         next = [];
//                         deep().each(_prev, it => deep().each(deep()._toSet(deep()[key](it)), it => next.push(it)));
//                         next = setToSelector(next);
//                         if (next) cy().$(next).select();
//                       }
//                       if (value === 'forgot') {
//                         next = [];
//                         deep().each(_prev, it => deep().each(deep()._toSet(deep()[key](it)), it => next.push(it)));
//                         next = setToSelector(next);
//                         if (next) cy().$(next).unselect();
//                         setSelections(selections().filter((v,k) => k !== selection()));
//                         setSelection(selection()-1);
//                       }
//                     }}>
//                       <MenuTriggerItem value={key}>{key}</MenuTriggerItem>
//                       <MenuContent>
//                         <MenuItem value="jump" color="fg.info">jump</MenuItem>
//                         <MenuItem value="add">add</MenuItem>
//                         <MenuItem value="forgot">forgot</MenuItem>
//                       </MenuContent>
//                     </MenuRoot>
//                   ))}
//                   <MenuItem value="forgot">forgot</MenuItem>
//                   <MenuItem value="delete" color="fg.error">delete</MenuItem>
//                 </MenuContent>
//               </MenuRoot> : button}
//             </Box>
//           })}
//           <Box>
//             <Button p='0' rounded='full' variant='surface' onClick={() => {
//               const newArr = [...selections(), new Set<any>()];
//               setSelections(newArr);
//               setSelection(newArr.length - 1);
//             }}>+</Button>
//           </Box>
//         </VStack>
//       </VStack>
//     </Box>
//     <Box position='absolute' right='1em' bottom='1em'>
//       <InputGroup flex="1" startElement={<><Kbd>⌘I</Kbd></>}>
//         <Input disabled bg='black' rounded='3em' placeholder="AI" pl='5em'/>
//       </InputGroup>
//     </Box>*/}
//     <Box sx={{ position: 'absolute', left: '1em', bottom: '1em' }}>
//       {pckg.version}
//     </Box>
//   </>);
// }
