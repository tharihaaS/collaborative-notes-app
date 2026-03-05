import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex flex-col">
      
      {/* Navbar */}
      <nav className="flex justify-between items-center px-6 sm:px-12 py-5">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📝</span>
          <span className="text-white font-bold text-xl">CollabNotes</span>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/login')}
            className="text-white text-sm font-medium hover:underline px-3 py-1.5">
            Login
          </button>
          <button onClick={() => navigate('/register')}
            className="bg-white text-blue-600 text-sm font-medium px-4 py-1.5 rounded-full hover:bg-blue-50 transition">
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 sm:px-12 py-16">
        
        <div className="bg-white/10 text-white text-xs font-medium px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
          ✨ Collaborative Note Taking — Reimagined
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white leading-tight max-w-3xl">
          Take Notes Together,{' '}
          <span className="text-yellow-300">Achieve More</span>
        </h1>

        <p className="text-blue-100 mt-6 text-base sm:text-lg max-w-xl leading-relaxed">
          CollabNotes lets you write, organize, and share notes with your team in real time.
          Powerful editing, smart search, and seamless collaboration — all in one place.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-10">
          <button onClick={() => navigate('/register')}
            className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-3.5 rounded-full text-base transition shadow-lg hover:shadow-xl">
            🚀 Get Started — It's Free
          </button>
          <button onClick={() => navigate('/login')}
            className="bg-white/10 hover:bg-white/20 text-white font-medium px-8 py-3.5 rounded-full text-base transition backdrop-blur-sm border border-white/20">
            Login to Your Account
          </button>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 max-w-3xl w-full">
          {[
            { icon: '✏️', title: 'Rich Text Editor', desc: 'Format your notes with bold, lists, headings and more' },
            { icon: '👥', title: 'Collaborate', desc: 'Invite teammates to view and edit your notes together' },
            { icon: '🔍', title: 'Smart Search', desc: 'Find any note instantly with full-text search' },
          ].map(feature => (
            <div key={feature.title}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 text-left hover:bg-white/20 transition">
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="text-white font-semibold text-base mb-1">{feature.title}</h3>
              <p className="text-blue-100 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-blue-200 text-xs py-6">
        © 2026 CollabNotes. Built with ❤️ using MERN Stack.
      </footer>
    </div>
  );
}