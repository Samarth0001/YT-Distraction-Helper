import React, { useEffect, useState } from 'react';
import { savedSettingsStorage } from '@chrome-extension-boilerplate/storage';
import { useStorageSuspense } from '@chrome-extension-boilerplate/shared';

interface TitleEvalResultProps {
  result: {
    evaluation_rating: string;
    evaluation_context: string;
  };
  summary:string,
  scrutinized:string
}

const ratingToClassName = (rating: string): string => {
  switch (rating) {
    case 'relevant':
      return 'bg-green-200';
    case 'not_sure':
      return 'bg-yellow-200';
    case 'irrelevant':
      return 'bg-orange-200';
    case 'avoid':
      return 'bg-red-200';
    default:
      return 'bg-white';
  }
};

export const TitleEvalResult: React.FC<TitleEvalResultProps & { onUnblock?: () => void }> = ({ result, summary, scrutinized, onUnblock }) => {
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [finalOutput, setFinalOutput] = useState<string | null>(null); // State to hold the final output
  const Settings = useStorageSuspense(savedSettingsStorage);
  const [settings, setSettings] = useState(Settings);
  const ratingColor = ratingToClassName(result.evaluation_rating);

  const handleButtonClick = () => {
    setShowInput(true);
  };

  

  // Fetch transcript and process it
  
  useEffect(()=>{
    const hideComments = () => {
      const commentSection = document.getElementById('comments');
      if (commentSection) {
          commentSection.style.display = 'none';
      }
  };
  if(settings.commentsDisabled){
  hideComments();
  }
  },[])
  useEffect(() => {
    if (inputValue === 'this video is not a distraction' && onUnblock) {
      onUnblock();
    }
  }, [inputValue, onUnblock]);

  return (
    <div className={`w-full my-8 text-black rounded-xl p-4 text-xl ${ratingColor}`}>
      <p>{result.evaluation_context}
      {/* Display final output */}
      <br/>
      <br/>
      <p>Summary:</p>
      
      <div dangerouslySetInnerHTML={{ __html: summary }} />
      <br/>
      <p>Analysis:</p>
      <div dangerouslySetInnerHTML={{ __html: scrutinized }} />

      </p>
      {/* Show "Unblock" button */}
      {(result.evaluation_rating === 'not_sure' || result.evaluation_rating === 'irrelevant') && onUnblock && (
        <div className="flex justify-end items-end">
          {!showInput && (
            <button onClick={handleButtonClick} className="mt-2 p-2 bg-gray-200 text-gray-500 rounded-xl">
              Unblock
            </button>
          )}
          {showInput && (
            <div className="mt-4 w-full">
              <div className="text-gray-500 mb-2">
                Type <strong>"this video is not a distraction"</strong> to unblock
              </div>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="p-4 border rounded w-full"
                placeholder="Persistence is the key to success"
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export const Analyzing: React.FC = () => {
  return (
    <div className="w-300 h-100 flex justify-center items-center">
      <div className="text-center text-white">
        <div className="animate-bounce text-4xl">💪</div>
        <div className="mt-2 text-3xl font-mono">Removing Distractions......</div>
      </div>
    </div>
  );
};