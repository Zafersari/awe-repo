# Exercise 3 — React Foundations & First Migration

This is the third exercise in Advanced Web Engineering Course (CSDC). It builds on Exercises 1 and 2. This exercise adds
React to that project and migrates the **application shell and one representative view (the Dashboard)** to it. The rest of the app stays vanilla TS for now. You'll migrate more of it in Exercises 4 and 5.

Keep a running note of what you changed and why, and commit as you go. Several theory questions ask you to point at a specific decision or diff you made.

## Corresponding manuscript reading

This exercise corresponds to the following chapters in the course manuscript:

- **Chapter 12, From Static Documents to Rich Web Applications** — PDF pp. 85–88
- **Chapter 13, Rendering and Navigation Architectures** — PDF pp. 90–95
- **Chapter 14, Hybrid Rendering and Modern Web Architectures** — PDF pp. 96–100
- **Chapter 15, React Foundations** — PDF pp. 102–109

## Self-Check

The exercise is organized into 10 individual tasks with corresponding questions, that are
presented in class.

These checkboxes are for self-checking. Don't forget to do the actual checking of tasks you are able to present in the Moodle course. **Before class, tick only what you can genuinely demonstrate or answer on the spot, live.**

| #   | Demo                                               | Ready? |
| --- | -------------------------------------------------- | ------ |
| 1   | Historical view of the web                         | ☐      |
| 2   | SSR vs. CSR                                        | ☐      |
| 3   | The virtual DOM                                    | ☐      |
| 4   | SPA vs. MPA: state & routing                       | ☐      |
| 5   | React introduction                                 | ☐      |
| 6   | React + TypeScript entry point in the Vite project | ☐      |
| 7   | Component hierarchy for the whole app              | ☐      |
| 8   | Architecture Decision Record: why SPA/React        | ☐      |
| 9   | Migrate the application shell                      | ☐      |
| 10  | Migrate the Dashboard view                         | ☐      |

A demo only counts as "Ready" once **every** task and question checkbox inside it (below) is
ticked — the table above is just a fast overview, tick the boxes inside each demo first.

---

## Demo 1 — Historical view of the web

**Tasks**

- [x] Give a concise explanation of how web applications evolved over the years and place the app from the exercises on the timeline. Justify where you put it.

> **Evolution of web applications**: mostly static pages in the beginning to server-rendered pages whose contents would change after each request, then to richer pages that could fetch data and update parts of UI without reloading. This led to single-page applications where JS handles navigation and updates inside single document, with modern frameworks and build tools making structuring and maintaining those applications easier.
> **This application**: Single Page Application (SPA) style webapp, where the browser loads one HTML document where views are configured, JS entry point is loaded and navigation changes URL hash with switching from one view to the other without full page reload. Fits into period of AJAX-to-SPA period (single page application with partial page updates).

**Questions** (depend on the tasks above)

- [x] What specific problem was AJAX (and libraries like jQuery) solving that plain server-rendered pages couldn't? What new problems did that approach introduce, that SPA frameworks then tried to solve?

> **AJAX** let page request data in background and update only parts of page instead of asking server for entire page.
> **JQuery** helped developers in using those browser features, by providing simpler more consistent API.

- [x] This app currently uses hash-based routing (`#dashboard`, `#evidence`, ...) with no full page reload between views. Which era does that pattern belong to, and what does it tell you about when this architectural choice became common?

> Belongs to Single-Page-Application era during the web 2.0/AJAX period. The pattern shows that this type of architectural choice became common when apps started to implement client-side navigation rather than multi-page navigation.

---

## Demo 2 — SSR vs. CSR

**Tasks**

- [x] Present a short comparison table for Server-Side Rendering and Client-Side Rendering. Explain what the server sends on first request, what the browser has to do before the user sees content, and what happens on subsequent navigation.

> |                           | Server-Side Rendering (SSR)                                                                        | Client-Side Rendering (CSR)                                                                         |
> | ------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
> | First response            | Server returns HTML containing the requested page's content, often with CSS and JavaScript assets. | Server returns an HTML shell plus JavaScript; data may arrive separately from API/JSON requests.    |
> | Before content is visible | Browser parses and paints the HTML. JavaScript may later hydrate it to add interactivity.          | Browser downloads and executes JavaScript, obtains required data, then builds/updates the page DOM. |
> | Subsequent navigation     | Often requests another HTML document from the server, though hybrid apps may navigate client-side. | Usually changes the view in the existing document without a full reload; it may fetch more data.    |

