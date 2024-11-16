import { get } from "http";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// const [getValue, setValue] = useValueRef(changableValue);
// argument value always change result getValue()
// no rerenders, getValue always memoized and returns ref.current
export function useValueRef<T extends any>(value?: T): [() => T, (value: T) => void] {
  const ref = useRef<T>(value as T);
  const getValue = useCallback<() => T>(() => ref.current as T, []);
  // @ts-ignore
  getValue._isUseValue = true;
  const setValue = useCallback((value) => ref.current = value, []);
  useEffect(() => {
    if (arguments.length) setValue(value as T);
  }, [value]);
  return useMemo(() => [getValue, setValue], []);
};

// const [getValue, setValue] = useValueRef(changableValue);
// setValue and change changableValue always with rerender
// getValue recreates with every change value/changableValue
export function useValueState<T extends any>(value?: T): [() => T, (value: T) => void] {
  const [_value, _setValue] = useState<T>(value as T);
  const ref = useRef<T | void>(value);
  const getValue = useCallback<() => T>(() => (ref.current as T), [_value]);
  // @ts-ignore
  getValue._isUseValue = true;
  const setValue = useCallback((value) => {
    ref.current = value;
    _setValue(value);
  }, []);
  useEffect(() => {
    if (arguments.length) setValue(value as T);
  }, [value]);
  return useMemo(() => [getValue, setValue], [_value]);
};
