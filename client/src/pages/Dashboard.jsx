import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const ALL = 'All';
const OWNED = 'My Notes';
const SHARED = 'Shared with Me';

export default function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState(ALL);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fetchNotes = async (q = '') => {
    const { data } = await api.get(`/notes${q ? `?search=${q}` : ''}`);
    setNotes(data);
  };

  useEffect(() => { fetchNotes(); }, []);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-lg sm:text-xl font-bold text-blue-600">📝 CollabNotes</h1>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-4">
            <span className="text-sm text-gray-600">Hi, {user?.username}</span>
            <button onClick={logout} className="text-sm text-red-500 hover:underline">Logout</button>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="sm:hidden text-gray-500 text-2xl">
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="sm:hidden mt-3 border-t pt-3 flex flex-col gap-2 px-4">
            <span className="text-sm text-gray-600">Hi, {user?.username}</span>
            <button onClick={logout} className="text-sm text-red-500 text-left">Logout</button>
          </div>
        )}
      </nav>

      <div className="max-w-4xl mx-auto p-4 sm:p-6">

        {/* Search + New Note */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            className="flex-1 border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            placeholder="🔍 Search notes..."
            value={search} onChange={handleSearch} />
          <button onClick={() => navigate('/notes/new')}
            className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 font-medium whitespace-nowrap">
            + New Note
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {filterTabs.map(tab => (
            <button key={tab} onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition border ${
                filter === tab
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
              }`}>
              {tab}
              <span className="ml-1.5 text-xs opacity-70">
                ({tab === ALL ? notes.length
                  : tab === OWNED ? notes.filter(n => n.owner._id === user?.id).length
                  : notes.filter(n => n.owner._id !== user?.id).length})
              </span>
            </button>
          ))}
        </div>

        {/* Notes Grid */}
        {filtered.length === 0 ? (
          <div className="text-center mt-16 text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-lg font-medium">No notes found</p>
            <p className="text-sm mt-1">
              {filter !== ALL ? 'Try a different filter' : 'Create your first note!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map(note => (
              <div key={note._id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-2 hover:shadow-md transition cursor-pointer"
                onClick={() => navigate(`/notes/${note._id}`)}>

                <div className="flex justify-between items-start">
                  <h2 className="text-base font-semibold text-gray-800 line-clamp-1 flex-1">{note.title}</h2>
                  {note.owner._id === user?.id && (
                    <button
                      onClick={e => { e.stopPropagation(); deleteNote(note._id); }}
                      className="text-red-400 hover:text-red-600 text-xs ml-2 shrink-0">
                      🗑️
                    </button>
                  )}
                </div>

                <p className="text-xs text-gray-400">
                  {note.owner._id === user?.id ? '👤 You' : `👤 ${note.owner.username}`}
                  {' · '}
                  {new Date(note.updatedAt).toLocaleDateString()}
                </p>

                {note.collaborators.length > 0 && (
                  <p className="text-xs text-blue-400">
                    👥 {note.collaborators.map(c => c.username).join(', ')}
                  </p>
                )}

                {note.owner._id !== user?.id && (
                  <span className="self-start text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">
                    Shared
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}