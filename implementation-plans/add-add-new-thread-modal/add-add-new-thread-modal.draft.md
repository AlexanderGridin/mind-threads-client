# Add a "Add new thread" modal

## Goal

A "+ New Thread" button in the Dashboard header opens an "Add new thread" modal which has a from with 2 fields as its content:

- Thread name (mapped to the title field of the MainThread type). The Input.tsx component should be used as an input of this field;
- Color: the ColorPicker.tsx component should be used as an input of this field.

The modal should have 2 actions:

- Add: when clicked, the data entered into the form is printed to the browser's console;
- Cancel: when clicked, the modal is closed.

The "+ New Thread" button and the modal should be colocated within a single component that represents a something like a feature module.

### High-level plan

1. Implement an AddNewThread component, which should include the "+ New Thread" button and control the visibility of the AddNewThreadModal. The AddNewThreadModal should include the AddNewThreadModalActions and ThreadForm components connected in a way, so when the modal is submitted, it emits the onSubmit event with the form value to the parent component.
2. Cover all newly created components with unit-tests.
3. Integrate the AddNewThread component with the Dashboard page.
4. Add/update any necessary/affected unit-tests.

## References

- @src/components/lib/Input/Input.tsx
- @src/components/lib/Dialog/Dialog.tsx
- @src/components/lib/ColorPicker/ColorPicker.tsx
- @src/pages/DashboardPage/DashboardPage.tsx
