# Create a section in a thread

**Type:** Standard user story · **Status:** Reviewed and Approved · **Created:** 2026-11-07

## Story

As a Mind Threads user,
I want to create named sections inside a thread,
so that I can split the thread into topics that will later hold its pages.

## Acceptance criteria

### Opening the form

- Given a thread page that has loaded a thread, with or without sections, when the user views the Sections column, then an "Add section" button is visible next to the "Sections" heading.
- Given a thread page that shows the "not found" or the load error message, when the user views the page, then no "Add section" button is shown.
- Given a thread page, when the user clicks "Add section", then an "Add new section" modal opens with a required name field, a color picker, and Add and Cancel buttons.
- Given a thread page, when the "Add new section" modal opens, then the name field has keyboard focus.
- Given the "Add new section" modal has just opened, when the user views the form, then the name is empty and the color picker offers the same colors and the same default color as the "Add new thread" modal.
- Given the "Add new section" modal has unsaved input, when the user clicks Cancel, then the modal closes and no section is created.
- Given the user cancelled the modal after typing a name, when the user opens the modal again, then the form shows the empty name and the default color.

### Name rules

- Given an empty name, when the user views the modal, then the Add button is disabled.
- Given a name that contains only spaces, when the user views the modal, then the Add button is disabled.
- Given the name "  Ideas  ", when the user clicks Add, then the section is saved with the name "Ideas".
- Given a valid name in the name field, when the user presses Enter, then the section is saved, the same as clicking Add.
- Given an empty name or a name with only spaces, when the user presses Enter, then no section is created and the modal stays open.
- Given a save is in progress, when the user presses Enter, then no second section is created.
- Given a thread that already has a section named "Ideas", when the user creates another section named "Ideas", then both sections are kept.

### Creating a section

- Given a valid name and a chosen color, when the user clicks Add, then the modal closes.
- Given a valid name and a chosen color, when the user clicks Add, then the new section appears as the last card in the Sections list, with its name and its chosen color as the card's left border.
- Given a thread with no sections, when the user creates the first section, then the "No sections yet." message is no longer shown.
- Given a thread with sections, when the user views the Sections list, then the sections appear in creation order, oldest first.
- Given a Sections list taller than the visible column, when the user scrolls within the column, then all sections can be reached.
- Given a Sections list taller than the visible column, when the user creates a section, then the new section's card is scrolled into view.
- Given a section was just created, when the user views the Pages column, then the column still shows "Select a section to see its pages."
- Given a section card, when the user clicks it, then nothing happens, because selecting a section is left to a follow-up story.

### Long names

- Given a section name too long for one line, when the user views the card, then the name stays on one line and is cut off with an ellipsis.
- Given a name that is cut off, when the user hovers over it, then a tooltip shows the full name.
- Given a name that fits on one line, when the user hovers over it, then no tooltip is shown.

### Saved data and the dashboard

- Given a thread with a new section, when the user reloads the page, then the section is still listed with its name and color.
- Given two threads, when the user creates a section in one of them, then the section is not listed in the other.
- Given a thread that has just received its first section, when the user views its dashboard card, then the card shows "1 section".
- Given a thread with two sections, when the user views its dashboard card, then the card shows "2 sections".
- Given a thread, when the user creates a section, then the thread's "last updated" time on the dashboard changes to the moment of creation.
- Given a thread with sections, when the user deletes the thread, then its sections are deleted with it.

### Error handling and user feedback

- Given a section named "Ideas" is being saved, when the save completes, then a success notification says `Section "Ideas" created.`
- Given the save fails, when the failure occurs, then an error notification says "Couldn't save the section. Please try again."
- Given the save fails, when the error notification appears, then the modal stays open with the entered name and color, and the user can click Add again.
- Given a save is in progress, when the user views the modal, then the Add button shows a loading state.
- Given a save is in progress, when the user presses Esc, clicks outside the modal, clicks the × button, or clicks Cancel, then the modal stays open.
- Given the thread was deleted in another browser tab while the modal was open, when the user clicks Add, then the same error notification appears and the modal stays open.
