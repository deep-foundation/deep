import React from 'react';
import { Map } from '../components/map';

export default function Page() {
  return (
    <div style={{
      position: 'fixed',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
      overflow: 'hidden',
    }}>
      <Map />
    </div>
  );
};
