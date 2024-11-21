"use client"

import { createTheme } from "@mui/material"

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#cccccc',
      light: '#ffffff',
      dark: '#aaaaaa',
    },
    types: {
      // Базовые типы значений
      value: {
        main: '#64B5F6',
        light: '#90CAF9',
        dark: '#42A5F5'
      },
      symbol: {
        main: '#FFD54F',
        light: '#FFE082',
        dark: '#FFC107'
      },
      undefined: {
        main: '#90A4AE',
        light: '#B0BEC5',
        dark: '#78909C'
      },
      promise: {
        main: '#4DB6AC',
        light: '#80CBC4',
        dark: '#26A69A'
      },
      boolean: {
        main: '#F06292',
        light: '#F48FB1',
        dark: '#EC407A'
      },
      string: {
        main: '#81C784',
        light: '#A5D6A7',
        dark: '#66BB6A'
      },
      number: {
        main: '#7986CB',
        light: '#9FA8DA',
        dark: '#5C6BC0'
      },
      bigint: {
        main: '#9575CD',
        light: '#B39DDB',
        dark: '#7E57C2'
      },
      set: {
        main: '#4DD0E1',
        light: '#80DEEA',
        dark: '#26C6DA'
      },
      weakSet: {
        main: '#4FC3F7',
        light: '#81D4FA',
        dark: '#29B6F6'
      },
      map: {
        main: '#FF8A65',
        light: '#FFAB91',
        dark: '#FF7043'
      },
      weakMap: {
        main: '#FFA726',
        light: '#FFB74D',
        dark: '#FB8C00'
      },
      array: {
        main: '#BA68C8',
        light: '#CE93D8',
        dark: '#AB47BC'
      },
      object: {
        main: '#A1887F',
        light: '#BCAAA4',
        dark: '#8D6E63'
      },
      function: {
        main: '#E57373',
        light: '#EF9A9A',
        dark: '#EF5350'
      },
      // Специальные типы
      contain: {
        main: '#FFB300',
        light: '#FFD54F',
        dark: '#FF8F00'
      },
      everything: {
        main: '#8E24AA',
        light: '#AB47BC',
        dark: '#6A1B9A'
      },
      nothing: {
        main: '#424242',
        light: '#616161',
        dark: '#212121'
      },
      unexpected: {
        main: '#D32F2F',
        light: '#E57373',
        dark: '#B71C1C'
      },
      any: {
        main: '#7CB342',
        light: '#9CCC65',
        dark: '#558B2F'
      },
      id: {
        main: '#00897B',
        light: '#26A69A',
        dark: '#00695C'
      },
      exp: {
        main: '#5E35B1',
        light: '#7E57C2',
        dark: '#4527A0'
      },
      selection: {
        main: '#00ACC1',
        light: '#26C6DA',
        dark: '#00838F'
      },
      // Отношения
      relation: {
        main: '#F9A825',
        light: '#FDD835',
        dark: '#F57F17'
      },
      many: {
        main: '#AD1457',
        light: '#D81B60',
        dark: '#880E4F'
      },
      one: {
        main: '#6D4C41',
        light: '#8D6E63',
        dark: '#4E342E'
      },
      // Условия
      condition: {
        main: '#F4511E',
        light: '#FF7043',
        dark: '#D84315'
      },
      // Логика
      logic: {
        main: '#0288D1',
        light: '#29B6F6',
        dark: '#01579B'
      }
    }
  },
  shape: {
    borderRadius: 16,
  },
});
