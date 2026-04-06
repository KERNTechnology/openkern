import * as migration_20260406_101530_initial from './20260406_101530_initial';

export const migrations = [
  {
    up: migration_20260406_101530_initial.up,
    down: migration_20260406_101530_initial.down,
    name: '20260406_101530_initial'
  },
];
