import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, URL } from "node:url";
import process from "node:process";

const dataDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "../public/data");
const port = Number(process.env.API_PORT ?? 3001);
const resources = new Map([
  ["/api/case", "case.json"],
  ["/api/evidence", "evidence.json"],
  ["/api/people", "people.json"],
  ["/api/locations", "locations.json"],
  ["/api/timeline", "timeline.json"],
]);

function sendJson(response, statusCode, value) {
  response.writeHead(statusCode, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(value));
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
  const fileName = resources.get(url.pathname);

  if (!fileName) {
    sendJson(response, 404, { error: "Not found" });
    return;
  }

  if (request.method !== "GET") {
    response.setHeader("allow", "GET");
    sendJson(response, 405, { error: "Method not allowed" });
    return;
  }

  if (url.searchParams.get("error") === "1") {
    sendJson(response, 500, { error: `Simulated failure for ${url.pathname}` });
    return;
  }

  const delayParameter = url.searchParams.get("delay");
  const configuredDelay = Number(process.env.API_DELAY_MS ?? 0);
  const requestedDelay = delayParameter === null
    ? configuredDelay
    : Number(delayParameter);
  const delayMs = Number.isFinite(requestedDelay)
    ? Math.min(Math.max(requestedDelay, 0), 30000)
    : 0;

  if (delayMs > 0) {
    await new Promise((resolveDelay) => setTimeout(resolveDelay, delayMs));
  }

  if (url.pathname === "/api/evidence" && url.searchParams.get("empty") === "1") {
    sendJson(response, 200, []);
    return;
  }

  try {
    const body = await readFile(resolve(dataDirectory, fileName), "utf8");
    response.writeHead(200, { "content-type": "application/json; charset=utf-8" });
    response.end(body);
  } catch {
    sendJson(response, 500, { error: `Could not read ${fileName}` });
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Read-only case API listening at http://127.0.0.1:${port}`);
});