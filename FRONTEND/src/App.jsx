import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import NotFound from "./components/sections/NotFound";
import InvalidPage from "./components/sections/InvalidPage";
import { ThemeProvider } from "./components/theme-provider";
import { ThemeToggle } from "./components/theme-toggle";
import { Toaster } from 'sonner';
import "./styles/globals.css";
import NavigationBar from "./components/home/NavigationBar";
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
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Login from "./components/auth/Login";
import Signup from "./components/auth/signup";

function App() {
  // const count = useSelector((state) => state.counter.value);
  // const dispatch = useDispatch();
  return (
    <ThemeProvider defaultTheme="light" storageKey="masai-theme">
      <Toaster position="top-right" expand={true} richColors />
      <BrowserRouter>
        <div className="min-h-screen bg-background text-foreground flex">
          <NavigationBar />
          <div className="flex-1 ml-0 lg:ml-72">
            <div className="fixed top-3.5 right-4 z-50">
              <ThemeToggle />
            </div>
            <Routes>
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register" element={<Signup />} />
              <Route path="/auth/*" element={<Navigate replace to="/auth/login" />} />
              <Route path="/" element={<Navigate replace to="/workspaces" />} />
              <Route
                path="/workspaces"
                element={
                  <ProtectedRoute>
                    <Workspaces />
                  </ProtectedRoute>
                }
              />
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
                <Route path="sprints" element={<SprintsTab />} />
                <Route path="board" element={<BoardTab />} />
                <Route path="settings" element={<SettingsTab />} />
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
              <Route path="/404" element={<NotFound />} />
              <Route path="/invalid" element={<InvalidPage />} />
              <Route path="*" element={<Navigate replace to="/404" />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
