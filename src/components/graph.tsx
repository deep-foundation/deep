"use client"

import React, { createContext, memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useDebounceCallback } from '@react-hook/debounce';
import Image from "next/image";
import cytoscape from 'cytoscape';
import { useResizeDetector } from "react-resize-detector";

import d3Force from 'cytoscape-d3-force';
import elk from 'cytoscape-elk';
import euler from 'cytoscape-euler';
// import cola from 'cytoscape-cola';

import { Deep } from '../deep';

import pckg from '../../package.json';
import { useValueRef, useValueState } from '../hooks/use-value';
import { Autocomplete, Box, Button, TextField } from '@mui/material';
import { useDeep, useSelect } from '../react';
import { CatchErrors } from './catch-errors';

const IDS = false;
const doteriaze = (string) => string.length > 10 ? string.slice(0, 10) + '...' : string;

cytoscape.use(d3Force);
const layout = {
  name: 'd3-force',
  animate: true, // whether to show the layout as it's running; special 'end' value makes the layout animate like a discrete layout
  maxIterations: 1000, // max iterations before the layout will bail out
  maxSimulationTime: 1000, // max length in ms to run the layout
  ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
  fixedAfterDragging: false, // fixed node after dragging
  fit: false, // on every layout reposition of nodes, fit the viewport
  padding: 30, // padding around the simulation
  boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
  /**d3-force API**/
  alpha: 0.8, // sets the current alpha to the specified number in the range [0,1]
  alphaMin: 0.001, // sets the minimum alpha to the specified number in the range [0,1]
  // alphaDecay: 1 - Math.pow(0.001, 1 / 300), // sets the alpha decay rate to the specified number in the range [0,1]
  alphaDecay: 0.5, // sets the alpha decay rate to the specified number in the range [0,1]
  alphaTarget: 0.1, // sets the current target alpha to the specified number in the range [0,1]
  velocityDecay: 0.6, // sets the velocity decay factor to the specified number in the range [0,1]
  collideRadius: 1, // sets the radius accessor to the specified number or function
  collideStrength: 0.7, // sets the force strength to the specified number in the range [0,1]
  collideIterations: 1, // sets the number of iterations per application to the specified number
  linkId: function id(d) {
    return d.id;
  }, // sets the node id accessor to the specified function
  linkDistance: 100, // sets the distance accessor to the specified number or function
  linkStrength: function strength(edgeStrength) {
    // return 1 / Math.min(count(edgeStrength.source), count(edgeStrength.target));
    return 0.1;
  }, // sets the strength accessor to the specified number or function
  linkIterations: 1, // sets the number of iterations per application to the specified number
  manyBodyStrength: -20, // sets the strength accessor to the specified number or function
  manyBodyTheta: 0.9, // sets the Barnes–Hut approximation criterion to the specified number
  manyBodyDistanceMin: 1, // sets the minimum distance between nodes over which this force is considered
  manyBodyDistanceMax: Infinity, // sets the maximum distance between nodes over which this force is considered
  // xStrength: 0.1, // sets the strength accessor to the specified number or function
  // xX: 0, // sets the x-coordinate accessor to the specified number or function
  // yStrength: 0.1, // sets the strength accessor to the specified number or function
  // yY: 0, // sets the y-coordinate accessor to the specified number or function
  // radialStrength: 0.05, // sets the strength accessor to the specified number or function
  // // radialRadius: [radius]// sets the circle radius to the specified number or function
  // radialX: 0, // sets the x-coordinate of the circle center to the specified number
  // radialY: 0, // sets the y-coordinate of the circle center to the specified number
  // layout event callbacks
  // ready: function() {
  //   console.log('ready');
  // }, // on layoutready
  // stop: function() {
  //   console.log('stop');
  // }, // on layoutstop
  // tick: function(progress) {
  //   console.log('tick');
  // }, // on every iteration
  // positioning options
  randomize: false, // use random node positions at beginning of layout
  // infinite layout options
  infinite: true // overrides all other options for a forces-all-the-time mode
};

