import { useState, useContext } from 'react';
import { AuthContext } from '../context/authUtils';

const Buttons = () => {
  const [interval, setInterval] = useState('');
  const { token } = useContext(AuthContext);

  const handleFetchOnce = () => {
    const API_URL = import.meta.env.VITE_API_URL;
    fetch(`${API_URL}/api/fetchOnce`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response not ok.');
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  };

  const handleFetchInterval = () => {
    const intValue = interval || 10000;

    const API_URL = import.meta.env.VITE_API_URL;
    fetch(`${API_URL}/api/fetchInterval?interval=${intValue}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Network response not ok. Status: ${response.status}`
          );
        }
      })
      .catch((error) => {
        console.error('Error starting interval fetch:', error);
      });
  };

  const handleEndIntervalFetch = () => {
    const API_URL = import.meta.env.VITE_API_URL;
    fetch(`${API_URL}/api/endIntervalFetch`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response not ok.');
        }
      })
      .catch((error) => {
        console.error('Error ending interval fetch:', error);
      });
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
        <button onClick={handleFetchInterval}>Fetch Interval</button>
      </div>
      <button onClick={handleEndIntervalFetch}>End Interval Fetch</button>
    </div>
  );
};

export default Buttons;
