export const PhaseStatuses = {
  Active: "active",
  Planned: "planned",
};

export type PhaseStatus = (typeof PhaseStatuses)[keyof typeof PhaseStatuses];

export interface PhasePrototype {
  startsAt: string;
  duration: number;
  status?: PhaseStatus;
}

export class Phase {
  _id: string | undefined;
  startsAt: string;
  duration: number;
  status: PhaseStatus;

  constructor({
    startsAt,
    duration,
    status = PhaseStatuses.Planned,
  }: PhasePrototype) {
    this._id = undefined;
    this.startsAt = startsAt;
    this.duration = duration;
    this.status = status;
  }
}

export type StoredPhase = Phase & { _id: string };
