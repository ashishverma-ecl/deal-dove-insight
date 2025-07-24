import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, FileText, ArrowLeft, Plus } from "lucide-react";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles: UploadedFile[] = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);

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

  const handleCreateAssessment = async () => {
    if (!title.trim()) {
      toast({ title: "Error", description: "Please enter the client name", variant: "destructive" });
      return;
    }

    if (uploadedFiles.length === 0) {
      toast({ title: "Error", description: "Please upload at least one document", variant: "destructive" });
      return;
    }

    setIsCreating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Error", description: "You must be logged in to create an assessment", variant: "destructive" });
        return;
      }

      const sessionTag = crypto.randomUUID(); // Unique session tag for this upload session

      const { data: assessment, error: assessmentError } = await supabase
        .from("assessments")
        .insert({
          title: title.trim(),
          user_id: user.id,
          status: "draft",
          session_tag: sessionTag,
        })
        .select()
        .single();

      if (assessmentError) throw assessmentError;

      setIsUploading(true);
      const uploadPromises = uploadedFiles.map(async (uploadedFile) => {
        const fileName = `${user.id}/${assessment.id}/${uploadedFile.id}-${uploadedFile.name}`;

        const { error: uploadError } = await supabase.storage
          .from("assessment-documents")
          .upload(fileName, uploadedFile.file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from("assessment-documents").getPublicUrl(fileName);

        const { error: docError } = await supabase
          .from("assessment_documents")
          .insert({
            assessment_id: assessment.id,
            file_name: uploadedFile.name,
            file_path: fileName,
            file_size: uploadedFile.size,
            content_type: uploadedFile.type,
            title: title.trim(),
            url: urlData.publicUrl,
            session_tag: sessionTag,
          });

        if (docError) throw docError;
      });

      await Promise.all(uploadPromises);

      const webhookData = {
        assessment_id: assessment.id,
        title: assessment.title,
        user_email: user.email,
        documents_count: uploadedFiles.length,
        session_tag: sessionTag,
        timestamp: new Date().toISOString(),
      };

      try {
        const { error: webhookError } = await supabase.functions.invoke('notify-webhooks', {
          body: webhookData,
        });

        if (webhookError) console.error('Webhook notification failed:', webhookError);
      } catch (webhookError) {
        console.error('Webhook notification error:', webhookError);
      }

      toast({ title: "Success", description: "Assessment created successfully with all documents uploaded" });
      navigate(`/assessment/${assessment.id}`);
    } catch (error: any) {
      console.error("Error creating assessment:", error);
      toast({ title: "Error", description: error.message || "Failed to create assessment", variant: "destructive" });
    } finally {
      setIsUploading(false);
      setIsCreating(false);
    }
  };

  return (
    // ... UI part remains unchanged
    // Just copy and use your existing UI from the original code block
  );
};

export default CreateAssessment;