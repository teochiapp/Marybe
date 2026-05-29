import React, { createContext, useContext, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { translations } from '../translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const location = useLocation();

    // Detect language from URL
    const isEnglish = location.pathname.startsWith('/eng');
    const currentLanguage = isEnglish ? 'en' : 'es';

    // Function to get translation
    // If Spanish, return the key itself (since Spanish text is in code)
    // If English, return translation from en.js
    const t = (key, fallback = key) => {
        if (currentLanguage === 'es') {
            return fallback; // Return fallback (Spanish text from code)
        }

        // Get English translation
        const keys = key.split('.');
        let value = translations.en;

        for (const k of keys) {
            value = value?.[k];
            if (!value) return fallback;
        }

        return value || fallback;
    };

    const value = useMemo(
        () => ({
            currentLanguage,
            isEnglish,
            t
        }),
        [currentLanguage, isEnglish]
    );

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
};

export default LanguageContext;
