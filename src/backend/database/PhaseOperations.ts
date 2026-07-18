import { ObjectId } from "mongodb";
import {
  PhaseStatuses,
  type CreatePhaseRequest,
  type StoredPhase,
} from "../../shared/models/Phases.ts";
import {
  convertToPhase,
  getPhasesCollection,
  type PhaseDocument,
} from "./Database.ts";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function toUtcDayStart(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function phaseRange(
  startsAt: Date,
  duration: number
): {
  start: number;
  end: number;
} {
  const start = toUtcDayStart(startsAt);
  return { start, end: start + Math.max(duration, 1) * MS_PER_DAY };
}

function rangesOverlap(
  first: { start: number; end: number },
  second: { start: number; end: number }
): boolean {
  return first.start < second.end && second.start < first.end;
}

export async function getPhases(): Promise<StoredPhase[]> {
  const phaseDocuments = await (
    await getPhasesCollection()
  )
    .find()
    .sort({ startsAt: 1, _id: 1 })
    .toArray();

  return phaseDocuments.map(convertToPhase);
}

export async function getActivePhase(): Promise<StoredPhase | null> {
  const phaseDocument = await (
    await getPhasesCollection()
  ).findOne({ status: PhaseStatuses.Active }, { sort: { startsAt: -1 } });

  return phaseDocument ? convertToPhase(phaseDocument) : null;
}

export async function findOverlappingPhase({
  startsAt,
  duration,
}: CreatePhaseRequest): Promise<StoredPhase | null> {
  const candidate = phaseRange(new Date(startsAt), duration);
  const phases = await getPhases();

  for (const phase of phases) {
    const existing = phaseRange(new Date(phase.startsAt), phase.duration);
    if (rangesOverlap(candidate, existing)) {
      return phase;
    }
  }

  return null;
}

export async function createPhase({
  startsAt,
  duration,
}: CreatePhaseRequest): Promise<StoredPhase> {
  const phaseDocument: PhaseDocument = {
    _id: new ObjectId(),
    startsAt: new Date(startsAt),
    duration,
    status: PhaseStatuses.Planned,
  };

  await (await getPhasesCollection()).insertOne(phaseDocument);
  return convertToPhase(phaseDocument);
}

export async function getPhaseById(
  phaseId: string
): Promise<StoredPhase | null> {
  const phaseDocument = await (
    await getPhasesCollection()
  ).findOne({ _id: new ObjectId(phaseId) });

  return phaseDocument ? convertToPhase(phaseDocument) : null;
}

export async function deletePhase(phaseId: string): Promise<boolean> {
  const result = await (
    await getPhasesCollection()
  ).deleteOne({ _id: new ObjectId(phaseId) });

  return result.deletedCount === 1;
}
