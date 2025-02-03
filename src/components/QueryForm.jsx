import { useState, useEffect } from 'react';

const QueryForm = () => {
  const [eventId, setEventId] = useState('');
  const [eventIds, setEventIds] = useState([]);
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
        // Create a new object with all fields
        const processed = {
          eventid: item.eventid || '',
          marketid: item.marketid || '',
          eventtypeid: item.eventtypeid || '',
          firsthalfend: formatDateTime(item.firsthalfend),
          firsthalfstart: formatDateTime(item.firsthalfstart),
          secondhalfend: formatDateTime(item.secondhalfend),
          secondhalfstart: formatDateTime(item.secondhalfstart),
          inplay: item.inplay || false,
          inplaytime: formatDateTime(item.inplaytime),
          currenttime: formatDateTime(item.currenttime),
          lastupdate: formatDateTime(item.lastupdate),
          starttime: formatDateTime(item.starttime),
          markettype: item.markettype || '',
          name: item.name || '',
          selections: item.selections || [],
          status: item.status || '',
          volume: item.volume || 0,
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

  useEffect(() => {
    const fetchEventIds = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Fetching event IDs from server...');
        const response = await fetch('/api/eventIds', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received event IDs:', data);
        setEventIds(data);
      } catch (err) {
        console.error('Error fetching event IDs:', err);
        setError('Failed to fetch event IDs: ' + err.message);
      }
    };

    fetchEventIds();
  }, []);

  // Filter out columns we don't want to display
  const getDisplayColumns = (data) => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]).filter((key) => !key.includes('_')); // Only remove underscore columns
  };

  return (
    <div className="w-full">
      <h1 className="text-2xl font-semibold text-white mb-6">
        Query Cassandra Database
      </h1>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <select
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
          className="w-full md:flex-1 px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select an Event ID</option>
          {eventIds.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
        <button
          onClick={handleQuery}
          disabled={loading}
          className={`w-full md:w-auto px-6 py-2 rounded-md text-white whitespace-nowrap ${
            loading
              ? 'bg-gray-700 cursor-not-allowed'
              : 'bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          }`}
        >
          {loading ? 'Loading...' : 'Query'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-md bg-red-900/50 text-red-200 border border-red-800">
          {error}
        </div>
      )}

      <h2 className="text-xl font-semibold text-white mb-4">Results</h2>
      {results.length > 0 ? (
        <div className="overflow-x-auto -mx-6">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  {getDisplayColumns(results).map((column) => (
                    <th
                      key={column}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider bg-gray-800 whitespace-nowrap"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {results.map((row, rowIndex) => (
                  <tr key={rowIndex} className="bg-gray-700/50">
                    {getDisplayColumns(results).map((column) => (
                      <td
                        key={`${rowIndex}-${column}`}
                        className="px-6 py-4 text-sm text-gray-200 whitespace-nowrap overflow-hidden text-ellipsis"
                      >
                        {typeof row[column] === 'boolean'
                          ? row[column].toString()
                          : Array.isArray(row[column])
                          ? JSON.stringify(row[column])
                          : typeof row[column] === 'object' &&
                            row[column] !== null
                          ? JSON.stringify(row[column])
                          : row[column]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-gray-300">No results found</p>
      )}
    </div>
  );
};

export default QueryForm;
