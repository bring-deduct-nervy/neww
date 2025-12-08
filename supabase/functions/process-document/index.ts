import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExtractedData {
  type: string;
  records: any[];
  summary: {
    totalRecords: number;
    columns?: string[];
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { documentId } = await req.json();

    if (!documentId) {
      return new Response(
        JSON.stringify({ error: 'Document ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: doc, error: docError } = await supabase
      .from('uploaded_documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docError || !doc) {
      return new Response(
        JSON.stringify({ error: 'Document not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    await supabase
      .from('uploaded_documents')
      .update({ processing_status: 'PROCESSING' })
      .eq('id', documentId);

    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(doc.storage_path);

    if (downloadError) {
      await supabase
        .from('uploaded_documents')
        .update({ 
          processing_status: 'FAILED',
          error_message: 'Failed to download file'
        })
        .eq('id', documentId);

      return new Response(
        JSON.stringify({ error: 'Failed to download file' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let extractedData: ExtractedData = {
      type: doc.file_type,
      records: [],
      summary: { totalRecords: 0 }
    };

    const fileType = doc.file_type.toLowerCase();
    const text = await fileData.text();

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

        if (headers.some(h => h.toLowerCase().includes('name') || h.toLowerCase().includes('phone'))) {
          for (const record of records) {
            const nameField = Object.keys(record).find(k => k.toLowerCase().includes('name'));
            const phoneField = Object.keys(record).find(k => k.toLowerCase().includes('phone'));
            const districtField = Object.keys(record).find(k => k.toLowerCase().includes('district'));
            const addressField = Object.keys(record).find(k => k.toLowerCase().includes('address'));

            if (nameField && phoneField && record[nameField] && record[phoneField]) {
              await supabase.from('beneficiaries').insert({
                name: record[nameField],
                phone: record[phoneField],
                district: districtField ? record[districtField] : 'Unknown',
                address: addressField ? record[addressField] : 'Unknown',
                household_size: 1
              });
            }
          }
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
        summary: {
          totalRecords: lines.length
        }
      };
    }

    await supabase
      .from('uploaded_documents')
      .update({
        processing_status: 'COMPLETED',
        extracted_data: extractedData,
        processed_at: new Date().toISOString()
      })
      .eq('id', documentId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        extractedData,
        message: `Processed ${extractedData.summary.totalRecords} records`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing document:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
