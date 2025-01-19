import './App.css';
import TestRoute from './components/TestRoute.jsx';
import Buttons from './components/Buttons.jsx';
import QueryForm from './components/QueryForm.jsx';
import AutoPoller from './components/AutoPoller.jsx';

function App() {
  return (
    <>
      <div className="card">
        <h1>Soccer Data App</h1>
        <AutoPoller />
        <TestRoute />
        <Buttons />
        <QueryForm />
      </div>
    </>
  );
}

export default App;
