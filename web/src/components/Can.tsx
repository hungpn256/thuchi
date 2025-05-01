import { ReactNode } from 'react';
import { useAbility } from '@/contexts/casl-context';
import { Action, Subjects } from '@/casl/ability';

interface CanProps {
  action: Action;
  subject: Subjects;
  children: ReactNode;
  fallback?: ReactNode;
}

export function Can({ action, subject, children, fallback = null }: CanProps) {
  const ability = useAbility();

  return ability.can(action, subject) ? <>{children}</> : <>{fallback}</>;
}
