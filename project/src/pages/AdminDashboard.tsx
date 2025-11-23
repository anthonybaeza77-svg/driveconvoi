import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, FileText, Home, Edit3, Mail, DollarSign } from 'lucide-react';
import BlogManager from '../components/admin/BlogManager';
import HomepageManager from '../components/admin/HomepageManager';
import FooterManager from '../components/admin/FooterManager';
import PricingManager from '../components/admin/PricingManager';

type Tab = 'homepage' | 'blog' | 'footer' | 'pricing';

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('homepage');

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  if (!user) {
    navigate('/admin/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Administration</h1>
              <p className="text-sm text-slate-600 mt-1">Connecté en tant que {user.email}</p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-slate-900 transition-colors"
              >
                <Home className="w-4 h-4" />
                Voir le site
              </a>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="border-b border-slate-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('homepage')}
                className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-colors ${
                  activeTab === 'homepage'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Edit3 className="w-5 h-5" />
                Contenu de la page d'accueil
              </button>
              <button
                onClick={() => setActiveTab('blog')}
                className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-colors ${
                  activeTab === 'blog'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-5 h-5" />
                Articles du blog
              </button>
              <button
                onClick={() => setActiveTab('footer')}
                className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-colors ${
                  activeTab === 'footer'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Mail className="w-5 h-5" />
                Pied de page
              </button>
              <button
                onClick={() => setActiveTab('pricing')}
                className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-colors ${
                  activeTab === 'pricing'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <DollarSign className="w-5 h-5" />
                Tarifs
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'homepage' && <HomepageManager />}
            {activeTab === 'blog' && <BlogManager />}
            {activeTab === 'footer' && <FooterManager />}
            {activeTab === 'pricing' && <PricingManager />}
          </div>
        </div>
      </div>
    </div>
  );
}
