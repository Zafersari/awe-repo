export interface Person {
    id: string;
    name: string;
    role?: string;
    bio?: string;
}

export interface Location {
    id: string;
    name: string;
    description?: string;
}

export interface Evidence {
    id: string;
    title: string;
    type?: string;
    personIds?: string[]; // Sadece ID'lerden oluşan bir dizi olmalı!
    locationId?: string;
    status?: string;
    relevance?: string;
    certainty?: string;
}

export interface TimelineEvent {
    id: string;
    date: string;
    title: string;
    description?: string;
    relatedEvidenceIds?: string[];
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