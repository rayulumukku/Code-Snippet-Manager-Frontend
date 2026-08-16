import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toast from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import StructuredData from './components/StructuredData';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const SnippetDetail = lazy(() => import('./pages/SnippetDetail'));
const SnippetEditor = lazy(() => import('./pages/SnippetEditor'));
const Search = lazy(() => import('./pages/Search'));
const Collections = lazy(() => import('./pages/Collections'));
const CollectionDetail = lazy(() => import('./pages/CollectionDetail'));
const Profile = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Router basename="/projects/code-snippet-manager">
            <StructuredData />
            <div className="min-h-screen bg-white text-slate-900 dark:bg-custom-dark-bg dark:text-custom-dark-text antialiased selection:bg-orange-200/60 selection:text-slate-900">
              <Navbar />
              <Suspense fallback={
                <div className="min-h-[60vh] flex items-center justify-center">
                  <div className="w-10 h-10 border-2 border-custom-orangered border-t-transparent rounded-full animate-spin" />
                </div>
              }>
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
              </Suspense>
              <Footer />
              <Toast />
            </div>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
