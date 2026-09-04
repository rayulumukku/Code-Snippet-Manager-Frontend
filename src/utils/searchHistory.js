const HISTORY_KEY = 'csm_recent_searches';
const MAX_HISTORY = 8;

export const getRecentSearches = () => {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const addRecentSearch = (query) => {
  if (!query || typeof query !== 'string' || !query.trim()) {
    return getRecentSearches();
  }
  const cleaned = query.trim();

  try {
    const history = getRecentSearches();
    const filtered = history.filter((item) => typeof item === 'string' && item.toLowerCase() !== cleaned.toLowerCase());
    const updated = [cleaned, ...filtered].slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save recent search:', err);
    return [];
  }
};

export const removeRecentSearch = (queryToRemove) => {
  try {
    const history = getRecentSearches();
    const updated = history.filter((item) => item !== queryToRemove);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
};

export const clearRecentSearches = () => {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (err) {
    console.error('Failed to clear search history:', err);
  }
};
