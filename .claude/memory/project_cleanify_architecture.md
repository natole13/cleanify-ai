---
name: cleanify-architecture
description: Architecture and routing of Cleanify.ai SaaS project — what lives where
metadata:
  type: project
---

React/Vite SaaS for batch image watermark removal.

**Routes** (src/main.tsx):
- `/` → Landing page (src/pages/Landing.tsx)
- `/studio` → Full workspace (src/App.tsx) — Fabric.js canvas + sidebar
- `/dashboard` → Dashboard (src/pages/Dashboard.tsx)
- `/batch` → Batch processor (src/pages/BatchProcessor.tsx)
- `/billing` → Billing (src/pages/Billing.tsx)

**Key components**:
- `src/components/Header.tsx` — Sticky header with 2 mega-dropdowns (Image Tools, Video Tools) + coral CTA
- `src/components/FabricCanvas.tsx` — Fabric.js canvas, drag/drop main image + watermark PNG overlay
- `src/components/Sidebar.tsx` — AI ops toggles, resize 2048×2048, media upload, Export JSON
- `src/components/layout/DashboardLayout.tsx` — Used by Dashboard and BatchProcessor

**Tech stack**: React 19, Vite 8, Tailwind v4, Radix UI, fabric 7, lucide-react, react-router-dom v7

**Why:** The studio workspace (App.tsx) was not routed before this session — added /studio route.

**How to apply:** When adding new routes, follow existing pattern in main.tsx. Header.tsx is only for /studio workspace, Landing.tsx has its own Navbar component.
