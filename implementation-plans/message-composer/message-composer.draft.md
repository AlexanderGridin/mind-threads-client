# Chat page: message composer

**Type:** Standard User Story · **Status:** Reviewed and Approved · **Created:** 2026-11-15

## Story

As a Mind Threads user,
I want to select a Chat page in a thread and see a message composer at the top of its page view,
so that I can write formatted messages with links, images, and tags in the page I chose.

## Acceptance criteria

### Page view

- Given the thread screen with at least one page in the Pages column, when I select a page card, then the card is highlighted as selected and a page view for that page opens next to the Sections and Pages columns.
- Given a page view for a page of type "Chat", when it opens, then the page name and the message composer are shown at the top of the page view, with the page name above the composer.
- Given a page is selected, when I select another page, then the page view switches to the newly selected page and the previous one is no longer shown.
- Given no page is selected, when I look at the thread screen, then no page view is shown and a short hint tells me to select a page.
- Given the selected page is deleted, when the deletion completes, then the page view closes and the hint is shown again.
- Given a page is selected, when I reload the browser, then no page is selected [assumption (inferred content): selection is not kept across reloads, because there is no route for it yet].
- Given I switch to another page or the selected page closes, when I return to the page, then the composer starts empty [assumption (inferred content): unsent drafts are not kept].

### Text formatting

- Given the composer is empty, when I look at it, then I see a placeholder inviting me to write a message and mentioning Ctrl+Enter to send.
- Given I have typed text, when I select it and use the Bold, Italic, Underline, or Strikethrough toolbar button, then the selected text gets that formatting. Using the same button again removes it.
- Given the editor has focus, when I use Ctrl+B, Ctrl+I, or Ctrl+U (Cmd on macOS), then bold, italic, or underline is applied the same way as with the toolbar button [assumption (inferred content): shortcuts follow the prototype tooltips].
- Given the cursor is in the editor, when I use the Bullet list or Numbered list toolbar button, then the current line becomes a bulleted or numbered list item. Using the button again turns it back into plain text.
- Given the cursor is in the editor, when I use the Code block toolbar button, then a code block is inserted with placeholder text and an empty line below it for continued typing.
- Given I click a toolbar button, when the action is applied, then the editor keeps its focus and selection.
- Given the editor content grows, when it reaches the maximum editor height, then the editor scrolls vertically instead of growing further.
- Given the toolbar is wider than the composer, when the composer is narrow, then the toolbar buttons wrap onto the next line.

### Links

- Given the editor has focus, when I use the Insert link toolbar button, then a small inline field for the URL appears in the composer.
- Given the URL field is open and I entered a valid http or https URL, when I confirm, then a link is inserted. If text was selected, the selected text becomes the link text. Otherwise the URL is the link text.
- Given a link was inserted, when it is followed (for example from the console output or a later message view), then it opens in a new browser tab.

### Images

- Given the editor has focus, when I use the Insert image toolbar button, then a file picker limited to images opens.
- Given I pick an image, when it loads, then the image is inserted at the cursor, scaled to fit the editor width, with an empty line below it for continued typing.
- No file size limit applies in this story. The limit is handled separately.

### Tags

- Given the composer is open, when I use the Tag toolbar button, then a tag row with a text field appears. Using the button again hides the field.
- Given the tag field is focused, when I type a name and press Enter or comma, then a tag chip is added to the row and the field is cleared.
- Given I added a tag, when it is stored, then the tag is lowercased, trimmed, and its spaces are replaced with hyphens.
- Given I leave the tag field with text typed, when it loses focus, then the text is added as a tag.
- Given the tag field is focused, when I press Escape, then the field closes and its text is discarded. Tags already added stay.
- Given a tag chip, when I use its remove button, then the tag is removed.
- Given the tag button, when the tag row is open or at least one tag exists, then the button is shown as active.
- Given many tags or very long tags, when they do not fit the row, then the row scrolls horizontally. Tags are not truncated and there is no limit on their number or length.

### Sending

- Given the editor has no text, image, or code, when I look at the Send button, then it is disabled. Tags alone do not enable it.
- Given the editor has content, when I click Send or press Ctrl+Enter (Cmd+Enter on macOS), then the composer content and its tags are written to the browser console, the editor is emptied, the tags are cleared, the tag field is closed, and focus returns to the editor.
- Given the editor has no content, when I press Ctrl+Enter, then nothing happens.
- Given I sent a message, when I look at the page view, then the message is not shown or stored anywhere. Saving and showing messages comes in a follow-up story. The console output is a temporary aid for manual validation.

### Error handling and user feedback

- Given the URL field is open, when I confirm a URL that is empty or not a valid http or https URL, then an inline message "Enter a valid http or https URL" is shown, nothing is inserted, and the field stays open so I can fix it.
- Given I pick a file that is not an image, when it is rejected, then an error notification explains that only images are supported and nothing is inserted.
- Given I pick an image, when the file cannot be read, then an error notification says the image could not be loaded and nothing is inserted.
- Given a tag name is empty or already added, when I try to add it, then it is ignored without any message.
- Given I use a formatting button while the editor has no selection, when the action is applied, then it affects the text I type next, with no error shown.

## Notes / Links

- Designs: the Composer component of the note-taking prototype is the reference for the features and behavior. The prototype lives in the `prototype` folder of the project.
- Dependencies: none. This story includes the minimal page view that hosts the composer. A route for the page view, message storage, and the message list are separate stories.

## Discovery notes

Shared by the requester during refinement. Passed on as input for implementation planning.

- Prototype reference: `prototype/prototype-code/components/note/Composer.tsx`. Use it as a guide to the features and capabilities to implement, not as code to copy.
- Developer note: use the Command pattern for all composer actions.
- Developer note: avoid `document.execCommand()`, as it is deprecated. The prototype uses it for formatting, lists, links, code blocks, and images.
- Decision: the page view has no route yet. It is scoped to the page view root component and is shown on the thread screen when a page card is selected.
- Decision: sending logs the composer output (content and tags) to the browser console for manual validation. No storage and no message list yet.
- Decision: the image size limit is omitted here and handled separately.
