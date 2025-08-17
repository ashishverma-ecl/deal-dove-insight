import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, FileText, ArrowLeft, Plus } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
}

const CreateAssessment = () => {
  const [title, setTitle] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isWaitingForResults, setIsWaitingForResults] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // Generate session ID when first files are selected (if not already generated)
    if (uploadedFiles.length === 0 && !sessionId) {
      setSessionId(uuidv4());
    }

    const newFiles: UploadedFile[] = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);
    
    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const pollForResults = async (sessionId: string, assessmentId: string) => {
    const maxPollingTime = 10 * 60 * 1000; // 10 minutes for complete processing
    const pollingInterval = 10000; // 10 seconds
    const startTime = Date.now();
    let previousResultCount = 0;
    let stableCheckCount = 0;
    const requiredStableChecks = 3; // Number of consecutive checks with same count

    const poll = async (): Promise<boolean> => {
      try {
        // Check current number of results for this session
        const { data: resultsData, error: resultsError } = await supabase
          .from('ai_output')
          .select('id, screening_criterion')
          .eq('session_id', sessionId);

        if (resultsError) {
          console.error('Error polling for results:', resultsError);
          return false;
        }

        const currentResultCount = resultsData?.length || 0;
        console.log(`Current results count: ${currentResultCount} for session: ${sessionId}`);

        // Check if processing is complete by looking for stability in result count
        if (currentResultCount > 0) {
          if (currentResultCount === previousResultCount) {
            stableCheckCount++;
            console.log(`Stable check ${stableCheckCount}/${requiredStableChecks} - Count unchanged at ${currentResultCount}`);
            
            // If count has been stable for required checks, consider processing complete
            if (stableCheckCount >= requiredStableChecks) {
              console.log('Processing appears complete - result count stable');
              return true;
            }
          } else {
            // Count changed, reset stability counter
            stableCheckCount = 0;
            previousResultCount = currentResultCount;
            console.log(`Result count increased to ${currentResultCount}, continuing to monitor...`);
          }
        }

        // Check if we've exceeded the maximum polling time
        if (Date.now() - startTime > maxPollingTime) {
          console.log('Polling timeout reached');
          return false;
        }

        // Wait before polling again
        await new Promise(resolve => setTimeout(resolve, pollingInterval));
        return poll();
      } catch (error) {
        console.error('Polling error:', error);
        return false;
      }
    };

    return poll();
  };

  const handleCreateAssessment = async () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter the client name",
        variant: "destructive",
      });
      return;
    }

    if (uploadedFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please upload at least one document",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to create an assessment",
          variant: "destructive",
        });
        return;
      }

      // Generate a new session ID for this assessment run
      const sessionId = uuidv4();
      sessionStorage.setItem('chatbot_session_id', sessionId);

      // Create assessment record
      const { data: assessment, error: assessmentError } = await supabase
        .from("assessments")
        .insert({
          title: title.trim(),
          user_id: user.id,
          status: "draft",
        })
        .select()
        .single();

      if (assessmentError) {
        throw assessmentError;
      }

      // Upload files and create document records
      setIsUploading(true);
      const uploadPromises = uploadedFiles.map(async (uploadedFile) => {
        const fileName = `${user.id}/${assessment.id}/${uploadedFile.id}-${uploadedFile.name}`;
        
        // Upload file to storage
        const { error: uploadError } = await supabase.storage
          .from("assessment-documents")
          .upload(fileName, uploadedFile.file);

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL for the uploaded file
        const { data: urlData } = supabase.storage
          .from("assessment-documents")
          .getPublicUrl(fileName);

        // Create document record in assessment_documents table with session_id
        const { error: docError } = await supabase
          .from("assessment_documents")
          .insert({
            assessment_id: assessment.id,
            file_name: uploadedFile.name,
            file_path: fileName,
            file_size: uploadedFile.size,
            content_type: uploadedFile.type,
            title: title.trim(), // Set title to client name
            url: urlData.publicUrl, // Store the public URL
            session_id: sessionId, // Add session ID to track this upload session
          });

        if (docError) {
          throw docError;
        }
      });

      await Promise.all(uploadPromises);

      // Trigger webhook notifications via Edge Function
      const webhookData = {
        assessment_id: assessment.id,
        title: assessment.title,
        user_email: user.email,
        documents_count: uploadedFiles.length,
        session_id: sessionId,
        timestamp: new Date().toISOString(),
      };

      try {
        const { error: webhookError } = await supabase.functions.invoke('notify-webhooks', {
          body: webhookData
        });

        if (webhookError) {
          console.error('Webhook notification failed:', webhookError);
        } else {
          console.log('Webhook notifications sent successfully');
        }
      } catch (webhookError) {
        console.error('Webhook notification error:', webhookError);
        // Don't break the flow if webhook fails
      }

      toast({
        title: "Success",
        description: `Assessment created successfully. Processing documents...`,
      });

      // Start polling for results
      setIsWaitingForResults(true);
      const resultsFound = await pollForResults(sessionId, assessment.id);
      
      if (resultsFound) {
        toast({
          title: "Assessment Complete",
          description: "Analysis results are now available",
        });
        navigate(`/assessment/${assessment.id}`);
      } else {
        toast({
          title: "Processing Timeout",
          description: "Assessment is still processing. You can check results later from the dashboard.",
          variant: "destructive",
        });
        navigate(`/dashboard`);
      }
    } catch (error: any) {
      console.error("Error creating assessment:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create assessment",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setIsCreating(false);
      setIsWaitingForResults(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/61690229-7cfd-4603-b3d7-cf1f5b7ccd95.png" 
              alt="Logo" 
              className="h-10 w-auto"
            />
            <div>
              <p className="text-lg font-bold text-foreground">Reputational Risk Assessment Solution</p>
            </div>
          </div>
          <Link to="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Create New Assessment</h1>
            <p className="text-muted-foreground">
              Upload documents for environmental and social due diligence analysis
            </p>
          </div>

          <div className="space-y-6">
            {/* Assessment Title */}
            <Card>
              <CardHeader>
                <CardTitle>Assessment Details</CardTitle>
                <CardDescription>
                  Provide a title for your assessment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="title">Name of the Client</Label>
                  <Input
                    id="title"
                    placeholder="Enter client name..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Document Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Document Upload</CardTitle>
                <CardDescription>
                  Upload documents for analysis. Supported formats: PDF, DOC, DOCX, TXT
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Upload Area */}
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <div className="space-y-2">
                    <p className="text-lg font-medium">Drop files here or click to browse</p>
                    <p className="text-sm text-muted-foreground">
                      Select one or more documents to upload
                    </p>
                  </div>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Select Files
                  </Button>
                </div>

                {/* Add More Button */}
                {uploadedFiles.length > 0 && (
                  <div className="flex justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add More Documents
                    </Button>
                  </div>
                )}

                {/* Session ID Display */}
                {sessionId && (
                  <div className="p-3 bg-muted/50 rounded-lg border">
                    <p className="text-sm font-medium text-muted-foreground">Session ID</p>
                    <p className="text-sm font-mono">{sessionId}</p>
                  </div>
                )}

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-medium">Uploaded Documents ({uploadedFiles.length})</h3>
                    <div className="grid gap-3">
                      {uploadedFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{file.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(file.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Processing Status */}
                {isWaitingForResults && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      <div>
                        <p className="font-medium text-blue-800">Processing Assessment</p>
                        <p className="text-sm text-blue-600">
                          Analyzing documents and generating results. This may take a few minutes...
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Create Assessment Button */}
                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleCreateAssessment}
                    disabled={isCreating || isUploading || isWaitingForResults || uploadedFiles.length === 0 || !title.trim()}
                    size="lg"
                  >
                    {isCreating || isUploading ? "Uploading..." : 
                     isWaitingForResults ? "Processing..." : "Run Assessment"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateAssessment;