# Add application specific color theme

## Goal

We need to implement our own color theme that uses the Nord color theme colors and implemented using the rules applicable to the theming of Chakra UI components.

During the implementation, please rely on the Chakra theming overview from the file @.doc/chakra-theming-overview.md. Ideally, we need to keep our theme as simple as possible, so prefer using Chakra's default color tokens instead of adding the custom ones. We need to omit the usage of the Chakra CLI for creating the types after the theme is created/updated.

We also have a code related to the prototype of our application. You can find it in this folder @prototype/prototype-code/ . Use it for the information about the colors, spacing etc.

In addition, here is the information about the colors of the Nord color theme:
- Polar Night (Backgrounds/Sidebars): #2e3440, #3b4252, #434c5e, #4c566a
- Snow Storm (Light mode text/backgrounds): #d8dee9, #e5e9f0, #eceff4
- Frost (Accents, active states, buttons): #8fbcbb, #88c0d0, #81a1c1, #5e81ac
- Aurora (Alerts, delete actions, system status): #bf616a, #d08770, #ebcb8b, #a3be8c, #b48ead

All code related to our custom theme should be placed within the folder @src/components/lib/ .

If you find any uncertainties, inconsistencies, or have any concerns, please ask the developer first before creating the final plan.

## References

- @.doc/chakra-theming-overview.md
- @prototype/prototype-code/
- @src/components/lib/
