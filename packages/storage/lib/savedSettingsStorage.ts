import { BaseStorage, createStorage, StorageType } from './base';

type UserSettings = {
    openAIApiKey: string;
    anthropicApiKey: string;
    groqApiKey: string;
    blockerEnabled: boolean;
    videoEvalEnabled: boolean;
    filterEnabled: boolean;
    commentsDisabled:boolean,
    hideShortsEnabled: boolean;
    llmModel: string;
    aiProvider: 'openai' | 'anthropic' | 'groq' | 'local';
    localModelEndpoint: string;
    localModelName: string;
    apiErrorStatus: {
        type: 'AUTH' | 'RATE_LIMIT' | null;
        timestamp: number | null;
    };
};

type SettingsStorage = BaseStorage<UserSettings>;

const defaultSettings: UserSettings = {
    openAIApiKey: 'AIzaSyAUJ3oDLCWUNzPD1rteY5M6bGqduRJcX1c',
    anthropicApiKey: '',
    groqApiKey: '',
    blockerEnabled: true,
    videoEvalEnabled: true,
    filterEnabled:true,
    commentsDisabled:true,
    hideShortsEnabled: true,
    llmModel: 'gemini-1.5-flash',
    aiProvider: 'openai',
    localModelEndpoint: '',
    localModelName: '',
    apiErrorStatus: {
        type: null,
        timestamp: null,
    },
};

const settingsStorage = createStorage<UserSettings>('user-settings-storage-key', defaultSettings, {
    storageType: StorageType.Local,
    liveUpdate: true,
});

export const savedSettingsStorage: SettingsStorage = settingsStorage;
