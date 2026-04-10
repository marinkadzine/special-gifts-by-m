import { createClient } from "@supabase/supabase-js";
import { UploadedReference } from "@/types/store";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
let browserClient: ReturnType<typeof createClient> | null = null;

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function humanizeStorageError(message: string, fileName: string, bucketName: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("bucket") && normalized.includes("not found")) {
    return `The Supabase upload bucket is missing. Please re-run supabase/schema.sql so the '${bucketName}' bucket is created, then try the upload again.`;
  }

  if (normalized.includes("row-level security") || normalized.includes("permission")) {
    return `The '${bucketName}' bucket exists, but its storage policy is blocking the upload. Please re-run supabase/schema.sql to refresh the storage policies.`;
  }

  return message || `Could not upload ${fileName}.`;
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
        throw new Error(humanizeStorageError(error.message, file.name, "order-assets"));
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

export async function uploadProfileImage(file: File, userId: string) {
  const supabase = getBrowserSupabaseClient();

  if (!supabase) {
    return "";
  }

  const filePath = `${userId}/${Date.now()}-${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;
  const { error } = await supabase.storage.from("profile-images").upload(filePath, file, {
    upsert: true,
  });

  if (error) {
    throw new Error(humanizeStorageError(error.message, file.name, "profile-images"));
  }

  const { data } = supabase.storage.from("profile-images").getPublicUrl(filePath);
  return data.publicUrl;
}
