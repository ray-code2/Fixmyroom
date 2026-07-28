# Project Multi-Agent Orchestration Guide

When receiving user requests, delegate tasks according to directory boundaries:

| Task Area | Designated Subagent | Primary Directory |
| :--- | :--- | :--- |
| Server API, Controllers, Middleware | `@backend-expert` | `backend/` |
| Web App UI, State, Routing | `@frontend-expert` | `frontend/` |
| Marketing Site, SEO, Animations | `@landing-page-expert` | `landing-page/` |
| DB Schemas, Migrations, SQL | `@database-expert` | `backend/` |
| ER Diagrams, Charts, Visualization | `@database-visualization-expert` | Documentation / UI |
| Code Audit, Security, QA | `@code-reviewer-expert` | Entire Project |

### Workflow Pipeline Example
1. Feature request involving DB & API: Call `@database-expert` -> `@backend-expert`.
2. Frontend integration: Call `@frontend-expert`.
3. Quality Check: Call `@code-reviewer-expert` to audit before finalizing changes.