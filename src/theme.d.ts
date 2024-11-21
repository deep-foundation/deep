import '@mui/material/styles';

interface TypeColor {
  main: string;
  light: string;
  dark: string;
}

declare module '@mui/material/styles' {
  interface Palette {
    types: {
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
  }

  interface PaletteOptions {
    types?: {
      value?: Partial<TypeColor>;
      symbol?: Partial<TypeColor>;
      undefined?: Partial<TypeColor>;
      promise?: Partial<TypeColor>;
      boolean?: Partial<TypeColor>;
      string?: Partial<TypeColor>;
      number?: Partial<TypeColor>;
      bigint?: Partial<TypeColor>;
      set?: Partial<TypeColor>;
      weakSet?: Partial<TypeColor>;
      map?: Partial<TypeColor>;
      weakMap?: Partial<TypeColor>;
      array?: Partial<TypeColor>;
      object?: Partial<TypeColor>;
      function?: Partial<TypeColor>;
      contain?: Partial<TypeColor>;
      everything?: Partial<TypeColor>;
      nothing?: Partial<TypeColor>;
      unexpected?: Partial<TypeColor>;
      any?: Partial<TypeColor>;
      id?: Partial<TypeColor>;
      exp?: Partial<TypeColor>;
      selection?: Partial<TypeColor>;
      relation?: Partial<TypeColor>;
      many?: Partial<TypeColor>;
      one?: Partial<TypeColor>;
      condition?: Partial<TypeColor>;
      logic?: Partial<TypeColor>;
    }
  }
}
