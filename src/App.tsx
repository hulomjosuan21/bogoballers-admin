import { Routes, Route } from "react-router-dom";
import LeagueAdminLayout from "./layouts/LeagueAdminLayout";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { leagueAdminRoutes } from "./routes";
import PublicViewLeagueAdminPage from "./pages/public/ViewLeagueAdminPage";
import Count from "./test/Count";
import State from "./test/State";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<h1>Home</h1>} />

        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/count" element={<Count />} />
        <Route path="/state" element={<State />} />
        <Route path="/:id" element={<PublicViewLeagueAdminPage />} />

        <Route element={<ProtectedRoute />}>
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
