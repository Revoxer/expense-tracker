import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store";

export const RootRedirect = () => {
  const token = useAuthStore((state) => state.token);
  return <Navigate to={token ? "/dashboard" : "/login"} />;
};
