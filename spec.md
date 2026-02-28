# Specification

## Summary
**Goal:** Add inline template name editing and delete-with-confirmation functionality to both the on-chain (TemplateLibraryPage) and local (LocalTemplatesPage) template lists.

**Planned changes:**
- Add `updateWorkoutTemplateName(id, newName)` backend function with ownership validation
- Add `deleteWorkoutTemplate(id)` backend function with ownership validation
- Create `useUpdateWorkoutTemplateName` mutation hook that invalidates the templates query on success
- Create `useDeleteWorkoutTemplate` mutation hook that invalidates the templates query on success
- In TemplateLibraryPage, make each template name clickable to enter inline edit mode (Enter/blur saves, Escape cancels) with loading indicator and success/error toasts
- In TemplateLibraryPage, add a Delete button per template that opens a confirmation dialog before deleting, with success/error toasts
- In LocalTemplatesPage, make each template name clickable to enter inline edit mode (Enter/blur saves, Escape cancels) using the local templates update mutation
- In LocalTemplatesPage, add a Delete button per template that opens a confirmation dialog before removing from localStorage

**User-visible outcome:** Users can click a template name to rename it in place, and delete any template after confirming in a dialog — both for on-chain and locally stored templates.
