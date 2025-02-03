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
    <div className="flex flex-col space-y-4">
      <div className="flex items-center space-x-4">
        <input
          type="number"
          value={interval}
          onChange={(e) => setInterval(e.target.value)}
          placeholder="Interval (ms)"
          className="px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          onClick={handleFetchInterval}
          disabled={isRunning}
          className={`px-4 py-2 rounded-md text-white ${
            isRunning
              ? 'bg-gray-700 cursor-not-allowed'
              : 'bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          }`}
        >
          Start Interval Fetch
        </button>
        <button
          onClick={handleEndIntervalFetch}
          disabled={!isRunning}
          className={`px-4 py-2 rounded-md text-white ${
            !isRunning
              ? 'bg-gray-700 cursor-not-allowed'
              : 'bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          }`}
        >
          End Interval Fetch
        </button>
      </div>
      <div className="flex items-center space-x-2">
        <div
          className={`w-3 h-3 rounded-full ${
            isRunning ? 'bg-green-500' : 'bg-gray-400'
          }`}
        ></div>
        <span className="text-sm text-white">
          {isRunning
            ? 'Interval fetch is running'
            : 'Interval fetch is stopped'}
        </span>
      </div>
    </div>
  );
};

export default Buttons;
