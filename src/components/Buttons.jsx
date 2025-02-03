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
    <div className="flex flex-col space-y-4 w-full">
      <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-2 lg:space-y-0 lg:space-x-4">
        <input
          type="number"
          value={interval}
          onChange={(e) => setInterval(e.target.value)}
          placeholder="Interval (ms)"
          className="w-full lg:w-48 px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <div className="flex flex-col md:flex-row w-full space-y-2 md:space-y-0 md:space-x-4">
          <button
            onClick={handleFetchInterval}
            disabled={isRunning}
            className={`w-full md:flex-1 px-4 py-2 rounded-md text-white whitespace-nowrap ${
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
            className={`w-full md:flex-1 px-4 py-2 rounded-md text-white whitespace-nowrap ${
              !isRunning
                ? 'bg-gray-700 cursor-not-allowed'
                : 'bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            }`}
          >
            End Interval Fetch
          </button>
        </div>
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
