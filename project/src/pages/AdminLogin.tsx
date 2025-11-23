import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [success, setSuccess] = useState('');
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (isSignUp) {
      const { error } = await signUp(email, password);
      if (error) {
        setError('Erreur lors de la création du compte: ' + error.message);
        setLoading(false);
      } else {
        setSuccess('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
        setIsSignUp(false);
        setLoading(false);
        setEmail('');
        setPassword('');
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        setError('Email ou mot de passe incorrect');
        setLoading(false);
      } else {
        navigate('/admin');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {isSignUp ? 'Créer un compte Admin' : 'Connexion Admin'}
          </h1>
          <p className="text-slate-600">
            {isSignUp ? 'Créez votre compte administrateur' : 'Accédez à votre espace d\'administration'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
              <Mail className="w-4 h-4 mr-2" />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="admin@exemple.com"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
              <Lock className="w-4 h-4 mr-2" />
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{success}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {isSignUp ? 'Création...' : 'Connexion...'}
              </>
            ) : (
              isSignUp ? 'Créer le compte' : 'Se connecter'
            )}
          </button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
              setSuccess('');
            }}
            className="text-sm text-blue-600 hover:text-blue-700 underline"
          >
            {isSignUp ? 'Déjà un compte ? Se connecter' : 'Créer un compte admin'}
          </button>
          <div>
            <a href="/" className="text-sm text-slate-600 hover:text-slate-700">
              Retour au site
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