// cytoscape.use(euler);
// const layout = {
//   name: 'euler',
//   // springLength: edge => 80,
//   // springCoeff: edge => {
//   //   // const classes = edge.classes();
//   //   // return classes.includes('value') || classes.includes('type') ? 0.00003 : 0.0008;
//   //   return 0.0008;
//   // },
//   // mass: node => 9,
//   // gravity: -10,
//   // pull: 0.00001,
//   // theta: 0.666,
//   // dragCoeff: 0.02,
//   // movementThreshold: 1,
//   // timeStep: 1,
//   // refresh: 1,
//   // animate: true,
//   // animationDuration: undefined,
//   // animationEasing: undefined,
//   // maxIterations: 1000,
//   // maxSimulationTime: 4000,
//   // ungrabifyWhileSimulating: false,
//   // fit: false,
//   // padding: 30,
//   // boundingBox: undefined,
//   // ready: function(){
//   //   console.log('layout ready');
//   // }, 
//   // stop: function(){
//   //   console.log('layout stop');
//   // }, 
//   randomize: false
// };

export const defaultBgStyle = {
  position: 'absolute', left: 0, top: 0, right: 0, bottom: 0,
  backgroundImage: `linear-gradient(#111111 .1em, transparent .1em), linear-gradient(90deg, #111111 .1em, transparent .1em)`,
  backgroundSize: `3em 3em`,
  backgroundPosition: `0px 0px`,
};

export const GraphContext = createContext<any>({});

export function useRelayout(cy) {
  const [lay, setLay] = useValueRef<any>();
  // return useDebounceCallback(() => {
  return useCallback((_layout = layout) => {
    console.log('relayout');
    if (lay()) {
      console.log('relayout !!lay');
      lay().stop && lay().stop();
      lay().destroy && lay().destroy();
    }
    const l = cy().elements().layout(layout);
    setLay(l);
    console.log('relayout run', l);
    global.l = l;
    l.run();
  }, []);
  // }, 300);
}

