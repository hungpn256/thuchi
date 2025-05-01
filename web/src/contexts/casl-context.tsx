'use client';

import { createContext, useContext, useMemo, ReactNode } from 'react';
import { AppAbility, defineAbilityFor } from '@/casl/ability';
import { useCurrentProfileUser } from '@/hooks/use-current-profile-user';

interface CaslContextValue {
  ability: AppAbility;
  isLoading: boolean;
}

const CaslContext = createContext<CaslContextValue | undefined>(undefined);

interface CaslProviderProps {
  children: ReactNode;
}

export function CaslProvider({ children }: CaslProviderProps) {
  const { data: profileUser, isLoading } = useCurrentProfileUser();
  const ability = useMemo(() => defineAbilityFor(profileUser), [profileUser]);
  return <CaslContext.Provider value={{ ability, isLoading }}>{children}</CaslContext.Provider>;
}

export function useAbility(): AppAbility {
  const context = useContext(CaslContext);
  if (!context) throw new Error('useAbility must be used within CaslProvider');
  return context.ability;
}
