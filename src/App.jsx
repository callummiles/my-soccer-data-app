import './App.css';
import TestRoute from './components/TestRoute.jsx';
import Buttons from './components/Buttons.jsx';
import QueryForm from './components/QueryForm.jsx';
import AutoPoller from './components/AutoPoller.jsx';
import Login from './components/Login.jsx';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/authUtils';

function MainContent() {
  const { isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Soccer Data App</h1>
        <button onClick={logout} style={{ padding: '0.5rem 1rem' }}>
          Logout
        </button>
      </div>
      <AutoPoller />
      <TestRoute />
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
