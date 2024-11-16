"use client"

import Box from '@mui/material/Box';
import React from 'react';


import { useDeep, useSelect } from '../react';

export default function Test() {
  const deep = useDeep();
  const result = useSelect({ type: deep });
  return <>
    {result.length}
  </>;
}
