import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import QuoteForm from './components/QuoteForm';
import BlogList from './components/BlogList';
import Footer from './components/Footer';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

function AppRouter() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={
        <div className="min-h-screen flex flex-col bg-slate-50">
          <Navigation />
          <Hero />
          <section id="quote-form" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <QuoteForm />
          </section>
          <Footer />
        </div>
      } />
      <Route path="/blog" element={
        <div className="min-h-screen flex flex-col bg-slate-50">
          <Navigation />
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                Notre Blog
              </h1>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Actualités, conseils et informations sur le convoyage de véhicules
              </p>
            </div>
            <BlogList />
          </section>
          <Footer />
        </div>
      } />
      <Route path="/admin/login" element={
        user ? <Navigate to="/admin/dashboard" /> : <AdminLogin />
      } />
      <Route path="/admin/dashboard" element={
        user ? <AdminDashboard /> : <Navigate to="/admin/login" />
      } />
    </Routes>
  );
}

export default AppRouter;

