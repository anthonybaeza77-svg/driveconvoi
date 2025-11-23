import { Link, useLocation } from 'react-router-dom';

export default function Navigation() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            to="/"
            className="flex items-center space-x-3 group"
          >
            <img src="/CaptureLogoVoiture.png" alt="Convoy-Auto Logo" className="h-14 w-auto" />
            <span className="text-xl font-bold text-slate-900 group-hover:text-slate-700 transition-colors">
              Convoy-Auto
            </span>
          </Link>

          <div className="flex space-x-1">
            <Link
              to="/"
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                currentPath === '/'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Accueil
            </Link>
            <Link
              to="/blog"
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                currentPath === '/blog'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Blog
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
