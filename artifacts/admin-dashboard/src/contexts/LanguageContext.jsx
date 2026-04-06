import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { translations } from "@/i18n/translations";
const LanguageContext = createContext({
    language: "en",
    setLanguage: () => { },
    t: (key) => key,
});
export function LanguageProvider({ children }) {
    const [language, setLanguageState] = useState(() => {
        const stored = localStorage.getItem("dashboard_language");
        return stored && translations[stored] ? stored : "en";
    });
    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch("/api/settings/general");
                if (res.ok) {
                    const data = await res.json();
                    const lang = data["language"];
                    if (lang && translations[lang]) {
                        setLanguageState(lang);
                        localStorage.setItem("dashboard_language", lang);
                    }
                }
            }
            catch {
                // silently fall back to localStorage value
            }
        };
        load();
    }, []);
    const setLanguage = useCallback((lang) => {
        setLanguageState(lang);
        localStorage.setItem("dashboard_language", lang);
    }, []);
    const t = useCallback((key) => {
        return translations[language]?.[key] ?? translations["en"][key] ?? key;
    }, [language]);
    return (<LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>);
}
export function useLanguage() {
    return useContext(LanguageContext);
}
