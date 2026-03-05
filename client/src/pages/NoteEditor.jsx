import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
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

  useEffect(() => {
    if (!isNew) {
      api.get(`/notes/${id}`).then(({ data }) => {
        setNote(data);
        setTitle(data.title);
        setContent(data.content);
      });
    }
  }, [id]);

  const showMsg = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 2500);
  };

  const save = async () => {
    try {
      if (isNew) {
        const { data } = await api.post('/notes', { title, content });
        navigate(`/notes/${data._id}`);
      } else {
        await api.put(`/notes/${id}`, { title, content });
        showMsg('✅ Saved!');
      }
    } catch {
      showMsg('❌ Error saving', 'error');
    }
  };

  const addCollaborator = async () => {
    try {
      const { data } = await api.post(`/notes/${id}/collaborators`, { email: collaboratorEmail });
      setNote(data);
      setCollaboratorEmail('');
      showMsg('✅ Collaborator added!');
    } catch (err) {
      showMsg(err.response?.data?.message || '❌ Error', 'error');
    }
  };

  const removeCollaborator = async (userId) => {
    const { data } = await api.delete(`/notes/${id}/collaborators/${userId}`);
    setNote(data);
    showMsg('Collaborator removed');
  };

  const isOwner = note && note.owner._id === user?.id;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow px-4 sm:px-6 py-4 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex justify-between items-center flex-wrap gap-2">
          <button onClick={() => navigate('/')} className="text-blue-600 hover:underline text-sm font-medium">
            ← Back
          </button>
          <div className="flex items-center gap-2 flex-wrap">
            {message && (
              <span className={`text-sm ${messageType === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                {message}
              </span>
            )}
            {!isNew && isOwner && (
              <button onClick={() => setShowCollabPanel(!showCollabPanel)}
                className="text-sm border border-blue-300 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition">
                👥 Collaborators {note?.collaborators?.length > 0 ? `(${note.collaborators.length})` : ''}
              </button>
            )}
            <button onClick={save}
              className="bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 text-sm font-medium transition">
              {isNew ? 'Create' : 'Save'}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto p-4 sm:p-6">
        {/* Title */}
        <input
          className="w-full text-2xl sm:text-3xl font-bold border-b-2 border-gray-200 pb-3 mb-4 outline-none bg-transparent focus:border-blue-400 transition"
          placeholder="Note title..."
          value={title}
          onChange={e => setTitle(e.target.value)} />

        {/* Rich Text Editor */}
        <div className="bg-white rounded-xl overflow-hidden shadow-sm">
          <ReactQuill theme="snow" value={content} onChange={setContent}
            style={{ minHeight: '350px' }} />
        </div>

        {/* Collaborator Panel */}
        {showCollabPanel && !isNew && isOwner && (
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-800 mb-4">👥 Manage Collaborators</h3>

            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <input
                className="flex-1 border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-sm"
                placeholder="Enter collaborator's email"
                value={collaboratorEmail}
                onChange={e => setCollaboratorEmail(e.target.value)} />
              <button onClick={addCollaborator}
                className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 text-sm font-medium whitespace-nowrap">
                Add
              </button>
            </div>

            {note.collaborators?.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No collaborators yet</p>
            ) : (
              <div className="divide-y">
                {note.collaborators.map(c => (
                  <div key={c._id} className="flex justify-between items-center py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">{c.username}</p>
                      <p className="text-xs text-gray-400">{c.email}</p>
                    </div>
                    <button onClick={() => removeCollaborator(c._id)}
                      className="text-xs text-red-400 hover:text-red-600 border border-red-200 px-2 py-1 rounded hover:bg-red-50 transition">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}