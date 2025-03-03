"use client"

import React, { useEffect } from 'react';
// @ts-ignore
import { WebSocketProvider } from 'next-ws/client';

export function Client({ children }: { children: any }) {
  return <WebSocketProvider url='ws://localhost:3000/api/deep'>
    {children}
  </WebSocketProvider>;
};
