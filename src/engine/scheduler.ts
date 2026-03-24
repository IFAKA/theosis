import { Scheduler } from 'rot-js';

export type Actor = 'player' | string;

export class TurnScheduler {
  private scheduler: InstanceType<typeof Scheduler.Simple>;

  constructor() {
    this.scheduler = new Scheduler.Simple();
  }

  addActor(id: Actor, _speed = 100): void {
    this.scheduler.add(id, true);
  }

  removeActor(id: Actor): void {
    this.scheduler.remove(id);
  }

  next(): Actor {
    return this.scheduler.next() as Actor;
  }

  clear(): void {
    this.scheduler.clear();
  }
}
