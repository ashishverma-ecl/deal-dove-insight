import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
}

const CreateAssessment = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    const newSessionId = crypto.randomUUID();
    setSessionId(newSessionId);
  }, []);

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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to create an assessment",
          variant: "destructive",
        });
        return;
      }

      const { data: assessment, error: assessmentError } = await supabase
        .from("assessments")
        .insert({
          title: title.trim(),
          user_id: user.id,
          status: "draft",
          session_id: sessionId,
        })
        .select()
        .single();

      if (assessmentError) {
        throw assessmentError;
      }

      setIsUploading(true);

      const uploadPromises = uploadedFiles.map(async (uploadedFile) => {
        const fileName = `${user.id}/${assessment.id}/${uploadedFile.id}-${uploadedFile.name}`;

        const { error: uploadError } = await supabase.storage
          .from("assessment-documents")
          .upload(fileName, uploadedFile.file);

        if (uploadError) {
          throw uploadError;
        }

        const { data: urlData } = supabase.storage
          .from("assessment-documents")
          .getPublicUrl(fileName);

        const { error: docError } = await supabase.from("assessment_documents").insert({
          assessment_id: assessment.id,
          session_id: sessionId,
          file_name: uploadedFile.name,
          file_path: fileName,
          file_size: uploadedFile.size,
          content_type: uploadedFile.type,
          title: title.trim(),
          url: urlData.publicUrl,
        });

        if (docError) {
          throw docError;
        }
      });

      await Promise.all(uploadPromises);

      const webhookUrl = "https://climatewarrior87.app.n8n.cloud/webhook-test/e9171c46-f42b-4dec-b411-47faa89c790c";
      const webhookData = {
        assessment_id: assessment.id,
        title: assessment.title,
        user_email: user.email,
        documents_count: uploadedFiles.length,
        session_id: sessionId,
        timestamp: new Date().toISOString(),
      };

      await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(webhookData),
      });

      toast({
        title: "Assessment Created",
        description: `New assessment '${assessment.title}' created successfully`,
      });

      navigate(`/assessment/${assessment.id}`);
    } catch (error) {
      console.error("Error creating assessment:", error);
      toast({
        title: "Error",
        description: "Failed to create assessment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setIsCreating(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Create New Assessment</h1>
      <Label htmlFor="clientName">Client Name</Label>
      <Input
        id="clientName"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mb-4"
      />
      {/* Add your file upload component here and update uploadedFiles */}
      <Button onClick={handleCreateAssessment} disabled={isCreating || isUploading}>
        {isCreating || isUploading ? "Creating..." : "Create Assessment"}
      </Button>
    </div>
  );
};

export default CreateAssessment;