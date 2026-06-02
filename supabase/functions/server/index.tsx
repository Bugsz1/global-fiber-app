import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

const app = new Hono();
const USER_KEY = "user:abner:perfil";

app.use("*", logger(console.log));
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

app.get("/make-server-6a374317/health", (c) => c.json({ status: "ok" }));

// Retorna perfil do usuário (plano ativo + outros dados persistidos)
app.get("/make-server-6a374317/perfil", async (c) => {
  try {
    const perfil = await kv.get(USER_KEY);
    return c.json(perfil ?? { planoAtivo: "Global Fiber 200" });
  } catch (e) {
    console.log("Erro ao buscar perfil:", e);
    return c.json({ error: String(e) }, 500);
  }
});

// Atualiza o plano ativo do usuário
app.put("/make-server-6a374317/perfil/plano", async (c) => {
  try {
    const { planoAtivo } = await c.req.json();
    if (!planoAtivo) return c.json({ error: "planoAtivo é obrigatório" }, 400);
    const perfilAtual = (await kv.get(USER_KEY)) ?? {};
    await kv.set(USER_KEY, { ...perfilAtual, planoAtivo });
    return c.json({ ok: true, planoAtivo });
  } catch (e) {
    console.log("Erro ao atualizar plano:", e);
    return c.json({ error: String(e) }, 500);
  }
});

// Cria um novo usuário via Supabase Auth Admin
app.post("/make-server-6a374317/usuarios", async (c) => {
  try {
    const { nome, email, senha, plano, perfil } = await c.req.json();
    if (!nome || !email || !senha) {
      return c.json({ error: "nome, email e senha são obrigatórios" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: senha,
      user_metadata: { nome, plano: plano ?? "", perfil: perfil ?? "cliente" },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true,
    });

    if (error) {
      console.log("Erro ao criar usuário:", error);
      return c.json({ error: error.message }, 400);
    }

    // Persiste dados extras no kv
    const kvKey = `usuario:${data.user.id}`;
    await kv.set(kvKey, {
      id: data.user.id,
      nome,
      email,
      plano: plano ?? "",
      perfil: perfil ?? "cliente",
      criadoEm: new Date().toISOString(),
    });

    return c.json({ ok: true, id: data.user.id, nome, email });
  } catch (e) {
    console.log("Erro ao criar usuário:", e);
    return c.json({ error: String(e) }, 500);
  }
});

// Lista todos os usuários cadastrados
app.get("/make-server-6a374317/usuarios", async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) {
      console.log("Erro ao listar usuários:", error);
      return c.json({ error: error.message }, 500);
    }

    const usuarios = data.users.map((u) => ({
      id: u.id,
      email: u.email,
      nome: u.user_metadata?.nome ?? "",
      plano: u.user_metadata?.plano ?? "",
      perfil: u.user_metadata?.perfil ?? "cliente",
      criadoEm: u.created_at,
      confirmado: u.email_confirmed_at != null,
    }));

    return c.json({ usuarios });
  } catch (e) {
    console.log("Erro ao listar usuários:", e);
    return c.json({ error: String(e) }, 500);
  }
});

// Atualiza metadados de um usuário pelo ID
app.put("/make-server-6a374317/usuarios/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const { nome, plano, perfil } = await c.req.json();
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data, error } = await supabase.auth.admin.updateUserById(id, {
      user_metadata: { nome, plano, perfil },
    });

    if (error) return c.json({ error: error.message }, 400);

    const kvKey = `usuario:${id}`;
    const perfilAtual = (await kv.get(kvKey)) ?? {};
    await kv.set(kvKey, { ...perfilAtual, nome, plano, perfil });

    return c.json({ ok: true, id });
  } catch (e) {
    return c.json({ error: String(e) }, 500);
  }
});

// Deleta um usuário pelo ID
app.delete("/make-server-6a374317/usuarios/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { error } = await supabase.auth.admin.deleteUser(id);
    if (error) {
      console.log("Erro ao deletar usuário:", error);
      return c.json({ error: error.message }, 400);
    }

    await kv.del(`usuario:${id}`);
    return c.json({ ok: true });
  } catch (e) {
    console.log("Erro ao deletar usuário:", e);
    return c.json({ error: String(e) }, 500);
  }
});

Deno.serve(app.fetch);
