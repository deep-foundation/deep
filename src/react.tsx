"use client"

import React, { useMemo, createContext, useContext, useRef, useEffect, useState } from "react";
import { Deep } from "./deep";
import { useDebounceCallback } from '@react-hook/debounce';

const deep = new Deep();

export const DeepContext = createContext<Deep>(deep);

console.log('deep', deep);
global.deep = deep;

export function useDeep() {
  return useContext(DeepContext);
}

export function DeepProvider({
  deep,
  children,
}: {
  deep?: Deep;
  children: any;
}) {
  const contextDeep = useDeep();
  const value = useMemo(() => deep || contextDeep || new Deep(), [deep, contextDeep]);
  return <DeepContext.Provider value={value}>
    {children}
  </DeepContext.Provider>;
}

let i = 0;
export function useSelect(exp): any[] {
  const deep = useDeep();
  const first = useMemo(() => {
    const selection = deep.select(exp);
    const array = Array.from(selection.to);
    selection.kill();
    return array;
  }, []);
  const [result, setResult] = useState(first);
  const updateResults = useDebounceCallback((selection) => {
    setResult(Array.from(selection.call()));
  }, 300);
  useEffect(() => {
    let ii = i++;
    const selection = deep.select(exp);
    selection.on((event) => {
      if (event?.deep?.type != deep.Selection) updateResults(selection);
    });
    return () => selection.kill();
  }, []);
  return result;
}
