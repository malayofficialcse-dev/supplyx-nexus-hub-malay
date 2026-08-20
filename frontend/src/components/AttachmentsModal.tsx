import * as React from "react";
import {
  FileText,
  Paperclip,
  Trash2,
  Upload,
  Download,
  CheckCircle2,
  File,
  AlertCircle,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Modal } from "./kit/Modal";
import { Button } from "./kit/Button";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/format";

export interface AttachmentItem {
  id: string;
  name: string;
  size?: number;
  type?: string;
  dataUrl?: string;
  uploader?: string;
  uploadedAt?: string;
}

interface AttachmentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: "invoices" | "contracts" | "orders" | "goods-receipts" | "goodsReceipts";
  entityId: string;
  entityLabel: string;
  attachments?: AttachmentItem[];
  invalidateKey: string;
}

export function AttachmentsModal({
  open,
  onOpenChange,
  entityType,
  entityId,
  entityLabel,
  attachments = [],
  invalidateKey,
}: AttachmentsModalProps) {
  const qc = useQueryClient();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  const addAttachmentMutation = useMutation({
    mutationFn: async (fileData: { name: string; size: number; type: string; dataUrl: string }) => {
      return api.post(`/attachments/${entityType}/${entityId}`, fileData);
    },
    onSuccess: () => {
      toast.success("Document attached successfully");
      void qc.invalidateQueries({ queryKey: [invalidateKey] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteAttachmentMutation = useMutation({
    mutationFn: async (attachmentId: string) => {
      return api.delete(`/attachments/${entityType}/${entityId}/${attachmentId}`);
    },
    onSuccess: () => {
      toast.success("Attachment removed");
      void qc.invalidateQueries({ queryKey: [invalidateKey] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds maximum limit of 10MB");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      addAttachmentMutation.mutate(
        {
          name: file.name,
          size: file.size,
          type: file.type || "application/octet-stream",
          dataUrl,
        },
        {
          onSettled: () => {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
          },
        }
      );
    };
    reader.onerror = () => {
      toast.error("Failed to read file");
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "0 KB";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleDownload = (att: AttachmentItem) => {
    if (att.dataUrl && att.dataUrl.startsWith("data:")) {
      const link = document.createElement("a");
      link.href = att.dataUrl;
      link.download = att.name;
      link.click();
    } else {
      // Simulate/download file
      const blob = new Blob([`SupplyX Document: ${att.name}`], { type: att.type || "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = att.name;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Document Attachments"
      description={`Manage attached PDF agreements, delivery notes & invoices for ${entityLabel}`}
      width="md"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-[11px] text-muted-foreground">
            {attachments.length} attached document{attachments.length === 1 ? "" : "s"}
          </span>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Upload Dropzone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer rounded-lg border-2 border-dashed border-border hover:border-primary/60 bg-muted/20 hover:bg-muted/40 p-4 text-center transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx"
            onChange={handleFileUpload}
          />
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Upload className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold text-foreground">
              {isUploading ? "Uploading document…" : "Click or drag files here to attach"}
            </p>
            <p className="text-[10px] text-muted-foreground">
              Supports PDF, scanned delivery receipts, TIFF, DOCX up to 10MB
            </p>
          </div>
        </div>

        {/* Attachment List */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Attached Files
          </h4>
          {attachments.length === 0 ? (
            <div className="rounded border border-border bg-card p-6 text-center text-xs text-muted-foreground">
              <Paperclip className="mx-auto h-6 w-6 text-muted-foreground/50 mb-1.5" />
              No documents attached yet. Click above to attach invoice or contract PDFs.
            </div>
          ) : (
            <div className="divide-y divide-border rounded border border-border bg-card">
              {attachments.map((att) => (
                <div
                  key={att.id || att.name}
                  className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-foreground">
                        {att.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatFileSize(att.size)} • {att.uploadedAt ? formatDateTime(att.uploadedAt) : "Attached"} • by {att.uploader || "System"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <Button
                      variant="subtle"
                      size="sm"
                      onClick={() => handleDownload(att)}
                      title="Download document"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="subtle"
                      size="sm"
                      disabled={deleteAttachmentMutation.isPending}
                      onClick={() => deleteAttachmentMutation.mutate(att.id)}
                      title="Delete attachment"
                      className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

export function AttachmentBadge({
  count = 0,
  onClick,
}: {
  count?: number;
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium transition-all ${
        count > 0
          ? "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
          : "bg-muted text-muted-foreground/60 hover:text-foreground hover:bg-muted/80 border border-transparent"
      }`}
      title={count > 0 ? `${count} document(s) attached` : "Attach document"}
    >
      <Paperclip className="h-3 w-3" />
      <span>{count > 0 ? count : "+"}</span>
    </button>
  );
}
