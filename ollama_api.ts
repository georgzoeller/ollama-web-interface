// ollama_api.ts

// Types
export interface Model {
    name: string;
    modified_at: string;
    size: number;
    digest: string;
    details: {
      format: string;
      family: string;
      families: string[] | null;
      parameter_size: string;
      quantization_level: string;
    };
  }
  
  interface GenerateOptions {
    temperature?: number;
    // Add other option parameters as needed
  }
  
  interface GenerateResponse {
    response: string;
    // Add other response fields as needed
  }
  
  // API Functions
  export const checkConnection = async (baseUrl: string): Promise<boolean> => {
    try {
      const response = await fetch(`${baseUrl}/`);
      return response.status === 200;
    } catch (error) {
      console.error('Error connecting to server:', error);
      return false;
    }
  };
  
  export const fetchModels = async (baseUrl: string): Promise<Model[]> => {
    try {
      const response = await fetch(`${baseUrl}/api/tags`);
      const data = await response.json();
      return data.models;
    } catch (error) {
      console.error('Error fetching models:', error);
      return [];
    }
  };
  
  export const generateResponse = async (
    baseUrl: string,
    model: string,
    prompt: string,
    options: GenerateOptions
  ): Promise<string> => {
    try {
      const response = await fetch(`${baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          model, 
          prompt, 
          stream: false,
          options
        }),
      });
      const data: GenerateResponse = await response.json();
      return data.response || "Error: Unexpected response format";
    } catch (error) {
      console.error('Error generating response:', error);
      return "Error: Failed to generate response";
    }
  };
  
  export const createModel = async (baseUrl: string, name: string, modelfile: string): Promise<void> => {
    try {
      await fetch(`${baseUrl}/api/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, modelfile }),
      });
    } catch (error) {
      console.error('Error creating model:', error);
      throw error;
    }
  };
  
  export const deleteModel = async (baseUrl: string, name: string): Promise<void> => {
    try {
      await fetch(`${baseUrl}/api/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
    } catch (error) {
      console.error('Error deleting model:', error);
      throw error;
    }
  };
  
  export const pullModel = async (baseUrl: string, name: string): Promise<void> => {
    try {
      await fetch(`${baseUrl}/api/pull`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
    } catch (error) {
      console.error('Error pulling model:', error);
      throw error;
    }
  };

  export interface ModelDetails {
    modelfile: string;
    parameters: string;
    template: string;
    details: {
      parent_model: string;
      format: string;
      family: string;
      families: string[];
      parameter_size: string;
      quantization_level: string;
    };
    model_info: {
      [key: string]: string | number | string[];
    };
  }
  
  // Add this function to the existing functions
  export const showModelDetails = async (baseUrl: string, name: string): Promise<ModelDetails> => {
    try {
      const response = await fetch(`${baseUrl}/api/show`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching model details:', error);
      throw error;
    }
  };
