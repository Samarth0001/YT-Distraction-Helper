import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { savedSettingsStorage } from '@chrome-extension-boilerplate/storage';

interface ChatCompletionResponse {
    choices: { message: { content: string } }[];
}

interface LocalChatCompletionResponse {
    message: { content: string };
}

function formatPrompt(systemPrompt: string, prompt: string) {
    return [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
    ];
}

export async function fetchChatCompletion(systemPrompt: string, schema:object,prompt: string): Promise<string> {
    try {
        const { llmModel, aiProvider, openAIApiKey, anthropicApiKey, groqApiKey, localModelEndpoint, localModelName } = await savedSettingsStorage.get();

        if (aiProvider === 'openai') {
            return fetchOpenAIChatCompletion(openAIApiKey,schema, llmModel, systemPrompt, prompt);
        } else if (aiProvider === 'anthropic') {
            return fetchAnthropicChatCompletion(anthropicApiKey, llmModel, systemPrompt, prompt);
        } else if (aiProvider === 'groq') {
            return fetchGroqChatCompletion(groqApiKey, llmModel, formatPrompt(systemPrompt, prompt));
        } else if (aiProvider === 'local') {
            return fetchLocalChatCompletion(localModelEndpoint, localModelName, formatPrompt(systemPrompt, prompt));
        } else {
            throw new Error('Invalid AI provider');
        }
    } catch (error) {
        console.error('Error calling AI service:', error);
        return 'Failed to fetch chat completion from AI service.';
    }
}

async function fetchOpenAIChatCompletion(apiKey: string,schema:object, model: string,systemPrompt: string, prompt: string ): Promise<string> {
    
    const genAI = new GoogleGenerativeAI("AIzaSyAUJ3oDLCWUNzPD1rteY5M6bGqduRJcX1c");

    
    const generationConfig = {
        temperature: 1,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 8192,
        responseMimeType:  "application/json",
        responseSchema:schema
      }
      const llmModel = genAI.getGenerativeModel({
        model:"gemini-1.5-flash",
        systemInstruction:systemPrompt
      });
      
    
    
    // const url = 'https://api.openai.com/v1/chat/completions';
    // const data = {
    //     model: model,
    //     response_format: { type: 'json_object' },
    //     messages: messages,
    // };
    // const headers = {
    //     Authorization: `Bearer ${apiKey}`,
    //     'Content-Type': 'application/json',
    // };

    return llmModel.generateContent(prompt)
        .then(response => {
            if (response.response.candidates!!.length>0 ) {
                // Reset error status on successful request
                savedSettingsStorage.set(prev => ({
                    ...prev,
                    apiErrorStatus: { type: null, timestamp: null }
                }));
                return response.response.text();
            } else {
                return 'No response from OpenAI.';
            }
        })
        .catch(error => {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 401) {
                    savedSettingsStorage.set(prev => ({
                        ...prev,
                        apiErrorStatus: { type: 'AUTH', timestamp: Date.now() }
                    }));
                    throw new Error('Authentication failed. Please check your API key.');
                } else if (error.response?.status === 429) {
                    savedSettingsStorage.set(prev => ({
                        ...prev,
                        apiErrorStatus: { type: 'RATE_LIMIT', timestamp: Date.now() }
                    }));
                    throw new Error('Rate limit exceeded. Please try again later.');
                }
            }
            throw error;
        });
}

async function fetchAnthropicChatCompletion(apiKey: string, model: string, systemPrompt: string, prompt: string): Promise<string> {
    const url = 'https://api.anthropic.com/v1/messages';
    const data = {
        model: model,
        system: systemPrompt,
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }]
    };
    const headers = {
        'X-API-Key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
    };

    return axios.post<any>(url, data, { headers })
        .then(response => {
            if (response.data.content) {
                // Reset error status on successful request
                savedSettingsStorage.set(prev => ({
                    ...prev,
                    apiErrorStatus: { type: null, timestamp: null }
                }));
                return response.data.content[0].text;
            } else {
                return 'No response from Anthropic.';
            }
        })
        .catch(error => {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 401) {
                    savedSettingsStorage.set(prev => ({
                        ...prev,
                        apiErrorStatus: { type: 'AUTH', timestamp: Date.now() }
                    }));
                    throw new Error('Authentication failed. Please check your API key.');
                } else if (error.response?.status === 429) {
                    savedSettingsStorage.set(prev => ({
                        ...prev,
                        apiErrorStatus: { type: 'RATE_LIMIT', timestamp: Date.now() }
                    }));
                    throw new Error('Rate limit exceeded. Please try again later.');
                }
            }
            throw error;
        });
}

async function fetchGroqChatCompletion(apiKey: string, model: string, messages: any[]): Promise<string> {
    const url = 'https://api.groq.com/openai/v1/chat/completions';
    const data = {
        model: model,
        messages: messages,
    };
    const headers = {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
    };

    return axios.post<ChatCompletionResponse>(url, data, { headers })
        .then(response => {
            if (response.data.choices && response.data.choices.length > 0) {
                // Reset error status on successful request
                savedSettingsStorage.set(prev => ({
                    ...prev,
                    apiErrorStatus: { type: null, timestamp: null }
                }));
                return response.data.choices[0].message.content;
            } else {
                return 'No response from Groq.';
            }
        })
        .catch(error => {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 401) {
                    savedSettingsStorage.set(prev => ({
                        ...prev,
                        apiErrorStatus: { type: 'AUTH', timestamp: Date.now() }
                    }));
                    throw new Error('Authentication failed. Please check your API key.');
                } else if (error.response?.status === 429) {
                    savedSettingsStorage.set(prev => ({
                        ...prev,
                        apiErrorStatus: { type: 'RATE_LIMIT', timestamp: Date.now() }
                    }));
                    throw new Error('Rate limit exceeded. Please try again later.');
                }
            }
            throw error;
        });
}

async function fetchLocalChatCompletion(localModelPort: string, localModelName: string, messages: any[]): Promise<string> {
    const url = `${localModelPort}`;
    const data = {
        model: localModelName,
        messages: messages,
        stream: false
    };
    return axios.post<LocalChatCompletionResponse>(url, data, {
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(response => {
            if (response.data.message && response.data.message.content) {
                // Reset error status on successful request
                savedSettingsStorage.set(prev => ({
                    ...prev,
                    apiErrorStatus: { type: null, timestamp: null }
                }));
                return response.data.message.content;
            } else {
                return 'No response from local model.';
            }
        })
        .catch(error => {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 401) {
                    savedSettingsStorage.set(prev => ({
                        ...prev,
                        apiErrorStatus: { type: 'AUTH', timestamp: Date.now() }
                    }));
                    throw new Error('Authentication failed. Please check your local model settings.');
                } else if (error.response?.status === 429) {
                    savedSettingsStorage.set(prev => ({
                        ...prev,
                        apiErrorStatus: { type: 'RATE_LIMIT', timestamp: Date.now() }
                    }));
                    throw new Error('Rate limit exceeded. Please try again later.');
                }
            }
            throw error;
        });
}