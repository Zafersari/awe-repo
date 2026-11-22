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
  personIds: string[];
  locationIds: string[];
  tags: string[];
  status: string;
  relevance: string;
  bookmarked?: boolean;
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
