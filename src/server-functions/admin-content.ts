import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAILS = [
  "jayszrs@admin.local",
  "jaelanisuryasaputra@gmail.com",
  "jaelanisurya.akademicrypto@gmail.com",
] as const;

const CONTENT_TABLES = [
  "certifications",
  "experiences",
  "education",
  "volunteers",
  "projects",
] as const;

type ContentTable = (typeof CONTENT_TABLES)[number];
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

function readContentMutationInput(input: unknown): ContentMutationInput {
  const fields = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const table = String(fields.table || "");
  const action = String(fields.action || "");

  return {
    accessToken: String(fields.accessToken || ""),
    table: CONTENT_TABLES.includes(table as ContentTable)
      ? (table as ContentTable)
      : "projects",
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

  if (error || !data.user || !ADMIN_EMAILS.includes(data.user.email?.toLowerCase() as any)) {
    throw new Error("Session admin tidak valid. Sign out lalu login ulang.");
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

    const { error: deleteError } = await admin.from("user_roles").delete().eq("user_id", data.userId);
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
