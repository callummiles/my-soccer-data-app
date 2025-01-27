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

      setResults(dataWithFormattedDates);
    } catch (err) {
      setError('Failed to fetch data');
      console.error('Error fetching data', err);
    } finally {
      setLoading(false);
    }
  };

  const renderSelection = (selection) => {
    return (
      <ul>
        {Object.entries(selection).map(([key, value]) => (
          <li key={key}>
            {key}:{' '}
            {typeof value === 'object' ? (
              <ul>
                {Object.entries(value).map(([nestedKey, nestedValue]) => (
                  <li key={nestedKey}>
                    {nestedKey}: {nestedValue}
                  </li>
                ))}
              </ul>
            ) : (
              value
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Query Cassandra Database</h1>
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Event ID"
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
        />
        <input
          type="text"
          placeholder="Market ID"
          value={marketId}
          onChange={(e) => setMarketId(e.target.value)}
          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
        />
        <button
          onClick={handleQuery}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Query'}
        </button>
      </div>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Results</h2>
        {results.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {Object.keys(results[0]).map((key) => (
                    <th
                      key={key}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((result, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {Object.values(result).map((value, i) => (
                      <td
                        key={i}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      >
                        {typeof value === 'object' ? (
                          <div className="space-y-1">
                            {Object.entries(value).map(([key, val]) => (
                              <div key={key} className="text-sm">
                                <span className="font-medium">{key}:</span>{' '}
                                {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                              </div>
                            ))}
                          </div>
                        ) : (
                          String(value)
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No results found</p>
        )}
      </div>
    </div>
  );
};

export default QueryForm;
