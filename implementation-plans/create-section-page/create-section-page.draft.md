# Create a page in a thread section

**Type:** Standard user story · **Status:** Reviewed and Approved · **Created:** 2026-11-10

## Story

As a Mind Threads user who has split a thread into sections,
I want to select a section and add chat pages to it,
so that I can break each topic into separate pages that will later hold my notes.

## Acceptance criteria

### Selecting a section

- Given a thread page has just loaded, when the user views the Sections column, then no section is selected.
- Given a thread page with sections, when the user clicks a section card, then that section becomes the selected section.
- Given a section is selected, when the user views its card, then the card's background is filled with the color chosen when the section was created.
- Given a section is selected, when the user views its card, then the section name and the actions menu button are readable on the section's color, for both light and dark section colors.
- Given a section is selected, when the user clicks another section card, then the clicked section becomes selected and the first section goes back to its unselected look.
- Given a section is selected, when the user clicks the same section card again, then the section stays selected.
- Given a section is selected, when the user opens the section's actions menu, then the selection does not change.
- Given a section is selected, when the user reloads the page, then no section is selected.
- Given a section is selected, when the user creates a new section, then the selected section does not change.
- Given a section is selected, when the user deletes that section, then no section is selected and the Pages column shows "Select a section to see its pages."
- Given a section is selected, when the user deletes a different section, then the selected section does not change.

### The Pages column

- Given no section is selected, when the user views the Pages column, then it shows "Select a section to see its pages."
- Given no section is selected, when the user views the Pages column, then no "Add page" button is shown.
- Given a section is selected, when the user views the Pages column, then an "Add page" button is visible next to the "Pages" heading.
- Given a selected section with no pages, when the user views the Pages column, then it shows "No pages yet."
- Given a selected section with pages, when the user views the Pages column, then it lists only that section's pages.
- Given a selected section with pages, when the user views the Pages column, then the pages appear in creation order, oldest first.
- Given a page list taller than the visible column, when the user scrolls within the column, then all pages can be reached.

### Opening the form

- Given a section is selected, when the user clicks "Add page", then an "Add new page" modal opens with a required name field, a "Page type" dropdown, a color picker, and Add and Cancel buttons.
- Given the "Add new page" modal opens, when the user views it, then the name field has keyboard focus.
- Given the "Add new page" modal has just opened, when the user views the form, then the name is empty, the page type is "Chat", and the color picker shows the same default color as the "Add new section" modal.
- Given the "Add new page" modal is open, when the user opens the color picker, then it offers the same colors as the "Add new section" modal.
- Given the "Add new page" modal is open, when the user opens the "Page type" dropdown, then "Chat" is the only option.
- Given the "Page type" dropdown is open, when the user views the "Chat" option, then a chat icon is shown to the left of the "Chat" label.
- Given the "Add new page" modal has unsaved input, when the user clicks Cancel, then the modal closes and no page is created.
- Given the user cancelled the modal after typing a name and choosing a color, when the user opens the modal again, then the form shows an empty name, the "Chat" type, and the default color.

### Name rules

- Given an empty name, when the user views the modal, then the Add button is disabled.
- Given a name that contains only spaces, when the user views the modal, then the Add button is disabled.
- Given the name "  Ideas  ", when the user clicks Add, then the page is saved with the name "Ideas".
- Given a valid name in the name field, when the user presses Enter, then the page is saved, the same as clicking Add.
- Given an empty name or a name with only spaces, when the user presses Enter, then no page is created and the modal stays open.
- Given a section that already has a page named "Ideas", when the user creates another page named "Ideas" in it, then both pages are kept.

### Creating a page

- Given a valid name, the "Chat" type, and a chosen color, when the user clicks Add, then the modal closes.
- Given a valid name, the "Chat" type, and a chosen color, when the user clicks Add, then the new page appears as the last card in the Pages list.
- Given a page was created, when the user views its card, then the card shows the page name and the page's chosen color as the card's left border.
- Given a page of the "Chat" type, when the user views its card, then a chat icon is shown to the left of the page name.
- Given a selected section with no pages, when the user creates the first page, then the "No pages yet." message is no longer shown.
- Given a page list taller than the visible column, when the user creates a page, then the new page's card is scrolled into view.
- Given a page card, when the user clicks it, then nothing happens and the Content column still shows "Select a page to see its content."
- Given a page card, when the user views it, then it has no actions menu.

### Long names

- Given a page name too long for one line, when the user views the card, then the name stays on one line and is cut off with an ellipsis.
- Given a page name that is cut off, when the user hovers over it, then a tooltip shows the full name.
- Given a page name that fits on one line, when the user hovers over it, then no tooltip is shown.

### Saved data and the dashboard

- Given a section with a new page, when the user reloads the page and selects that section, then the page is still listed with its name, chat icon, and color.
- Given two sections in a thread, when the user creates a page in one of them, then the page is not listed when the other section is selected.
- Given two threads, when the user creates a page in one of them, then the page is not listed in any section of the other thread.
- Given a thread that has just received its first page, when the user views its dashboard card, then the card shows "1 page".
- Given a thread with two pages, in the same section or in different sections, when the user views its dashboard card, then the card shows "2 pages".
- Given a thread, when the user creates a page, then the thread's "last updated" time on the dashboard changes to the moment of creation.
- Given a thread with 3 pages, 2 of them in section "Ideas", when the user deletes section "Ideas", then the thread's dashboard card shows "1 page".
- Given a section with pages was deleted, when the user creates a new section with the same name, then the new section has no pages.
- Given a thread with pages, when the user deletes the thread, then its pages are deleted with it.

### Error handling and user feedback

- Given a page named "Ideas" is being saved, when the save completes, then a success notification says `Page "Ideas" created.`
- Given the save fails, when the failure occurs, then an error notification says "Couldn't save the page. Please try again."
- Given the save fails, when the error notification appears, then the modal stays open with the entered name, page type, and color, and the user can click Add again.
- Given a save is in progress, when the user views the modal, then the Add button shows a loading state.
- Given a save is in progress, when the user views the modal, then the name field, the "Page type" dropdown, and the color picker are disabled.
- Given a save is in progress, when the user presses Enter, then no second page is created.
- Given a save is in progress, when the user presses Esc, clicks outside the modal, clicks the × button, or clicks Cancel, then the modal stays open.
- Given the section was deleted in another browser tab while the modal was open, when the user clicks Add, then the error notification "Couldn't save the page. Please try again." appears and the modal stays open.
- Given the thread was deleted in another browser tab while the modal was open, when the user clicks Add, then the error notification "Couldn't save the page. Please try again." appears and the modal stays open.

## Notes / Links

- Research / data: product owner notes. Adding a page should work almost the same as adding a section. More page types will be supported later, and "Chat" is the only type for now.
- Dependencies: builds on the shipped stories "Create a section in a thread" and "Delete a section from a thread". The existing delete-section dialog already warns that the section's pages will be deleted, so its text does not change.
