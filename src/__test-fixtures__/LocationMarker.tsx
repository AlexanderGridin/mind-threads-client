import { useLocation } from "react-router";
import { LOCATION_MARKER_TEST_ID } from "./router.constants";

export const LocationMarker = () => {
  const location = useLocation();

  return <p data-testid={LOCATION_MARKER_TEST_ID}>{location.pathname}</p>;
};
