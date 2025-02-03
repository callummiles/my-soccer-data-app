import { useState, useContext } from 'react';
import { AuthContext } from '../context/authUtils';

const Buttons = () => {
  const [interval, setInterval] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const { token } = useContext(AuthContext);

  const handleFetchInterval = () => {
    const intValue = interval || 10000;
    setIsRunning(true);

    const API_URL = import.meta.env.VITE_API_URL;
    fetch(`${API_URL}/api/fetchInterval?interval=${intValue}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          setIsRunning(false);
          throw new Error(
            `Network response not ok. Status: ${response.status}`
          );
        }
      })
      .catch((error) => {
        setIsRunning(false);
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
        setIsRunning(false);
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
          disabled={isRunning}
          className={`px-4 py-2 rounded text-white ${
            isRunning
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          Start Interval Fetch
        </button>
        <button
          onClick={handleEndIntervalFetch}
          disabled={!isRunning}
          className={`px-4 py-2 rounded text-white ${
            !isRunning
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-red-500 hover:bg-red-600'
          }`}
        >
          End Interval Fetch
        </button>
      </div>

      {/* Status indicator */}
      <div className="flex items-center space-x-2">
        <div
          className={`w-3 h-3 rounded-full ${
            isRunning ? 'bg-green-500' : 'bg-gray-300'
          }`}
        ></div>
        <span className="text-sm text-gray-900">
          {isRunning
            ? 'Interval fetch is running'
            : 'Interval fetch is stopped'}
        </span>
      </div>
    </div>
  );
};

export default Buttons;
