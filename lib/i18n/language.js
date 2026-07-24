import { translations } from "./translations";

export const defaultLanguage = "ru";

export const supportedLanguages = ["ru", "en", "tr", "et"];

export function normalizeLanguage(language) {
  if (!language) return defaultLanguage;

  const shortLanguage = String(language).toLowerCase().slice(0, 2);

  if (supportedLanguages.includes(shortLanguage)) {
    return shortLanguage;
  }

  return defaultLanguage;
}

export function getSavedLanguage() {
  if (typeof window === "undefined") return defaultLanguage;

  const savedLanguage = window.localStorage.getItem("pgm_language");
  return normalizeLanguage(savedLanguage);
}

export function saveLanguage(language) {
  if (typeof window === "undefined") return;

  const normalizedLanguage = normalizeLanguage(language);
  window.localStorage.setItem("pgm_language", normalizedLanguage);
}

export function getLanguageName(language) {
  const normalizedLanguage = normalizeLanguage(language);
  return translations[normalizedLanguage]?.language_name || "Русский";
}

export function createTranslator(language) {
  const normalizedLanguage = normalizeLanguage(language);

  return function t(key) {
    return (
      translations[normalizedLanguage]?.[key] ||
      translations[defaultLanguage]?.[key] ||
      key
    );
  };
}
