import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Trash2, Download, RefreshCw, Plus, Info } from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  checkConnection, 
  fetchModels, 
  generateResponse, 
  createModel, 
  deleteModel, 
  pullModel,
  showModelDetails,
} from '@/lib/ollama_api';

import type {  Model,
  ModelDetails} from './ollama_api';

const OllamaManagementUI = () => {
  const [server, setServer] = useState('http://localhost');
  const [port, setPort] = useState('11434');
  const [isConnected, setIsConnected] = useState(false);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [modelFile, setModelFile] = useState('');
  const [newModelName, setNewModelName] = useState('');
  const [modelToPull, setModelToPull] = useState('');
  const [modelToDelete, setModelToDelete] = useState<string | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showPullDialog, setShowPullDialog] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [modelDetails, setModelDetails] = useState<ModelDetails | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const baseUrl = `${server}:${port}`;

  const refreshModels = useCallback(async () => {
    const modelList = await fetchModels(baseUrl);
    setModels(modelList);
  }, [baseUrl]);

  const handleCheckConnection = async () => {
    const connected = await checkConnection(baseUrl);
    setIsConnected(connected);
    if (connected) {
      refreshModels();
    }
  };

  const handleGenerate = async () => {
    const generatedResponse = await generateResponse(baseUrl, selectedModel, prompt, { temperature });
    setResponse(generatedResponse);
  };

  const handleCreateModel = async () => {
    await createModel(baseUrl, newModelName, modelFile);
    refreshModels();
    setNewModelName('');
    setModelFile('');
  };

  const handleDeleteModel = (modelName: string) => {
    setModelToDelete(modelName);
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteModel = async () => {
    if (modelToDelete) {
      await deleteModel(baseUrl, modelToDelete);
      refreshModels();
    }
    setShowDeleteConfirmation(false);
  };

  const handlePullModel = async () => {
    await pullModel(baseUrl, modelToPull);
    refreshModels();
    setModelToPull('');
    setShowPullDialog(false);
  };

  const handleShowDetails = async (modelName: string) => {
    const details = await showModelDetails(baseUrl, modelName);
    setModelDetails(details);
    setShowDetailsDialog(true);
  };

  const formatSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString(), 10);
    return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
  };

  const ModelCard = ({ model }: { model: Model }) => (
    <Card className="p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg">{model.name}</h3>
          <p className="text-sm text-gray-500">Family: {model.details.family}</p>
          <p className="text-sm text-gray-500">Size: {formatSize(model.size)}</p>
          <p className="text-sm text-gray-500">Modified: {new Date(model.modified_at).toLocaleString()}</p>
          <p className="text-sm text-gray-500">Parameter Size: {model.details.parameter_size}</p>
          <p className="text-sm text-gray-500">Quantization: {model.details.quantization_level}</p>
        </div>
        <div className="flex flex-col space-y-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => handleShowDetails(model.name)}
          >
            <Info className="h-4 w-4" />
          </Button>
          <Button 
            variant="destructive" 
            size="icon"
            onClick={() => handleDeleteModel(model.name)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Ollama Management UI</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Server Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="Server"
              value={server}
              onChange={(e) => setServer(e.target.value)}
            />
            <Input
              placeholder="Port"
              value={port}
              onChange={(e) => setPort(e.target.value)}
            />
            <Button onClick={handleCheckConnection}>Connect</Button>
            <div className={`w-4 h-4 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </div>
        </CardContent>
      </Card>

      {isConnected ? (
        <Tabs defaultValue="list">
          <TabsList className="mb-4">
            <TabsTrigger value="list">List Models</TabsTrigger>
            <TabsTrigger value="generate">Generate</TabsTrigger>
            <TabsTrigger value="manage">Manage Models</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  Available Models
                  <div>
                    <Button onClick={refreshModels} size="sm" className="mr-2">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                    <Dialog open={showPullDialog} onOpenChange={setShowPullDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Pull Model
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Pull a New Model</DialogTitle>
                          <DialogDescription>
                            Enter the name of the model you want to pull.
                          </DialogDescription>
                        </DialogHeader>
                        <Input
                          placeholder="Model to pull"
                          value={modelToPull}
                          onChange={(e) => setModelToPull(e.target.value)}
                        />
                        <DialogFooter>
                          <Button onClick={handlePullModel}>Pull Model</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardTitle>
                <CardDescription>List of all available models on the server.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {models.map((model) => (
                    <ModelCard key={model.name} model={model} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="generate">
            <Card>
              <CardHeader>
                <CardTitle>Generate Response</CardTitle>
                <CardDescription>Select a model and enter a prompt to generate a response.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map((model) => (
                        <SelectItem key={model.name} value={model.name}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Enter your prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Temperature: {temperature}
                    </label>
                    <Slider
                      value={[temperature]}
                      onValueChange={(value) => setTemperature(value[0])}
                      min={0}
                      max={1}
                      step={0.1}
                    />
                  </div>
                  <Button onClick={handleGenerate}>Generate</Button>
                  {response && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Response</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>{response}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="manage">
            <Card>
              <CardHeader>
                <CardTitle>Manage Models</CardTitle>
                <CardDescription>Create or delete models.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold mb-2">Create Model</h3>
                    <Input
                      placeholder="New model name"
                      value={newModelName}
                      onChange={(e) => setNewModelName(e.target.value)}
                    />
                    <Input
                      placeholder="Modelfile content"
                      value={modelFile}
                      onChange={(e) => setModelFile(e.target.value)}
                    />
                    <Button onClick={handleCreateModel} className="mt-2">Create Model</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Alert>
          <AlertTitle>Not Connected</AlertTitle>
          <AlertDescription>
            Please connect to the Ollama server to use the management features.
          </AlertDescription>
        </Alert>
      )}

      <AlertDialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this model?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              model {modelToDelete}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteModel}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Model Details</DialogTitle>
          </DialogHeader>
          {modelDetails && (
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-bold">Modelfile</h3>
                <pre className="bg-gray-100 p-2 rounded">{modelDetails.modelfile}</pre>
              </div>
              <div>
                <h3 className="font-bold">Parameters</h3>
                <pre className="bg-gray-100 p-2 rounded">{modelDetails.parameters}</pre>
              </div>
              <div>
                <h3 className="font-bold">Template</h3>
                <pre className="bg-gray-100 p-2 rounded">{modelDetails.template}</pre>
              </div>
              <div>
                <h3 className="font-bold">Details</h3>
                <ul>
                  {Object.entries(modelDetails.details).map(([key, value]) => (
                    <li key={key}><strong>{key}:</strong> {Array.isArray(value) ? value.join(', ') : value}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-bold">Model Info</h3>
                <ul>
                  {Object.entries(modelDetails.model_info).map(([key, value]) => (
                    <li key={key}><strong>{key}:</strong> {Array.isArray(value) ? value.join(', ') : value}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OllamaManagementUI;
