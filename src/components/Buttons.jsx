import { useState } from 'react';

const Buttons = () => {
  const [interval, setInterval] = useState('');

  const handleFetchOnce = () => {
    fetch('/fetchOnce')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response not ok.');
        }
        return response.text();
      })
      .then((data) => {
        console.log('fetchOnce response: ', data);
      })
      .catch((error) => {
        console.error('Error fetching once: ', error);
      });
  };

  const handleFetchInterval = () => {
    const intValue = interval || 10000;
    console.log(`[FetchInterval] Starting fetch with interval: ${intValue}ms`);

    fetch(`/fetchInterval?interval=${intValue}`)
      .then((response) => {
        console.log(`[FetchInterval] Response status: ${response.status}`);
        console.log(
          `[FetchInterval] Response headers:`,
          Object.fromEntries(response.headers.entries())
        );

        if (!response.ok) {
          throw new Error(
            `Network response not ok. Status: ${response.status}`
          );
        }
        return response.text();
      })
      .then((data) => {
        console.log('[FetchInterval] Success response:', data);
      })
      .catch((error) => {
        console.error('[FetchInterval] Error:', {
          message: error.message,
          stack: error.stack,
          type: error.constructor.name,
        });
      });
  };

  const handleEndIntervalFetch = () => {
    fetch('/endIntervalFetch')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response not ok.');
        }
        return response.text();
      })
      .then((data) => {
        console.log('endIntervalFetch response: ', data);
      })
      .catch((error) => {
        console.error('Error ending interval fetch: ', error);
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
