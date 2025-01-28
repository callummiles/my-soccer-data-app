import { useState } from 'react';

const QueryForm = () => {
  const [eventId, setEventId] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    // Convert numeric timestamp to milliseconds if needed
    const timestampNum =
      typeof timestamp === 'string' ? parseFloat(timestamp) : timestamp;
    if (!isNaN(timestampNum)) {
      const date = new Date(timestampNum);
      if (date.getTime() > 0) {
        return date.toLocaleString();
      }
    }
    return 'N/A';
  };

  const handleQuery = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ eventId }),
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }

      const data = await response.json();

      // Process and format the data
      const processedData = data.map((item) => {
        // Create a new object with only the fields we want
        const processed = {
          eventid: item.eventid || '',
          eventtypeid: item.eventtypeid || '',
          firsthalfend: item.firsthalfend || '',
          firsthalfstart: item.firsthalfstart || '',
          secondhalfend: item.secondhalfend || '',
          secondhalfstart: item.secondhalfstart || '',
          inplay: item.inplay || false,
          inplaytime: formatDateTime(item.inplaytime),
          currenttime: formatDateTime(item.currenttime),
          lastupdate: formatDateTime(item.lastupdate),
          starttime: formatDateTime(item.starttime),
          markettype: item.markettype || '',
          name: item.name || '',
          selections: item.selections || [],
        };
        return processed;
      });

      setResults(processedData);
    } catch (err) {
      setError('Failed to fetch data: ' + err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter out columns we don't want to display
  const getDisplayColumns = (data) => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]).filter((key) => !key.includes('_')); // Only remove underscore columns
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Query Cassandra Database
      </h1>
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Event ID"
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
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
                  {getDisplayColumns(results).map((key) => (
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
                {results.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {getDisplayColumns(results).map((key) => (
                      <td
                        key={key}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      >
                        {key === 'selections'
                          ? JSON.stringify(row[key])
                          : row[key]?.toString() || ''}
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
