# Delete a section from a thread

**Type:** Standard user story · **Status:** Reviewed and Approved · **Created:** 2026-11-08

## Story

As someone organizing my notes in a thread,
I want to delete a section I no longer need,
so that the thread only shows sections that are still relevant.

## Acceptance criteria

The examples below use a section named "Research".

### Section actions menu

- Given a thread page with at least one section, when the page is displayed, then every section card shows an actions menu button.
- Given a section named "Research", when a screen reader reads the actions menu button of its card, then the button is announced as "Section actions for Research".
- Given a section card, when the user opens its actions menu, then the menu shows one item, "Delete", in red.
- Given a section with a name too long to fit on its card, when the card is displayed, then the name is truncated and does not overlap the actions menu button.

### Confirmation dialog

- Given the actions menu of "Research" is open, when the user selects "Delete", then a dialog opens with the title "Delete section?".
- Given the actions menu of "Research" is open, when the user selects "Delete", then the dialog body reads: "Research" and all its pages will be permanently deleted. This can't be undone.
- Given the actions menu of "Research" is open, when the user selects "Delete", then the dialog shows a "Cancel" button and a red "Delete" button, with keyboard focus on "Cancel".
- Given the confirmation dialog is open and no deletion is in progress, when the user dismisses it with any of "Cancel", the dialog close button, a click outside the dialog, or Escape, then the dialog closes.
- Given the confirmation dialog for "Research" was dismissed, when the user looks at the section list, then "Research" is still there.

### Deleting the section

- Given the confirmation dialog is open for "Research", when the user clicks "Delete", then "Research" disappears from the section list without a page reload.
- Given a thread with the sections "Research", "Ideas", and "Archive", when the user deletes "Ideas", then "Research" and "Archive" stay in the list in the same order.
- Given a thread with two sections that have the same name, when the user deletes one of them, then the other one stays in the list.
- Given "Research" was deleted, when the user reloads the thread page, then "Research" is not in the section list.
- Given "Research" is the only section in the thread, when the user deletes it, then the Sections column shows the message "No sections yet."
- Given one section was deleted from a thread that had 3 sections, when the user opens the dashboard, then the thread card shows "2 sections".
- Given a section was deleted from a thread, when the user opens the dashboard, then the "last updated" value on the thread card reflects the time of the deletion.

### Error handling and user feedback

**In progress**

- Given the user clicked "Delete" in the dialog, when the deletion is in progress, then the "Delete" button shows a loading indicator.
- Given the user clicked "Delete" in the dialog, when the deletion is in progress, then the "Cancel", "Delete", and dialog close buttons are disabled.
- Given the deletion is in progress, when the user presses Escape or clicks outside the dialog, then the dialog stays open.

**Success**

- Given the user clicked "Delete" in the dialog, when the deletion succeeds, then the dialog closes.
- Given the user clicked "Delete" in the dialog, when the deletion succeeds, then a success notification reads: Section "Research" deleted.

**Failure**

- Given the user clicked "Delete" in the dialog, when the deletion fails, then an error notification reads: Couldn't delete the section. Please try again.
- Given the deletion failed, when the error notification appears, then the dialog stays open with "Cancel" and "Delete" enabled, so the user can retry.
- Given the deletion failed, when the user closes the dialog, then "Research" is still in the section list.
- Given the deletion failed, when the user opens the dashboard, then the section count and "last updated" value on the thread card are unchanged.

**Section already deleted elsewhere (for example, in another browser tab)**

- Given "Research" was already deleted elsewhere, when the user clicks "Delete" in the dialog, then "Research" disappears from the section list.
- Given "Research" was already deleted elsewhere, when the user clicks "Delete" in the dialog, then the dialog closes.
- Given "Research" was already deleted elsewhere, when the user clicks "Delete" in the dialog, then a success notification reads: Section "Research" deleted.
- Given the user confirmed deleting a section that was already deleted elsewhere, when the user opens the dashboard, then the section count on the thread card does not drop a second time.
- Given the user confirmed deleting a section that was already deleted elsewhere, when the user opens the dashboard, then the "last updated" value on the thread card still reflects the earlier deletion.

## Notes / Links

- Research / data: the action button and the removal flow follow the existing thread removal flow on the dashboard: same actions menu pattern, confirmation dialog, in-progress state, and notifications.
