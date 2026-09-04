const RECENT_COMMANDS_KEY = 'csm_recent_commands_v1';

export const getRecentCommands = () => {
  try {
    const data = localStorage.getItem(RECENT_COMMANDS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Failed to read recent commands:', err);
    return [];
  }
};

export const addRecentCommand = (commandId) => {
  if (!commandId) return;
  try {
    const list = getRecentCommands().filter((id) => id !== commandId);
    list.unshift(commandId);
    localStorage.setItem(RECENT_COMMANDS_KEY, JSON.stringify(list.slice(0, 6)));
  } catch (err) {
    console.error('Failed to save recent command:', err);
  }
};

export const getStaticCommands = (user, { navigate, toggleTheme, logout, toast }) => [
  // Navigation
  {
    id: 'nav-home',
    title: 'Go to Home',
    category: 'Navigation',
    keywords: ['home', 'feed', 'snippets', 'main'],
    shortcut: '⌘H',
    perform: () => navigate('/'),
  },
  {
    id: 'nav-search',
    title: 'Search Snippets Library',
    category: 'Navigation',
    keywords: ['search', 'find', 'explore', 'library'],
    shortcut: '⌘S',
    perform: () => navigate('/search'),
  },
  {
    id: 'nav-collections',
    title: 'View Collections',
    category: 'Navigation',
    keywords: ['collections', 'folders', 'groups'],
    shortcut: '⌘C',
    perform: () => navigate('/collections'),
  },
  ...(user
    ? [
        {
          id: 'nav-create',
          title: 'Create New Snippet',
          category: 'Actions',
          keywords: ['create', 'new', 'add', 'snippet', 'code'],
          shortcut: '⌘N',
          perform: () => navigate('/create'),
        },
        {
          id: 'nav-profile',
          title: 'View My Profile',
          category: 'Account',
          keywords: ['profile', 'user', 'settings', 'me'],
          shortcut: '⌘P',
          perform: () => navigate('/profile'),
        },
        {
          id: 'nav-favorites',
          title: 'View Favorited Snippets',
          category: 'Actions',
          keywords: ['favorites', 'starred', 'saved', 'bookmarks'],
          shortcut: '⌘F',
          perform: () => navigate('/profile?tab=favorites'),
        },
      ]
    : [
        {
          id: 'nav-login',
          title: 'Sign In / Register',
          category: 'Account',
          keywords: ['login', 'signin', 'register', 'auth'],
          perform: () => navigate('/login'),
        },
      ]),

  // System & Theme
  {
    id: 'sys-theme',
    title: 'Toggle Dark / Light Theme',
    category: 'Preferences',
    keywords: ['theme', 'dark', 'light', 'mode', 'color'],
    shortcut: '⌘T',
    perform: () => {
      toggleTheme();
      toast?.success?.('Theme toggled');
    },
  },
  {
    id: 'sys-copy-url',
    title: 'Copy Current Page URL',
    category: 'Quick Actions',
    keywords: ['copy', 'url', 'link', 'share'],
    perform: () => {
      navigator.clipboard.writeText(window.location.href);
      toast?.success?.('Current page URL copied to clipboard');
    },
  },

  // Logout if user exists
  ...(user
    ? [
        {
          id: 'acc-logout',
          title: 'Sign Out / Logout',
          category: 'Account',
          keywords: ['logout', 'signout', 'exit'],
          perform: async () => {
            await logout();
            navigate('/');
            toast?.success?.('Logged out successfully');
          },
        },
      ]
    : []),
];
