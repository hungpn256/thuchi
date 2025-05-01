import { PureAbility, AbilityBuilder } from '@casl/ability';
import type { ProfileUser } from '@/hooks/use-profile-members';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
  Invite = 'invite',
}

export type Subjects = 'Profile' | 'Transaction' | 'Category' | 'Event' | 'ProfileMember' | 'all';

export type AppAbility = PureAbility<[Action, Subjects]>;

export function defineAbilityFor(profileUser: ProfileUser | undefined | null): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<PureAbility<[Action, Subjects]>>(PureAbility);

  if (!profileUser) {
    cannot(Action.Manage, 'all');
    return build();
  }

  switch (profileUser.permission) {
    case 'ADMIN':
      can(Action.Manage, 'all');
      can([Action.Invite, Action.Read], 'ProfileMember');
      can([Action.Read, Action.Create, Action.Update], 'Transaction');
      can([Action.Read, Action.Create, Action.Update], 'Category');
      can([Action.Read, Action.Create, Action.Update], 'Event');
      can(Action.Read, 'Profile');
      break;
    case 'WRITE':
      can([Action.Read, Action.Create, Action.Update], 'Transaction');
      can([Action.Read, Action.Create, Action.Update], 'Category');
      can([Action.Read, Action.Create, Action.Update], 'Event');
      can(Action.Read, 'Profile');
      can(Action.Read, 'ProfileMember');
      break;
    case 'READ':
      can(Action.Read, 'Transaction');
      can(Action.Read, 'Category');
      can(Action.Read, 'Event');
      can(Action.Read, 'Profile');
      can(Action.Read, 'ProfileMember');
      break;
    default:
      cannot(Action.Manage, 'all');
  }

  return build();
}
