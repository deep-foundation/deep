import Box from '@mui/material/Box';
import React from 'react';

import Head from 'next/head';

import pckg from '../../package.json';
import { Graph, GraphIntelligence, GraphRelayout, GraphSearch } from '../components/graph';
import Test from '../components/test';

export default function Page() {
  return <>
    <Head>
      <title>Deep@{pckg.version}</title>
    </Head>
    <Box sx={{
      background: '#000000',
      color: '#ffffff',
      width: '100%',
      height: '100%',
      minHeight: '100vh',
      position: 'relative',
    }}>
      <Graph>
        <GraphSearch/>
        <GraphIntelligence/>
        <GraphRelayout/>
      </Graph>
    </Box>
  </>;
}
