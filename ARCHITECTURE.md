# React Sandbox Structure

```text
sandbox/react-intro/
  app/                    Application shell, routing, and shared data types
  features/
    dashboard/            Dashboard view and its presentation components
    people-locations/     People and Locations view and cards
    timeline/             Timeline view and event cards
  shared/                 Helpers and UI used by multiple features
  main.tsx                React entry point
```

Files belong to a feature when they serve only that view. Put code in `shared/`
when it is genuinely used by more than one feature; for example, `formatDate`
is shared by Dashboard and Timeline. The shell and cross-feature data types live
in `app/` because they connect the views.
