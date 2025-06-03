import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import NotFound from "./components/sections/NotFound";
import InvalidPage from "./components/sections/InvalidPage";
import { ThemeProvider } from "./components/theme-provider";
import { ThemeToggle } from "./components/theme-toggle";
import { Toaster } from "sonner";
import "./styles/globals.css";
import NavigationBar from "./components/home/NavigationBar";
import Topbar from "./components/home/Topbar";
import Workspaces from "./pages/Workspaces";
import Projects from "./pages/Projects";
import Sprints from "./pages/Sprints";
import Board from "./pages/Board";
import Users from "./pages/Users";
import Activity from "./pages/Activity";
import ProjectDetail from "./pages/ProjectDetail";
import SprintsTab from "./pages/SprintsTab";
import BoardTab from "./pages/BoardTab";
import SettingsTab from "./pages/SettingsTab";
import SummaryTab from "./pages/SummaryTab";
import BacklogTab from "./pages/BacklogTab";
import TeamTab from "./pages/TeamTab";
import ActivityTab from "./pages/ActivityTab";
import AIFeatures from "./pages/AIFeatures";
import AIFeaturesTab from "./pages/AIFeaturesTab";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Login from "./components/auth/Login";
import Signup from "./components/auth/signup";

function AppLayout() {
  const location = useLocation();

  // Check if current route is an auth route or landing page
  const isAuthRoute = location.pathname.startsWith("/auth");
  const isLandingPage = location.pathname === "/";

  // Only show navigation bar on non-auth routes and non-landing pages
  const showNavBar = !isAuthRoute && !isLandingPage;

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Only show NavigationBar on non-auth routes and non-landing pages */}
      {/* {showNavBar && <NavigationBar />} */}
      <div className={`flex-1  flex flex-col`}>
        <div className="fixed top-3.5 right-4 z-50">
          <ThemeToggle />
        </div>
        {/* Only show Topbar on non-auth routes */}
        {!isAuthRoute && <Topbar />}
        <div className="flex-1">
          <Routes>
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Signup />} />
            <Route
              path="/auth/*"
              element={<Navigate replace to="/auth/login" />}
            />
            <Route path="/" element={<Navigate replace to="/workspaces" />} />
            {/* <Route
              path="/workspaces"
              element={
                <ProtectedRoute>
                  <Workspaces />
                </ProtectedRoute>
              }
            /> */}
            <Route
              path="/projects"
              element={
                <ProtectedRoute>
                  <Projects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/:projectId"
              element={
                <ProtectedRoute>
                  <ProjectDetail />
                </ProtectedRoute>
              }
            >
              <Route path="summary" element={<SummaryTab />} />
              <Route path="board" element={<BoardTab />} />
              <Route path="sprints" element={<SprintsTab />} />
              <Route path="backlog" element={<BacklogTab />} />
              <Route path="team" element={<TeamTab />} />
              <Route path="activity" element={<ActivityTab />} />
              <Route path="ai-features" element={<AIFeaturesTab />} />
              <Route path="settings" element={<SettingsTab />} />
              <Route index element={<Navigate replace to="summary" />} />
            </Route>
            <Route
              path="/sprints"
              element={
                <ProtectedRoute>
                  <Sprints />
                </ProtectedRoute>
              }
            />
            <Route
              path="/board"
              element={
                <ProtectedRoute>
                  <Board />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="/activity"
              element={
                <ProtectedRoute>
                  <Activity />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai-features"
              element={
                <ProtectedRoute>
                  <AIFeatures />
                </ProtectedRoute>
              }
            />
            <Route path="/404" element={<NotFound />} />
            <Route path="/invalid" element={<InvalidPage />} />
            <Route path="*" element={<Navigate replace to="/404" />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="masai-theme">
      <Toaster position="top-right" expand={true} richColors />
      <Router>
        <AppLayout />
      </Router>
    </ThemeProvider>
  );
}

export default App;
