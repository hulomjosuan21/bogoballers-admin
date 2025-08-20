import { Routes, Route } from "react-router-dom";
import LeagueAdminLayout from "./layouts/LeagueAdminLayout";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { leagueAdminRoutes } from "./routes";
import TestDndComponent from "./test/TestDndComponent";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<h1>Home</h1>} />

        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/test" element={<TestDndComponent />} />
          <Route path="/league-administrator" element={<LeagueAdminLayout />}>
            {leagueAdminRoutes.map((route, index) => (
              <Route
                key={index}
                index={route.index}
                path={route.path}
                element={route.element}
              />
            ))}
          </Route>
        </Route>
      </Routes>
    </>
  );
}
