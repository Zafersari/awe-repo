export type DataResource = "case" | "evidence" | "people" | "locations" | "timeline";

export interface EvidenceRequestOptions {
  revision: number;
  delayMs: number;
  empty: boolean;
}

const resourceFiles: Record<DataResource, string> = {
  case: "case.json",
  evidence: "evidence.json",
  people: "people.json",
  locations: "locations.json",
  timeline: "timeline.json",
};

export function getDataUrl(
  resource: DataResource,
  evidenceRequest: EvidenceRequestOptions,
): string {
  const fileName = resourceFiles[resource];
  if (!import.meta.env.DEV) return `/data/${fileName}`;

  const params = new URLSearchParams();
  const pageParams = new URLSearchParams(window.location.search);

  if (resource === "evidence" && pageParams.get("apiError") === "evidence") {
    params.set("error", "1");
  }
  if (resource === "evidence" && evidenceRequest.revision > 0) {
    params.set("delay", String(evidenceRequest.delayMs));
    if (evidenceRequest.empty) params.set("empty", "1");
    params.set("request", String(evidenceRequest.revision));
  } else {
    if (resource === "evidence" && pageParams.get("apiEmpty") === "evidence") {
      params.set("empty", "1");
    }
    const delay = pageParams.get("apiDelay");
    if (delay) params.set("delay", delay);
  }

  const query = params.toString();
  return `/api/${resource}${query ? `?${query}` : ""}`;
}

export async function fetchJson<T>(url: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}).`);
  }
  return response.json() as Promise<T>;
}