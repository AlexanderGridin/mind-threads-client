import { useState } from "react";

export const App = () => {
  const [visible, setVisible] = useState(true);

  const handleToggleVisibility = () => {
    setVisible((value) => !value);
  };

  return (
    <>
      <button onClick={handleToggleVisibility}>Toggle visibility</button>
      {visible ? <h1>MindThreads</h1> : null}
    </>
  );
};
