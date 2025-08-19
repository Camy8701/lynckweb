import React, { createContext, useContext, useState } from 'react';

const translations = {
  en: {
    'nav.courses': 'Courses',
    'nav.teachers': 'For Teachers',
    'nav.pricing': 'Pricing',
    'nav.login': 'Login',
    'nav.signup': 'Sign Up',
    'hero.title': 'Create Professional Courses in 30 Minutes with AI',
    'hero.subtitle': 'Transform your expertise into engaging courses with AI-powered content generation and tiered learning experiences.',
    'hero.cta.teach': 'Start Teaching',
    'hero.cta.browse': 'Browse Courses',
    'featured.title': 'Featured Courses',
    'features.ai.title': 'AI Course Generation',
    'features.ai.desc': 'Transform any content into structured courses using advanced AI',
    'features.tiered.title': 'Tiered Learning',
    'features.tiered.desc': 'Foundation, Advanced, and Mastery levels for complete learning',
    'features.multilang.title': 'Multi-language Support',
    'features.multilang.desc': 'Courses available in English, French, and German',
    'pricing.foundation': 'Foundation',
    'pricing.advanced': 'Advanced',
    'pricing.mastery': 'Mastery',
  },
  fr: {
    'nav.courses': 'Cours',
    'nav.teachers': 'Pour Enseignants',
    'nav.pricing': 'Tarifs',
    'nav.login': 'Connexion',
    'nav.signup': 'S\'inscrire',
    'hero.title': 'Créez des Cours Professionnels en 30 Minutes avec l\'IA',
    'hero.subtitle': 'Transformez votre expertise en cours engageants avec la génération de contenu IA et des expériences d\'apprentissage à niveaux.',
    'hero.cta.teach': 'Commencer à Enseigner',
    'hero.cta.browse': 'Parcourir les Cours',
    'featured.title': 'Cours en Vedette',
    'features.ai.title': 'Génération de Cours IA',
    'features.ai.desc': 'Transformez n\'importe quel contenu en cours structurés avec l\'IA avancée',
    'features.tiered.title': 'Apprentissage à Niveaux',
    'features.tiered.desc': 'Niveaux Fondation, Avancé et Maîtrise pour un apprentissage complet',
    'features.multilang.title': 'Support Multi-langues',
    'features.multilang.desc': 'Cours disponibles en anglais, français et allemand',
    'pricing.foundation': 'Fondation',
    'pricing.advanced': 'Avancé',
    'pricing.mastery': 'Maîtrise',
  },
  de: {
    'nav.courses': 'Kurse',
    'nav.teachers': 'Für Lehrer',
    'nav.pricing': 'Preise',
    'nav.login': 'Anmelden',
    'nav.signup': 'Registrieren',
    'hero.title': 'Erstellen Sie professionelle Kurse in 30 Minuten mit KI',
    'hero.subtitle': 'Verwandeln Sie Ihr Fachwissen in ansprechende Kurse mit KI-gestützter Inhaltserstellung und gestuften Lernerfahrungen.',
    'hero.cta.teach': 'Lehren beginnen',
    'hero.cta.browse': 'Kurse durchsuchen',
    'featured.title': 'Empfohlene Kurse',
    'features.ai.title': 'KI-Kurserstellung',
    'features.ai.desc': 'Verwandeln Sie beliebige Inhalte mit fortgeschrittener KI in strukturierte Kurse',
    'features.tiered.title': 'Gestuftes Lernen',
    'features.tiered.desc': 'Grundlagen-, Fortgeschrittenen- und Meisterstufen für vollständiges Lernen',
    'features.multilang.title': 'Mehrsprachiger Support',
    'features.multilang.desc': 'Kurse verfügbar in Englisch, Französisch und Deutsch',
    'pricing.foundation': 'Grundlagen',
    'pricing.advanced': 'Fortgeschritten',
    'pricing.mastery': 'Meisterschaft',
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};