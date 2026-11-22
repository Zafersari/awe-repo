import type {
  Evidence,
  Location,
  Person,
  TimelineEvent,
} from "../shared/models";

export interface CaseData {
  title: string;
  status: string;
  summary: string;
}

export interface HypothesisDraft {
  suspectId: string;
  nature: string;
  evidenceIds: string[];
  confidence: string;
  explanation: string;
  alternative: string;
}

export interface DashboardData {
  caseData: CaseData;
  evidence: Evidence[];
  people: Person[];
  locations: Location[];
  timeline: TimelineEvent[];
}