export const Graph = memo(function Graph({
  bgStyle = defaultBgStyle,
  children = null,
}: {
  bgStyle?: any;
  children?: any;
}){
  const deep = useDeep();
  const [cy, setCy] = useValueState<any>();
  const cytoscapeRef = useRef<any>();
  const bgRef = useRef<any>();
  const rootRef = useRef<any>();
  const portalRef = useRef<any>();
  const relayout = useRelayout(cy);
  global.relayout = relayout;

  useEffect(() => {
    const cy = cytoscape({
      container: cytoscapeRef.current,
      elements: [{ data: { id: deep.id(), label: 'deep', deep } }],
      style: [
        {
          selector: 'node',
          style: {
            label: 'data(label)',
            color: 'data(color)',
            width: 30,
            height: 30,
            'font-size': 16,
            'text-margin-y': 55, // -4
            // 'text-margin-x': -2,
            "text-wrap": "wrap",
            // 'background-image': 'https://live.staticflickr.com/3063/2751740612_af11fb090b_b.jpg',
            'background-fit': 'cover',
            'background-opacity': 1,
            'background-color': '#bbbbbb',
          },
        },
        {
          selector: 'node:selected',
          style: {
            'background-color': '#fff',
          },
        },
        {
          selector: 'node.hover',
          style: {
            'background-color': '#fff',
          }
        },
        {
          selector: 'edge',
          style: {
            color: '#bbbbbb',
          },
        },
        {
          selector: 'edge:selected',
          style: {
            color: 'white',
          },
        },
        {
          selector: '.to',
          style: {
            'target-arrow-shape': 'triangle',
            'target-distance-from-node': 8,
            'source-distance-from-node': 1,
          }
        },
        {
          selector: '.from',
          style: {
            'target-arrow-shape': 'tee',
            'target-distance-from-node': 8,
            'source-distance-from-node': 1,
          }
        },
        {
          selector: '.type',
          style: {
            'target-arrow-shape': 'triangle',
            'line-style': 'dashed',
            'line-dash-pattern': [5, 5],
            'target-distance-from-node': 8,
            'source-distance-from-node': 1,
          }
        },
        {
          selector: 'edge',
          style: {
            width: 1,
            'curve-style': 'bezier',
          }
        },
        {
          selector: 'node.relation',
          style: {
            'background-color': 'transparent',
            'border-width': 1,
            'border-color': '#aaa',
            'border-style': 'dashed',
            'border-dash-pattern': [5, 5],
          },
        },
        {
          selector: 'node.relation.hover',
          style: {
            'border-color': '#fff',
          },
        },
        {
          selector: 'edge.relation',
          style: {
            'width': 1,
            'line-style': 'dashed',
            'line-color': '#aaa',
            'line-dash-pattern': [5, 5],
          },
        },
        {
          selector: 'edge.related',
          style: {
            'width': 0,
            'line-color': 'transparent',
          },
        },
      ],
      layout,
    });

    setCy(cy);

    const viewport = (event) => {
      const pan = cy.pan();
      const zoom = cy.zoom();
      // setViewport({ pan, zoom });
      bgRef.current.style['background-size'] = `${zoom * 3}em ${zoom * 3}em`;
      bgRef.current.style['background-position'] = `${pan.x}px ${pan.y}px`;
      if (pan) portalRef.current.style['transform'] = `translate(${pan.x}px,${pan.y}px) scale(${zoom})`;
    };

    const mouseover = (event) => {
      cy.$(event.target).addClass('hover');
    };
    
    const mouseout = (event) => {
      cy.$(event.target).removeClass('hover');
    };

    const ehpreviewoff = (event, source, target, preview) => {
      // console.log('ehpreviewoff', preview, preview?.json());
    };
    const ehcomplete = (event, source, target, added) => {
      const s = source.data();
      const t = target.data();
      added.remove();
    };

    const bgtap = (event) => {
    };

    cy.on('ehpreviewoff', ehpreviewoff);
    cy.on('ehcomplete', ehcomplete);
    cy.on('tap', bgtap);

    cy.on('viewport', viewport);
    cy.on('mouseover', mouseover);
    cy.on('mouseout', mouseout);

    const click = (event) => {
      console.log(event.target.data())
      const onClick = event.target.data()?.onClick;
      if (onClick) onClick();
    };

    cy.on('click', 'node', click);

    console.log('cy', cy);
    global.cy = cy;

    // let deeps = new Set<Deep>;
    // for (let d of deep.memory.all) {
    //   if (!d.typeof(deep.contains.Contain) && !d.typeof(deep.contains.Id) && !deep.isValue(d.value)) deeps.add(d);
    //   // deeps.add(d);
    // }
    // const nodes: any = [];
    // for (let d of deeps) {
    //   const name: string[] = [];
    //   name.push(d.name);
    //   if (d?.type?.name) name.push(`(${d.type.name})`);
    //   nodes.push({ data: {
    //     id: d.id(),
    //     label: name.join(' '),
    //     color: 'white',
    //     deep: d,
    //   } });
    // }
    // cy.add(nodes);
    // const edges: any = [];
    // if (!global.test) global.test = {};
    // for (let d of deeps) {
    //   global.test[d.id()] = (global.test[d.id()] || 0) + 1;
    //   if (d.type) edges.push({ data: { source: d.id(), target: d.type.id(), deep: d }, classes: ['type'] });
    //   if (d.from) edges.push({ data: { source: d.id(), target: d.from.id(), deep: d }, classes: ['from'] });
    //   if (d.to) edges.push({ data: { source: d.id(), target: d.to.id(), deep: d }, classes: ['to'] });
    //   // if (deep.isDeep(d.value)) edges.push({ data: { source: d.id(), target: d.value.id(), deep: d }, classes: ['value'] });
    // }
    // console.log(JSON.stringify(global.test));
    // cy.add(edges);

    // relayout();

    return () => {
      cy.removeListener('viewport', viewport);
      cy.removeListener('mouseover', mouseover);
      cy.removeListener('mouseout', mouseout);

      cy.removeListener('ehpreviewoff', ehpreviewoff);
      cy.removeListener('ehcomplete', ehcomplete);
      cy.removeListener('tap', bgtap);

      cy.removeListener('click', 'node', click);
    };
  }, []);

  return <GraphContext.Provider value={{
    cy, relayout,
  }}>
    <CatchErrors
      errorRenderer={(error, reset, catcher) => {
        if (!catcher.tries) {
          catcher.tries = 1;
          reset();
        }
        return <></>;
      }}
    >
      <Box ref={rootRef} sx={{
        width: '100%',
        height: '100%',
        position: 'absolute',
      }}>
        <Box ref={bgRef} sx={bgStyle}/>
        <Box ref={cytoscapeRef} sx={{
          position: 'absolute', left: 0, top: 0, right: 0, bottom: 0,
        }}/>
        <Box ref={portalRef} sx={{
          position: 'absolute', left: 0, top: 0,
          transformOrigin: 'top left',
          pointerEvents: 'none',
        }}>
        </Box>
        {children}
        {!!cy() && <GraphMap/>}
      </Box>
    </CatchErrors>
  </GraphContext.Provider>;
});

