export const noScrollBar = ((s) => ({
  '&::-webkit-scrollbar': s,
  '&::-webkit-scrollbar-track': s,
  '&::-webkit-scrollbar-thumb': s,
  'scrollbar-width': 'none !important',
}))({ display: 'none' });
