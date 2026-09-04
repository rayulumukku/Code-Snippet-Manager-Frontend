import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { snippetsAPI, favoritesAPI } from '../services/api';
import SnippetCard from '../components/SnippetCard';
import { FiFileText, FiGlobe, FiEye, FiHeart, FiCode, FiBookmark } from 'react-icons/fi';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');

  const [snippets, setSnippets] = useState([]);
  const [favoriteSnippets, setFavoriteSnippets] = useState([]);
  const [loadingSnippets, setLoadingSnippets] = useState(true);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [stats, setStats] = useState({ total: 0, public: 0, totalViews: 0, totalLikes: 0 });
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ username: '', bio: '', website: '', githubUrl: '', currentPassword: '', newPassword: '' });
  const [activeTab, setActiveTab] = useState(
    tabParam === 'favorites' || tabParam === 'settings' ? tabParam : 'snippets'
  ); // 'snippets' | 'favorites' | 'settings'

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['snippets', 'favorites', 'settings'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    document.title = 'My Profile | Code Snippet Manager';
    if (user) {
      setForm({ username: user.username, bio: user.bio || '', website: user.website || '', githubUrl: user.githubUrl || '', currentPassword: '', newPassword: '' });
    }
  }, [user]);

  useEffect(() => {
    fetchMySnippets();
  }, []);

  useEffect(() => {
    if (activeTab === 'favorites') {
      fetchFavorites();
    }
  }, [activeTab]);

  const fetchMySnippets = async () => {
    try {
      const res = await snippetsAPI.getMy({ limit: 50 });
      const snips = res.data.snippets;
      setSnippets(snips);
      const totalViews = snips.reduce((acc, s) => acc + (s.views || 0), 0);
      const totalLikes = snips.reduce((acc, s) => acc + (s.likeCount || 0), 0);
      const publicCount = snips.filter(s => s.isPublic).length;
      setStats({ total: res.data.total, public: publicCount, totalViews, totalLikes });
    } catch (err) {
      console.error('Failed to fetch snippets:', err);
    } finally {
      setLoadingSnippets(false);
    }
  };

  const fetchFavorites = async () => {
    setLoadingFavorites(true);
    try {
      const res = await favoritesAPI.getFavorites({ limit: 50 });
      setFavoriteSnippets(res.data.snippets || []);
    } catch (err) {
      console.error('Failed to fetch favorites:', err);
    } finally {
      setLoadingFavorites(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {};
      if (form.username !== user.username) payload.username = form.username;
      if (form.bio !== (user.bio || '')) payload.bio = form.bio;
      if (form.website !== (user.website || '')) payload.website = form.website;
      if (form.githubUrl !== (user.githubUrl || '')) payload.githubUrl = form.githubUrl;
      if (form.newPassword) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword = form.newPassword;
      }
      await updateProfile(payload);
      toast.success('Profile updated!');
      setForm(f => ({ ...f, currentPassword: '', newPassword: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const avatarInitials = user?.username?.slice(0, 2).toUpperCase() || '??';

  const statCards = [
    { label: 'Total Snippets', value: stats.total, icon: <FiFileText className="text-2xl text-custom-orangered mx-auto" /> },
    { label: 'Public', value: stats.public, icon: <FiGlobe className="text-2xl text-emerald-500 mx-auto" /> },
    { label: 'Total Views', value: stats.totalViews, icon: <FiEye className="text-2xl text-sky-500 mx-auto" /> },
    { label: 'Total Likes', value: stats.totalLikes, icon: <FiHeart className="text-2xl text-red-500 mx-auto" /> },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Profile header */}
      <div className="bg-white dark:bg-custom-dark-card border border-slate-200 dark:border-custom-dark-border rounded-2xl p-6 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-orange-500/20 shrink-0">
            {avatarInitials}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">@{user?.username}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{user?.email}</p>
            {user?.bio && <p className="text-slate-600 dark:text-slate-300 mt-2">{user.bio}</p>}
            <div className="flex flex-wrap gap-3 mt-3">
              {user?.website && (
                <a href={user.website.startsWith('http') ? user.website : `https://${user.website}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm text-custom-orangered hover:underline">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></svg>
                  {user.website}
                </a>
              )}
              {user?.githubUrl && (
                <a href={user.githubUrl.startsWith('http') ? user.githubUrl : `https://github.com/${user.githubUrl}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300 hover:underline">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>
                  GitHub
                </a>
              )}
            </div>
          </div>
          <button
            onClick={() => setActiveTab('settings')}
            className="btn-secondary text-sm shrink-0 self-start"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
            Edit Profile
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {statCards.map(s => (
          <div key={s.label} className="bg-white dark:bg-custom-dark-card border border-slate-200 dark:border-custom-dark-border rounded-2xl p-4 text-center shadow-sm">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-custom-dark-surface rounded-xl w-fit mb-6">
        <button
          onClick={() => setActiveTab('snippets')}
          className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'snippets'
              ? 'bg-white dark:bg-custom-dark-card text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          My Snippets ({stats.total})
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'favorites'
              ? 'bg-white dark:bg-custom-dark-card text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <FiBookmark className="w-4 h-4 text-amber-500" />
          Favorites ({favoriteSnippets.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'settings'
              ? 'bg-white dark:bg-custom-dark-card text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          Settings
        </button>
      </div>

      {/* Snippets tab */}
      {activeTab === 'snippets' && (
        <div>
          {loadingSnippets ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-32 rounded-2xl bg-slate-100 dark:bg-custom-dark-surface animate-pulse" />)}
            </div>
          ) : snippets.length === 0 ? (
            <div className="text-center py-20 animate-fade-in">
              <div className="flex justify-center text-slate-300 dark:text-slate-600 mb-4">
                <FiCode className="text-6xl" />
              </div>
              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No snippets yet</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">Create your first snippet to get started</p>
              <Link to="/create" className="btn-primary">Create Snippet</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {snippets.map(s => (
                <SnippetCard key={s._id} snippet={s} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Favorites tab */}
      {activeTab === 'favorites' && (
        <div>
          {loadingFavorites ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-32 rounded-2xl bg-slate-100 dark:bg-custom-dark-surface animate-pulse" />)}
            </div>
          ) : favoriteSnippets.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-custom-dark-card border border-slate-200 dark:border-custom-dark-border rounded-3xl animate-fade-in">
              <div className="flex justify-center text-amber-400 mb-4">
                <FiBookmark className="text-6xl" />
              </div>
              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No favorite snippets</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">Click the bookmark icon on any snippet to save it to your favorites</p>
              <Link to="/search" className="btn-primary">Browse Snippets</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {favoriteSnippets.map(s => (
                <SnippetCard key={s._id} snippet={s} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Settings tab */}
      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-custom-dark-card border border-slate-200 dark:border-custom-dark-border rounded-2xl p-6 shadow-sm animate-fade-in">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Edit Profile</h2>
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Username</label>
                <input className="input-style" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="username" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Website</label>
                <input className="input-style" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://yoursite.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Bio <span className="text-slate-400 font-normal text-xs">(max 300 chars)</span></label>
              <textarea className="input-style resize-none" rows={3} maxLength={300} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Tell the world about yourself..." />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">GitHub Username or URL</label>
              <input className="input-style" value={form.githubUrl} onChange={e => setForm(f => ({ ...f, githubUrl: e.target.value }))} placeholder="your-github-username" />
            </div>

            <div className="border-t border-slate-100 dark:border-custom-dark-border pt-4">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Change Password <span className="text-slate-400 font-normal">(leave blank to keep current)</span></h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Current Password</label>
                  <input type="password" className="input-style" value={form.currentPassword} onChange={e => setForm(f => ({ ...f, currentPassword: e.target.value }))} placeholder="Current password" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">New Password</label>
                  <input type="password" className="input-style" value={form.newPassword} onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))} placeholder="New password (min 8 chars)" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setActiveTab('snippets')} className="btn-secondary text-sm">Cancel</button>
              <button type="submit" disabled={saving} id="profile-save" className="btn-primary text-sm">
                {saving ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
                ) : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;
