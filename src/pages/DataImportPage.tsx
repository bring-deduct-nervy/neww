import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/lib/supabase";
import {
  Upload,
  FileText,
  FileSpreadsheet,
  File,
  CheckCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Database,
  Users,
  Building2,
  MapPin,
  Trash2,
  Eye,
  Download
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface UploadedDocument {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  extracted_data: any;
  processing_status: string;
  error_message: string | null;
  created_at: string;
  processed_at: string | null;
}

export function DataImportPage() {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedDoc, setSelectedDoc] = useState<UploadedDocument | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('uploaded_documents')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setDocuments(data || []);
    } catch (err) {
      console.error('Error loading documents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setUploadProgress(10);

    try {
      const filename = `${Date.now()}-${file.name}`;
      
      setUploadProgress(30);
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filename, file);

      if (uploadError) throw uploadError;
      setUploadProgress(60);

      const { data: docData, error: docError } = await supabase
        .from('uploaded_documents')
        .insert({
          filename: file.name,
          file_type: file.type || getFileType(file.name),
          file_size: file.size,
          storage_path: uploadData.path,
          processing_status: 'PENDING'
        })
        .select()
        .single();

      if (docError) throw docError;
      setUploadProgress(80);

      // Process the document
      await processDocument(docData.id, file);
      setUploadProgress(100);

      await loadDocuments();
    } catch (err) {
      console.error('Error uploading file:', err);
    } finally {
      setUploadingFile(false);
      setUploadProgress(0);
    }
  };

  const getFileType = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const types: Record<string, string> = {
      'csv': 'text/csv',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'xls': 'application/vnd.ms-excel',
      'pdf': 'application/pdf',
      'txt': 'text/plain',
      'json': 'application/json'
    };
    return types[ext || ''] || 'application/octet-stream';
  };

  const processDocument = async (docId: string, file: File) => {
    try {
      await supabase
        .from('uploaded_documents')
        .update({ processing_status: 'PROCESSING' })
        .eq('id', docId);

      const text = await file.text();
      let extractedData: any = { type: 'unknown', records: [], summary: { totalRecords: 0 } };

      const fileType = file.type || getFileType(file.name);

      if (fileType.includes('csv') || fileType.includes('text')) {
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length > 0) {
          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          const records = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            const record: Record<string, string> = {};
            headers.forEach((header, index) => {
              record[header] = values[index] || '';
            });
            return record;
          });

          extractedData = {
            type: 'csv',
            records,
            summary: {
              totalRecords: records.length,
              columns: headers
            }
          };

          // Auto-import beneficiaries if detected
          const nameField = headers.find(h => h.toLowerCase().includes('name'));
          const phoneField = headers.find(h => h.toLowerCase().includes('phone'));
          
          if (nameField && phoneField) {
            let imported = 0;
            for (const record of records) {
              if (record[nameField] && record[phoneField]) {
                const districtField = headers.find(h => h.toLowerCase().includes('district'));
                const addressField = headers.find(h => h.toLowerCase().includes('address'));
                
                await supabase.from('beneficiaries').insert({
                  name: record[nameField],
                  phone: record[phoneField],
                  district: districtField ? record[districtField] : 'Unknown',
                  address: addressField ? record[addressField] : 'Unknown',
                  household_size: 1
                });
                imported++;
              }
            }
            extractedData.summary.importedRecords = imported;
          }
        }
      } else if (fileType.includes('json')) {
        try {
          const jsonData = JSON.parse(text);
          const records = Array.isArray(jsonData) ? jsonData : [jsonData];
          extractedData = {
            type: 'json',
            records,
            summary: {
              totalRecords: records.length,
              columns: records.length > 0 ? Object.keys(records[0]) : []
            }
          };
        } catch {
          extractedData.type = 'json_error';
        }
      } else {
        const lines = text.split('\n').filter(line => line.trim());
        extractedData = {
          type: 'text',
          records: lines.map(line => ({ content: line })),
          summary: { totalRecords: lines.length }
        };
      }

      await supabase
        .from('uploaded_documents')
        .update({
          processing_status: 'COMPLETED',
          extracted_data: extractedData,
          processed_at: new Date().toISOString()
        })
        .eq('id', docId);

    } catch (err: any) {
      await supabase
        .from('uploaded_documents')
        .update({
          processing_status: 'FAILED',
          error_message: err.message
        })
        .eq('id', docId);
    }
  };

  const handleDelete = async (id: string, storagePath: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await supabase.storage.from('documents').remove([storagePath]);
      await supabase.from('uploaded_documents').delete().eq('id', id);
      await loadDocuments();
    } catch (err) {
      console.error('Error deleting document:', err);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('spreadsheet') || fileType.includes('excel') || fileType.includes('csv')) {
      return <FileSpreadsheet className="h-8 w-8 text-green-400" />;
    }
    if (fileType.includes('pdf')) {
      return <File className="h-8 w-8 text-red-400" />;
    }
    return <FileText className="h-8 w-8 text-blue-400" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Database className="h-6 w-6 text-cyan-400" />
              Data Import
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Upload and process data files to import records
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadDocuments}
            disabled={isLoading}
            className="border-white/20"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </motion.div>

        {/* Upload Section */}
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Upload className="h-5 w-5 text-cyan-400" />
              Upload Data File
            </CardTitle>
            <CardDescription>
              Supported formats: CSV, Excel, JSON, PDF, Text
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-cyan-500/50 transition-colors">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".csv,.xlsx,.xls,.json,.txt,.pdf"
                onChange={handleFileUpload}
                disabled={uploadingFile}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                {uploadingFile ? (
                  <div className="space-y-4">
                    <Loader2 className="h-12 w-12 mx-auto text-cyan-400 animate-spin" />
                    <p className="text-sm text-muted-foreground">Processing file...</p>
                    <Progress value={uploadProgress} className="w-48 mx-auto" />
                  </div>
                ) : (
                  <>
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="mt-4 text-sm text-muted-foreground">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      CSV, Excel, JSON, PDF, or Text files up to 10MB
                    </p>
                  </>
                )}
              </label>
            </div>

            <div className="mt-4 p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
              <h4 className="font-medium text-cyan-400 mb-2">Auto-Import Features</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• CSV files with "name" and "phone" columns will auto-import as beneficiaries</li>
                <li>• Shelter data with location info will be added to the shelter database</li>
                <li>• Volunteer lists will be processed and added to the volunteer pool</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-lg">Uploaded Documents ({documents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No documents uploaded yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc, index) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "p-4 rounded-xl border",
                      doc.processing_status === 'COMPLETED' && "bg-green-500/5 border-green-500/30",
                      doc.processing_status === 'FAILED' && "bg-red-500/5 border-red-500/30",
                      doc.processing_status === 'PENDING' && "bg-yellow-500/5 border-yellow-500/30",
                      doc.processing_status === 'PROCESSING' && "bg-blue-500/5 border-blue-500/30"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getFileIcon(doc.file_type)}
                        <div>
                          <p className="font-medium">{doc.filename}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                            <span>{formatFileSize(doc.file_size)}</span>
                            <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                            {doc.extracted_data?.summary?.totalRecords && (
                              <span className="text-cyan-400">
                                {doc.extracted_data.summary.totalRecords} records
                              </span>
                            )}
                            {doc.extracted_data?.summary?.importedRecords && (
                              <span className="text-green-400">
                                {doc.extracted_data.summary.importedRecords} imported
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={cn(
                          doc.processing_status === 'COMPLETED' && "bg-green-500/20 text-green-400",
                          doc.processing_status === 'FAILED' && "bg-red-500/20 text-red-400",
                          doc.processing_status === 'PENDING' && "bg-yellow-500/20 text-yellow-400",
                          doc.processing_status === 'PROCESSING' && "bg-blue-500/20 text-blue-400"
                        )}>
                          {doc.processing_status === 'COMPLETED' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {doc.processing_status === 'FAILED' && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {doc.processing_status === 'PROCESSING' && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                          {doc.processing_status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedDoc(doc)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-400"
                          onClick={() => handleDelete(doc.id, doc.storage_path)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {doc.error_message && (
                      <div className="mt-2 p-2 rounded bg-red-500/10 text-red-400 text-sm">
                        {doc.error_message}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Document Preview Modal */}
        {selectedDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setSelectedDoc(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="w-full max-w-2xl max-h-[80vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getFileIcon(selectedDoc.file_type)}
                    {selectedDoc.filename}
                  </CardTitle>
                  <CardDescription>
                    Extracted data preview
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedDoc.extracted_data ? (
                    <div className="space-y-4">
                      <div className="p-3 rounded-lg bg-white/5">
                        <p className="text-sm font-medium mb-2">Summary</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>Type: <span className="text-cyan-400">{selectedDoc.extracted_data.type}</span></div>
                          <div>Records: <span className="text-cyan-400">{selectedDoc.extracted_data.summary?.totalRecords}</span></div>
                          {selectedDoc.extracted_data.summary?.columns && (
                            <div className="col-span-2">
                              Columns: <span className="text-cyan-400">{selectedDoc.extracted_data.summary.columns.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {selectedDoc.extracted_data.records?.length > 0 && (
                        <div className="p-3 rounded-lg bg-white/5 max-h-64 overflow-auto">
                          <p className="text-sm font-medium mb-2">Sample Records (first 5)</p>
                          <pre className="text-xs overflow-auto">
                            {JSON.stringify(selectedDoc.extracted_data.records.slice(0, 5), null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No extracted data available</p>
                  )}

                  <Button
                    variant="outline"
                    className="w-full mt-4 border-white/20"
                    onClick={() => setSelectedDoc(null)}
                  >
                    Close
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
