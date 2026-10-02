// Domain models — they mirror the shape of the files in public/data/*.json.

export interface Person {
  id: string;
  name: string;
  role: string;
  speciality: string;
  background: string;
  responsibilities: string[];
  statement: string;
  avatar: string;
}

export interface Location {
  id: string;
  name: string;
  description: string;
  contains: string[];
}

export interface Evidence {
  id: string;
  title: string;
  type: string;
  timestamp: string;
  summary: string;
  content: string;
  personIds: string[]; // should be IDs, but E04 in evidence.json uses the name "Nova Byte"
  locationIds: string[];
  tags: string[];
  status: string;
  relevance: string;
  bookmarked?: boolean; // not in the JSON, set at runtime from the stored bookmarks
}

export interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  description: string;
  type: string;
  certainty: string;
  personIds: string[];
  locationIds: string[];
  evidenceIds: string[];
}

export interface AppState {
  allEvidence: Evidence[];
  filteredEvidence: Evidence[];
  selectedEvidence: Evidence | null;
  bookmarks: string[];
  currentPage: string;
  allPeople: Person[];
  allLocations: Location[];
  allTimeline: TimelineEvent[];
  caseData: Record<string, unknown>;
  currentPeopleTab: string;
  loadingStepsRemaining: number;
  evidenceViewLoading: boolean;
  viewRendered: {
    dashboard: boolean;
    evidence: boolean;
    people: boolean;
    timeline: boolean;
    workspace: boolean;
  };
  notesStore: Record<string, string>;
  modalCloseListenerCount: number;
}
