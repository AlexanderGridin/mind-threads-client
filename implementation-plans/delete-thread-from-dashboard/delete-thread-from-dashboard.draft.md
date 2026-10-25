# Delete a thread from the dashboard

**Type:** Standard user story · **Status:** Reviewed and Approved · **Created:** 2026-10-20

## Story

As a Mind Threads user,
I want to delete a thread from my dashboard,
so that my thread list only shows threads I still use and stays easy to scan.

## Acceptance criteria

### Thread actions menu

- Given the dashboard shows threads in grid view, when a thread card is shown, then a three-dots "Thread actions" button is shown in the card's top-right corner.
- Given the dashboard shows threads in list view, when a thread card is shown, then a three-dots "Thread actions" button is shown in the card's top-right corner.
- Given the "Edit a thread from the dashboard" story has not shipped, when the user clicks a card's three-dots button, then an actions menu opens with exactly one item: "Delete".
- Given the "Edit a thread from the dashboard" story has shipped, when the user clicks a card's three-dots button, then an actions menu opens with exactly two items, in this order: "Edit", "Delete".
- Given a thread card is shown, when the user clicks its three-dots button, then the thread is not opened.
- Given the actions menu is open, when the user clicks "Delete", then the thread is not opened.
- Given the actions menu is open, when the user clicks "Delete", then the actions menu closes.
- Given the actions menu is open for the thread "Testing Strategy", when the user clicks "Delete", then the delete confirmation modal opens for "Testing Strategy".
- Given the actions menu is open, when the user presses Esc, then the actions menu closes.
- Given the actions menu is open, when the user clicks anywhere outside the menu, then the actions menu closes.
- Given the three-dots button of a card has keyboard focus, when the user presses Enter or Space, then the actions menu opens.
- Given the actions menu was opened with the keyboard, when the user presses the Down or Up arrow key, then focus moves between the menu items.
- Given a screen reader user moves focus to the three-dots button on the card for "Testing Strategy", when the button is announced, then its label is "Thread actions for Testing Strategy".

### Delete confirmation modal

- Given the user chose "Delete" for a thread, when the confirmation modal opens, then its title is "Delete thread?".
- Given the user chose "Delete" for the thread "Testing Strategy", when the confirmation modal opens, then its text is `"Testing Strategy" and all its sections and pages will be permanently deleted. This can't be undone.`
- Given the user chose "Delete" for a thread, when the confirmation modal opens, then it shows two buttons: "Cancel" (outline style) and "Delete" (red, destructive style).
- Given the user chose "Delete" for a thread, when the confirmation modal opens, then the "Cancel" button has keyboard focus.
- Given the confirmation modal is open, when the user clicks "Cancel", then the modal closes.
- Given the confirmation modal is open and no deletion is in progress, when the user presses Esc, then the modal closes.
- Given the confirmation modal is open and no deletion is in progress, when the user clicks the × button, then the modal closes.
- Given the confirmation modal is open and no deletion is in progress, when the user clicks outside the modal, then the modal closes.
- Given the user closed the confirmation modal without clicking "Delete", when the dashboard is shown, then the thread is still in the list.

### Deleting a thread

- Given the confirmation modal is open for a thread, when the user clicks "Delete" and the deletion succeeds, then the modal closes.
- Given the confirmation modal is open for a thread, when the user clicks "Delete" and the deletion succeeds, then the thread's card is no longer shown on the dashboard.
- Given the user has three threads and deletes the second one, when the deletion succeeds, then the other two threads are still shown in their previous order.
- Given a thread was deleted, when the user reloads the page, then the deleted thread is still not shown.
- Given the user has exactly one thread, when the user deletes it and the deletion succeeds, then the dashboard shows the empty state "No threads yet. Create your first thread to get started."

### Error handling and user feedback

- Given the user clicks "Delete" in the confirmation modal, when the deletion succeeds, then a success notification shows `Thread "<thread name>" deleted.`, with the thread's actual name in place of `<thread name>`.
- Given the user clicks "Delete" in the confirmation modal, when the deletion is in progress, then the "Delete" button shows a loading indicator.
- Given the user clicks "Delete" in the confirmation modal, when the deletion is in progress, then the "Cancel" and "Delete" buttons are disabled.
- Given a deletion is in progress, when the user presses Esc, then the modal stays open.
- Given a deletion is in progress, when the user clicks outside the modal, then the modal stays open.
- Given a deletion is in progress, when the user looks at the modal, then the × button is disabled.
- Given the user clicks "Delete" in the confirmation modal, when the deletion fails, then the modal stays open.
- Given the user clicks "Delete" in the confirmation modal, when the deletion fails, then the thread is still shown on the dashboard.
- Given the user clicks "Delete" in the confirmation modal, when the deletion fails, then an error notification shows "Couldn't delete the thread. Please try again."
- Given a deletion failed, when the error notification is shown, then the "Cancel" and "Delete" buttons in the modal are enabled again.
- Given a deletion failed and the modal is still open, when the user clicks "Delete" again and the deletion succeeds, then the thread's card is no longer shown on the dashboard.

## Notes / Links

- Designs: no dedicated designs. Reuse the app's existing thread card, modal, and notification styles. The destructive "Delete" button uses the red color from the app's Nord palette.
- Dependencies: no blocking dependencies. This story and "Edit a thread from the dashboard" share the card's three-dots actions menu, and either can ship first. The story that ships first builds the menu. The other adds its item.