- [x] Pick one real, publicly known website and argue whether it's (primarily) SSR or CSR, using observable evidence (view source, network tab, etc.).

> **Example: Wikipedia article page**, [Server-side scripting](https://en.wikipedia.org/wiki/Server-side_scripting). In the browser, open **View Page Source** and search for `id="mw-content-text"` or the first sentence of the article. The initial HTML response contains the article paragraphs inside that content element, and the article is visible on page load. That is evidence of server-rendered content. Wikipedia also runs client-side JavaScript for interactive features, so this describes its initial article rendering, not an absence of client-side code. I verified the article text in the page source and the rendered page.

**Questions** (depend on the tasks above)

- [x] Explain why this exercise application is SSR or CSR and why. Walk through, step by step, what happens between the browser requesting the page and the Dashboard actually being visible.

> This is **primarily CSR for its data-driven dashboard**, with a static HTML shell. On the initial request, `index.html` already supplies the header, navigation, dashboard heading and introduction, but the `#dashboardContent` area is empty. The browser then loads the module entry point. On `DOMContentLoaded`, `initApp()` restores local preferences, installs event listeners and starts `loadAllData()`. The app fetches case, people and location JSON, then separately starts evidence and timeline fetches. `renderDashboard()` builds the dashboard markup in the browser and assigns it to `#dashboardContent`; it is called again as more data arrives. Finally, the router activates the dashboard view. So the shell is present in the first HTML response, but the case summary, statistics, progress and recent lists are generated client-side.

- [x] Name one real cost of what the architecture pays for that choice (think about what a user with JavaScript disabled, or a slow connection, or a search engine crawler would see) and why.

> If JavaScript is disabled, a user can still receive the static headings and introductory HTML, but the case-specific dashboard content stays empty and the app's navigation and controls do not work. On a slow connection, users wait for the JavaScript and JSON requests before seeing the populated dashboard. A crawler that does not execute JavaScript may likewise index only the shell rather than the data-driven case content. These are costs of rendering this content in the browser instead of including it in the initial HTML response.

---

## Demo 3 — The virtual DOM

**Tasks**

- [x] In your own words (a few sentences, not a copied definition), explain what the virtual DOM is and what problem it solves.

> A virtual DOM is a lightweight, in-memory description of what a UI should look like. When state changes, a UI library can make a new description, compare it with the previous one, and apply the necessary changes to the browser DOM. This gives the UI a structured way to stay in sync with application state without manually rebuilding every affected section ourselves.

- [x] Find one concrete example in the _original_ vanilla `app.js` (from before Exercise 1) where a small state change (e.g. toggling one bookmark) caused a large chunk of real DOM to be recreated via `innerHTML`, even though only a tiny part of it actually needed to change.

> **Bookmarking an evidence item:** In the Evidence view, click the bookmark button on one card. `handleBookmarkClick(evidenceId)` changes that item's bookmark state and saves the bookmarks, then calls `renderEvidenceList()` while the Evidence view is active. That function rebuilds HTML for every currently filtered evidence card and assigns the result to `#evidenceList.innerHTML`. As a result, all card elements in the list are replaced, even though only the selected card's bookmark icon and active styling needed to change. To demonstrate it, open DevTools Elements, inspect a card, click its bookmark, and observe that the list's card DOM is rebuilt. See `app.js`: `handleBookmarkClick()`, `renderEvidenceList()`, and `renderEvidenceCardHTML()`.

> To demonstrate, best would be to checkout: `git checkout 6b96434d11c613c142a02eb5ce235836b9bdc763`, run live server for the `index.html`, then go to **"Evidence"**, inspect the document (HTML), press the bookmark (star) icon on any of the cards and notice how the others all update as well.

**Questions** (depend on the tasks above)

- [x] Using the example you found: how would a virtual-DOM-based approach (conceptually, not necessarily React-specific) avoid recreating the parts that didn't change?

> After the bookmark state changes, the UI would be described again and compared with its previous description. The comparison would show that the evidence list and other cards are unchanged; only the selected card's bookmark button has a different active class and star icon. The renderer could update those button details in the existing DOM node and leave the other card nodes intact.

- [x] Is the virtual DOM a "faster" way to update the real DOM than directly calling `innerHTML`? Explain precisely what's actually being traded off (think about the diffing work itself).

> Whether it is "faster" depends entirely on the contents and the work necessary to update the entire DOM. For smaller UI's like this one, the diffing might outweigh the saved mutations when redoing the entire section.
> **What's traded off?**: bookkeeping and comparison work (when diffing) vs. number and cost of actual DOM changes (direct innerHTML call)

- [x] Does using a virtual DOM library automatically make your app fast? What could still make a React app slow despite it?

> No. A virtual DOM is a rendering strategy, not an automatic performance guarantee. A React app can still be slow if it needlessly re-renders large component subtrees, performs expensive calculations during rendering, uses unstable or missing keys in lists, triggers excessive state updates, or loads and processes too much JavaScript or data. Poor network performance, large assets, and expensive layout or paint work can also dominate. Measure the actual bottleneck and then reduce unnecessary rendering or work; adding memoization without evidence can add complexity without helping.

---

## Demo 4 — SPA vs. MPA: state & routing

**Tasks**

- [x] Diagram or illustrate live how navigation currently works in this app: what triggers a view change, what code runs, and what does _not_ happen (that would happen in a classic multi-page site).

> ```mermaid
> flowchart TD
>   A[Click navigation button] --> B[window.navigateTo view]
>   B --> C[Set window.location.hash]
>   C --> D[Browser updates URL and history]
>   D --> E[hashchange event]
>   E --> F[handleHashChange in js/router.ts]
>   F --> G[Update currentPage and active CSS classes]
>   G --> H[Render the selected view if needed]
>   H --> I[Same HTML document remains loaded]
> ```
>
> For a live walkthrough, click between two navigation buttons and watch the address bar: only the hash changes. `navigateTo()` sets it, the browser emits `hashchange`, and `handleHashChange()` updates `state.currentPage`, toggles the view/navigation classes, and renders the view as needed. No new HTML document is requested and the JavaScript runtime is not restarted, unlike a traditional multi-page navigation. Data loading occurs during app startup, not on each hash change.

- [x] List every piece of state in the current app that would be lost on a full page reload, versus what's preserved (hint: check what's in `localStorage` versus what's only in memory).

> **Preserved by `localStorage` and restored by the app:**
> - `remotion_bookmarks`: bookmarked evidence IDs.
> - `remotion_notes`: saved notes keyed by evidence ID. A note is persisted when Save is used; an unsaved edit in the note textarea is not.
> - `remotion_hypothesis`: the hypothesis draft fields and selected evidence, persisted when Save hypothesis is used. Unsaved form edits are not.
>
> **Preserved in the URL/browser history:** the current hash (for example `#timeline`) and hash-history entries. On reload, the app reads the hash and routes back to that view; `state.currentPage` itself is reinitialized and set again by the router.
>
> **Lost on reload, then reset or reconstructed:** the in-memory `AppState` values `selectedEvidence`, `filteredEvidence`, `currentPeopleTab`, `loadingStepsRemaining`, `evidenceViewLoading`, all `viewRendered` flags, and `modalCloseListenerCount`, plus the evidence module's `latestSearchRequestId` and any pending simulated-search timer. `caseData`, `allEvidence`, `allPeople`, `allLocations`, and `allTimeline` are fetched again from JSON; unsaved in-memory changes to evidence `status` or `relevance` are therefore lost. The browser DOM is recreated, so transient evidence search/filter/sort values, timeline filters/order, the selected People/Locations tab, an open detail/modal, and any unsaved note or hypothesis input are not preserved by the app. The bookmark and notes arrays/objects also start fresh in memory, but their saved contents are reloaded from `localStorage`. Browser form-restoration behavior can vary; the app itself does not persist those transient control values.

**Questions** (depend on the tasks above)

- [x] In a traditional multi-page app, where does "the current page's data" live between requests? Where does it live in this SPA instead, and what are the consequences of that difference (for good and for bad)?

> In an multi page app, the server rebuilds each page from database/session data. Here, working state lives in browser memory, with selected data saved in `localStorage`; navigation is fast, but unsaved state is lost on reload.

- [x] This app currently implements routing by hand (`handleHashChange()`, a `switch`-like chain of `if`s, and manually toggling CSS classes). What is a router library actually responsible for that this hand-rolled version does _not_ handle?

> A router library maps URLs to views and provides reusable handling for route parameters, nested routes, not-found pages, and browser history. This app only matches a few hashes and toggles views itself.

- [x] If the user hits the browser's back button right now, what happens in this app, and why?

> Back restores the previous hash, firing `hashchange`. `handleHashChange()` then activates that view without reloading the page.

---

## Demo 5 — React introduction

**Tasks**

- [x] Read enough of the React docs (or equivalent) to write, from scratch, a single tiny component (it can live in a throwaway sandbox, not necessarily this project yet) that renders a piece of static data as JSX. No state, no props even, just to prove you can write and reason about JSX.

> A tiny static component written in a React sandbox:
> Implemented in [sandbox/react-intro/CaseStatus.tsx](sandbox/react-intro/CaseStatus.tsx). It is intentionally not imported by the app.

- [x] Identify, in your own words, what "component" means in React, and how it differs from a plain JavaScript function that happens to return an HTML string (which is essentially what several functions in the old `app.js` did, e.g. `renderEvidenceCardHTML()`).

> A React component is a function that describes a piece of UI by returning React elements (often written as JSX). Unlike a function that returns an HTML string, React uses that description to manage updates to the DOM when the UI changes.

**Questions** (depend on the tasks above)

- [x] What is JSX, actually? What does it compile to?

> JSX is JavaScript syntax for describing UI; browsers do not understand it directly. A JSX transform turns `<p>Case status: Under review</p>` into JavaScript that creates a React element (with the modern transform, a helper call such as `_jsx("p", { children: "Case status: Under review" })`). React then uses that element description to update the DOM.

- [x] Compare your tiny component to the old `renderEvidenceCardHTML(ev)` function (string concatenation returning an HTML string). What is fundamentally different about how each one's output becomes real DOM?

> `renderEvidenceCardHTML()` returns a string that the app inserts with `innerHTML`. A React component returns an element description; React compares it with the previous render and updates the necessary DOM nodes.

- [x] What does it mean that "components are just functions" in React? What would break if a
      component's function body had a side effect (e.g. mutated a global variable) every time it rendered?

> React calls a component function to describe the UI for the current state and props. Keep it pure: side effects during render may repeat when React renders again, causing duplicated or unpredictable changes.

---

## Demo 6 — React + TypeScript entry point in the Vite project

**Tasks**

- [x] Add React and TypeScript support to the existing Vite project from Exercise 2 (the right Vite plugin, `tsx` support, React types).

> Installed `react` and `react-dom` for runtime rendering, `@types/react` and `@types/react-dom` for TypeScript declarations, and `@vitejs/plugin-react` for React development features such as Fast Refresh. 
> Vite 8 already recognizes `.tsx` files and transforms their JSX with its built-in Oxc transformer

- [x] Create a minimal entry point (e.g. a root `<App />` component mounted into the page) that
      renders _something_ visible, without removing the working vanilla app yet.

> The sandbox page loads [`main.tsx`](./sandbox/react-intro/main.tsx), which calls `createRoot()` on `#root` and renders `<CaseStatus />` from [`CaseStatus.tsx`](./sandbox/react-intro/CaseStatus.tsx). The main app still loads its original vanilla entry point.

- [x] Decide and document how the two versions coexist during the migration (e.g. a separate route/ flag to view the React version, or a full swap-over. Your call, but be ready to justify it).

> **Coexistence decision:** keep the current vanilla application at `/` and serve the React sandbox separately at `/sandbox/react-intro/`. This lets us experiment without replacing or mixing with the working app; the sandbox HTML is not linked from the main entry and is not part of the production bundle's import graph. The dedicated [`tsconfig.sandbox.json`](./tsconfig.sandbox.json) type-checks its TSX without adding the sandbox to the main app's TypeScript build.

> **Accessing the sandbox** via the browser: navigate to ``http://localhost:5173/sandbox/react-intro/`` which will load the files used in sandbox.  

**Questions** (depend on the tasks above)

- [x] What did you actually have to install and configure to get JSX compiling through Vite? What is each piece responsible for?

> React (package `react`) and React DOM (package `react-dom`) render the UI; their type packages (`@types/react` and `@types/react-dom`) support TypeScript. 
> Vite 8's Oxc transformer handles `.tsx` syntax
> `jsx: "react-jsx"` in [`tsconfig.sandbox.json`](./tsconfig.sandbox.json) selects React's automatic JSX runtime
> Vite React plugin adds Fast Refresh in development.

- [x] How does your `<App />` component get from source code onto the actual page? Trace the path from your `.tsx` file to the DOM.

> The sandbox HTML loads [`main.tsx`](./sandbox/react-intro/main.tsx), which imports [`CaseStatus`](./sandbox/react-intro/CaseStatus.tsx) and mounts it with `createRoot()` into `#root`. Vite transforms the TSX; in the browser, React runs the component and creates the `<p>` in the DOM.

- [x] What decision did you make about how the vanilla and React versions coexist during migration, and why? What would go wrong with an opposite choice?

> The vanilla app stays at `/`; React runs separately at `/sandbox/react-intro/`. That lets us test React without disrupting existing views; replacing the main app now could remove working features before their React versions are ready.

---

## Demo 7 — Component hierarchy for the whole app

**Tasks**

- [x] Design and diagram a proposed component hierarchy for the **entire application**, not just the part you're building this exercise. E.g. pages (one per current view) and the reusable components you expect to extract (cards, badges, buttons, form controls, etc.), even though most of them won't be built until Exercises 4 and 5.

> ```text
> App
> ├─ LoadingOverlay
> ├─ AppHeader
> │  ├─ Brand
> │  └─ MainNavigation
> ├─ SharedComponents
> │  ├─ StatusBadge
> │  ├─ RelevanceBadge
> │  ├─ BookmarkButton
> │  ├─ EvidenceMeta (EvidenceCard, EvidenceDetail, EvidenceModal)
> │  └─ TagList (EvidenceCard, EvidenceDetail)
> ├─ ViewRouter
> │  ├─ DashboardPage
> │  │  ├─ CaseSummary, StatGrid, ReviewProgress
> │  │  └─ RecentEvidenceList (uses StatusBadge), RecentTimelineList
> │  ├─ EvidencePage
> │  │  ├─ EvidenceFilters, EvidenceList
> │  │  ├─ EvidenceCard (uses shared badges, BookmarkButton, EvidenceMeta, TagList)
> │  │  └─ EvidenceDetail ─ EvidenceDetailField, NoteEditor (uses EvidenceMeta, TagList)
> │  ├─ PeopleLocationsPage
> │  │  ├─ PeopleTabs ─ PersonCard
> │  │  └─ LocationCard
> │  ├─ TimelinePage ─ TimelineFilters, TimelineEventCard, EvidenceModal
> │  └─ WorkspacePage ─ BookmarkList, NotesList, HypothesisForm
> └─ AppFooter
> ```

- [x] For at least 5 components in your diagram, briefly note what data/props each one would need and where that data comes from.

> - `CaseSummary`: case title, status, summary from `case.json` / `state.caseData`.
> - `StatGrid`: evidence, people, location and bookmark counts derived from app state.
> - `EvidenceCard`: an `Evidence` item and bookmark action from `state.allEvidence` and `state.bookmarks`.
> - `EvidenceMeta`: evidence ID, type and timestamp from an `Evidence` item; formats the timestamp for cards, details and the timeline quick-view modal.
> - `TagList`: tags from an `Evidence` item, used by its card and detail view.
> - `EvidenceDetailField`: a label and content for one labeled row in the evidence detail view.
> - `PersonCard`: a `Person` and related-evidence count from `people.json` and evidence state.
> - `LocationCard`: a `Location` from `locations.json`.
> - `TimelineEventCard`: a `TimelineEvent` plus related location/evidence data from timeline, location and evidence state.
> - `HypothesisForm`: people, evidence options and saved draft from app state and `localStorage`.

**Questions** (depend on the tasks above)

- [x] What criteria did you use to decide something should be its own component versus staying inline inside a bigger one?

> I’d extract UI that repeats, has its own behavior/data, or can change independently. One-off simple markup can stay inline.

- [x] Pick one component in your diagram that appears in more than one place in the app. What made you extract it instead of duplicating its markup, and how does that compare to how the original vanilla app handled (or didn't handle) that same duplication?

> `StatusBadge` is used in dashboard evidence rows and evidence cards. The vanilla app reused a helper for the CSS class, but built the badge markup in each renderer; a component would centralize both markup and presentation.

- [x] Your diagram includes components you won't build until later exercises. Why is it useful to design the whole hierarchy now rather than only diagramming what you're about to build?

> Planning the whole hierarchy shows how the views and shared components fit together, helping keep data flow and UI consistent as later views are migrated.

---

## Demo 8 — Architecture Decision Record: why SPA/React

**Tasks**

- [x] Argue whether an SPA built with React is actually the right architecture for _this specific app_, given what it does.

> **Decision:** An SPA is a reasonable fit because investigators repeatedly filter, inspect, bookmark, and cross-link case data across five views. React can make these interactive views and shared UI easier to organize, though it is not essential for an app of this size and using a "heavy" framework for this kind of application might be overkill. But it all depends on how this app is expected to expand in the future, already migrating to React during it's "small" phase could help in structuring and improving a future, larger and more complex, application.

- [x] Include honest trade-offs or downsides of the SPA/React choice for this app, not just the benefits.

> React adds JavaScript download/runtime cost, build and dependency complexity, and a learning/migration burden. The app also relies on JavaScript to show case data, so first load and no-JavaScript access are weaker than with server-rendered pages. For this small project, React could be more tooling than the current feature set strictly needs (slightly overengineered).

**Questions** (depend on the tasks above)

- [x] What would you lose by keeping this app as server-rendered vanilla HTML/JS instead? What would you lose by choosing React specifically over a _different_ SPA approach (e.g. vanilla JS with a router, or a lighter library)?

> Server-rendered vanilla pages would make each navigation simpler but usually reload the document. React provides reusable components and state-driven updates; compared with a lighter SPA, it costs more JavaScript and tooling in exchange for that structure.

- [x] If this app needed to support users on very low-end devices or poor connections as a hard requirement, would you stick with SPA or change the architecture? Why or why not?

> I’d favor server-rendered or hybrid pages: deliver useful case content as HTML first and keep JavaScript small. That reduces the work and waiting before content appears and makes it easier for low-end devices to access the content as the burden wouldn't be so much on the client.

---

## Demo 9 — Migrate the application shell

**Tasks**

- [ ] Build the header/branding, the navigation bar, and a routing skeleton (even a minimal one, a full router library is not required yet) in React + TypeScript.
- [ ] Wire it up so navigating between (stub) pages actually changes what's rendered, mirroring the current five views even though only the Dashboard will have real content this exercise.

**Questions** (depend on the tasks above)

- [ ] How does "the current view" get tracked in your React shell? Compare this directly to how `currentPage` and `handleHashChange()` did it in the vanilla version? What's actually
      different, and what's superficially different but conceptually the same?
- [ ] What happens in your shell if a user navigates to a view that doesn't exist? How does that compare to the vanilla app's fallback-to-dashboard behavior?

---

## Demo 10 — Migrate the Dashboard view

**Tasks**

- [ ] Rebuild the Dashboard view as React components (using your hierarchy from Demo 7 as a starting point), rendering the case summary, stat cards, review progress, and the recent
      evidence/timeline lists. Reading from the same data your app already loads.
- [ ] Confirm it renders correctly with real data, and that navigating away and back doesn't lose or corrupt anything.

**Questions** (depend on the tasks above)

- [ ] Where does the Dashboard's data (case info, evidence, timeline) come from in your React version, and how does it get to the components that render it? Is this the final architecture you intend to keep, or a placeholder you know you'll change in a later exercise?
- [ ] The old vanilla dashboard had a real bug where it could show stale numbers because it only re-rendered on a view's _first_ visit (a manual render-cache flag). Does your React version have an equivalent risk? Why or why not, given how React re-renders?
- [ ] What, if anything, does your React Dashboard do differently from the vanilla one in terms of _when_ it recalculates derived values (like the review-progress percentage)?

---

## What to bring to class

For each of the 10 demos: your changed code/diagrams/documents (ideally as commits you can show live), and the ticked checkboxes above reflecting what you can genuinely demonstrate and answer _right now_.
