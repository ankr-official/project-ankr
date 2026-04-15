import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { ThemeProvider, useThemeContext } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { LoginDropdownProvider } from "./contexts/LoginDropdownContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./pages/Home";
import "./App.css";

const Admin = lazy(() => import("./pages/Admin"));
const LikedEvents = lazy(() => import("./pages/LikedEvents"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));

function AppContent() {
  const { theme } = useThemeContext();
  const currentYear = new Date().getFullYear();

  return (
    <>
      <ToastContainer
        position="bottom-center"
        autoClose={2500}
        closeOnClick
        hideProgressBar
        theme={theme}
      />
      <Router>
        <div className="rounded-lg bg-indigo-50/50 dark:bg-[#242424] min-h-screen transition-colors">
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/event/:id" element={<Home />} />
              <Route path="/liked" element={<LikedEvents />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </Suspense>
          <footer className="w-full py-8 mt-8 text-gray-600 dark:text-gray-300 bg-gray-300 dark:bg-gray-900 transition-colors">
            <div className="container px-4 mx-auto">
              <div className="flex flex-col items-center space-y-4">
                <div className="text-center space-y-1">
                  <p className="text-sm">
                    © {currentYear} ANKR.KR, All rights reserved.
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <Link
                      to="/terms"
                      onClick={() => window.scrollTo(0, 0)}
                      className="text-xs text-gray-500 dark:text-gray-400 active:text-indigo-600 mouse:hover:text-indigo-600 dark:active:text-indigo-400 dark:mouse:hover:text-indigo-400 transition-colors"
                    >
                      이용약관
                    </Link>
                    <span className="text-xs text-gray-400 dark:text-gray-600">
                      |
                    </span>
                    <Link
                      to="/privacy"
                      onClick={() => window.scrollTo(0, 0)}
                      className="text-xs text-gray-500 dark:text-gray-400 active:text-indigo-600 mouse:hover:text-indigo-600 dark:active:text-indigo-400 dark:mouse:hover:text-indigo-400 transition-colors"
                    >
                      개인정보처리방침
                    </Link>
                  </div>
                </div>
                <div className="text-sm flex items-center gap-4">
                  <a
                    href="mailto:ankr.web.official@gmail.com"
                    className="text-indigo-600 dark:text-indigo-400 active:text-indigo-500 mouse:hover:text-indigo-500 dark:active:text-indigo-300 dark:mouse:hover:text-indigo-300 transition-colors"
                    aria-label="Email"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </a>
                  <a
                    href="https://x.com/ankr_db"
                    className="text-indigo-600 dark:text-indigo-400 active:text-indigo-500 mouse:hover:text-indigo-500 dark:active:text-indigo-300 dark:mouse:hover:text-indigo-300 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="X (Twitter)"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.instagram.com/ankr.db.official"
                    className="text-indigo-600 dark:text-indigo-400 active:text-indigo-500 mouse:hover:text-indigo-500 dark:active:text-indigo-300 dark:mouse:hover:text-indigo-300 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LoginDropdownProvider>
          <AppContent />
        </LoginDropdownProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
