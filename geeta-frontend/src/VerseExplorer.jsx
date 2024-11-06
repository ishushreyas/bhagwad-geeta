import React, { useState } from 'react';
import { Search, Loader2, BookOpen } from 'lucide-react';
import VerseDisplay from './VerseDisplay';

const VerseSearchForm = ({ onVerseFound }) => {
  const [searchParams, setSearchParams] = useState({ chapter: '', verse: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:8080/api/chapter/${searchParams.chapter}/verse/${searchParams.verse}`
      );

      if (!response.ok) {
        throw new Error('Verse not found');
      }

      const data = await response.json();
      onVerseFound(data);

      setRecentSearches((prev) => [
        { chapter: searchParams.chapter, verse: searchParams.verse },
        ...prev.slice(0, 4),
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSearch = (chapter, verse) => {
    setSearchParams({ chapter, verse });
    handleSearch(new Event('submit'));
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="mx-auto shadow-lg p-6 rounded-md">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-purple-600" />
          Search Verses
        </h2>
        <form onSubmit={handleSearch} className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="chapter" className="text-sm font-medium">
                Chapter
              </label>
              <input
                id="chapter"
                type="number"
                min="1"
                placeholder="Enter chapter number"
                value={searchParams.chapter}
                onChange={(e) =>
                  setSearchParams((prev) => ({
                    ...prev,
                    chapter: e.target.value,
                  }))
                }
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label htmlFor="verse" className="text-sm font-medium">
                Verse
              </label>
              <input
                id="verse"
                type="number"
                min="1"
                placeholder="Enter verse number"
                value={searchParams.verse}
                onChange={(e) =>
                  setSearchParams((prev) => ({
                    ...prev,
                    verse: e.target.value,
                  }))
                }
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white font-medium py-2 rounded flex items-center justify-center gap-2 disabled:opacity-50"
            disabled={loading || !searchParams.chapter || !searchParams.verse}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            {loading ? 'Searching...' : 'Search Verse'}
          </button>
        </form>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}
      </div>

      {recentSearches.length > 0 && (
        <div className="bg-white shadow-md p-4 rounded-md">
          <h3 className="text-lg font-semibold">Recent Searches</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {recentSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => handleQuickSearch(search.chapter, search.verse)}
                className="border border-gray-300 px-3 py-1 rounded-md flex items-center gap-2 hover:bg-gray-100"
              >
                <BookOpen className="w-4 h-4" />
                Chapter {search.chapter}, Verse {search.verse}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Main component
const VerseExplorer = () => {
  const [verseData, setVerseData] = useState(null);
    return (
    <div className="container mx-auto py-8 space-y-8">
      <VerseSearchForm onVerseFound={setVerseData} />

      {verseData && (
        <div className="animate-fadeIn">
          <VerseDisplay data={verseData} />
        </div>
      )}
    </div>
  );
};

export default VerseExplorer;

