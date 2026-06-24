import { useNavigate } from "react-router";
import { AppRoutes } from "@/routing";
import { Button, ColorModeButton } from "@/components/lib";

export const App = () => {
  const navigate = useNavigate();

  const handleNavigateToHome = () => {
    navigate("/");
  };

  const handleNavigateToThread = () => {
    navigate("/threads/1");
  };

  return (
    <>
      <nav
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "0.5rem",
          padding: "0.5rem",
        }}
      >
        <Button onClick={handleNavigateToHome}>Home</Button>
        <Button onClick={handleNavigateToThread}>Thread 1</Button>
        <ColorModeButton />
      </nav>

      <AppRoutes />
    </>
  );
};
