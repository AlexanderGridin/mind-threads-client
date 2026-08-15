import { useState } from "react";
import { Button } from "@/components/lib";
import { AddNewThreadModal } from "./components";
import type { ThreadFormValue } from "./components";
import {
  ADD_NEW_THREAD_BUTTON_LABEL,
  AddNewThreadTestId,
} from "./AddNewThread.constants";

export const AddNewThread = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = (value: ThreadFormValue) => {
    console.log(value);
    setIsModalOpen(false);
  };

  return (
    <>
      <Button
        data-testid={AddNewThreadTestId.openModalButton}
        background="accent"
        onClick={handleOpenModal}
      >
        {ADD_NEW_THREAD_BUTTON_LABEL}
      </Button>

      {isModalOpen ? (
        <AddNewThreadModal onClose={handleCloseModal} onSubmit={handleSubmit} />
      ) : null}
    </>
  );
};
