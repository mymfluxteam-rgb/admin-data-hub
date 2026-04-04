import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { translations, type Language, type TranslationKey } from "@/i18n/translations";

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: "en",
  setLanguage: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem("dashboard_language") as Language | null;
    return stored && translations[stored] ? stored : "en";
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/settings/general");
        if (res.ok) {
          const data = await res.json() as Record<string, unknown>;
          const lang = data["language"] as Language | undefined;
          if (lang && translations[lang]) {
            setLanguageState(lang);
            localStorage.setItem("dashboard_language", lang);
          }
        }
      } catch {
        // silently fall back to localStorage value
      }
    };
    load();
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("dashboard_language", lang);
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      return translations[language]?.[key] ?? translations["en"][key] ?? key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