export const GraphMap = memo(function GraphMap({
}: {
}) {
  const deep = useDeep();
  const { relayout } = useContext(GraphContext);
  const results = useSelect({ type: deep });

  return <>{results.map(deep => <GraphDeep key={deep.id()} deep={deep}/>)}</>;
});

export const GraphDeep = memo(function GraphDeep({
  deep,
}: {
  deep: Deep;
}) {
  console.log('GraphDeep', deep.id());
  const name = useMemo(() => {
    const name: string[] = [];
    name.push(deep.name);
    if (deep?.type?.name) name.push(`(${deep.type.name})`);
    return name;
  }, []);
  return <>
    <GraphNode id={deep.id()} element={{
      data: {
        label: name.join(' '),
        color: 'white',
      },
    }}/>
    {!!deep.type && <>
      <GraphEdge element={{ data: { source: deep.id(), target: deep.type.id() }, classes: ['type'] }}/>
      <GraphNode id={deep.type.id()}/>
    </>}
    {!!deep.from && <>
      <GraphEdge element={{ data: { source: deep.id(), target: deep.from.id() }, classes: ['from'] }}/>
      <GraphNode id={deep.from.id()}/>
    </>}
    {!!deep.to && <>
      <GraphEdge element={{ data: { source: deep.id(), target: deep.to.id() }, classes: ['to'] }}/>
      <GraphNode id={deep.to.id()}/>
    </>}
  </>;
});

export const GraphNode = memo(function GraphNode({
  id,
  element,
  // ghost = false,
}: {
  id?: string;
  element?: any;
  // ghost?: boolean;
}) {
  console.log('GraphNode', id);
  const me = useState(Symbol());
  const [el, setEl] = useValueRef<any>();
  const { cy, relayout } = useContext(GraphContext);

  const { data, classes = [] } = element || {};
  const { label, deep } = data || {};

  // initialize
  useMemo(() => {
    if (!cy().$id(id).length) {
      setEl(cy().add({ data: { id, Components: new Set(me), ...data }, classes }));
    } else {
      setEl(cy().$id(id));
      // el.data(data);
    }
  }, []);
  useEffect(() => () => {
    const data = el().data();
    if (data.Components) {
      data.Components.delete(me);
      if (!data.Components.size) el().remove();
    }
  }, []);

  useMemo(() => {
    const el = cy().$id(id);
    el.data(data);
  }, [element]);

  useMemo(() => {
    const el = cy().$id(id);
  }, [classes]);

  return <></>;
});

