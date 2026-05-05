import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Loader from './components/Loader';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SnippetDetail from './pages/SnippetDetail';
import SnippetEditor from './pages/SnippetEditor';
import Search from './pages/Search';
import Collections from './pages/Collections';
import CollectionDetail from './pages/CollectionDetail';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-white text-slate-900 dark:bg-custom-dark-bg dark:text-custom-dark-text antialiased selection:bg-orange-200/60 selection:text-slate-900">
            <Loader />
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/search" element={<Search />} />
              <Route path="/collections" element={<Collections />} />
              <Route path="/collections/:id" element={<CollectionDetail />} />
              <Route path="/create" element={<SnippetEditor />} />
              <Route path="/snippets/:id" element={<SnippetDetail />} />
              <Route path="/snippets/:id/edit" element={<SnippetEditor />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
