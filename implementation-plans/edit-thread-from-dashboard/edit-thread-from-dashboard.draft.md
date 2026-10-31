# Edit a thread from the dashboard

**Type:** Standard user story · **Status:** Reviewed and Approved · **Created:** 2026-10-20

## Story

As a Mind Threads user,
I want to edit a thread's name and color from my dashboard,
so that my threads stay accurately named and visually grouped as my topics change.

## Acceptance criteria

### Thread actions menu

- Given the dashboard shows threads in grid view, when a thread card is shown, then a three-dots "Thread actions" button is shown in the card's top-right corner.
- Given the dashboard shows threads in list view, when a thread card is shown, then a three-dots "Thread actions" button is shown in the card's top-right corner.
- Given the "Delete a thread from the dashboard" story has not shipped, when the user clicks a card's three-dots button, then an actions menu opens with exactly one item: "Edit".
- Given the "Delete a thread from the dashboard" story has shipped, when the user clicks a card's three-dots button, then an actions menu opens with exactly two items, in this order: "Edit", "Delete".
- Given a thread card is shown, when the user clicks its three-dots button, then the thread is not opened.
- Given the actions menu is open, when the user clicks "Edit", then the thread is not opened.
- Given the actions menu is open, when the user clicks "Edit", then the actions menu closes.
- Given the actions menu is open for the thread "Testing Strategy", when the user clicks "Edit", then the edit modal opens for "Testing Strategy".
- Given the actions menu is open, when the user presses Esc, then the actions menu closes.
- Given the actions menu is open, when the user clicks anywhere outside the menu, then the actions menu closes.
- Given the three-dots button of a card has keyboard focus, when the user presses Enter or Space, then the actions menu opens.
- Given the actions menu was opened with the keyboard, when the user presses the Down or Up arrow key, then focus moves between the menu items.
- Given a screen reader user moves focus to the three-dots button on the card for "Testing Strategy", when the button is announced, then its label is "Thread actions for Testing Strategy".

### Edit modal

- Given the user chose "Edit" for a thread, when the edit modal opens, then its title is "Edit thread".
- Given the user chose "Edit" for a thread, when the edit modal opens, then it shows the same "Thread name" and "Color" fields as the "Add new thread" modal.
- Given the user chose "Edit" for the thread "Testing Strategy", when the edit modal opens, then the "Thread name" field contains "Testing Strategy".
- Given the user chose "Edit" for a thread, when the edit modal opens, then the "Color" field shows the thread's current color.
- Given the user chose "Edit" for a thread, when the edit modal opens, then it shows two buttons: "Cancel" (outline style) and "Save" (accent style).
- Given the edit modal has just opened and nothing has changed, when the user looks at the "Save" button, then it is disabled.
- Given the user changed the name or the color, when the values differ from the saved thread, then the "Save" button is enabled.
- Given the user changed the name and then changed it back to the saved name, when the color is also unchanged, then the "Save" button is disabled.
- Given the edit modal is open, when the user clears the "Thread name" field, then the "Save" button is disabled.
- Given the edit modal is open, when the "Thread name" field contains only spaces, then the "Save" button is disabled.

### Closing without saving

- Given the edit modal is open and no save is in progress, when the user clicks "Cancel", then the modal closes.
- Given the edit modal is open and no save is in progress, when the user presses Esc, then the modal closes.
- Given the edit modal is open and no save is in progress, when the user clicks the × button, then the modal closes.
- Given the edit modal is open and no save is in progress, when the user clicks outside the modal, then the modal closes.
- Given the user changed the name or the color, when the user closes the modal without clicking "Save", then no "Discard changes?" prompt is shown.
- Given the user closed the edit modal without clicking "Save", when the dashboard is shown, then the thread's card shows its previous name and color.
- Given the user closed the edit modal with unsaved changes, when the user opens "Edit" for the same thread again, then the modal shows the thread's saved name and color.

### Saving changes

- Given the user renamed "Testing Strategy" to "QA Strategy", when the user clicks "Save" and the save succeeds, then the modal closes.
- Given the user renamed "Testing Strategy" to "QA Strategy", when the save succeeds, then the thread's card shows the name "QA Strategy".
- Given the user changed the thread's color, when the save succeeds, then the thread's card shows the new color.
- Given the user entered "  QA Strategy  " with spaces at the start and end, when the save succeeds, then the thread's card shows "QA Strategy" without those spaces.
- Given the user has three threads and edits the second one, when the save succeeds, then the edited thread is still shown in second position.
- Given a thread was edited, when the save succeeds, then the card's "Updated" date shows the time of the edit.
- Given a thread was edited, when the save succeeds, then the card's section and page counts are unchanged.
- Given a thread was edited, when the user reloads the page, then the card still shows the new name and color.

### Error handling and user feedback

- Given the user renamed a thread to "QA Strategy", when the save succeeds, then a success notification shows `Thread "QA Strategy" updated.`
- Given the user clicks "Save", when the save is in progress, then the "Save" button shows a loading indicator.
- Given the user clicks "Save", when the save is in progress, then the "Cancel" and "Save" buttons are disabled.
- Given the user clicks "Save", when the save is in progress, then the "Thread name" and "Color" fields are disabled.
- Given a save is in progress, when the user looks at the modal, then the × button is disabled.
- Given a save is in progress, when the user presses Esc, then the modal stays open.
- Given a save is in progress, when the user clicks outside the modal, then the modal stays open.
- Given the user clicks "Save", when the save fails, then the modal stays open.
- Given the user clicks "Save", when the save fails, then the modal still shows the name and color the user entered.
- Given the user clicks "Save", when the save fails, then the thread's card still shows its previous name and color.
- Given the user clicks "Save", when the save fails, then an error notification shows "Couldn't save the thread. Please try again."
- Given a save failed, when the error notification is shown, then the "Cancel" and "Save" buttons and the form fields are enabled again.
- Given a save failed and the modal is still open, when the user clicks "Save" again and the save succeeds, then the thread's card shows the new name and color.

## Notes / Links

- Designs: no dedicated designs. Reuse the app's existing thread card, the "Add new thread" modal and form, and the notification styles.
- Dependencies: no blocking dependencies. This story and "Delete a thread from the dashboard" share the card's three-dots actions menu, and either can ship first. The story that ships first builds the menu. The other adds its item.
