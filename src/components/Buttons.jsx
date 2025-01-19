import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Buttons = () => {
  const [interval, setInterval] = useState('');
  const [message, setMessage] = useState('');
  const { token } = useContext(AuthContext);

  const handleFetchOnce = async () => {
    try {
      await fetch('/api/fetchOnce', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setMessage('Data fetched successfully');
    } catch (error) {
      console.error('Error fetching once:', error);
      setMessage('Error fetching data');
    }
  };

  const handleStartInterval = async () => {
    try {
      await fetch('/api/startInterval', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ interval })
      });
      setMessage('Interval fetch started');
    } catch (error) {
      console.error('Error starting interval fetch:', error);
      setMessage('Error starting interval fetch');
    }
  };

  const handleStopInterval = async () => {
    try {
      await fetch('/api/stopInterval', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setMessage('Interval fetch stopped');
    } catch (error) {
      console.error('Error stopping interval fetch:', error);
      setMessage('Error stopping interval fetch');
    }
  };

  return (
    <div>
      <button onClick={handleFetchOnce}>Fetch Once</button>
      <div>
        <input
          type="number"
          placeholder="Enter int (ms)"
          value={interval}
          onChange={(e) => setInterval(e.target.value)}
        />
        <button onClick={handleStartInterval}>Fetch Interval</button>
      </div>
      <button onClick={handleStopInterval}>Stop Interval Fetch</button>
      <p>{message}</p>
    </div>
  );
};

export default Buttons;
