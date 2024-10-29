import '@src/Popup.css';
import React, { useState, useEffect, useRef } from 'react';
import { useStorageSuspense, withErrorBoundary, withSuspense } from '@chrome-extension-boilerplate/shared';
import { savedGoalsStorage, savedSettingsStorage } from '@chrome-extension-boilerplate/storage';

const GoalsEditor = ({ disabled }: { disabled: boolean }) => {
  const { helpful, harmful } = useStorageSuspense(savedGoalsStorage);
  const [helpfulVideos, setHelpfulVideos] = useState(helpful);
  const [harmfulVideos, setHarmfulVideos] = useState(harmful);
  const [showSavedMessage, setShowSavedMessage] = useState(false);

  const initialGoals = useRef({ helpful, harmful });
  const noteInputRef = useRef<HTMLTextAreaElement>(null); // Ref for note input

  useEffect(() => {
    initialGoals.current = { helpful, harmful };
  }, [helpful, harmful]);

  const saveGoals = async () => {
    await savedGoalsStorage.set({ helpful: helpfulVideos, harmful: harmfulVideos });
    initialGoals.current = { helpful: helpfulVideos, harmful: harmfulVideos };
    setShowSavedMessage(true);
    setTimeout(() => setShowSavedMessage(false), 3000);
  };

  const hasChanges = () => {
    return helpfulVideos !== initialGoals.current.helpful || harmfulVideos !== initialGoals.current.harmful;
  };

  // Save note function
  const saveNote = () => {
    const note = noteInputRef.current?.value;
    if (!note) return;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0]?.url;
      if (url) {
        const data = { url, note };

        // Save the note in local storage
        chrome.storage.local.get('notes', (result) => {
          const notes = result.notes || [];
          notes.push(data);
          chrome.storage.local.set({ notes }, () => {
            console.log('Note saved:', data); // Confirm save in console
          });
        });
      } else {
        console.error('Active tab URL not found.');
      }
    });
  };

  return (
    <div className="p-4 bg-gray-900 text-white">
      <div className="mb-4">
        <label htmlFor="helpful-videos" className="block text-sm font-medium text-gray-300">
          Helpful Videos to Watch:
        </label>
        <textarea
          id="helpful-videos"
          className={` text-2xl  text-white mt-1 p-2 block w-full border-2 rounded-md border-gray-700 bg-gray-800 shadow-sm resize-none focus:border-gray-500 focus:outline-none ${disabled ? 'text-gray-500' : 'text-white'}`}
          value={helpfulVideos}
          onChange={e => setHelpfulVideos(e.target.value)}
          rows={5}
        />
      </div>
      <div className="mb-4">
        <label htmlFor="harmful-videos" className="block text-sm font-medium text-gray-300">
          Harmful Videos to Avoid:
        </label>
        <textarea
          id="harmful-videos"
          className={`  text-white  text-2xl mt-1 p-2 block w-full border-2 rounded-md border-gray-700 bg-gray-800 shadow-sm resize-none focus:border-gray-500 focus:outline-none ${disabled ? 'text-gray-500' : 'text-white'}`}
          value={harmfulVideos}
          onChange={e => setHarmfulVideos(e.target.value)}
          rows={5}
        />
      </div>
      <div className="mb-4">
        <h1 className="block text-sm font-medium text-gray-300">YouTube Note Taker</h1>
        <textarea
          ref={noteInputRef} // Using ref for the note input
          id="note"
          className={`mt-1 p-2 block w-full border-2 rounded-md border-gray-700 bg-gray-800 shadow-sm resize-none focus:border-gray-500 focus:outline-none ${disabled ? 'text-gray-500' : 'text-white'}`}
          placeholder="Add your note here..."
        ></textarea>
        <button onClick={saveNote} className="block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Save Note
        </button>
      </div>
      {hasChanges() && (
        <button
          className="block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={saveGoals}
        >
          Save Changes
        </button>
      )}
      {showSavedMessage && <div className="mt-4 py-2 px-4 text-sm text-green-500">Changes Saved!</div>}
    </div>
  );
};

const Popup = () => {
  const openOptionsPage = () => {
    chrome.runtime.openOptionsPage();
  };

  const { openAIApiKey, anthropicApiKey, apiErrorStatus } = useStorageSuspense(savedSettingsStorage);

  // State for displaying the timer value
  const [timerValue, setTimerValue] = useState<number>(0);

  useEffect(() => {
    // Function to fetch and update the timer value
    const updateTimerValue = async () => {
      const result = await chrome.storage.local.get('totalTimeSpentOnYouTube');
      setTimerValue(result.totalTimeSpentOnYouTube || 0);
    };

    // Fetch initial value
    updateTimerValue();

    // Set interval to update the timer every second
    const intervalId = setInterval(updateTimerValue, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Calculate minutes and seconds
  const minutes = Math.floor(timerValue / 60);

  return (
    <div>
      <GoalsEditor disabled={true} />
      <div className="p-4 bg-gray-900 text-white">
        <h2 className="text-lg font-semibold">YouTube Time Tracker</h2>
        <p>Time spent on YouTube: {minutes} minutes</p>
      </div>
      <div className="flex flex-row items-center bg-gray-900 border-t border-gray-500">
        <button
          onClick={openOptionsPage}
          className="block text-gray-300 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Settings
        </button>
      </div>
      {apiErrorStatus.type && (
        <div className="bg-red-500 text-white p-2 text-sm">
          {apiErrorStatus.type === 'AUTH' ? 'Authentication error. Please check your API key.' : 'Rate limit exceeded. Please try again later or upgrade your plan.'}
        </div>
      )}
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occurred </div>);
