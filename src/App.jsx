import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import YearEndReceiptPage from "./pages/YearEndReceipt";
import "./App.css";

function App() {
  const currentYear = new Date().getFullYear();

  return (
    <Router>
      <div className="rounded-lg">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/event/:id" element={<Home />} />
          <Route path="/year-end-receipt" element={<YearEndReceiptPage />} />
          <Route path="*" element={<Home />} />
        </Routes>
        <footer className="w-full py-8 mt-8 text-gray-300 bg-gray-900">
          <div className="container px-4 mx-auto">
            <div className="flex flex-col items-center space-y-4">
              <div className="text-center">
                <p className="text-sm">
                  © {currentYear} ANKR. All rights reserved.
                </p>
              </div>
              <div className="text-sm flex divide-x divide-gray-700 [&>*]:px-2">
                <p>
                  <a
                    href="mailto:ankr.web.official@gmail.com"
                    className="text-indigo-400 hover:text-indigo-300"
                  >
                    Email
                  </a>
                </p>
                <p>
                  <a
                    href="https://x.com/ankr_db"
                    className="text-indigo-400 hover:text-indigo-300"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    X (Twitter)
                  </a>
                </p>
                <p>
                  <a
                    href="https://www.instagram.com/ankr.db.official"
                    className="text-indigo-400 hover:text-indigo-300"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Instagram
                  </a>
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
