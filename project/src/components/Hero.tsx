import { useState, useEffect } from 'react';
import { supabase, HomepageContent } from '../lib/supabase';
import { Car, Shield, Clock, Award } from 'lucide-react';

export default function Hero() {
  const [content, setContent] = useState({
    hero_title: 'Service de Convoyage Professionnel',
    hero_subtitle: 'Faites confiance à nos experts pour le transport sécurisé de votre véhicule partout en France',
    hero_cta: 'Demander un devis gratuit',
  });

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    const { data } = await supabase
      .from('homepage_content')
      .select('*');

    if (data) {
      const contentMap: Record<string, string> = {};
      data.forEach((item: HomepageContent) => {
        contentMap[item.section_key] = item.content;
      });
      setContent(prev => ({ ...prev, ...contentMap }));
    }
  };

  const scrollToForm = () => {
    const formElement = document.getElementById('quote-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            {content.hero_title}
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-8">
            {content.hero_subtitle}
          </p>
          <button
            onClick={scrollToForm}
            className="px-8 py-4 bg-white text-slate-900 rounded-lg font-semibold hover:bg-slate-100 transition-all shadow-lg hover:shadow-xl"
          >
            {content.hero_cta}
          </button>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mt-16">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all">
            <div className="bg-white/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Sécurisé</h3>
            <p className="text-sm text-slate-300">Assurance tous risques incluse</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all">
            <div className="bg-white/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Rapide</h3>
            <p className="text-sm text-slate-300">Intervention sous 24-48h</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all">
            <div className="bg-white/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Car className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Tous véhicules</h3>
            <p className="text-sm text-slate-300">Citadines aux véhicules de luxe</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all">
            <div className="bg-white/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Award className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Expérimenté</h3>
            <p className="text-sm text-slate-300">Chauffeurs professionnels</p>
          </div>
        </div>
      </div>
    </div>
  );
}
