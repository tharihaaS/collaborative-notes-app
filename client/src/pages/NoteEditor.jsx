import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function NoteEditor() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [collaboratorEmail, setCollaboratorEmail] = useState('');
  const [note, setNote] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [showCollabPanel, setShowCollabPanel] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);

  useEffect(() => {
    if (!isNew) {
      api.get(`/notes/${id}`).then(({ data }) => {
        setNote(data);
        setTitle(data.title);
        setContent(data.content);
        setLoading(false);
      }).catch(() => {
        navigate('/dashboard');
      });
    }
  }, [id]);

  const showMsg = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 2500);
  };

  const save = async () => {
    if (!title.trim()) return showMsg('Please add a title', 'error');
    setSaving(true);
    try {
      if (isNew) {
        const { data } = await api.post('/notes', { title, content });
        navigate(`/notes/${data._id}`);
       } else {
  await api.put(`/notes/${id}`, { title, content });
  showMsg('Saved successfully!');
  setNote(prev => ({ ...prev, updatedAt: new Date().toISOString() }));
}

    } catch {
      showMsg('Error saving note', 'error');
    } finally {
      setSaving(false);
    }
  };

  const addCollaborator = async () => {
    if (!collaboratorEmail.trim()) return;
    try {
      const { data } = await api.post(`/notes/${id}/collaborators`, { email: collaboratorEmail });
      setNote(data);
      setCollaboratorEmail('');
      showMsg('Collaborator added!');
    } catch (err) {
      showMsg(err.response?.data?.message || 'User not found', 'error');
    }
  };

  const removeCollaborator = async (userId) => {
    try {
      const { data } = await api.delete(`/notes/${id}/collaborators/${userId}`);
      setNote(data);
      showMsg('Collaborator removed');
    } catch {
      showMsg('Error removing collaborator', 'error');
    }
  };

  const isOwner = note && note.owner._id === user?.id;
  const getInitial = (name) => name?.[0]?.toUpperCase() || '?';

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote', 'code-block'],
      ['link'],
      ['clean'],
    ],
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" />
          <p className="text-gray-400 text-sm">Loading note...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3 sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto flex justify-between items-center gap-3">

          {/* Left */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 transition text-sm font-medium group">
              <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <div className="w-px h-5 bg-gray-200" />
            <div className="flex items-center gap-2">
              <span className="text-lg">📝</span>
              <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 text-sm hidden sm:inline">
                CollabNotes
              </span>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Status message */}
            {message && (
              <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${
                messageType === 'error'
                  ? 'bg-red-50 text-red-500 border border-red-200'
                  : 'bg-green-50 text-green-600 border border-green-200'
              }`}>
                {messageType === 'error' ? '⚠️' : '✅'} {message}
              </span>
            )}

            {/* Collaborators button */}
            {!isNew && isOwner && (
              <button
                onClick={() => setShowCollabPanel(!showCollabPanel)}
                className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl border font-medium transition ${
                  showCollabPanel
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50'
                }`}>
                👥
                <span className="hidden sm:inline">Collaborators</span>
                {note?.collaborators?.length > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                    showCollabPanel ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-600'
                  }`}>
                    {note.collaborators.length}
                  </span>
                )}
              </button>
            )}

            {/* Save button */}
            <button
              onClick={save}
              disabled={saving}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-1.5 rounded-xl text-sm font-semibold transition shadow-md hover:shadow-lg disabled:opacity-60 flex items-center gap-2">
              {saving ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Saving...
                </>
              ) : isNew ? '✨ Create Note' : '💾 Save'}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto w-full p-4 sm:p-6 flex-1 flex gap-6">

        {/* Main Editor */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <input
            className="w-full text-2xl sm:text-3xl font-extrabold border-none outline-none bg-transparent text-gray-800 placeholder-gray-300 mb-4 leading-tight"
            placeholder="Untitled note..."
            value={title}
            onChange={e => setTitle(e.target.value)} />

          {/* Meta info for existing notes */}
          {!isNew && note && (
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                  {getInitial(note.owner.username)}
                </div>
                <span className="text-xs text-gray-400">
                  {isOwner ? 'You' : note.owner.username}
                </span>
              </div>
              <span className="text-gray-200">•</span>
              <span className="text-xs text-gray-400">
                Last edited {new Date(note.updatedAt).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric'
                })}
              </span>
              {note.collaborators?.length > 0 && (
                <>
                  <span className="text-gray-200">•</span>
                  <span className="text-xs text-indigo-400">
                    👥 {note.collaborators.length} collaborator{note.collaborators.length !== 1 ? 's' : ''}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Rich Text Editor */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={quillModules}
              placeholder="Start writing your note..."
              style={{ minHeight: '450px' }} />
          </div>
        </div>

        {/* Collaborator Side Panel — desktop */}
        {showCollabPanel && !isNew && isOwner && (
          <div className="hidden sm:flex flex-col w-72 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 text-sm">👥 Collaborators</h3>
                <button onClick={() => setShowCollabPanel(false)}
                  className="text-gray-300 hover:text-gray-500 text-lg leading-none">✕</button>
              </div>

              {/* Add collaborator */}
              <div className="mb-4">
                <input
                  className="w-full border border-gray-200 px-3 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 outline-none mb-2"
                  placeholder="Email address"
                  value={collaboratorEmail}
                  onChange={e => setCollaboratorEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCollaborator()} />
                <button
                  onClick={addCollaborator}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl text-sm font-semibold transition">
                  + Add Collaborator
                </button>
              </div>

              {/* Collaborator list */}
              {note.collaborators?.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-3xl mb-2">👤</p>
                  <p className="text-xs text-gray-400">No collaborators yet</p>
                  <p className="text-xs text-gray-300 mt-1">Add someone by email</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {note.collaborators.map(c => (
                    <div key={c._id}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition group">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {getInitial(c.username)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-700 truncate">{c.username}</p>
                        <p className="text-xs text-gray-400 truncate">{c.email}</p>
                      </div>
                      <button
                        onClick={() => removeCollaborator(c._id)}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition text-xs shrink-0">
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Collaborator Panel — mobile bottom sheet */}
      {showCollabPanel && !isNew && isOwner && (
        <div className="sm:hidden fixed inset-0 z-30 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowCollabPanel(false)} />
          <div className="relative bg-white rounded-t-3xl p-5 shadow-2xl">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">👥 Collaborators</h3>
              <button onClick={() => setShowCollabPanel(false)}
                className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="flex gap-2 mb-4">
              <input
                className="flex-1 border border-gray-200 px-3 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                placeholder="Email address"
                value={collaboratorEmail}
                onChange={e => setCollaboratorEmail(e.target.value)} />
              <button onClick={addCollaborator}
                className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold">
                Add
              </button>
            </div>
            {note.collaborators?.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-4">No collaborators yet</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {note.collaborators.map(c => (
                  <div key={c._id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold">
                      {getInitial(c.username)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">{c.username}</p>
                      <p className="text-xs text-gray-400">{c.email}</p>
                    </div>
                    <button onClick={() => removeCollaborator(c._id)}
                      className="text-red-400 hover:text-red-600 text-sm">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}