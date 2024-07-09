import { useState } from 'react';

const QueryForm = () => {
  const [eventId, setEventId] = useState('');
  const [marketId, setMarketId] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleQuery = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId, marketId }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      const dataWithFormattedDates = data.map((item) => ({
        ...item,
        current_time: item.current_time
          ? new Date(item.current_time).toLocaleString()
          : item.current_time,
        last_updated: item.last_updated
          ? new Date(item.last_updated).toLocaleString()
          : item.last_updated,
        start_time: item.start_time
          ? new Date(item.start_time).toLocaleString()
          : item.start_time,
      }));

      console.log(dataWithFormattedDates);
      setResults(dataWithFormattedDates);
    } catch (err) {
      setError('Failed to fetch data');
      console.error('Error fetching data', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Query Cassandra Database</h1>
      <div>
        <input
          type="text"
          placeholder="Event ID"
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Market ID"
          value={marketId}
          onChange={(e) => setMarketId(e.target.value)}
        />
        <button onClick={handleQuery} disabled={loading}>
          {loading ? 'Loading...' : 'Query'}
        </button>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <h2>Results</h2>
        {results.length > 0 ? (
          <table>
            <thead>
              <tr>
                {Object.keys(results[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr key={index}>
                  {Object.values(result).map((value, idx) => (
                    <td key={idx}>{JSON.stringify(value)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No results found</p>
        )}
      </div>
    </div>
  );
};

export default QueryForm;
