import type {
  Evidence,
  Location,
  Person,
  TimelineEvent,
} from "../../../js/models";

export interface CaseData {
  title: string;
  status: string;
  summary: string;
}

export interface DashboardData {
  caseData: CaseData;
  evidence: Evidence[];
  people: Person[];
  locations: Location[];
  timeline: TimelineEvent[];
  bookmarks: string[];
}
