import { createClient } from "@supabase/supabase-js";
import { UploadedReference } from "@/types/store";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
let browserClient: ReturnType<typeof createClient> | null = null;

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export function getBrowserSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  if (!browserClient) {
    browserClient = createClient(supabaseUrl, supabaseAnonKey);
  }

  return browserClient;
}

export async function uploadReferenceFiles(files: File[], productSlug: string) {
  const supabase = getBrowserSupabaseClient();

  if (!supabase) {
    return files.map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type,
      url: "",
      path: "",
    })) satisfies UploadedReference[];
  }

  const uploadedFiles = await Promise.all(
    files.map(async (file) => {
      const filePath = `${productSlug}/${Date.now()}-${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;
      const { error } = await supabase.storage.from("order-assets").upload(filePath, file, {
        upsert: false,
      });

      if (error) {
        throw new Error(error.message || `Could not upload ${file.name}.`);
      }

      const { data } = supabase.storage.from("order-assets").getPublicUrl(filePath);

      return {
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        url: data.publicUrl,
        path: filePath,
      } satisfies UploadedReference;
    }),
  );

  return uploadedFiles;
}
