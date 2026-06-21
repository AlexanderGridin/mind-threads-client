import { useState } from "react";
import { Button } from "@/components/lib";

export const App = () => {
  const [visible, setVisible] = useState(true);

  const handleToggleVisibility = () => {
    setVisible((value) => !value);
  };

  return (
    <>
      <Button onClick={handleToggleVisibility}>Toggle visibility</Button>
      {visible ? <h1>MindThreads</h1> : null}
    </>
  );
};
