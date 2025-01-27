import { useState, useContext } from 'react';
import { AuthContext } from '../context/authUtils';

const Buttons = () => {
  const [interval, setInterval] = useState('');
  const { token } = useContext(AuthContext);

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
    <div className="flex flex-col space-y-4 p-4">
      <div className="flex items-center space-x-4">
        <input
          type="number"
          value={interval}
          onChange={(e) => setInterval(e.target.value)}
          placeholder="Interval (ms)"
          className="p-2 border rounded"
        />
        <button
          onClick={handleFetchInterval}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Start Interval Fetch
        </button>
        <button
          onClick={handleEndIntervalFetch}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          End Interval Fetch
        </button>
      </div>
    </div>
  );
};

export default Buttons;
