# Show created threads on the dashboard

**Type:** Standard user story · **Status:** Reviewed and Approved · **Created:** 2026-10-18

## Story

As a Mind Threads user,
I want threads I create to appear on my dashboard instead of demo data,
so that I can see my threads right after creating them and come back to them later.

## Acceptance criteria

### Thread list

- Given the user opens the dashboard, when the thread list is shown, then it contains only threads the user created and no demo threads.
- Given the "Add new thread" modal is open with a name and a color filled in, when the user clicks "Add" and the thread is saved, then the new thread appears as the first card on the dashboard.
- Given the "Add new thread" modal is open with a name and a color filled in, when the user clicks "Add" and the thread is saved, then the modal closes.
- Given a new thread was just created, when its card is shown, then the card shows the name and color the user picked, 0 sections, 0 pages, and the creation time as the last updated time, in the same format as other cards.
- Given the user has created several threads, when the dashboard is shown in either grid view or list view, then the threads are ordered newest first.
- Given the user has created threads, when the user reloads the page, then all created threads are still shown, in the same order.
- Given a thread named "Testing Strategy" already exists, when the user creates another thread named "Testing Strategy", then both threads are shown as separate cards.
- Given the "Add new thread" modal is open, when the name field contains only spaces, then the "Add" button is disabled.
- Given the user enters a name with spaces at the start or end, when the thread is saved, then the card shows the name without those spaces.

### Empty state

- Given the user has no threads, when the user opens the dashboard, then the dashboard shows the message "No threads yet. Create your first thread to get started." and an "Add new thread" button.
- Given the empty state is shown, when the user clicks its "Add new thread" button, then the same "Add new thread" modal opens as from the header button.
- Given the empty state is shown, when the user creates the first thread, then the empty state is replaced by the thread list with that thread.

### Error handling and user feedback

- Given the user clicks "Add" in the modal, when the thread is saved, then a success notification shows `Thread "<thread name>" created.`, with the thread's actual name in place of `<thread name>`.
- Given the user clicks "Add" in the modal, when the thread can't be saved, then the modal stays open with the entered name and color kept.
- Given the user clicks "Add" in the modal, when the thread can't be saved, then an error notification shows "Couldn't save the thread. Please try again."
- Given saving a thread failed, when the dashboard is shown, then the failed thread does not appear in the list.
- Given saving a thread failed and the modal is still open, when the user clicks "Add" again and the save succeeds, then the thread appears as the first card on the dashboard.
- Given saved threads can't be read when the dashboard opens, when the dashboard loads, then an error card with the message "Couldn't load your threads. Please reload the page." is shown in place of the empty state.
- Given the error card is shown, when the user looks at the dashboard, then neither the empty state nor any notification about the load failure is shown.
- Given the error card is shown, when the user looks at the header, then the "Add new thread" button is disabled.
- Given a success or error notification is shown, when 5 seconds pass, then the notification closes on its own.
- Given a success or error notification is shown, when the user clicks its close control, then the notification closes right away.
- Given a success or error notification is triggered, when it appears, then it shows in the bottom-right corner of the screen.
- Given the app is in light or dark color mode, when a notification appears, then the notification uses the colors of the active color mode.

## Notes / Links

- Dependencies: none. The app has no notification component yet, so this story includes building a shared one that later features can reuse.
- Known limitation: threads are saved in the user's current browser only. They don't sync across devices or browsers, and clearing browser data deletes them. Moving storage to a backend is a separate, later story.