export const GraphEdge = memo(function GraphEdge({
  element,
}: {
  element: any;
}) {
  const { cy, relayout } = useContext(GraphContext);
  const { data, classes = [] } = element;
  const { source, target } = data;
  console.log('GraphEdge', 'source', source, 'target', target);

  // define
  useEffect(() => {
    const edges = cy().$(`edge[source="${source}"][target="${target}"]`);
    if (!edges.length) cy().add({ data, classes });
  }, []);

  return <>
    {/* <GraphNode element={{ data: { id: source } }} ghost/>
    <GraphNode element={{ data: { id: target } }} ghost/> */}
  </>;
});

// export const GraphDeep = memo(function GraphDeep({ deep }: { deep: Deep }) {
//   const name: string[] = [];
//   if (deep.name) name.push(deep?.name);
//   if (deep?.type?.name) name.push(`(${deep?.type?.name})`);
//   const label = `${deep.id()}\n${name.join(' ')}\n\n\n\n${typeof(deep.call)}`;
//   return <>
//     <GraphNode element={{
//       data: {
//         id: deep.id(), deep, label,
//         color: '#fff',
//       },
//     }}/>
//     {/* {!!deep.type && <>
//       <GraphEdge element={{
//         data: { source: `${deep.id()}`, target: `${deep.type.id()}` },
//         classes: ['type'], }}/>
//     </>}
//     {!!deep.from && <>
//       <GraphEdge element={{
//         data: { source: `${deep.id()}`, target: `${deep.from.id()}` },
//         classes: ['from'], }}/>
//     </>}
//     {!!deep.to && <>
//       <GraphEdge element={{
//         data: { source: `${deep.id()}`, target: `${deep.to.id()}` },
//         classes: ['to'], }}/>
//     </>} */}
//     <GraphNode element={{
//       data: {
//         id: `${deep.id()}-typed`, deep, label: `typed\n\n\n\n${deep.typed.size}`, color: '#fff',
//       },
//       classes: ['relation'],
//     }}/>
//     {/* <GraphEdge element={{
//       data: { source: `${deep.id()}-typed`, target: deep.id() },
//       classes: ['relation'], }}/> */}
//     <GraphNode element={{
//       data: {
//         id: `${deep.id()}-out`, deep, label: `out\n\n\n\n${deep.out.size}`, color: '#fff',
//       },
//       classes: ['relation'],
//     }}/>
//     {/* <GraphEdge element={{
//       data: { source: `${deep.id()}-out`, target: deep.id() },
//       classes: ['relation'], }}/> */}
//     <GraphNode element={{
//       data: {
//         id: `${deep.id()}-in`, deep, label: `in\n\n\n\n${deep.in.size}`, color: '#fff',
//       },
//       classes: ['relation'],
//     }}/>
//     {/* <GraphEdge element={{
//       data: { source: `${deep.id()}-in`, target: deep.id() },
//       classes: ['relation'], }}/> */}
//   </>;
// });

export const GraphSearch = memo(function GraphSearch() {
  return <>
    <Autocomplete
      disablePortal
      options={[]}
      sx={{ width: 300, position: 'absolute', left: '1em', top: '1em' }}
      renderInput={(params) => <TextField {...params} label="Search" size='small'/>}
    />
  </>;
});

export const GraphIntelligence = memo(function GraphSearch() {
  return <>
    <TextField 
      sx={{ width: 300, position: 'absolute', right: '1em', bottom: '1em' }}label="Intelligence" size='small'
    />
  </>;
});

export const GraphRelayout = memo(function GraphSearch() {
  const { cy, relayout } = useContext(GraphContext);

  return <>
    <Button variant="outlined" onClick={() => relayout()} sx={{
      position: 'absolute', right: '1em', top: '1em',
      minWidth: 0,
      width: '3em', height: '3em', padding: 0,
    }}>⎈</Button>
  </>;
});
