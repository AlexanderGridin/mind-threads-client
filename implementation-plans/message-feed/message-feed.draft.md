# Chat Page Message Feed

**Type:** Standard User Story · **Status:** Reviewed and Approved · **Created:** 2026-11-24

## Story

As a Mind Threads user writing in a Chat page,
I want the messages I send from the message composer to appear in a feed on that page,
so that I can see and come back to what I wrote instead of losing it after sending.

## Acceptance criteria

### Feed and messages

- Given a Chat page is open, when I look at the page, then the message feed is shown directly under the message composer with a 16px gap between them.
- Given a Chat page with no messages, when the page finishes loading, then the feed area shows the placeholder "No messages yet. Write your first message above."
- Given the composer has content, when I send it, then a new message appears at the top of the feed.
- Given the feed has several messages, when I look at it, then the messages are listed from top to bottom with the newest first.
- Given the feed has messages, when I look at one of them, then it is aligned to the user's side of the feed, as in a conversation with one participant.
- Given a message was sent with tags and formatted text, when I look at it in the feed, then it shows, from top to bottom: the sent date and time, the tags as chips, and the formatted text as written.
- Given a message has more tags than fit in one row, when I look at it, then the tag chips wrap onto additional rows and are never shown as a single horizontally scrolling row.
- Given a message has no tags, when I look at it, then the tags block is not shown and the formatted text follows the sent date and time.
- Given I sent messages on a Chat page, when I reload the browser and open that page, then all its messages are shown in the same order.
- Given two Chat pages with different messages, when I switch from one to the other, then the feed shows only the messages of the page I switched to.
- Given a Chat page with messages, when I delete that page, then its messages are deleted with it.

### Safe display of messages

- Given a message contains bold text, italic text, lists, line breaks, links or images created in the composer, when it is shown in the feed, then that formatting is kept.
- Given a message contains a script, an event handler attribute, or a link or image address that can run code, when it is shown in the feed, then the unsafe part is removed, the script does not run, and the rest of the message is shown.
- Given a message contains a link, when I click it, then the link opens in a new browser tab.
- Given a message contains any formatting other than bold, italic, lists, line breaks, links and images, when it is shown in the feed, then that formatting is removed and its text is kept.

### Performance

- Given a Chat page has 5,000 messages [assumption (inferred content)], when I open the page and scroll the feed from top to bottom, then scrolling stays smooth and the page stays responsive, because only the messages near the visible area are rendered.

### Error handling and user feedback

- Given I open a Chat page, when its messages are loading, then a spinner is shown in a full-page progress overlay, and I cannot interact with any part of the application until loading ends.
- Given I open a Chat page, when loading its messages fails, then the overlay is removed and the feed area shows an error message with a "Try again" button.
- Given loading messages failed, when I click "Try again", then the full-page progress overlay with the spinner is shown again and loading restarts.
- Given the composer holds text and tags and loading messages fails, when the overlay is removed, then the composer still holds the same text and tags.
- Given the composer has content and tags, when I send it and the message cannot be saved, then the message does not appear in the feed and an error notification shows "Message could not be sent. Please try again."
- Given saving a message failed, when I look at the composer, then it still holds the text and tags I wrote, so I can send again.
- Given the composer has content, when I send it and it is saved, then the composer is cleared and no confirmation notification is shown, because the new message at the top of the feed is the feedback.

## Notes / Links

- Dependencies: the message composer, delivered in "feat: add a chat page message composer (#33)".
