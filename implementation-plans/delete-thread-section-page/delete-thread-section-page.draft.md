# Delete a page from a thread section

**Type:** Standard user story · **Status:** Reviewed and Approved · **Created:** 2026-11-15

## Story

As a thread owner,
I want to delete a page I no longer need from a section,
so that the section only shows pages that are still relevant.

## Acceptance criteria

The examples below use a page named "Brainstorm".

### Page actions menu

- Given a selected section with at least one page, when the Pages column is displayed, then every page card shows an actions menu button.
- Given a page named "Brainstorm", when a screen reader reads the actions menu button of its card, then the button is announced as "Page actions for Brainstorm".
- Given a page card, when the user opens its actions menu, then the menu shows one item, "Delete", in red.
- Given a page with a name too long to fit on its card, when the card is displayed, then the name is truncated and does not overlap the actions menu button.

### Confirmation dialog

- Given the actions menu of "Brainstorm" is open, when the user selects "Delete", then a dialog opens with the title "Delete page?".
- Given the actions menu of "Brainstorm" is open, when the user selects "Delete", then the dialog body reads: "Brainstorm" will be permanently deleted. This can't be undone.
- Given the actions menu of "Brainstorm" is open, when the user selects "Delete", then the dialog shows a "Cancel" button and a red "Delete" button, with keyboard focus on "Cancel".
- Given the confirmation dialog is open and no deletion is in progress, when the user dismisses it with any of "Cancel", the dialog close button, a click outside the dialog, or Escape, then the dialog closes.
- Given the confirmation dialog for "Brainstorm" was dismissed, when the user looks at the page list, then "Brainstorm" is still there.

### Deleting the page

- Given the confirmation dialog is open for "Brainstorm", when the user clicks "Delete", then "Brainstorm" disappears from the page list without a page reload.
- Given a section with the pages "Brainstorm", "Outline", and "Draft", when the user deletes "Outline", then "Brainstorm" and "Draft" stay in the list in the same order.
- Given a section with two pages that have the same name, when the user deletes one of them, then the other one stays in the list.
- Given two sections, each with a page named "Brainstorm", when the user deletes the page in one section, then the page in the other section stays.
- Given "Brainstorm" was deleted and the thread page was reloaded, when the user selects the same section, then "Brainstorm" is not in the page list.
- Given "Brainstorm" is the only page in the section, when the user deletes it, then the Pages column shows the message "No pages yet."
- Given one page was deleted from a thread that had 3 pages, when the user opens the dashboard, then the thread card shows "2 pages".
- Given a page was deleted from a thread, when the user opens the dashboard, then the "last updated" value on the thread card reflects the time of the deletion.
- Given a page was deleted from a section, when the user looks at the Sections column, then the section is still there.

### Error handling and user feedback

**In progress**

- Given the user clicked "Delete" in the dialog, when the deletion is in progress, then the "Delete" button shows a loading indicator.
- Given the user clicked "Delete" in the dialog, when the deletion is in progress, then the "Cancel", "Delete", and dialog close buttons are disabled.
- Given the deletion is in progress, when the user presses Escape or clicks outside the dialog, then the dialog stays open.

**Success**

- Given the user clicked "Delete" in the dialog, when the deletion succeeds, then the dialog closes.
- Given the user clicked "Delete" in the dialog, when the deletion succeeds, then a success notification reads: Page "Brainstorm" deleted.

**Failure**

- Given the user clicked "Delete" in the dialog, when the deletion fails, then an error notification reads: Couldn't delete the page. Please try again.
- Given the deletion failed, when the error notification appears, then the dialog stays open with "Cancel" and "Delete" enabled, so the user can retry.
- Given the deletion failed, when the user closes the dialog, then "Brainstorm" is still in the page list.
- Given the deletion failed, when the user opens the dashboard, then the page count and "last updated" value on the thread card are unchanged.

**Page already deleted elsewhere (for example, in another browser tab)**

- Given "Brainstorm" was already deleted elsewhere, when the user clicks "Delete" in the dialog, then "Brainstorm" disappears from the page list.
- Given "Brainstorm" was already deleted elsewhere, when the user clicks "Delete" in the dialog, then the dialog closes.
- Given "Brainstorm" was already deleted elsewhere, when the user clicks "Delete" in the dialog, then a success notification reads: Page "Brainstorm" deleted.
- Given the user confirmed deleting a page that was already deleted elsewhere, when the user opens the dashboard, then the page count on the thread card does not drop a second time.
- Given the user confirmed deleting a page that was already deleted elsewhere, when the user opens the dashboard, then the "last updated" value on the thread card still reflects the earlier deletion.

## Notes / Links

- Research / data: the action button and the removal flow follow the existing section removal flow on the thread page: same actions menu pattern, confirmation dialog, in-progress state, and notifications.
