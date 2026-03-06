import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const ALL = 'All';
const OWNED = 'My Notes';
const SHARED = 'Shared with Me';

function NoteCard({ note, userId, user, onDelete, onClick }) {
  const isOwner = note.owner._id === userId;
  const date = new Date(note.updatedAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  // Strip HTML tags for preview
  const preview = note.content
  .replace(/<[^>]+>/g, ' ')     // remove HTML tags
  .replace(/&nbsp;/g, ' ')      // fix &nbsp;
  .replace(/&amp;/g, '&')       // fix &amp;
  .replace(/&lt;/g, '<')        // fix &lt;
  .replace(/&gt;/g, '>')        // fix &gt;
  .replace(/&quot;/g, '"')      // fix &quot;
  .replace(/\s+/g, ' ')         // collapse multiple spaces
  .trim()
  .slice(0, 100) || 'No content yet...';

  const colors = [
    'from-blue-50 to-indigo-50 border-blue-100',
    'from-purple-50 to-pink-50 border-purple-100',
    'from-emerald-50 to-teal-50 border-emerald-100',
    'from-orange-50 to-amber-50 border-orange-100',
    'from-rose-50 to-pink-50 border-rose-100',
    'from-cyan-50 to-blue-50 border-cyan-100',
  ];
  const color = colors[note._id.charCodeAt(0) % colors.length];

  return (
    <div
      onClick={onClick}
      className={`bg-gradient-to-br ${color} border rounded-2xl p-5 flex flex-col gap-3 hover:shadow-lg transition-all duration-200 cursor-pointer group relative`}>

      {/* Header */}
      <div className="flex justify-between items-start gap-2">
        <h2 className="text-base font-bold text-gray-800 line-clamp-1 flex-1 group-hover:text-blue-600 transition-colors">
          {note.title}
        </h2>
        {isOwner && (
          <button
            onClick={e => { e.stopPropagation(); onDelete(note._id); }}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-500 shrink-0 p-1 rounded-lg hover:bg-red-50">
            🗑️
          </button>
        )}
      </div>

      {/* Preview */}
      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{preview}</p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-black/5">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
            {isOwner ? user?.username?.[0]?.toUpperCase() : note.owner.username[0].toUpperCase()}
          </div>
          <span className="text-xs text-gray-400">
            {isOwner ? 'You' : note.owner.username}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {note.collaborators.length > 0 && (
            <span className="text-xs text-blue-500 flex items-center gap-1">
              👥 {note.collaborators.length}
            </span>
          )}
          {!isOwner && (
            <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-medium">
              Shared
            </span>
          )}
          <span className="text-xs text-gray-400">{date}</span>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState(ALL);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fetchNotes = async (q = '') => {
    try {
      const { data } = await api.get(`/notes${q ? `?search=${q}` : ''}`);
      setNotes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
  setLoading(true);
  fetchNotes(); 
}, []);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    fetchNotes(e.target.value);
  };

  const deleteNote = async (id) => {
    if (!window.confirm('Delete this note?')) return;
    await api.delete(`/notes/${id}`);
    fetchNotes(search);
  };

  const filtered = notes.filter(note => {
    if (filter === OWNED) return note.owner._id === user?.id;
    if (filter === SHARED) return note.owner._id !== user?.id;
    return true;
  });

  const filterTabs = [ALL, OWNED, SHARED];

  const getInitial = (name) => name?.[0]?.toUpperCase() || '?';

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xl">📝</span>
            <span className="font-extrabold text-lg text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              CollabNotes
            </span>
          </div>

          {/* Desktop */}
          <div className="hidden sm:flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                {getInitial(user?.username)}
              </div>
              <span className="text-sm font-medium text-gray-700">{user?.username}</span>
            </div>
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="text-sm text-gray-500 hover:text-red-500 transition font-medium flex items-center gap-1">
              Logout
            </button>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="sm:hidden text-gray-500 text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="sm:hidden mt-3 border-t pt-3 flex flex-col gap-3 px-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                {getInitial(user?.username)}
              </div>
              <span className="text-sm font-medium text-gray-700">{user?.username}</span>
            </div>
            <button onClick={() => { logout(); navigate('/'); }}
              className="text-sm text-red-500 text-left font-medium">
              Logout
            </button>
          </div>
        )}
      </nav>

      <div className="max-w-5xl mx-auto p-4 sm:p-6">

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-gray-800">My Workspace</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {notes.length} note{notes.length !== 1 ? 's' : ''} total
          </p>
        </div>

        {/* Search + New Note */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              className="w-full border border-gray-200 bg-white pl-10 pr-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm shadow-sm transition"
              placeholder="Search notes by title or content..."
              value={search}
              onChange={handleSearch} />
          </div>
          <button
            onClick={() => navigate('/notes/new')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap shadow-md hover:shadow-lg transition flex items-center gap-2">
            <span className="text-lg leading-none">+</span> New Note
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {filterTabs.map(tab => (
            <button key={tab} onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                filter === tab
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
              }`}>
              {tab}
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                filter === tab ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                {tab === ALL ? notes.length
                  : tab === OWNED ? notes.filter(n => n.owner._id === user?.id).length
                  : notes.filter(n => n.owner._id !== user?.id).length}
              </span>
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="text-center mt-20">
            <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-gray-400 text-sm mt-3">Loading your notes...</p>
          </div>

        ) : filtered.length === 0 ? (
          <div className="text-center mt-20">
            <div className="text-6xl mb-4">{search ? '🔍' : '📭'}</div>
            <h3 className="text-lg font-bold text-gray-700 mb-1">
              {search ? 'No results found' : 'No notes yet'}
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              {search ? `Nothing matches "${search}"` : filter !== ALL ? 'Try a different filter' : 'Create your first note to get started!'}
            </p>
            {!search && filter === ALL && (
              <button
                onClick={() => navigate('/notes/new')}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition shadow-md">
                + Create First Note
              </button>
            )}
          </div>

        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(note => (
              <NoteCard
                key={note._id}
                note={note}
                userId={user?.id}
                user={user}
                onDelete={deleteNote}
                onClick={() => navigate(`/notes/${note._id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}