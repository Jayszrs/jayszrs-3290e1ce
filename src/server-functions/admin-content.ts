import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

const CONTENT_TABLES = [
  "certifications",
  "experiences",
  "education",
  "volunteers",
  "projects",
] as const;
const STORAGE_BUCKETS = [
  "cv",
  "certificates",
  "badges",
  "gallery",
  "documents",
  "avatars",
] as const;

type ContentTable = (typeof CONTENT_TABLES)[number];
type StorageBucket = (typeof STORAGE_BUCKETS)[number];
type ContentMutationInput = {
  accessToken: string;
  table: ContentTable;
  action: "insert" | "update" | "delete";
  id?: string;
  payload?: Record<string, unknown>;
};
type RoleMutationInput = {
  accessToken: string;
  userId: string;
  role: "admin" | "user";
};
type ProfileMutationInput = {
  accessToken: string;
  id: string;
  payload: Record<string, unknown>;
};
type UploadInput = {
  accessToken: string;
  bucket: StorageBucket;
  path: string;
  contentType: string;
  base64: string;
};

function readContentMutationInput(input: unknown): ContentMutationInput {
  const fields = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const table = String(fields.table || "");
  const action = String(fields.action || "");

  return {
    accessToken: String(fields.accessToken || ""),
    table: CONTENT_TABLES.includes(table as ContentTable) ? (table as ContentTable) : "projects",
    action: action === "update" || action === "delete" ? action : "insert",
    id: typeof fields.id === "string" ? fields.id : undefined,
    payload:
      fields.payload && typeof fields.payload === "object"
        ? (fields.payload as Record<string, unknown>)
        : undefined,
  };
}

function createAdminClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY belum ada di environment server.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function assertSeedAdmin(accessToken: string) {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.getUser(accessToken);

  if (error || !data.user) {
    throw new Error("Session admin tidak valid. Sign out lalu login ulang.");
  }

  const { data: role, error: roleError } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", data.user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (roleError || !role) {
    throw new Error("Session admin tidak valid. Role admin tidak ditemukan.");
  }

  return admin;
}

export const mutateAdminContent = createServerFn({ method: "POST" })
  .inputValidator(readContentMutationInput)
  .handler(async ({ data }) => {
    const admin = await assertSeedAdmin(data.accessToken);

    if (data.action === "delete") {
      if (!data.id) throw new Error("ID data tidak ditemukan.");
      const { error } = await admin.from(data.table).delete().eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true };
    }

    if (!data.payload) throw new Error("Payload data kosong.");

    if (data.action === "update") {
      if (!data.id) throw new Error("ID data tidak ditemukan.");
      const { error } = await admin.from(data.table).update(data.payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true };
    }

    const { error } = await admin.from(data.table).insert(data.payload);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const mutateAdminProfile = createServerFn({ method: "POST" })
  .inputValidator((input: unknown): ProfileMutationInput => {
    const fields = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;

    return {
      accessToken: String(fields.accessToken || ""),
      id: String(fields.id || ""),
      payload:
        fields.payload && typeof fields.payload === "object"
          ? (fields.payload as Record<string, unknown>)
          : {},
    };
  })
  .handler(async ({ data }) => {
    if (!data.id) throw new Error("ID profile tidak ditemukan.");
    const admin = await assertSeedAdmin(data.accessToken);
    const payload = { ...data.payload };

    delete payload.id;
    delete payload.updated_at;

    const { error } = await admin.from("profile_settings").update(payload).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const uploadAdminFile = createServerFn({ method: "POST" })
  .inputValidator((input: unknown): UploadInput => {
    const fields = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
    const bucket = String(fields.bucket || "");

    return {
      accessToken: String(fields.accessToken || ""),
      bucket: STORAGE_BUCKETS.includes(bucket as StorageBucket)
        ? (bucket as StorageBucket)
        : "documents",
      path: String(fields.path || ""),
      contentType: String(fields.contentType || "application/octet-stream"),
      base64: String(fields.base64 || ""),
    };
  })
  .handler(async ({ data }) => {
    if (!data.path || !data.base64) throw new Error("File upload tidak lengkap.");
    const admin = await assertSeedAdmin(data.accessToken);
    const bytes = Uint8Array.from(atob(data.base64), (char) => char.charCodeAt(0));
    const fileBody = new Blob([bytes], { type: data.contentType });

    const { error } = await admin.storage.from(data.bucket).upload(data.path, fileBody, {
      cacheControl: "3600",
      contentType: data.contentType,
      upsert: true,
    });

    if (error) throw new Error(error.message);

    const { data: publicData } = admin.storage.from(data.bucket).getPublicUrl(data.path);
    return { publicUrl: publicData.publicUrl };
  });

export const listAdminUsersFallback = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const fields = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
    return { accessToken: String(fields.accessToken || "") };
  })
  .handler(async ({ data }) => {
    const admin = await assertSeedAdmin(data.accessToken);
    const { data: usersPage, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });

    if (error) throw new Error(error.message);

    const { data: roles } = await admin.from("user_roles").select("user_id, role");
    const roleMap = new Map((roles || []).map((role) => [role.user_id, role.role]));

    return usersPage.users.map((user) => ({
      user_id: user.id,
      email: user.email || null,
      role: (roleMap.get(user.id) || "user") as "admin" | "user",
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at || null,
    }));
  });

export const setAdminUserRoleFallback = createServerFn({ method: "POST" })
  .inputValidator((input: unknown): RoleMutationInput => {
    const fields = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
    const role = fields.role === "admin" ? "admin" : "user";

    return {
      accessToken: String(fields.accessToken || ""),
      userId: String(fields.userId || ""),
      role,
    };
  })
  .handler(async ({ data }) => {
    if (!data.userId) throw new Error("User ID kosong.");
    const admin = await assertSeedAdmin(data.accessToken);

    const { error: deleteError } = await admin
      .from("user_roles")
      .delete()
      .eq("user_id", data.userId);
    if (deleteError) throw new Error(deleteError.message);

    const { error: insertError } = await admin
      .from("user_roles")
      .insert({ user_id: data.userId, role: data.role });

    if (insertError) throw new Error(insertError.message);
    return { ok: true };
  });

export const removeAdminUserRoleFallback = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const fields = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
    return {
      accessToken: String(fields.accessToken || ""),
      userId: String(fields.userId || ""),
    };
  })
  .handler(async ({ data }) => {
    if (!data.userId) throw new Error("User ID kosong.");
    const admin = await assertSeedAdmin(data.accessToken);
    const { error } = await admin.from("user_roles").delete().eq("user_id", data.userId);

    if (error) throw new Error(error.message);
    return { ok: true };
  });
