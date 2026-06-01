# Worklog — Task 1: Smart/Dumb Refactoring of Time Tracker

## Summary
Refactored the time tracker app using the smart/dumb component pattern. All behavior is preserved — this is a pure structural refactoring.

## Changes Made

### New Files Created
1. **`src/hooks/use-time-tracker.ts`** — Extracted ALL page state/handlers from `page.tsx` into a custom hook. Contains: `mounted`, `currentMonth`, `selectedDate`, `entriesByDate`, modal state, delete dialog state, all computed values, and all handler functions.

2. **`src/lib/time-tracker/types.ts`** — Added `TimeEntryWithDate` type (moved from `TaskPanel.tsx`).

3. **`src/lib/time-tracker/time-parser.ts`** — Added `formatTotal` helper function (extracted from `page.tsx`).

4. **`src/components/time-tracker/CalendarGrid/CalendarGrid.tsx`** — Dumb view, receives all data via props, renders calendar grid structure.

5. **`src/components/time-tracker/CalendarGrid/CalendarGrid.module.css`** — Only grid-level styles (root, header, headerTitleGroup, headerTitle, weekdayRow, weekdayCell, dayGrid).

6. **`src/components/time-tracker/CalendarGrid/DayCell.tsx`** — Dumb sub-view extracted from CalendarGrid. Pure presentational day cell.

7. **`src/components/time-tracker/CalendarGrid/DayCell.module.css`** — All day cell styles extracted from CalendarGrid.module.css (dayCell, dayNum, timeSummary, dotsRow, plusBtn, etc.).

8. **`src/components/time-tracker/TaskPanel/TaskPanel.tsx`** — Dumb view, renders panel with header and task list.

9. **`src/components/time-tracker/TaskPanel/TaskPanel.module.css`** — Only panel-level styles (emptyCard, card, cardHeader, metaRow, emptyEntries, taskList).

10. **`src/components/time-tracker/TaskPanel/TaskItem.tsx`** — Dumb sub-view extracted from TaskPanel.

11. **`src/components/time-tracker/TaskPanel/TaskItem.module.css`** — All task item styles extracted from TaskPanel.module.css (taskItem, typeDot, taskContent, taskActions, etc.).

12. **`src/components/time-tracker/TaskModal/use-task-form.ts`** — Smart hook: form state + validation + derived values (timePreview, periodPreview).

13. **`src/components/time-tracker/TaskModal/TaskModal.tsx`** — Dumb view using useTaskForm hook internally.

14. **`src/components/time-tracker/TaskModal/TaskModal.module.css`** — Copy of existing styles.

15. **`src/components/time-tracker/ImportExportBar/use-import-export.ts`** — Smart hook: import/export/clear logic + toasts.

16. **`src/components/time-tracker/ImportExportBar/ImportExportBar.tsx`** — Dumb view using useImportExport hook internally.

17. **`src/components/time-tracker/ImportExportBar/ImportExportBar.module.css`** — Copy of existing styles.

18. **`src/components/time-tracker/DeleteConfirmDialog/DeleteConfirmDialog.tsx`** — Copy (already simple dumb component).

19. **`src/components/time-tracker/DeleteConfirmDialog/DeleteConfirmDialog.module.css`** — Copy of existing styles.

20. **`src/components/time-tracker/AppHeader/AppHeader.tsx`** — Dumb view extracted from page.tsx header section. Receives `mounted`, `monthTotalMinutes`, `onDataChanged`.

21. **`src/components/time-tracker/AppHeader/AppHeader.module.css`** — Header styles from page.module.css.

22. **`src/components/time-tracker/AppFooter/AppFooter.tsx`** — Dumb view extracted from page.tsx footer section. Receives `selectedDate`, `selectedDateEntries`, `selectedDateTotalMinutes`.

23. **`src/components/time-tracker/AppFooter/AppFooter.module.css`** — Footer styles from page.module.css.

### Modified Files
- **`src/app/page.tsx`** — Now a thin smart wrapper: uses `useTimeTracker()` hook and renders layout with AppHeader, CalendarGrid, TaskPanel, AppFooter, TaskModal, DeleteConfirmDialog.
- **`src/app/page.module.css`** — Only layout styles (container, main, grid, calendarCol, taskCol).
- **`src/lib/time-tracker/types.ts`** — Added `TimeEntryWithDate` type export.
- **`src/lib/time-tracker/time-parser.ts`** — Added `formatTotal` function.

### Deleted Files (old flat files)
- `src/components/time-tracker/CalendarGrid.tsx`
- `src/components/time-tracker/CalendarGrid.module.css`
- `src/components/time-tracker/TaskPanel.tsx`
- `src/components/time-tracker/TaskPanel.module.css`
- `src/components/time-tracker/TaskModal.tsx`
- `src/components/time-tracker/TaskModal.module.css`
- `src/components/time-tracker/ImportExportBar.tsx`
- `src/components/time-tracker/ImportExportBar.module.css`
- `src/components/time-tracker/DeleteConfirmDialog.tsx`
- `src/components/time-tracker/DeleteConfirmDialog.module.css`

## Verification
- App compiles and serves successfully (GET / 200 responses)
- Lint passes (only pre-existing error in use-mobile.ts, not related to this refactoring)
- All `key={modalKey}` patterns preserved
- All `"use client"` directives preserved
- `mounted` flag pattern preserved for hydration safety
- All import paths updated and correct
