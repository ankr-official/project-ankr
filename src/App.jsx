import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import "./App.css";

function App() {
    const currentYear = new Date().getFullYear();

    return (
        <Router basename="/project-ankr">
            <div className="rounded-lg">
                <Routes>
                    <Route path="/" element={<Home />} />
                </Routes>
                <footer className="w-full bg-gray-900 text-gray-300 py-8 mt-8">
                    <div className="container mx-auto px-4">
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
                                    >
                                        X (Twitter)
                                    </a>
                                </p>
                                <p>
                                    <a
                                        href="https://www.instagram.com/ankr.db.official"
                                        className="text-indigo-400 hover:text-indigo-300"
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
