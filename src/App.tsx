import { Routes, Route } from "react-router-dom";
import LeagueAdminLayout from "./layouts/LeagueAdminLayout";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { leagueAdminRoutes, publicRoutes } from "./routes";
import HeroSection from "./pages/public/landing-page/LandingPage";

function LandingPage() {
  return <HeroSection />;
}
export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />

        <Route>
          {publicRoutes.map((route, index) => (
            <Route
              key={index}
              index={route.index}
              path={route.path}
              element={route.element}
            />
          ))}
        </Route>

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
