"use client"

import React, { useMemo, createContext, useContext, useRef, useEffect, useState } from "react";
import { Deep } from "./deep";

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

export function useSelect(exp): Deep[] {
  const deep = useDeep();
  const selection = useMemo(() => {
    const selection = deep.select(exp);
    selection.on(() => {
      setResult(Array.from(selection.call()));
    });
    return selection;
  }, []);
  const [result, setResult] = useState(useMemo(() => Array.from(selection.to), []));
  useEffect(() => {
    return () => selection.kill();
  }, []);
  return result;
}
