A React Component and optional Astro Page implementing a simple Ollama web-interface.

Generated via Claude in 30 minutes as a technology evaluation.

[![Video](https://img.youtube.com/vi/oSyLLhmLgNs/0.jpg)](https://www.youtube.com/watch?v=oSyLLhmLgNs)

![image](https://github.com/georgzoeller/ollama-web-interface/assets/2640999/ed82930e-46e1-4a81-9360-6b1c91b41d21)
![image](https://github.com/georgzoeller/ollama-web-interface/assets/2640999/06b32e82-4a8b-466f-8c36-9460dfb887f7)
![image](https://github.com/georgzoeller/ollama-web-interface/assets/2640999/477a4a1e-511b-4b4d-9392-7476cb7e7de5)


## Prompts

## Initial Prompt used: 

```
make me a tailwind  shadcn astro page that can manage ollama by providing a modern, highly usable UI for it's API actions
Here's the API doc
```
Attached: [Ollama API page from github](https://github.com/ollama/ollama/blob/main/docs/api.md)

![image](https://github.com/georgzoeller/ollama-web-interface/assets/2640999/d425148b-9f68-4157-af87-674796e83906)


## Adding Server Selection and List Models

```
Add the ability to set server and port on top and pressing connect which will check the / endpoint for a 200 response and show a green circle for connected or a red circle and for failure. 

Also add a "List models"  feature with a flex grid to manage models tab and make that the first tab
```


### Adding features and iterating

```
add support for pulling models via a button on the list pageand a delete model button on each  model list.

Make sure the model list is reactive and shows one model per line. Also add some more info on the model list (family, size, etc) in human readable format
```


### Reduce code size, add some confirmation to deletion

Needed to reduce code size because it was approaching output token limit

```
Take some actions to reduce the size of the code file without changing functionality or layout. 
Add a confirmation modal before deleting a model and refresh button for the model list.
Finally the generate function isn't working, the server responds with a JWT, you need to set the streaming:false option
```

### Streamline UI

```
Let's make the model list more space efficient with reactivity - list up to 3 model cards per row on the list page on lg resolutions, 2 on md .
Expose the temperature parameter on the generate page
```

### Split files 

Need to split the file here to avoid busting token limit. from here on out, the artifact window can no longer preview changes.

```
To save tokens, lets move all the functions like fetchModels, etc that interact wtih the API into a separate file and import them. Please create the file artifacts as ollama_api.ts, make it well typed and produce an import statement I can add to the file
```

### Get the main component

```
Give me the new main component that uses ollama_api.ts
```

### Implement show models

From here things get slow because you have to copy and paste between files. This will all disappear once IDEs integrate LLM capabilities properly.

```
Add a show button to each model card that brings up a dialog with the details from the model show API call. Produce the fully updated main component

this is the new call exported from the api file you can use 

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
    const response = await fetch(${baseUrl}/api/show, {
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
```
