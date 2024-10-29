import React, { useState, useEffect } from 'react';
import { withErrorBoundary, withSuspense } from '@chrome-extension-boilerplate/shared';

const SavedVideosTab = () => {
  const [savedNotes, setSavedNotes] = useState<{ url: string, note: string }[]>([]); // State to hold saved URLs and notes

  useEffect(() => {
    // Fetch saved notes and URLs from Chrome's local storage when component mounts
    chrome.storage.local.get('notes', (result) => {
      const notes = result.notes || [];
      setSavedNotes(notes); // Update state with the retrieved notes
    });
  }, []); // Empty dependency array ensures this runs only once when the component mounts

  function formatUrl(url :string){
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
            const match = url.match(regex);
           const videoId= match ? match[1] : null;
    return videoId;       

  }
  return (
    <div className="p-4 bg-gray-900 text-white">
      <h2 className="text-xl font-bold mb-4">Saved Videos and Notes</h2>
      {savedNotes.length === 0 ? (
        <p>No saved videos or notes yet.</p>
      ) : (
        <ul>
          {savedNotes.map((noteData, index) => (
            <li key={index} className="mb-4 bg-gray-600 border-b-2 border-black p-4 rounded-md">
              <img src={`https://img.youtube.com/vi/${formatUrl(noteData.url)}/default.jpg`} className=' object-cover rounded-md'></img>
              <div className="font-semibold">URL: <a href={noteData.url} className="text-blue-400 underline" target="_blank" rel="noopener noreferrer">{noteData.url}</a></div>
              <div className=' text-lg'>Note: {noteData.note}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default withErrorBoundary(withSuspense(SavedVideosTab, <div>Loading...</div>), <div>Error Occurred</div>);
