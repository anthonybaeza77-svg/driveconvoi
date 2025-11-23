import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Loader2, Plus, Trash2 } from 'lucide-react';

interface FooterSection {
  id: string;
  section: string;
  title: string;
  items: any;
  updated_at: string;
}

export default function FooterManager() {
  const [sections, setSections] = useState<FooterSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadFooterContent();
  }, []);

  const loadFooterContent = async () => {
    const { data, error } = await supabase
      .from('footer_content')
      .select('*')
      .order('section');

    if (error) {
      console.error('Error loading footer:', error);
      setMessage('Erreur lors du chargement');
    } else {
      setSections(data || []);
    }
    setLoading(false);
  };

  const updateSection = (sectionName: string, field: string, value: any) => {
    setSections(sections.map(s =>
      s.section === sectionName ? { ...s, [field]: value } : s
    ));
  };

  const updateSectionItems = (sectionName: string, newItems: any) => {
    setSections(sections.map(s =>
      s.section === sectionName ? { ...s, items: newItems } : s
    ));
  };

  const addArrayItem = (sectionName: string) => {
    const section = sections.find(s => s.section === sectionName);
    if (section && Array.isArray(section.items)) {
      updateSectionItems(sectionName, [...section.items, '']);
    }
  };

  const removeArrayItem = (sectionName: string, index: number) => {
    const section = sections.find(s => s.section === sectionName);
    if (section && Array.isArray(section.items)) {
      const newItems = section.items.filter((_, i) => i !== index);
      updateSectionItems(sectionName, newItems);
    }
  };

  const updateArrayItem = (sectionName: string, index: number, value: string) => {
    const section = sections.find(s => s.section === sectionName);
    if (section && Array.isArray(section.items)) {
      const newItems = [...section.items];
      newItems[index] = value;
      updateSectionItems(sectionName, newItems);
    }
  };

  const saveChanges = async () => {
    setSaving(true);
    setMessage('');

    try {
      for (const section of sections) {
        const { error } = await supabase
          .from('footer_content')
          .update({
            title: section.title,
            items: section.items,
            updated_at: new Date().toISOString()
          })
          .eq('section', section.section);

        if (error) throw error;
      }

      setMessage('Modifications enregistrées avec succès !');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving:', error);
      setMessage('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
      </div>
    );
  }

  const companySection = sections.find(s => s.section === 'company');
  const servicesSection = sections.find(s => s.section === 'services');
  const aboutSection = sections.find(s => s.section === 'about');
  const contactSection = sections.find(s => s.section === 'contact');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Gestion du pied de page</h2>
        <button
          onClick={saveChanges}
          disabled={saving}
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Enregistrer
            </>
          )}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.includes('Erreur') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message}
        </div>
      )}

      <div className="grid gap-6">
        {companySection && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Informations entreprise</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nom de l'entreprise</label>
                <input
                  type="text"
                  value={companySection.title}
                  onChange={(e) => updateSection('company', 'title', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea
                  value={companySection.items.description || ''}
                  onChange={(e) => updateSectionItems('company', { description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {servicesSection && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Services</h3>
              <button
                onClick={() => addArrayItem('services')}
                className="flex items-center gap-2 text-slate-900 hover:text-slate-800 text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Ajouter
              </button>
            </div>
            <div className="space-y-3">
              {Array.isArray(servicesSection.items) && servicesSection.items.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateArrayItem('services', index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => removeArrayItem('services', index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {aboutSection && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900">À propos</h3>
              <button
                onClick={() => addArrayItem('about')}
                className="flex items-center gap-2 text-slate-900 hover:text-slate-800 text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Ajouter
              </button>
            </div>
            <div className="space-y-3">
              {Array.isArray(aboutSection.items) && aboutSection.items.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateArrayItem('about', index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => removeArrayItem('about', index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {contactSection && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Contact</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Téléphone</label>
                <input
                  type="text"
                  value={contactSection.items.phone || ''}
                  onChange={(e) => updateSectionItems('contact', { ...contactSection.items, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  value={contactSection.items.email || ''}
                  onChange={(e) => updateSectionItems('contact', { ...contactSection.items, email: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Adresse</label>
                <textarea
                  value={contactSection.items.address || ''}
                  onChange={(e) => updateSectionItems('contact', { ...contactSection.items, address: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
