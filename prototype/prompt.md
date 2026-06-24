I want to prototype a quick-note taking app in React. This app should have 2 pages:

- First (and the main one): A dashboard/landing view with a searchable list or grid of notes.
- Second: A detailed view representing an opened note. This page should mimic the Microsoft OneNote 3-column layout hierarchy, but with an innovative, feed-style content editor:
    - Column 1 (Leftmost): Lists the Sections/Sub-pages of the current note.
    - Column 2 (Middle): Lists the Pages/Sub-sub-pages belonging to the selected sub-page.
    - Column 3 (Rightmost/Main area): Displays the content of the selected Note -> Sub-page -> Sub-sub-page, styled as an inverted, Microsoft Teams-inspired chat feed:
        - Feed Layout: Content is rendered as individual "messages" or entries, but arranged in reverse-chronological order—meaning the most recent entry is always at the top, and older entries push downward.
        - Each feed entry should support the date and time whet it was created, tags, editing functionality.
        - Composer Interface: At the very bottom (or anchored seamlessly), place a rich message typing and sending interface that mimics the Microsoft Teams composer.
        - Content Types: The composer must support adding and rendering multiple data types within a single entry:
            - Plain text with inline formatting.
            - Rich Text Styling (bold, italics, underline, strikethrough).
            - Structural Elements (bulleted lists, numbered lists, and hyperlinks).
            - Blocks for code snippets (with syntax highlighting blocks) and inline images/media placeholders.

Here are the requirements:

## FEATURES

- CRUD Operations for Notes: Create, edit (rename), and delete top-level notes from the main dashboard.
- CRUD Operations for Sub-pages: Create, rename, and delete sub-pages within the opened note view.
- CRUD Operations for Sub-sub-pages: Create, rename, and delete sub-sub-pages within the active sub-page.
- Hierarchical Search & Filtering: - Main page search to filter the top-level notes list.
- Internal scope search fields in the opened note columns to filter sub-pages and sub-sub-pages dynamically.
- Theme Toggle: Dark/light mode toggle with smooth transitions, persisting via local state.

## TECHNICAL REQUIREMENTS
- React Architecture: Built entirely with functional components, modern hooks (useState, useMemo, useCallback), and robust client-side mock data to demonstrate full interactivity.
- Routing: Browser routing using React Router (react-router-dom), establishing logical paths like / for the dashboard and /note/:noteId (with nested active paths or query params for selected sub-items if applicable).
- Responsive Design: Mobile-friendly adaptations (e.g., collapsible sidebar columns or a burger menu drawer for the multi-column OneNote layout on smaller screens).
- UI & Styling: Clean, ultra-modern UI powered by Tailwind v4. Utilize Tailwind's native CSS-variable configuration or inline hex classes strictly adhering to the Nord color palette:
    - Polar Night (Backgrounds/Sidebars): #2e3440, #3b4252, #434c5e, #4c566a
    - Snow Storm (Light mode text/backgrounds): #d8dee9, #e5e9f0, #eceff4
    - Frost (Accents, active states, buttons): #8fbcbb, #88c0d0, #81a1c1, #5e81ac
    - Aurora (Alerts, delete actions, system status): #bf616a, #d08770, #ebcb8b, #a3be8c, #b48ead

## STRUCTURE
- Component Modularization: Break the UI into highly reusable, atomic components (e.g., NoteCard, SidebarColumn, SearchInput, EditorArea, ThemeToggle).
- State Management: Keep state close to where it's needed or manage it at the page level to ensure typing in the editor or selecting items doesn't cause jarring visual reflows. Include mock data pre-populated with a few sample notes, sub-pages, and text content so the prototype is instantly usable.
