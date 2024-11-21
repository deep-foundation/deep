import { Theme, ThemeOptions } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface TypeColor {
    main: string;
    light: string;
    dark: string;
  }

  interface TypeColors {
    value: TypeColor;
    symbol: TypeColor;
    undefined: TypeColor;
    promise: TypeColor;
    boolean: TypeColor;
    string: TypeColor;
    number: TypeColor;
    bigint: TypeColor;
    set: TypeColor;
    weakSet: TypeColor;
    map: TypeColor;
    weakMap: TypeColor;
    array: TypeColor;
    object: TypeColor;
    function: TypeColor;
    contain: TypeColor;
    everything: TypeColor;
    nothing: TypeColor;
    unexpected: TypeColor;
    any: TypeColor;
    id: TypeColor;
    exp: TypeColor;
    selection: TypeColor;
    relation: TypeColor;
    many: TypeColor;
    one: TypeColor;
    condition: TypeColor;
    logic: TypeColor;
  }

  interface Palette {
    types: TypeColors;
  }

  interface PaletteOptions {
    types?: Partial<TypeColors>;
  }
}
