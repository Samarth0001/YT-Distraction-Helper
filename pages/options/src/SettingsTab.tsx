import React, { useState, useEffect, useRef } from 'react';
import { useStorageSuspense, withErrorBoundary, withSuspense } from '@chrome-extension-boilerplate/shared';
import { savedSettingsStorage } from '@chrome-extension-boilerplate/storage';

// TODO: import type from storage file
type UserSettings = {
  openAIApiKey: string;
  anthropicApiKey: string;
  blockerEnabled: boolean;
  videoEvalEnabled: boolean;
  filterEnabled: boolean;
  hideShortsEnabled: boolean;
  llmModel: string;
  aiProvider: 'openai' | 'anthropic' | 'groq' | 'local';
  localModelEndpoint: string;
  localModelName: string;
};

interface ToggleSwitchProps {
  id: string;
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ id, checked, onChange, label, description, disabled = false, children }) => (
  <div className="flex flex-col mb-4">
    <label htmlFor={id} className={`flex items-start ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
      <div className="relative">
        <input
          type="checkbox"
          id={id}
          className="sr-only"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
        />
        <div className={`block w-10 h-6 rounded-full ${checked ? (disabled ? 'bg-green-300' : 'bg-green-600') : (disabled ? 'bg-gray-300' : 'bg-gray-600')}`}></div>
        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${checked ? 'transform translate-x-4' : ''}`}></div>
      </div>
      <div className='ml-3 flex flex-col'>
        <div className='text-base text-white'>{label}</div>
        {description && <div className='text-gray-500 text-sm max-w-[300px]'>{description}</div>}
        {checked && children && <div className='max-w-[300px]'>{children}</div>}
      </div>
    </label>
  </div>
);

const TabSelector: React.FC<{
  activeTab: string;
  setActiveTab: (tab: string) => void;
}> = ({ activeTab, setActiveTab }) => (
  <div className="flex mb-4">
    <button
      className={`py-2 px-4 ${activeTab === 'hosted' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} rounded-l-md`}
      onClick={() => setActiveTab('hosted')}
    >
      Hosted Providers
    </button>
    <button
      className={`py-2 px-4 ${activeTab === 'local' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} rounded-r-md`}
      onClick={() => setActiveTab('local')}
    >
      Local Model
    </button>
  </div>
);

const SettingsTab = () => {
  const initialSettings = useStorageSuspense(savedSettingsStorage);
  const [settings, setSettings] = useState(initialSettings);
  const [showSavedMessage, setShowSavedMessage] = useState(false);

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  const saveSettings = async () => {
    await savedSettingsStorage.set(settings);
    setShowSavedMessage(true);
    setTimeout(() => setShowSavedMessage(false), 3000);
  };

  const hasChanges = () => {
    return Object.keys(settings).some(key => settings[key as keyof UserSettings] !== initialSettings[key as keyof UserSettings]);
  };

  const handleChange = (key: string, value: any) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [key]: value,
    }));
  };

  const [goalKeeperMode, setGoalKeeperMode] = useState<'block' | 'evaluate'>(
    settings.blockerEnabled ? 'block' : 'evaluate'
  );

  const handleGoalKeeperChange = (enabled: boolean) => {
    handleChange('blockerEnabled', enabled);
    handleChange('videoEvalEnabled', enabled);
    if (enabled && goalKeeperMode === 'evaluate') {
      setGoalKeeperMode('block');
    }
  };

  const [activeTab, setActiveTab] = useState('hosted');

  return (
    <div className="p-4">
      <div>
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
        <div>
          <h2 className="text-2xl font-bold mb-4">Smart Features</h2>
          <ToggleSwitch
            id="ai-goal-keeper"
            checked={settings.blockerEnabled || settings.videoEvalEnabled}
            onChange={() => handleGoalKeeperChange(!(settings.blockerEnabled || settings.videoEvalEnabled))}
            label="AI Goal Keeper"
          >
            <div>
              <div className="flex space-x-2 mt-2">
                <button
                  className={`py-2 px-4 rounded-full ${goalKeeperMode === 'block'
                    ? 'bg-gray-500 text-white'
                    : 'border border-gray-300 text-gray-300'
                    }`}
                  onClick={() => {
                    setGoalKeeperMode('block');
                    handleChange('blockerEnabled', true);
                    handleChange('videoEvalEnabled', true);
                  }}
                >
                  Block Videos
                </button>
                <button
                  className={`py-2 px-4 rounded-full ${goalKeeperMode === 'evaluate'
                    ? 'bg-gray-500 text-white'
                    : 'border border-gray-300 text-gray-300'
                    }`}
                  onClick={() => {
                    setGoalKeeperMode('evaluate');
                    handleChange('blockerEnabled', false);
                    handleChange('videoEvalEnabled', true);
                  }}
                >
                  Evaluation Only
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                <span>Evaluate videos based on your goals. <br /> </span>
                {goalKeeperMode === 'block'
                  ? "Block videos that are not relevant to your goals."
                  : "Only evaluate videos without blocking them. This will make the AI Goal Keeper more lenient."}
              </p>
            </div>
          </ToggleSwitch>

          <ToggleSwitch
            id="ai-filter"
            checked={settings.filterEnabled}
            onChange={() => handleChange('filterEnabled', !settings.filterEnabled)}
            label="AI Focus Filter"
            description="Only show recommendations that are relevant to your goals. 
            Works on the home page and related videos on the side bar."
          />
          <ToggleSwitch
            id="comments-filter"
            checked={settings.commentsDisabled}
            onChange={() => handleChange('commentsDisabled', !settings.commentsDisabled)}
            label="No Comments!"
            description="Remove comments entirely"
          />
          <ToggleSwitch
            id="hideShorts"
            checked={settings.hideShortsEnabled}
            onChange={() => handleChange('hideShortsEnabled', !settings.hideShortsEnabled)}
            label="No Shorts!"
            description="Hide any shorts on the page."
          />
        </div>
      </div>

      {hasChanges() && (
        <button
          className="mt-8 block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={saveSettings}>
          Save Settings
        </button>
      )}
      {showSavedMessage && <div className="py-2 px-4 text-sm text-green-500">Saved!</div>}
    </div>
  );
};

export default withErrorBoundary(withSuspense(SettingsTab, <div>Loading...</div>), <div>Error Occurred</div>);
