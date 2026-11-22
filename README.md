# Project ReMotion – Investigation Portal

Investigate the failure of an AI-assisted rehabilitation robot.

## About

Project ReMotion is a browser-based investigation platform built around a fictional incident.
During a pre-demonstration calibration test, the AI-assisted rehabilitation robot **ReMotion**
loaded the wrong calibration profile and triggered its emergency stop. This application lets an
investigator review the evidence, people, locations, and timeline surrounding the incident, and
build up a working hypothesis about what happened.

The investigation portal is built with React and TypeScript, with case data loaded
from local JSON files. The repository also retains the original JavaScript modules
used throughout the migration exercises. The course work analyses, maintains,
refactors, migrates, and extends this application.

## Running the application

This application uses `fetch()` to load its case data from local JSON files, so it must be served
over HTTP — opening `index.html` directly from the filesystem (`file://`) will not work in most
browsers.

Install the dependencies and start the Vite development server from the project root:

```bash
npm install
npm run dev
```

Create the production build with:

```bash
npm run build
```

Vite prints the local development URL after startup. The generated production
application is written to `dist/`.

## Features

- **Dashboard** — case summary and key statistics calculated from the loaded case data.
- **Evidence catalogue** — search, filter (by type, person, location, status, relevance), sort,
  bookmark, and open detailed evidence records.
- **People & Locations** — profile cards for the investigation team and the six key locations.
- **Timeline** — chronological view of case events with filtering and links to related evidence.
- **Investigator workspace** — bookmarked evidence, personal notes, and a hypothesis draft form.
  Workspace data is saved to your browser's local storage and will still be there when you reload
  the page.

## Browser requirements

A recent version of any evergreen desktop browser (Chrome, Firefox, Edge, Safari). JavaScript must
be enabled. The layout targets common desktop and tablet widths.

## Project status

This is an existing brownfield application, not a fresh scaffold. It works for everyday use, but
you should expect to find rough edges, inconsistent patterns, and a handful of bugs as you work
with it — that discovery process is part of the course.
