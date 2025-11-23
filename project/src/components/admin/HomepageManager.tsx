import { useState, useEffect } from 'react';
import { supabase, HomepageContent } from '../../lib/supabase';
import { Save, Loader2, Check, AlertCircle } from 'lucide-react';

export default function HomepageManager() {
  const [contents, setContents] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from('homepage_content')
        .select('*');

      if (error) throw error;

      const contentMap: Record<string, string> = {};
      data?.forEach((item: HomepageContent) => {
        contentMap[item.section_key] = item.content;
      });
      setContents(contentMap);
    } catch (err) {
      setError('Erreur lors du chargement du contenu');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      for (const [key, value] of Object.entries(contents)) {
        const { error } = await supabase
          .from('homepage_content')
          .upsert({
            section_key: key,
            content: value,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'section_key'
          });

        if (error) throw error;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const updateContent = (key: string, value: string) => {
    setContents(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Section Hero</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Titre principal
            </label>
            <input
              type="text"
              value={contents.hero_title || ''}
              onChange={(e) => updateContent('hero_title', e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Sous-titre
            </label>
            <textarea
              value={contents.hero_subtitle || ''}
              onChange={(e) => updateContent('hero_subtitle', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Texte du bouton
            </label>
            <input
              type="text"
              value={contents.hero_cta || ''}
              onChange={(e) => updateContent('hero_cta', e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          <Check className="w-5 h-5 flex-shrink-0" />
          <p>Modifications enregistrées avec succès</p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Enregistrer les modifications
            </>
          )}
        </button>
      </div>
    </div>
  );
}
