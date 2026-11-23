import { screen } from "@testing-library/react";
import type userEvent from "@testing-library/user-event";
import { MessageComposerTestId } from "@/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/MessageComposer.constants";
import { tagCommand } from "@/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/MessageComposer.commands";
import { TAG_INPUT_LABEL } from "@/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PageView/components/ChatPageView/components/MessageComposer/components/TagRow/TagRow.constants";
import { getComposerEditor } from "./composer.queries";

type User = ReturnType<typeof userEvent.setup>;

type TypeInComposerParams = {
  user: User;
  text: string;
};

type AddComposerTagParams = {
  user: User;
  tag: string;
};

type PickComposerFileParams = {
  user: User;
  file: File;
};

export const typeInComposer = async ({ user, text }: TypeInComposerParams) => {
  const editor = getComposerEditor();

  await user.click(editor);
  await user.type(editor, text);
};

export const selectAllInComposer = async (user: User) => {
  const editor = getComposerEditor();

  await user.click(editor);
  await user.keyboard("{Control>}a{/Control}");
};

export const addComposerTag = async ({ user, tag }: AddComposerTagParams) => {
  const existingTagInput = screen.queryByRole("textbox", {
    name: TAG_INPUT_LABEL,
  });

  if (!existingTagInput) {
    const tagButton = screen.getByRole("button", { name: tagCommand.label });
    await user.click(tagButton);
  }

  const tagInput = screen.getByRole("textbox", { name: TAG_INPUT_LABEL });
  await user.type(tagInput, `${tag}{Enter}`);
};

export const pickComposerFile = async ({
  user,
  file,
}: PickComposerFileParams) => {
  const imageInput = screen.getByTestId(MessageComposerTestId.imageInput);

  await user.upload(imageInput, file);
};
