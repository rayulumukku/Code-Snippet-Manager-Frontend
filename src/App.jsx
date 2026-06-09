import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SnippetDetail from './pages/SnippetDetail';
import SnippetEditor from './pages/SnippetEditor';
import Search from './pages/Search';
import Collections from './pages/Collections';
import CollectionDetail from './pages/CollectionDetail';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <div className="min-h-screen bg-white text-slate-900 dark:bg-custom-dark-bg dark:text-custom-dark-text antialiased selection:bg-orange-200/60 selection:text-slate-900">
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/search" element={<Search />} />
                <Route path="/collections" element={<Collections />} />
                <Route path="/collections/:id" element={<CollectionDetail />} />
                <Route path="/snippets/:id" element={<SnippetDetail />} />
                <Route path="/profile" element={
                  <ProtectedRoute><Profile /></ProtectedRoute>
                } />
                <Route path="/create" element={
                  <ProtectedRoute><SnippetEditor /></ProtectedRoute>
                } />
                <Route path="/snippets/:id/edit" element={
                  <ProtectedRoute><SnippetEditor /></ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toast />
            </div>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
