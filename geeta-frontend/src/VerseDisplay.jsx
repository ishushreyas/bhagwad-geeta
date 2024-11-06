import React, { useState } from 'react';
import { ChevronDown, ChevronRight, BookOpen, User, Globe, Languages } from 'lucide-react';

const VerseDisplay = ({ data }) => {
  const [expandedCommentator, setExpandedCommentator] = useState(null);

  if (!data) return null;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Main Verse Card */}
      <div className="bg-white shadow-lg rounded-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">
            Chapter {data.chapter}, Verse {data.verse}
          </h2>
          <span className="text-sm text-gray-500">ID: {data.id}</span>
        </div>
        <div className="text-xl font-serif text-center p-4 bg-purple-50 rounded-lg mb-6 whitespace-pre-line">
          {data.slok}
        </div>
        <div className="text-lg text-gray-700 italic text-center p-4 border-t whitespace-pre-line">
          {data.transliteration}
        </div>
      </div>

      {/* Commentaries Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Commentaries
        </h3>

        {data.commentaries?.map((commentary) => (
          <div
            key={commentary.commentator}
            className={`transition-all duration-300 bg-gray-50 rounded-md shadow ${
              expandedCommentator === commentary.commentator ? 'bg-white' : 'hover:bg-white'
            }`}
          >
            {/* Commentator Header */}
            <div
              onClick={() => setExpandedCommentator(
                expandedCommentator === commentary.commentator
                  ? null
                  : commentary.commentator
              )}
              className="flex items-center justify-between p-4 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-purple-600" />
                <span className="font-semibold">{commentary.commentator}</span>
                {commentary.author && (
                  <span className="text-sm text-gray-500">by {commentary.author}</span>
                )}
              </div>
              {expandedCommentator === commentary.commentator ? (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-500" />
              )}
            </div>

            {/* Expanded Content */}
            {expandedCommentator === commentary.commentator && (
              <div className="transition-all duration-300 ease-in-out p-4 space-y-6">
                {/* English Section */}
                {(commentary.english_translation || commentary.english_commentary) && (
                  <div className="space-y-3">
                    <h4 className="flex items-center gap-2 font-medium">
                      <Globe className="w-4 h-4" /> English
                    </h4>
                    {commentary.english_translation && (
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-sm text-gray-500 mb-1 whitespace-pre-line">Translation:</div>
                        <div>{commentary.english_translation}</div>
                      </div>
                    )}
                    {commentary.english_commentary && (
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-sm text-gray-500 mb-1">Commentary:</div>
                        <div>{commentary.english_commentary}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Sanskrit Section */}
                {commentary.sanskrit_commentary && (
                  <div className="space-y-3">
                    <h4 className="flex items-center gap-2 font-medium">
                      <Languages className="w-4 h-4" /> Sanskrit
                    </h4>
                    <div className="bg-gray-50 p-3 rounded font-serif whitespace-pre-line">
                      {commentary.sanskrit_commentary}
                    </div>
                  </div>
                )}

                {/* Hindi Section */}
                {(commentary.hindi_translation || commentary.hindi_commentary) && (
                  <div className="space-y-3">
                    <h4 className="flex items-center gap-2 font-medium">
                      <Languages className="w-4 h-4" /> Hindi
                    </h4>
                    {commentary.hindi_translation && (
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-sm text-gray-500 mb-1">Translation:</div>
                        <div>{commentary.hindi_translation}</div>
                      </div>
                    )}
                    {commentary.hindi_commentary && (
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-sm text-gray-500 mb-1">Commentary:</div>
                        <div>{commentary.hindi_commentary}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VerseDisplay;


