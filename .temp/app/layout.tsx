import React from 'react';
import { Client } from './client';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <Client>
          {children}
        </Client>
      </body>
    </html>
  )
};
