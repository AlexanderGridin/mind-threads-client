# Open a thread from the dashboard

**Type:** Standard user story · **Status:** Reviewed and Approved · **Created:** 2026-10-21

## Story

As a Mind Threads user,
I want to open a thread from my dashboard and return to the dashboard,
so that I can focus on one thread at a time and switch between threads quickly.

## Acceptance criteria

### Opening a thread

- Given the dashboard shows threads in grid view, when the user clicks the card for "Testing Strategy", then the thread page for "Testing Strategy" opens.
- Given the dashboard shows threads in list view, when the user clicks the card for "Testing Strategy", then the thread page for "Testing Strategy" opens.
- Given the dashboard shows threads, when the user presses Tab, then keyboard focus can reach each thread card.
- Given the card for "Testing Strategy" has keyboard focus, when the user presses Enter, then the thread page for "Testing Strategy" opens.
- Given a screen reader user moves focus to the card for "Testing Strategy", when the card is announced, then it is announced as a link named "Testing Strategy".
- Given the dashboard shows threads, when the user Ctrl+clicks (Cmd+click on macOS) a card, then the thread page opens in a new browser tab and the dashboard stays open in the current tab.
- Given the dashboard shows threads, when the user middle-clicks a card, then the thread page opens in a new browser tab and the dashboard stays open in the current tab.
- Given the thread page for "Testing Strategy" is open, when the user reloads the browser page, then the thread page for "Testing Strategy" is shown again.
- Given the user saved the address of the thread page for "Testing Strategy" as a bookmark, when the user opens the bookmark, then the thread page for "Testing Strategy" is shown.
- Given a card shows the three-dots "Thread actions" button from the "Edit a thread from the dashboard" or "Delete a thread from the dashboard" story, when the user clicks that button, then the thread page does not open.
- Given a card's actions menu is open, when the user clicks any item in the menu, then the thread page does not open.

### Thread page layout

- Given the thread page for "Testing Strategy" has loaded, when the user looks at the header, then it shows a back-arrow button at its far left.
- Given the thread page for "Testing Strategy" has loaded, when the user looks at the header, then it shows the title "Testing Strategy" to the right of the back-arrow button.
- Given the thread page has loaded, when the user looks at the header, then the "Mind Threads" app logo (icon and name), the same as on the dashboard, is shown in the horizontal center of the header.
- Given the thread page has loaded, when the user looks at the header, then the color mode toggle is shown at its far right.
- Given the thread page for a thread has loaded, when the user looks at the header, then the header's background is the thread's color.
- Given the header's background is the thread's color, when the user looks at the header's text and icons, then they are shown in dark or light, whichever has the higher contrast against the thread's color.
- Given the header's background is the thread's color, when the user switches the color mode, then the header's background stays the thread's color.
- Given the user switches the color mode on the thread page, when the user returns to the dashboard, then the dashboard uses the same color mode.
- Given the thread page has loaded, when the user looks at the header, then it does not show the thread's section count, page count, "Updated" date, or any Edit or Delete action.
- Given the thread page has loaded, when the user looks below the header, then the content area shows three columns side by side, separated by vertical borders.
- Given the thread page has loaded, when the user looks at the three columns, then the first and second columns have the same width and the third column fills the remaining width.
- Given the thread page has loaded, when the user looks at the first column, then it shows the heading "Sections" and the text "No sections yet."
- Given the thread page has loaded, when the user looks at the second column, then it shows the heading "Pages" and the text "Select a section to see its pages."
- Given the thread page has loaded, when the user looks at the third column, then it shows no heading and the centered text "Select a page to see its content."
- Given the thread page has loaded, when the user looks at any column, then no "Add section" or "Add page" button is shown.
- Given the browser window is narrower than 768px, when the thread page has loaded, then the three columns stay side by side and the page scrolls horizontally.
- Given the thread page for "Testing Strategy" has loaded, when the user looks at the browser tab, then its title is "Testing Strategy · Mind Threads".

### Returning to the dashboard

- Given the thread page is open, when the user clicks the back-arrow button, then the dashboard opens.
- Given a screen reader user moves focus to the back-arrow button, when the button is announced, then its label is "Back to Dashboard".
- Given the user opened the thread page from the dashboard, when the user clicks the browser's Back button, then the dashboard opens.
- Given the dashboard was in list view when the user opened a thread, when the user returns to the dashboard, then the dashboard shows threads in list view.
- Given the dashboard was in grid view when the user opened a thread, when the user returns to the dashboard, then the dashboard shows threads in grid view.
- Given the user opened a thread and returned to the dashboard, when the dashboard is shown, then it shows the same threads in the same order as before.
- Given the user returned to the dashboard from a thread page, when the user looks at the browser tab, then its title is the same as before the thread page was opened.

### Error handling and user feedback

- Given the user opens a thread page, when the thread data is loading, then a full-screen loader is shown on top of the thread page layout and covers the whole page, header and content area included.
- Given the full-screen loader is shown, when a screen reader announces it, then it is announced as "Loading thread".
- Given the full-screen loader is shown, when the user looks at the browser tab, then its title is "Mind Threads".
- Given the full-screen loader is shown, when loading finishes, then the loader is hidden and the thread page layout under it is shown.
- Given the thread exists, when loading finishes, then the page shows the header with the thread's title and the three-column content area.
- Given the user opens the address of a thread that doesn't exist, when loading finishes, then the content area shows the message "This thread doesn't exist or was deleted." and a "Back to Dashboard" button instead of the three columns.
- Given the thread is not found, when the user looks at the header, then it shows the back-arrow button, the app logo, and the color mode toggle, and no thread title.
- Given the thread is not found, when the user looks at the header, then its background is the same as the dashboard header's background.
- Given the thread is not found, when the user looks at the browser tab, then its title is "Thread not found · Mind Threads".
- Given the saved thread data can't be read, when loading finishes, then the content area shows the message "Couldn't load this thread. Please reload the page." and a "Back to Dashboard" button instead of the three columns.
- Given loading the thread failed, when the user looks at the header, then it shows the back-arrow button, the app logo, and the color mode toggle, and no thread title.
- Given loading the thread failed, when the user looks at the header, then its background is the same as the dashboard header's background.
- Given loading the thread failed, when the user looks at the browser tab, then its title is "Mind Threads".
- Given the thread is not found or loading failed, when the user clicks "Back to Dashboard", then the dashboard opens.
- Given the thread is not found or loading failed, when the page is shown, then no notification popup is shown.

## Notes / Links

- Designs: no dedicated designs. Reuse the dashboard's header, app logo, and color mode toggle styles, with the thread's color as the header background. The three-column content area follows a OneNote-like layout: sections, then pages, then the selected page's content.
- Dependencies: no blocking dependencies. "Edit a thread from the dashboard" and "Delete a thread from the dashboard" both require that clicks on a card's three-dots actions menu don't open the thread. Whichever story ships after this one must keep that rule, and this story must keep it if either of them ships first.
- Follow-ups: a mobile layout for screens narrower than 768px (one column at a time) is a separate story. Adding sections and pages to the columns belongs to the sections and pages stories.
