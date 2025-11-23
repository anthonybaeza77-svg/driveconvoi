import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface FooterSection {
  section: string;
  title: string;
  items: any;
}

export default function Footer() {
  const [sections, setSections] = useState<FooterSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFooterContent();
  }, []);

  const loadFooterContent = async () => {
    const { data, error } = await supabase
      .from('footer_content')
      .select('section, title, items')
      .order('section');

    if (!error && data) {
      setSections(data);
    }
    setLoading(false);
  };

  if (loading) {
    return null;
  }

  const company = sections.find(s => s.section === 'company');
  const services = sections.find(s => s.section === 'services');
  const about = sections.find(s => s.section === 'about');
  const contact = sections.find(s => s.section === 'contact');

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img src="/CaptureLogoVoiture.png" alt="Convoy-Auto Logo" className="h-10 w-auto" />
              <span className="text-xl font-bold text-white">
                {company?.title || 'Convoy-Auto'}
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              {company?.items?.description || 'Service professionnel de convoyage de véhicules pour concessions et agences de location.'}
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">{services?.title || 'Services'}</h3>
            <ul className="space-y-2 text-sm">
              {services && Array.isArray(services.items) && services.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">{about?.title || 'À propos'}</h3>
            <ul className="space-y-2 text-sm">
              {about && Array.isArray(about.items) && about.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">{contact?.title || 'Contact'}</h3>
            <ul className="space-y-3 text-sm">
              {contact?.items?.phone && (
                <li className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-blue-400" />
                  {contact.items.phone}
                </li>
              )}
              {contact?.items?.email && (
                <li className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-blue-400" />
                  {contact.items.email}
                </li>
              )}
              {contact?.items?.address && (
                <li className="flex items-start">
                  <MapPin className="w-4 h-4 mr-2 text-blue-400 mt-1" />
                  <span style={{ whiteSpace: 'pre-line' }}>{contact.items.address}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm">&copy; {new Date().getFullYear()} Convoy-Auto. Tous droits réservés.</p>
            <a
              href="/admin/login"
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Admin
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
