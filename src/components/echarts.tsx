"use client"

import Box from '@mui/material/Box';
import React, { useMemo } from 'react';
import EChartsReact from 'echarts-for-react';
import 'echarts-gl';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import type { TypeColor } from '@mui/material/styles';

import { useDeep, useSelect } from '../react';
import { Paper } from '@mui/material';
import { useDebounce } from '@react-hook/debounce';

export default function ECharts() {
  const deep = useDeep();
  const theme = useTheme();
  const result = useSelect({});
  const [edgeLength, setEdgeLength] = useDebounce(191, 100);
  const [repulsion, setRepulsion] = useDebounce(340, 100);
  const [gravity, setGravity] = useDebounce(0.13, 100);
  const [friction, setFriction] = useDebounce(0.12, 100);
  
  const option = useMemo(() => {
    const data: any = [];
    const edges: any = [];
    for (let d of result) {
      if (d.type != deep.Id && !d.typeof(deep.contains.Value)) {
        const call = d.call;
        const isValue = d.isValue(call);
        const typeKey = Object.keys(theme.palette.types).find(key => d._is(deep[key])) || 'value';
        const typeColor = theme.palette.types[typeKey as keyof typeof theme.palette.types] as TypeColor;
        const isResult = d._is(d);

        data.push({
          id: d.id(),
          name: d.name,
          label: {
            show: true,
            position: 'right',
            formatter: (params: any) => {
              const lines = [
                '{name|' + params.data.name + '}',
                '{type|' + (d.type?.name || '') + '}'
              ];
              if (isValue && typeof call != 'undefined') {
                lines.push('{value|' + isResult + '}');
              }
              return lines.join('\n');
            },
            rich: {
              name: {
                color: typeColor.main,
                fontSize: 14,
                padding: [0, 0, 4, 0]
              },
              type: {
                color: typeColor.dark,
                fontSize: 12,
                padding: [0, 0, isValue ? 4 : 0, 0]
              },
              value: {
                color: typeColor.light,
                fontSize: 12
              }
            }
          },
          itemStyle: {
            color: typeColor.main,
            borderColor: typeColor.light
          }
        });
        if (d.type) edges.push({ 
          source: d.id(), 
          target: d.type.id(), 
          symbol: ['none', 'arrow'],
          lineStyle: { type: 'dashed' },
          value: 1
        });
        if (d.from) edges.push({ 
          source: d.id(), 
          target: d.from.id(), 
          symbol: ['none', 'diamond'],
          value: 3,
          // lineStyle: { color: '#999' }
        });
        if (d.to) edges.push({ 
          source: d.id(), 
          target: d.to.id(), 
          symbol: ['none', 'arrow'],
          value: 3,
          // lineStyle: { color: '#333' }
        });
      }
    }
    return {
      // backgroundColor: '#333',
      series: [
        {
          type: 'graph',
          layout: 'force',
          roam: true,
          animation: false,
          label: {
            position: 'right',
            formatter: '{b}',
            color: '#fff'
          },
          draggable: false,
          data,
          edges,
          edgeSymbolSize: 5,
          lineStyle: {
            width: 2,
            curveness: 0,
            color: '#aaa'
          },
          itemStyle: {
            color: '#fff',
            borderColor: '#fff'
          },
          force: {
            edgeLength,
            repulsion,
            gravity,
            friction,
          },
          emphasis: {
            focus: 'adjacency',
            label: {
              show: true
            }
          },
          // zoom: 1,
          // center: ['50%', '50%']
        }
      ]
    }
  }, [result, edgeLength, repulsion, gravity, friction]);

  return <>
    <EChartsReact
      option={option}
      style={{ height: '100%', width: '100%', position: 'absolute', left: 0, top: 0, }}
    />
    <Paper sx={{ position: 'absolute', left: 16, top: 16, width: 200, p: 2 }}>
      <Stack spacing={2}>
        <Box>
          <Typography gutterBottom>Edge Length ({edgeLength})</Typography>
          <Slider
            value={edgeLength}
            onChange={(_, value) => setEdgeLength(value as number)}
            min={1}
            max={1000}
            valueLabelDisplay="auto"
          />
        </Box>
        <Box>
          <Typography gutterBottom>Repulsion ({repulsion})</Typography>
          <Slider
            value={repulsion}
            onChange={(_, value) => setRepulsion(value as number)}
            min={1}
            max={1000}
            valueLabelDisplay="auto"
          />
        </Box>
        <Box>
          <Typography gutterBottom>Gravity ({gravity})</Typography>
          <Slider
            value={gravity}
            onChange={(_, value) => setGravity(value as number)}
            min={0}
            max={1}
            step={0.01}
            valueLabelDisplay="auto"
          />
        </Box>
        <Box>
          <Typography gutterBottom>Friction ({friction})</Typography>
          <Slider
            value={friction}
            onChange={(_, value) => setFriction(value as number)}
            min={0}
            max={1}
            step={0.01}
            valueLabelDisplay="auto"
          />
        </Box>
      </Stack>
    </Paper>
  </>;
}
