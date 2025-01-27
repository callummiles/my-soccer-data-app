import './App.css';
import Buttons from './components/Buttons.jsx';
import QueryForm from './components/QueryForm.jsx';
import Login from './components/Login.jsx';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/authUtils';

function MainContent() {
  const { isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Soccer Data App</h1>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Logout
        </button>
      </div>
      <Buttons />
      <QueryForm />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}

export default App;
