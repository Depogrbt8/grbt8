import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import AlertBadge from './AlertBadge';
import LayoutProvider from './layout-provider';

export const metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      noarchive: true,
      nosnippet: true,
    },
  },
};

export default async function OpsAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <head>
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />
        <meta name="googlebot" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />
      </head>
      <body>
        <LayoutProvider>
          {children}
        </LayoutProvider>
      </body>
    </html>
  );
}


