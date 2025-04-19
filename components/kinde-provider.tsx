'use client';

import { KindeProvider as KindeProviderClient } from '@kinde-oss/kinde-auth-nextjs';

export function KindeProvider({ children }: { children: React.ReactNode }) {
  return <KindeProviderClient>{children}</KindeProviderClient>;
}
