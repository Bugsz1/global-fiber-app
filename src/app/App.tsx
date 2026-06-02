import { useState, useEffect, useCallback, useRef } from "react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import logoGlobal from "@/imports/logo_global_azul-8.png";
import { projectId, publicAnonKey } from "/utils/supabase/info";

const API = `https://${projectId}.supabase.co/functions/v1/make-server-6a374317`;
const headers = { "Content-Type": "application/json", Authorization: `Bearer ${publicAnonKey}` };
import {
  Home,
  FileText,
  Activity,
  Star,
  Package,
  ChevronRight,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  Wifi,
  Play,
  BookOpen,
  Music,
  Gift,
  Bell,
  TrendingUp,
  ArrowUpRight,
  Shield,
  Headphones,
  Zap,
  Globe,
  User,
  Eye,
  EyeOff,
  Lock,
  Mail,
  LogOut,
  Edit3,
  CreditCard,
  MapPin,
  Phone,
  ChevronDown,
  Settings,
  HelpCircle,
  Copy,
  Check,
  Gauge,
  Users,
  UserPlus,
  Trash2,
} from "lucide-react";

const BLUE = "#002cf2";
const TURQUESA = "#01ffe6";
const NAVY = "#00113a";

type Tab = "inicio" | "faturas" | "consumo" | "assinaturas" | "beneficios" | "perfil" | "usuarios";

const consumoSemanal = [
  { dia: "Seg", gb: 12 },
  { dia: "Ter", gb: 18 },
  { dia: "Qua", gb: 9 },
  { dia: "Qui", gb: 24 },
  { dia: "Sex", gb: 31 },
  { dia: "Sáb", gb: 45 },
  { dia: "Dom", gb: 38 },
];

const consumoMensal = [
  { mes: "Jan", gb: 520 },
  { mes: "Fev", gb: 790 },
  { mes: "Mar", gb: 610 },
  { mes: "Abr", gb: 450 },
  { mes: "Mai", gb: 615 },
];

const faturas = [
  { id: "2025-05", mes: "Maio 2025", valor: "R$ 209,99", status: "aberta", venc: "15/06/2025" },
  { id: "2025-04", mes: "Abril 2025", valor: "R$ 209,99", status: "paga", venc: "15/05/2025" },
  { id: "2025-03", mes: "Março 2025", valor: "R$ 209,99", status: "paga", venc: "15/04/2025" },
  { id: "2025-02", mes: "Fevereiro 2025", valor: "R$ 209,99", status: "paga", venc: "15/03/2025" },
  { id: "2025-01", mes: "Janeiro 2025", valor: "R$ 209,99", status: "paga", venc: "15/02/2025" },
];

const assinaturas = [
  {
    categoria: "Streaming de Vídeo",
    icon: Play,
    cor: "#e50914",
    itens: [
      { nome: "Netflix Standard", preco: "R$ 39,90/mês", incluso: true, desc: "2 telas simultâneas em Full HD" },
      { nome: "Disney+", preco: "R$ 27,90/mês", incluso: false, desc: "Filmes, séries e conteúdo exclusivo" },
      { nome: "HBO Max", preco: "R$ 34,90/mês", incluso: false, desc: "Séries premium e filmes em 4K" },
    ],
  },
  {
    categoria: "Música",
    icon: Music,
    cor: "#1db954",
    itens: [
      { nome: "Spotify Premium", preco: "R$ 21,90/mês", incluso: true, desc: "Música sem anúncios e offline" },
      { nome: "Deezer Premium", preco: "R$ 16,90/mês", incluso: false, desc: "90 milhões de músicas em alta qualidade" },
    ],
  },
  {
    categoria: "Leitura e Aprendizado",
    icon: BookOpen,
    cor: "#ff9500",
    itens: [
      { nome: "Kindle Unlimited", preco: "R$ 19,90/mês", incluso: false, desc: "Acesso a mais de 4 milhões de livros" },
      { nome: "Ubook", preco: "R$ 29,90/mês", incluso: false, desc: "Audiobooks e e-books em português" },
    ],
  },
];

const beneficios = [
  { icon: Shield,     titulo: "Segurança Digital",   desc: "Antivírus e proteção para até 5 dispositivos inclusos no seu plano.", cor: BLUE,      disponivel: true },
  { icon: Headphones, titulo: "Suporte 24h",          desc: "Atendimento técnico prioritário via chat, telefone ou videochamada.",  cor: "#0a7a5e", disponivel: true },
  { icon: Wifi,       titulo: "Roteador Premium",     desc: "Equipamento Wi-Fi 6 sem taxa de comodato para clientes há mais de 1 ano.", cor: "#6d28d9", disponivel: true },
  { icon: Zap,        titulo: "Velocidade Garantida", desc: "SLA de 99,5% de uptime com compensação automática em caso de falha.", cor: "#d97706", disponivel: true },
  { icon: Globe,      titulo: "IP Fixo",              desc: "Endereço IP fixo dedicado para home office ou servidores domésticos.", cor: "#0891b2", disponivel: false },
  { icon: Gift,       titulo: "Indique e Ganhe",      desc: "Ganhe 1 mês grátis para cada amigo que contratar a Global Fiber.",    cor: "#be185d", disponivel: true },
];

// ─── Login ───────────────────────────────────────────────────────────────────

type UsuarioLogado = { id: string; nome: string; email: string; plano: string; perfil: string; token: string };

function TelaLogin({ onLogin }: { onLogin: (u: UsuarioLogado) => void }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async () => {
    if (!email || !senha) { setErro("Preencha e-mail e senha."); return; }
    setErro("");
    setCarregando(true);
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const sb = createClient(
        `https://${projectId}.supabase.co`,
        publicAnonKey,
      );
      const { data, error } = await sb.auth.signInWithPassword({ email, password: senha });
      if (error || !data.session) {
        setErro("E-mail ou senha incorretos.");
        return;
      }
      const u = data.user;
      onLogin({
        id: u.id,
        nome: u.user_metadata?.nome ?? email.split("@")[0],
        email: u.email ?? email,
        plano: u.user_metadata?.plano ?? "Global Fiber 200",
        perfil: u.user_metadata?.perfil ?? "cliente",
        token: data.session.access_token,
      });
    } catch (e) {
      setErro("Erro ao conectar. Tente novamente.");
      console.log("Erro login:", e);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* Top hero */}
      <div
        className="flex-shrink-0 flex flex-col items-center justify-end pb-8 pt-10 px-6 relative overflow-hidden"
        style={{ background: `linear-gradient(160deg, ${NAVY} 0%, ${BLUE} 100%)`, minHeight: 220 }}
      >
        {/* decorative circles */}
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full opacity-10" style={{ background: TURQUESA }} />
        <div className="absolute top-16 -left-8 w-24 h-24 rounded-full opacity-10" style={{ background: TURQUESA }} />

        {/* Logo */}
        <div className="bg-white rounded-2xl px-6 py-3 mb-3 shadow-sm">
          <ImageWithFallback
            src={logoGlobal}
            alt="Global Fiber — Internet por Fibra Óptica"
            className="h-16 w-auto object-contain"
          />
        </div>
        <p className="text-white/60 text-xs text-center">Sua conexão com o mundo começa aqui.</p>
      </div>

      {/* Form */}
      <div className="flex-1 bg-background px-6 pt-7 pb-6 flex flex-col gap-4 overflow-y-auto">
        <h2 className="font-extrabold text-xl text-foreground">Entrar na sua conta</h2>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">E-mail</label>
          <div className="flex items-center gap-2 bg-white border border-border rounded-xl px-3 py-2.5 focus-within:ring-2" style={{ focusWithinRingColor: BLUE } as React.CSSProperties}>
            <Mail size={15} style={{ color: BLUE }} />
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 text-sm outline-none bg-transparent text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Senha */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Senha</label>
          <div className="flex items-center gap-2 bg-white border border-border rounded-xl px-3 py-2.5">
            <Lock size={15} style={{ color: BLUE }} />
            <input
              type={mostrarSenha ? "text" : "password"}
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="flex-1 text-sm outline-none bg-transparent text-foreground placeholder:text-muted-foreground"
            />
            <button onClick={() => setMostrarSenha((v) => !v)} className="text-muted-foreground hover:text-foreground transition-colors">
              {mostrarSenha ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {erro && <p className="text-xs text-red-500 font-medium">{erro}</p>}

        <div className="flex justify-end">
          <button className="text-xs font-semibold" style={{ color: BLUE }}>Esqueci minha senha</button>
        </div>

        {/* Botão entrar */}
        <button
          onClick={handleLogin}
          disabled={carregando}
          className="w-full py-3.5 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-opacity"
          style={{ background: `linear-gradient(90deg, ${BLUE}, #3355ff)`, opacity: carregando ? 0.7 : 1 }}
        >
          {carregando ? (
            <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="31" strokeDashoffset="10" strokeLinecap="round" />
            </svg>
          ) : null}
          {carregando ? "Entrando..." : "Entrar"}
        </button>

        {/* Divisor */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">ou acesse com</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* CPF login */}
        <button
          className="w-full py-3 rounded-2xl font-semibold text-sm border-2 flex items-center justify-center gap-2 hover:bg-secondary transition-colors"
          style={{ borderColor: BLUE, color: BLUE }}
        >
          <CreditCard size={15} /> Entrar com CPF
        </button>

        <p className="text-center text-xs text-muted-foreground mt-2">
          Problemas para acessar?{" "}
          <button className="font-semibold" style={{ color: BLUE }}>Fale conosco</button>
        </p>
      </div>
    </div>
  );
}

// ─── Perfil ──────────────────────────────────────────────────────────────────

const planosResidencial = [
  {
    nome: "Global Fiber 100",
    velocidade: "100 MB",
    upload: "50 MB",
    preco: 159.99,
    destaque: false,
    cor: "#0891b2",
    recursos: ["Wi-Fi incluso", "Suporte 24h", "Instalação grátis"],
  },
  {
    nome: "Global Fiber 200",
    velocidade: "200 MB",
    upload: "100 MB",
    preco: 209.99,
    destaque: true,
    cor: BLUE,
    recursos: ["Wi-Fi incluso", "Suporte 24h", "IP fixo opcional", "Instalação grátis"],
  },
  {
    nome: "Global Fiber 300",
    velocidade: "300 MB",
    upload: "150 MB",
    preco: 309.99,
    destaque: false,
    cor: "#7c3aed",
    recursos: ["Wi-Fi 6 incluso", "Suporte 24h VIP", "IP fixo incluso", "Instalação grátis", "Roteador premium"],
  },
];

const planosPymes = [
  {
    nome: "Pymes 500",
    velocidade: "500 MB",
    upload: "250 MB",
    preco: 509.99,
    destaque: false,
    cor: "#d97706",
    recursos: ["Wi-Fi 6 empresarial", "Suporte 24h VIP", "IP fixo incluso", "Instalação grátis", "SLA garantido"],
  },
  {
    nome: "Pymes 700",
    velocidade: "700 MB",
    upload: "350 MB",
    preco: 609.99,
    destaque: true,
    cor: "#16a34a",
    recursos: ["Wi-Fi 6 empresarial", "Suporte 24h dedicado", "IP fixo incluso", "Instalação grátis", "SLA 99,5%", "Gerente de conta"],
  },
  {
    nome: "Pymes 1 Giga",
    velocidade: "1 GB",
    upload: "500 MB",
    preco: 859.99,
    destaque: false,
    cor: "#be185d",
    recursos: ["Wi-Fi 6 empresarial", "Suporte 24h dedicado", "IP fixo incluso", "Instalação grátis", "SLA 99,9%", "Gerente de conta", "Backup de link"],
  },
];

const todosOsPlanos = [...planosResidencial, ...planosPymes];
type PlanoInfo = (typeof todosOsPlanos)[number];

// ─── TabUsuarios ──────────────────────────────────────────────────────────────

type Usuario = { id: string; nome: string; email: string; plano: string; perfil: string; criadoEm: string; confirmado: boolean };


function TabUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [form, setForm] = useState({ nome: "", email: "", senha: "", plano: "Global Fiber 200", perfil: "cliente" });
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState("");
  const [deletando, setDeletando] = useState<string | null>(null);

  const carregar = async () => {
    setLoading(true);
    setErro("");
    try {
      const r = await fetch(`${API}/usuarios`, { headers });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Erro ao carregar");
      setUsuarios(d.usuarios ?? []);
    } catch (e) {
      setErro(String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const handleCriar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setErroForm("");
    try {
      const r = await fetch(`${API}/usuarios`, {
        method: "POST",
        headers,
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Erro ao criar");
      setModalAberto(false);
      setForm({ nome: "", email: "", senha: "", plano: "Global Fiber 200", perfil: "cliente" });
      carregar();
    } catch (e) {
      setErroForm(String(e));
    } finally {
      setSalvando(false);
    }
  };

  const handleDeletar = async (id: string) => {
    setDeletando(id);
    try {
      const r = await fetch(`${API}/usuarios/${id}`, { method: "DELETE", headers });
      if (!r.ok) { const d = await r.json(); throw new Error(d.error); }
      carregar();
    } catch (e) {
      setErro(String(e));
    } finally {
      setDeletando(null);
    }
  };

  const planos = ["Global Fiber 200", "Global Fiber 500", "Global Fiber 1GB", "Global Fiber Business"];

  return (
    <div className="flex flex-col gap-4 pb-6">
      {/* Header */}
      <div className="rounded-2xl p-5 text-white" style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${BLUE} 100%)` }}>
        <p className="text-xs font-mono tracking-widest uppercase mb-1" style={{ color: TURQUESA }}>Administração</p>
        <h2 className="text-xl font-extrabold" style={{ fontFamily: "'Montserrat', sans-serif" }}>Usuários</h2>
        <p className="text-sm text-white/60 mt-0.5">{usuarios.length} cadastrado{usuarios.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Botão novo usuário */}
      <button
        onClick={() => setModalAberto(true)}
        className="w-full py-3 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2"
        style={{ background: `linear-gradient(90deg, ${NAVY}, ${BLUE})` }}
      >
        <UserPlus size={16} /> Novo Usuário
      </button>

      {/* Erro geral */}
      {erro && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-700">{erro}</div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-10">
          <svg className="animate-spin" width={28} height={28} viewBox="0 0 24 24" fill="none">
            <circle cx={12} cy={12} r={10} stroke={BLUE} strokeWidth={3} strokeDasharray={31} strokeDashoffset={10} strokeLinecap="round" />
          </svg>
        </div>
      ) : usuarios.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground text-sm">Nenhum usuário cadastrado ainda.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {usuarios.map((u) => (
            <div key={u.id} className="bg-white rounded-2xl p-4 shadow-sm border border-border">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-white text-sm"
                  style={{ background: `linear-gradient(135deg, ${NAVY}, ${BLUE})` }}>
                  {u.nome?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-foreground truncate">{u.nome || "—"}</p>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {u.plano && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white" style={{ background: BLUE }}>{u.plano}</span>
                    )}
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground capitalize">{u.perfil}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${u.confirmado ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                      {u.confirmado ? "Confirmado" : "Pendente"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeletar(u.id)}
                  disabled={deletando === u.id}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors flex-shrink-0"
                >
                  {deletando === u.id
                    ? <svg className="animate-spin" width={14} height={14} viewBox="0 0 24 24" fill="none"><circle cx={12} cy={12} r={10} stroke="currentColor" strokeWidth={3} strokeDasharray={31} strokeDashoffset={10} strokeLinecap="round" /></svg>
                    : <Trash2 size={14} />}
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 pl-13">
                Criado em {new Date(u.criadoEm).toLocaleDateString("pt-BR")}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Modal novo usuário */}
      {modalAberto && (
        <div className="absolute inset-0 z-50 flex items-end bg-black/40" onClick={() => setModalAberto(false)}>
          <div className="w-full bg-background rounded-t-3xl p-5 flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-foreground">Novo Usuário</h3>
              <button onClick={() => setModalAberto(false)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground font-bold text-lg">×</button>
            </div>
            <form onSubmit={handleCriar} className="flex flex-col gap-3">
              {[
                { label: "Nome completo", key: "nome", type: "text", placeholder: "Ex: João Silva" },
                { label: "E-mail", key: "email", type: "email", placeholder: "joao@email.com" },
                { label: "Senha", key: "senha", type: "password", placeholder: "Mínimo 6 caracteres" },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-foreground mb-1 block">{label}</label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    required
                    className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ "--tw-ring-color": BLUE } as React.CSSProperties}
                  />
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Plano</label>
                <select
                  value={form.plano}
                  onChange={(e) => setForm((f) => ({ ...f, plano: e.target.value }))}
                  className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background focus:outline-none"
                >
                  {planos.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Perfil</label>
                <div className="flex gap-2">
                  {["cliente", "admin", "tecnico"].map((p) => (
                    <button key={p} type="button" onClick={() => setForm((f) => ({ ...f, perfil: p }))}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold border transition-all capitalize"
                      style={form.perfil === p ? { background: BLUE, color: "#fff", borderColor: BLUE } : { borderColor: "#e5e7eb", color: "#6b7280" }}
                    >{p}</button>
                  ))}
                </div>
              </div>
              {erroForm && <p className="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2">{erroForm}</p>}
              <button
                type="submit"
                disabled={salvando}
                className="w-full py-3 rounded-2xl font-bold text-sm text-white mt-1 disabled:opacity-60"
                style={{ background: `linear-gradient(90deg, ${NAVY}, ${BLUE})` }}
              >
                {salvando ? "Salvando…" : "Criar Usuário"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TabPerfil ────────────────────────────────────────────────────────────────

function TabPerfil({ onLogout, planoAtivo, onChangePlano, onAbrirPlanos, usuario }: { onLogout: () => void; planoAtivo: string; onChangePlano: (nome: string) => void; onAbrirPlanos: () => void; usuario: UsuarioLogado }) {
  const [secaoAberta, setSecaoAberta] = useState<string | null>(null);
  const infoPlanoAtual = todosOsPlanos.find((p) => p.nome === planoAtivo)!;
  const toggle = (s: string) => setSecaoAberta((v) => (v === s ? null : s));
  const iniciais = usuario.nome.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  const codigoIndicacao = (usuario.nome.split(" ")[0] ?? "USER").toUpperCase().replace(/[^A-Z0-9]/g, "") + "25";

  return (
    <div className="flex flex-col gap-4 pb-6">
      {/* Avatar hero */}
      <div
        className="rounded-2xl p-5 text-white relative overflow-hidden flex items-center gap-4"
        style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${BLUE} 100%)` }}
      >
        <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-10" style={{ background: TURQUESA }} />
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center font-extrabold text-2xl flex-shrink-0"
          style={{ background: TURQUESA, color: NAVY, fontFamily: "'Montserrat', sans-serif" }}
        >
          {iniciais}
        </div>
        <div className="flex-1">
          <p className="font-extrabold text-lg leading-tight">{usuario.nome}</p>
          <p className="text-white/60 text-xs mt-0.5">{usuario.email}</p>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: TURQUESA, color: NAVY }}>
              Cliente desde Jan/2024
            </span>
          </div>
        </div>
        <button className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
          <Edit3 size={14} className="text-white" />
        </button>
      </div>

      {/* Plano ativo */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-border">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Meu Plano</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-extrabold text-base text-foreground">{planoAtivo}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Fibra Óptica · {infoPlanoAtual?.velocidade}</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full text-white" style={{ background: BLUE }}>Ativo</span>
        </div>
        <div className="mt-3 pt-3 border-t border-border flex justify-between text-xs text-muted-foreground">
          <span>Contrato nº <span className="font-mono font-semibold text-foreground">GF-2024-00821</span></span>
          <button onClick={onAbrirPlanos} style={{ color: BLUE }} className="font-semibold">Ver detalhes</button>
        </div>
      </div>

      {/* Dados pessoais accordion */}
      {[
        {
          id: "dados",
          titulo: "Dados Pessoais",
          icon: User,
          conteudo: (
            <div className="flex flex-col gap-3 pt-3">
              {[
                { label: "Nome completo", valor: usuario.nome },
                { label: "CPF", valor: "•••.•••.372-30" },
                { label: "Data de nascimento", valor: "23/09/2000" },
              ].map(({ label, valor }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className="text-xs font-semibold text-foreground">{valor}</span>
                </div>
              ))}
            </div>
          ),
        },
        {
          id: "contato",
          titulo: "Contato",
          icon: Phone,
          conteudo: (
            <div className="flex flex-col gap-3 pt-3">
              {[
                { label: "Telefone", valor: "(92) 9 8432-3903" },
                { label: "E-mail", valor: usuario.email },
                { label: "WhatsApp", valor: "(92) 9 8432-3903" },
              ].map(({ label, valor }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className="text-xs font-semibold text-foreground">{valor}</span>
                </div>
              ))}
            </div>
          ),
        },
        {
          id: "endereco",
          titulo: "Endereço de Instalação",
          icon: MapPin,
          conteudo: (
            <div className="flex flex-col gap-3 pt-3">
              {[
                { label: "Rua", valor: "Rua Carvalho Moreira, 32 — casa." },
                { label: "Bairro", valor: "Dom Pedro" },
                { label: "Cidade", valor: "Manaus — AM" },
                { label: "CEP", valor: "69042-630" },
              ].map(({ label, valor }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className="text-xs font-semibold text-foreground text-right max-w-[55%]">{valor}</span>
                </div>
              ))}
            </div>
          ),
        },
        {
          id: "pagamento",
          titulo: "Forma de Pagamento",
          icon: CreditCard,
          conteudo: (
            <div className="flex flex-col gap-3 pt-3">
              {[
                { label: "Método", valor: "Débito automático" },
                { label: "Banco", valor: "Nubank" },
                { label: "Conta", valor: "••••  ••••  4521" },
                { label: "Vencimento", valor: "Todo dia 15" },
              ].map(({ label, valor }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className="text-xs font-semibold text-foreground">{valor}</span>
                </div>
              ))}
            </div>
          ),
        },
      ].map(({ id, titulo, icon: Icon, conteudo }) => (
        <div key={id} className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
          <button
            onClick={() => toggle(id)}
            className="w-full flex items-center justify-between p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: BLUE + "12" }}>
                <Icon size={15} style={{ color: BLUE }} />
              </div>
              <span className="font-semibold text-sm text-foreground">{titulo}</span>
            </div>
            <ChevronDown
              size={16}
              className="text-muted-foreground transition-transform"
              style={{ transform: secaoAberta === id ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>
          {secaoAberta === id && (
            <div className="px-4 pb-4 border-t border-border">
              {conteudo}
              <button
                className="mt-3 w-full py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 hover:bg-secondary transition-colors"
                style={{ borderColor: BLUE, color: BLUE }}
              >
                <Edit3 size={12} /> Editar {titulo.toLowerCase()}
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Configurações e ajuda */}
      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        {[
          { icon: Settings,   label: "Configurações do app",    cor: "#6d28d9" },
          { icon: HelpCircle, label: "Central de ajuda",        cor: "#0891b2" },
          { icon: Shield,     label: "Privacidade e segurança", cor: BLUE },
        ].map(({ icon: Icon, label, cor }, i, arr) => (
          <button
            key={label}
            className={`w-full flex items-center justify-between px-4 py-3.5 hover:bg-secondary transition-colors ${i < arr.length - 1 ? "border-b border-border" : ""}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: cor + "15" }}>
                <Icon size={15} style={{ color: cor }} />
              </div>
              <span className="text-sm font-medium text-foreground">{label}</span>
            </div>
            <ChevronRight size={15} className="text-muted-foreground" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border-2 transition-colors hover:bg-red-50"
        style={{ borderColor: "#d4183d", color: "#d4183d" }}
      >
        <LogOut size={15} /> Sair da conta
      </button>

      <p className="text-center text-xs text-muted-foreground">Global Fiber v1.0.1 · CNPJ 49.416.302/0001-34</p>
    </div>
  );
}

// ─── Telas do app principal ───────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  if (status === "paga") {
    return (
      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
        <CheckCircle2 size={11} /> Paga
      </span>
    );
  }
  if (status === "aberta") {
    return (
      <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
        <AlertCircle size={11} /> Em aberto
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
      <Clock size={11} /> Vencida
    </span>
  );
}

function MiniAreaChart({ data, height, showAxes }: { data: { dia: string; gb: number }[]; height: number; showAxes?: boolean }) {
  const W = 300, H = height;
  const padL = showAxes ? 32 : 4, padR = 4, padT = 8, padB = showAxes ? 24 : 4;
  const vals = data.map(d => d.gb);
  const maxV = Math.max(...vals);
  const xs = data.map((_, i) => padL + (i / (data.length - 1)) * (W - padL - padR));
  const ys = vals.map(v => padT + (1 - v / maxV) * (H - padT - padB));
  const line = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ");
  const area = `${line} L${xs[xs.length - 1]},${H - padB} L${xs[0]},${H - padB} Z`;
  const [tooltip, setTooltip] = useState<{ idx: number; x: number; y: number } | null>(null);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} onMouseLeave={() => setTooltip(null)}>
      <defs>
        <linearGradient id="mga" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={BLUE} stopOpacity={0.18} />
          <stop offset="100%" stopColor={BLUE} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#mga)" />
      <path d={line} fill="none" stroke={BLUE} strokeWidth={2} strokeLinejoin="round" />
      {showAxes && data.map((d, i) => (
        <text key={d.dia} x={xs[i]} y={H - 6} textAnchor="middle" fontSize={10} fill="#3a4fa0">{d.dia}</text>
      ))}
      {showAxes && [0, Math.round(maxV / 2), maxV].map((v, i) => {
        const y = padT + (1 - v / maxV) * (H - padT - padB);
        return <text key={i} x={padL - 4} y={y + 4} textAnchor="end" fontSize={9} fill="#3a4fa0">{v}</text>;
      })}
      {xs.map((x, i) => (
        <rect key={i} x={x - 12} y={0} width={24} height={H} fill="transparent"
          onMouseEnter={() => setTooltip({ idx: i, x, y: ys[i] })} />
      ))}
      {tooltip && (
        <>
          <line x1={tooltip.x} y1={padT} x2={tooltip.x} y2={H - padB} stroke={BLUE} strokeWidth={1} strokeDasharray="3,2" opacity={0.5} />
          <circle cx={tooltip.x} cy={tooltip.y} r={4} fill={BLUE} />
          <rect x={Math.min(tooltip.x - 28, W - 60)} y={tooltip.y - 28} width={56} height={20} rx={4} fill={NAVY} />
          <text x={Math.min(tooltip.x, W - 32)} y={tooltip.y - 14} textAnchor="middle" fontSize={10} fill="#fff">{data[tooltip.idx].gb} GB</text>
        </>
      )}
    </svg>
  );
}

function MiniBarChart({ data, height }: { data: { mes: string; gb: number }[]; height: number }) {
  const W = 300, H = height;
  const padL = 36, padR = 4, padT = 8, padB = 24;
  const vals = data.map(d => d.gb);
  const maxV = Math.max(...vals);
  const bw = Math.floor((W - padL - padR) / data.length * 0.6);
  const gap = (W - padL - padR) / data.length;
  const [tooltip, setTooltip] = useState<{ idx: number } | null>(null);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} onMouseLeave={() => setTooltip(null)}>
      {data.map((d, i) => {
        const bh = (d.gb / maxV) * (H - padT - padB);
        const x = padL + i * gap + (gap - bw) / 2;
        const y = H - padB - bh;
        const hov = tooltip?.idx === i;
        return (
          <g key={d.mes}>
            <rect x={x} y={y} width={bw} height={bh} rx={4} fill={hov ? NAVY : BLUE}
              onMouseEnter={() => setTooltip({ idx: i })} style={{ cursor: "default" }} />
            <text x={x + bw / 2} y={H - 6} textAnchor="middle" fontSize={10} fill="#3a4fa0">{d.mes}</text>
            {hov && (
              <>
                <rect x={Math.min(x + bw / 2 - 28, W - 60)} y={y - 24} width={56} height={20} rx={4} fill={NAVY} />
                <text x={Math.min(x + bw / 2, W - 32)} y={y - 10} textAnchor="middle" fontSize={10} fill="#fff">{d.gb} GB</text>
              </>
            )}
          </g>
        );
      })}
      {[0, Math.round(maxV / 2), maxV].map((v, i) => {
        const y = padT + (1 - v / maxV) * (H - padT - padB);
        return <text key={i} x={padL - 4} y={y + 4} textAnchor="end" fontSize={9} fill="#3a4fa0">{v}</text>;
      })}
    </svg>
  );
}

function TabInicio({ planoAtivo, infoPlano, onNavigate }: { planoAtivo: string; infoPlano: PlanoInfo; onNavigate: (tab: Tab) => void }) {
  const usadoGB = 215;
  const totalGB = 1000;
  const pct = Math.round((usadoGB / totalGB) * 100);
  const precoFormatado = `R$ ${infoPlano.preco.toFixed(2).replace(".", ",")}`;
  const velNum = parseFloat(infoPlano.velocidade);
  const velAtual = infoPlano.velocidade.includes("GB") ? "985 Mbps" : `${Math.round(velNum * 0.97)} Mbps`;
  const [modalSuporte, setModalSuporte] = useState(false);

  return (
    <div className="flex flex-col gap-4 pb-6">
      <div
        className="rounded-2xl p-5 text-white relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${BLUE} 100%)` }}
      >
        <div
          className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-20"
          style={{ background: `radial-gradient(circle, ${TURQUESA} 0%, transparent 70%)`, transform: "translate(30%, -30%)" }}
        />
        <p className="text-xs font-mono tracking-widest uppercase mb-1" style={{ color: TURQUESA }}>Plano Ativo</p>
        <h2 className="text-2xl font-extrabold tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          {planoAtivo.toUpperCase()}
        </h2>
        <p className="text-sm mt-0.5 text-white/70">Fibra Óptica • {infoPlano.velocidade}</p>

        <div className="mt-5">
          <div className="flex justify-between text-xs text-white/70 mb-1.5">
            <span>Consumo este mês</span>
            <span className="font-mono font-semibold text-white">{usadoGB} / {totalGB} GB</span>
          </div>
          <div className="h-2 rounded-full bg-white/20">
            <div
              className="h-2 rounded-full transition-all"
              style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${TURQUESA}, #80fff5)` }}
            />
          </div>
          <p className="text-right text-xs text-white/60 mt-1 font-mono">{pct}% utilizado</p>
        </div>

        <div className="mt-4 flex gap-3">
          <div className="flex-1 bg-white/10 rounded-xl p-3">
            <p className="text-xs text-white/60">Próxima fatura</p>
            <p className="text-base font-bold mt-0.5">{precoFormatado}</p>
            <p className="text-xs text-white/60">Vence 15/06</p>
          </div>
          <div className="flex-1 bg-white/10 rounded-xl p-3">
            <p className="text-xs text-white/60">Velocidade atual</p>
            <p className="text-base font-bold mt-0.5">{velAtual}</p>
            <p className="text-xs flex items-center gap-0.5" style={{ color: TURQUESA }}>
              <TrendingUp size={10} /> Estável
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "2ª Via", icon: FileText, cor: BLUE, onClick: () => onNavigate("faturas") },
          { label: "Consumo", icon: Activity, cor: "#0891b2", onClick: () => onNavigate("consumo") },
          { label: "Suporte", icon: Headphones, cor: "#7c3aed", onClick: () => setModalSuporte(true) },
        ].map(({ label, icon: Icon, cor, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className="bg-white rounded-2xl p-4 flex flex-col items-center gap-2 shadow-sm border border-border hover:shadow-md transition-shadow active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: cor + "18" }}>
              <Icon size={20} style={{ color: cor }} />
            </div>
            <span className="text-xs font-semibold text-foreground">{label}</span>
          </button>
        ))}
      </div>

      {/* Modal Suporte */}
      {modalSuporte && (
        <div className="absolute inset-x-0 bottom-0 z-50 bg-background flex flex-col rounded-t-3xl" style={{ height: "90%", overflow: "hidden" }}>
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 text-white" style={{ background: NAVY }}>
            <div>
              <p className="text-[10px] font-mono tracking-widest uppercase" style={{ color: TURQUESA }}>Global Fiber</p>
              <h1 className="text-sm font-bold leading-tight">Central de Suporte</h1>
            </div>
            <button
              onClick={() => setModalSuporte(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white font-bold text-lg"
            >
              ×
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-4 pb-6 flex flex-col gap-4">
            {/* Hero */}
            <div
              className="rounded-2xl p-4 text-white flex items-center gap-3 relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #7c3aed 100%)` }}
            >
              <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-15" style={{ background: TURQUESA }} />
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.15)" }}>
                <Headphones size={22} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-sm">Como podemos ajudar?</p>
                <p className="text-xs text-white/60 mt-0.5">Atendimento disponível 24h por dia</p>
              </div>
            </div>

            {/* Canais de atendimento */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">Canais de Atendimento</p>
              <div className="flex flex-col gap-2">
                {[
                  { icon: Phone,      label: "Ligar agora",         desc: "0800 999 0000 — Gratuito",        cor: "#16a34a", badge: "Grátis" },
                  { icon: Globe,      label: "WhatsApp",            desc: "(11) 9 8000-0000",                 cor: "#25d366", badge: "Online" },
                  { icon: Headphones, label: "Chat ao vivo",        desc: "Tempo médio: 2 minutos",           cor: BLUE,      badge: null },
                  { icon: Mail,       label: "E-mail / Ticket",     desc: "Resposta em até 4 horas",          cor: "#d97706", badge: null },
                ].map(({ icon: Icon, label, desc, cor, badge }) => (
                  <button key={label} className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm border border-border hover:shadow-md transition-shadow active:scale-[0.98] text-left">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: cor + "18" }}>
                      <Icon size={18} style={{ color: cor }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                    </div>
                    {badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white flex-shrink-0" style={{ background: cor }}>{badge}</span>
                    )}
                    <ChevronRight size={14} className="text-muted-foreground flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Tópicos frequentes */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">Tópicos Frequentes</p>
              <div className="flex flex-col gap-2">
                {[
                  { titulo: "Minha internet está lenta",         icon: Wifi },
                  { titulo: "Não consigo acessar o roteador",    icon: Settings },
                  { titulo: "Problemas com a fatura",            icon: FileText },
                  { titulo: "Agendar visita técnica",            icon: MapPin },
                  { titulo: "Cancelar ou alterar plano",         icon: Package },
                ].map(({ titulo, icon: Icon }) => (
                  <button key={titulo} className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm border border-border hover:bg-secondary transition-colors text-left">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: BLUE + "12" }}>
                      <Icon size={15} style={{ color: BLUE }} />
                    </div>
                    <span className="flex-1 text-sm font-medium text-foreground">{titulo}</span>
                    <ChevronRight size={14} className="text-muted-foreground flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Protocolo de atendimento */}
            <div className="bg-secondary rounded-2xl p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: BLUE + "18" }}>
                <Shield size={15} style={{ color: BLUE }} />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">Protocolo do último atendimento</p>
                <p className="font-mono text-xs text-muted-foreground mt-0.5">#GF-2025-084721</p>
                <p className="text-xs text-muted-foreground mt-0.5">12/05/2025 — Instabilidade de rede resolvida</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm text-foreground">Última Fatura</h3>
          <span className="text-xs font-semibold flex items-center gap-0.5" style={{ color: BLUE }}>
            Ver todas <ChevronRight size={12} />
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono font-bold text-lg text-foreground">{precoFormatado}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Maio 2025 · Vence 15/06</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge status="aberta" />
            <button
              className="text-xs font-semibold text-white px-3 py-1.5 rounded-lg flex items-center gap-1"
              style={{ background: BLUE }}
            >
              <Download size={12} /> Pagar
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-border">
        <h3 className="font-bold text-sm text-foreground mb-3">Consumo — Últimos 7 dias</h3>
        <MiniAreaChart data={consumoSemanal} height={80} />
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-border flex gap-3 items-start">
        <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
          <Bell size={16} className="text-amber-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Manutenção programada</p>
          <p className="text-xs text-muted-foreground mt-0.5">Haverá manutenção preventiva no dia 28/05 das 02h às 04h. Pode haver instabilidade na rede.</p>
        </div>
      </div>
    </div>
  );
}

function FakeQR({ size = 160 }: { size?: number }) {
  const cells = 21;
  const cell = size / cells;
  const filled = new Set<string>();
  const mark = (r: number, c: number) => filled.add(`${r},${c}`);
  const finder = (or: number, oc: number) => {
    for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++)
      if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4))
        mark(or + r, oc + c);
  };
  finder(0, 0); finder(0, 14); finder(14, 0);
  for (let i = 8; i <= 12; i += 2) { mark(6, i); mark(i, 6); }
  mark(13, 8); mark(8, 13);
  [[8,8],[8,10],[8,12],[8,16],[8,18],[8,20],[9,9],[9,11],[9,15],[9,17],[9,19],
   [10,8],[10,10],[10,14],[10,16],[10,20],[11,9],[11,11],[11,13],[11,17],[11,18],
   [12,8],[12,10],[12,12],[12,18],[12,20],[13,9],[13,11],[13,13],[13,15],[13,19],
   [14,8],[14,10],[14,16],[14,18],[15,9],[15,11],[15,13],[15,17],[15,19],
   [16,8],[16,10],[16,12],[16,14],[16,18],[17,9],[17,11],[17,15],[17,17],
   [18,8],[18,10],[18,12],[18,14],[18,16],[18,20],[19,9],[19,11],[19,13],[19,19],
   [20,8],[20,10],[20,12],[20,14],[20,16],[20,18],[20,20],
  ].forEach(([r, c]) => mark(r, c));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ borderRadius: 8 }}>
      <rect width={size} height={size} fill="white" />
      {Array.from(filled).map((k) => {
        const [r, c] = k.split(",").map(Number);
        return <rect key={k} x={c * cell + 0.5} y={r * cell + 0.5} width={cell - 1} height={cell - 1} fill={NAVY} rx={1} />;
      })}
    </svg>
  );
}

function TabFaturas({ infoPlano }: { infoPlano: PlanoInfo }) {
  const precoFormatado = `R$ ${infoPlano.preco.toFixed(2).replace(".", ",")}`;
  const [modalPix, setModalPix] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [segundos, setSegundos] = useState(300);

  useEffect(() => {
    if (!modalPix) { setSegundos(300); return; }
    const id = setInterval(() => setSegundos((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [modalPix]);

  const pixKey = "globalfiber@pix.com.br";
  const minutos = String(Math.floor(segundos / 60)).padStart(2, "0");
  const segs = String(segundos % 60).padStart(2, "0");

  const copiar = () => {
    navigator.clipboard?.writeText(pixKey).catch(() => {});
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4 pb-6">
      <div
        className="rounded-2xl p-5 text-white"
        style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${BLUE} 100%)` }}
      >
        <p className="text-xs font-mono tracking-widest uppercase" style={{ color: TURQUESA }}>Resumo Financeiro</p>
        <p className="text-3xl font-extrabold mt-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>{precoFormatado}</p>
        <p className="text-white/70 text-sm">Fatura de Maio 2025 em aberto</p>
        <button
          onClick={() => setModalPix(true)}
          className="mt-4 w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 bg-white hover:bg-secondary transition-colors"
          style={{ color: BLUE }}
        >
          <Download size={15} /> Pagar via PIX
        </button>
      </div>

      <h3 className="font-bold text-sm text-foreground px-1">Histórico de Pagamentos</h3>

      <div className="flex flex-col gap-3">
        {faturas.map((f) => (
          <div key={f.id} className="bg-white rounded-2xl p-4 shadow-sm border border-border">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-sm text-foreground">{f.mes}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Vencimento: {f.venc}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <p className="font-mono font-bold text-base text-foreground">{f.status === "aberta" ? precoFormatado : f.valor}</p>
                <StatusBadge status={f.status} />
              </div>
            </div>
            {f.status !== "paga" && (
              <button
                onClick={() => setModalPix(true)}
                className="mt-3 w-full py-2 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5"
                style={{ background: BLUE }}
              >
                <Download size={12} /> Pagar via PIX
              </button>
            )}
            {f.status === "paga" && (
              <button className="mt-3 w-full py-2 rounded-xl text-xs font-semibold text-muted-foreground border border-border flex items-center justify-center gap-1.5 hover:bg-secondary transition-colors">
                <Download size={12} /> Baixar comprovante
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Modal PIX */}
      {modalPix && (
        <div className="absolute inset-x-0 bottom-0 z-50 bg-background flex flex-col rounded-t-3xl" style={{ height: "90%", overflow: "hidden" }}>
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 text-white" style={{ background: NAVY }}>
            <div>
              <p className="text-[10px] font-mono tracking-widest uppercase" style={{ color: TURQUESA }}>Pagamento</p>
              <h1 className="text-sm font-bold leading-tight">Pagar com PIX</h1>
            </div>
            <button
              onClick={() => setModalPix(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white font-bold text-lg"
            >×</button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-5 pb-6 flex flex-col gap-4 items-center">
            {/* Valor */}
            <div className="w-full rounded-2xl p-4 text-center" style={{ background: BLUE + "12" }}>
              <p className="text-xs text-muted-foreground">Valor a pagar</p>
              <p className="text-3xl font-extrabold mt-1" style={{ color: BLUE, fontFamily: "'Montserrat', sans-serif" }}>{precoFormatado}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Fatura Maio 2025 · Vence 15/06</p>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-border">
                <FakeQR size={168} />
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: segundos < 60 ? "#d4183d" : BLUE }}>
                <Clock size={12} />
                Expira em {minutos}:{segs}
              </div>
            </div>

            {/* Chave PIX */}
            <div className="w-full">
              <p className="text-xs font-semibold text-muted-foreground mb-1.5 px-1">Chave PIX (E-mail)</p>
              <div className="flex items-center gap-2 bg-white border border-border rounded-2xl px-4 py-3">
                <p className="flex-1 text-sm font-mono text-foreground truncate">{pixKey}</p>
                <button
                  onClick={copiar}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl text-white transition-all flex-shrink-0"
                  style={{ background: copiado ? "#16a34a" : BLUE }}
                >
                  {copiado ? <><Check size={12} /> Copiado!</> : <><Copy size={12} /> Copiar</>}
                </button>
              </div>
            </div>

            {/* Instruções */}
            <div className="w-full bg-secondary rounded-2xl p-4 flex flex-col gap-2">
              <p className="text-xs font-semibold text-foreground mb-1">Como pagar:</p>
              {[
                "Abra o app do seu banco",
                "Escolha pagar via PIX",
                "Escaneie o QR Code ou cole a chave",
                "Confirme o valor e finalize",
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-white text-[10px] font-bold" style={{ background: BLUE }}>{i + 1}</div>
                  <p className="text-xs text-foreground">{step}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setModalPix(false)}
              className="w-full py-3 rounded-2xl text-sm font-semibold border border-border text-muted-foreground hover:bg-secondary transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

type FaseTeste = "idle" | "conectando" | "download" | "upload" | "concluido";

function TabConsumo({ infoPlano }: { infoPlano: PlanoInfo }) {
  const [periodo, setPeriodo] = useState<"semanal" | "mensal">("semanal");
  const usadoGB = 215;
  const totalGB = 1000;
  const pct = Math.round((usadoGB / totalGB) * 100);
  const velNum = parseFloat(infoPlano.velocidade);
  const targetDL = infoPlano.velocidade.includes("GB") ? 985 : Math.round(velNum * 0.97);
  const targetUL = infoPlano.velocidade.includes("GB") ? 490 : Math.round(parseFloat(infoPlano.upload) * 0.97);
  const velAtual = `${targetDL} Mbps`;
  const uploadAtual = `${targetUL} Mbps`;

  const [modalVelo, setModalVelo] = useState(false);
  const [fase, setFase] = useState<FaseTeste>("idle");
  const [dlVal, setDlVal] = useState(0);
  const [ulVal, setUlVal] = useState(0);
  const [latVal, setLatVal] = useState(0);

  const iniciarTeste = () => {
    setFase("conectando");
    setDlVal(0); setUlVal(0); setLatVal(0);
    setTimeout(() => {
      setFase("download");
      let v = 0;
      const id = setInterval(() => {
        v += targetDL / 40;
        if (v >= targetDL) { v = targetDL; clearInterval(id); setLatVal(Math.round(6 + Math.random() * 4));
          setTimeout(() => {
            setFase("upload");
            let u = 0;
            const id2 = setInterval(() => {
              u += targetUL / 40;
              if (u >= targetUL) { u = targetUL; clearInterval(id2); setTimeout(() => setFase("concluido"), 300); }
              setUlVal(Math.round(u));
            }, 40);
          }, 400);
        }
        setDlVal(Math.round(v));
      }, 40);
    }, 1200);
  };

  const maxSpeed = Math.max(targetDL, 200);
  const gaugeVal = fase === "upload" || fase === "concluido" ? ulVal : dlVal;
  const gaugeMax = fase === "upload" || fase === "concluido" ? targetUL : targetDL;
  const r = 80, cx = 105, cy = 110;
  const circ = 2 * Math.PI * r;
  const arcLen = circ * 0.75;
  const offset = arcLen - arcLen * Math.min(gaugeVal / Math.max(gaugeMax, 1), 1);

  return (
    <div className="flex flex-col gap-4 pb-6">
      <div
        className="rounded-2xl p-5 text-white"
        style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${BLUE} 100%)` }}
      >
        <p className="text-xs font-mono tracking-widest uppercase mb-3" style={{ color: TURQUESA }}>Consumo Mensal</p>
        <div className="flex items-end gap-2">
          <p className="text-4xl font-extrabold" style={{ fontFamily: "'Montserrat', sans-serif" }}>{usadoGB} GB</p>
          <p className="text-white/70 mb-1 text-sm">/ {totalGB} GB</p>
        </div>
        <div className="mt-3 h-3 rounded-full bg-white/20">
          <div className="h-3 rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${TURQUESA}, #80fff5)` }} />
        </div>
        <div className="flex justify-between text-xs text-white/60 mt-1.5">
          <span>{pct}% utilizado</span>
          <span>{totalGB - usadoGB} GB restantes</span>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            { label: "Download", val: velAtual },
            { label: "Upload", val: uploadAtual },
            { label: "Latência", val: "8 ms" },
          ].map(({ label, val }) => (
            <div key={label} className="bg-white/10 rounded-xl p-2.5 text-center">
              <p className="text-xs text-white/60">{label}</p>
              <p className="font-mono font-bold text-sm mt-0.5">{val}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-1 flex shadow-sm border border-border">
        {(["semanal", "mensal"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriodo(p)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
              periodo === p ? "text-white shadow-sm" : "text-muted-foreground"
            }`}
            style={periodo === p ? { background: BLUE } : {}}
          >
            {p === "semanal" ? "Últimos 7 dias" : "Últimos 5 meses"}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-border">
        <h3 className="font-bold text-sm text-foreground mb-4">
          {periodo === "semanal" ? "Consumo Diário (GB)" : "Consumo Mensal (GB)"}
        </h3>
        {periodo === "semanal"
          ? <MiniAreaChart data={consumoSemanal} height={160} showAxes />
          : <MiniBarChart data={consumoMensal} height={160} />
        }
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-border">
        <h3 className="font-bold text-sm text-foreground mb-3">Consumo por Dispositivo</h3>
        {[
          { nome: "Smart TV (Samsung)", gb: 98, pct: 46, cor: BLUE },
          { nome: "Notebook (Abner)",   gb: 67, pct: 31, cor: "#0891b2" },
          { nome: "iPhone 15 Pro",      gb: 31, pct: 14, cor: "#7c3aed" },
          { nome: "Outros",             gb: 19, pct: 9,  cor: "#d97706" },
        ].map(({ nome, gb, pct: p, cor }) => (
          <div key={nome} className="mb-3 last:mb-0">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-foreground font-medium">{nome}</span>
              <span className="font-mono text-muted-foreground">{gb} GB · {p}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-secondary">
              <div className="h-1.5 rounded-full" style={{ width: `${p}%`, background: cor }} />
            </div>
          </div>
        ))}
      </div>

      {/* Botão teste de velocidade */}
      <button
        onClick={() => { setModalVelo(true); setFase("idle"); setDlVal(0); setUlVal(0); }}
        className="w-full rounded-2xl p-4 flex items-center gap-4 shadow-sm border-2 border-dashed transition-all hover:shadow-md active:scale-[0.98]"
        style={{ borderColor: BLUE, background: BLUE + "08" }}
      >
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: BLUE }}>
          <Gauge size={22} className="text-white" />
        </div>
        <div className="text-left">
          <p className="font-bold text-sm" style={{ color: BLUE }}>Testar Velocidade</p>
          <p className="text-xs text-muted-foreground mt-0.5">Medir download, upload e latência agora</p>
        </div>
        <ChevronRight size={16} className="ml-auto flex-shrink-0" style={{ color: BLUE }} />
      </button>

      {/* Modal Velocímetro */}
      {modalVelo && (
        <div className="absolute inset-x-0 bottom-0 z-50 bg-background flex flex-col rounded-t-3xl" style={{ height: "90%", overflow: "hidden" }}>
          <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 text-white" style={{ background: NAVY }}>
            <div>
              <p className="text-[10px] font-mono tracking-widest uppercase" style={{ color: TURQUESA }}>Diagnóstico</p>
              <h1 className="text-sm font-bold leading-tight">Teste de Velocidade</h1>
            </div>
            <button
              onClick={() => { setModalVelo(false); setFase("idle"); }}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white font-bold text-lg"
            >×</button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-4 pb-6 flex flex-col items-center gap-4">
            {/* Gauge SVG */}
            <div className="relative">
              <svg width={210} height={160} viewBox="0 0 210 160">
                {/* track */}
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth={14}
                  strokeDasharray={`${arcLen} ${circ}`} strokeLinecap="round"
                  transform={`rotate(-225 ${cx} ${cy})`} />
                {/* value arc */}
                <circle cx={cx} cy={cy} r={r} fill="none" stroke={BLUE} strokeWidth={14}
                  strokeDasharray={`${arcLen} ${circ}`} strokeDashoffset={offset}
                  strokeLinecap="round"
                  transform={`rotate(-225 ${cx} ${cy})`}
                  style={{ transition: "stroke-dashoffset 0.04s linear" }} />
                {/* center text */}
                <text x={cx} y={cy - 8} textAnchor="middle" fontSize={34} fontWeight={800}
                  fill={NAVY} fontFamily="Montserrat,sans-serif">
                  {fase === "upload" || fase === "concluido" ? ulVal : dlVal}
                </text>
                <text x={cx} y={cy + 14} textAnchor="middle" fontSize={11} fill="#6b7280">Mbps</text>
                <text x={cx} y={cy + 30} textAnchor="middle" fontSize={10} fill={BLUE} fontWeight={600}>
                  {fase === "conectando" ? "Conectando..." : fase === "download" ? "↓ Download" : fase === "upload" ? "↑ Upload" : fase === "concluido" ? "✓ Concluído" : ""}
                </text>
              </svg>
            </div>

            {/* Resultados */}
            <div className="w-full grid grid-cols-3 gap-2">
              {[
                { label: "Download", val: fase === "concluido" || fase === "upload" || (fase === "download") ? `${dlVal}` : "—", unit: "Mbps", cor: BLUE, ativo: fase === "download" },
                { label: "Upload",   val: fase === "concluido" || fase === "upload" ? `${ulVal}` : "—", unit: "Mbps", cor: "#7c3aed", ativo: fase === "upload" },
                { label: "Latência", val: fase === "concluido" || fase === "upload" ? `${latVal}` : "—", unit: "ms", cor: "#0891b2", ativo: false },
              ].map(({ label, val, unit, cor, ativo }) => (
                <div key={label} className="rounded-2xl p-3 text-center border-2 transition-all"
                  style={{ borderColor: ativo ? cor : "transparent", background: ativo ? cor + "10" : "white" }}>
                  <p className="text-[10px] text-muted-foreground">{label}</p>
                  <p className="font-mono font-extrabold text-lg mt-0.5" style={{ color: val === "—" ? "#d1d5db" : cor }}>{val}</p>
                  <p className="text-[9px] text-muted-foreground">{unit}</p>
                </div>
              ))}
            </div>

            {/* Info do plano */}
            <div className="w-full bg-secondary rounded-2xl p-3 flex items-center gap-3">
              <Wifi size={18} style={{ color: BLUE }} />
              <div>
                <p className="text-xs font-semibold text-foreground">{infoPlano.nome}</p>
                <p className="text-xs text-muted-foreground">Contratado: {infoPlano.velocidade} ↓ · {infoPlano.upload} ↑</p>
              </div>
            </div>

            {/* Botão */}
            {fase === "idle" || fase === "concluido" ? (
              <button
                onClick={iniciarTeste}
                className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-opacity active:opacity-80"
                style={{ background: `linear-gradient(90deg, ${NAVY}, ${BLUE})` }}
              >
                <Gauge size={18} />
                {fase === "concluido" ? "Testar novamente" : "Iniciar teste"}
              </button>
            ) : (
              <div className="w-full py-4 rounded-2xl flex items-center justify-center gap-2" style={{ background: BLUE + "12" }}>
                <svg className="animate-spin" width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <circle cx={12} cy={12} r={10} stroke={BLUE} strokeWidth={3} strokeDasharray={31} strokeDashoffset={10} strokeLinecap="round" />
                </svg>
                <span className="text-sm font-semibold" style={{ color: BLUE }}>Testando…</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const produtos = [
  {
    categoria: "Smartphones",
    itens: [
      {
        nome: "iPhone 16 Pro",
        desc: "256GB · Titânio Desert · iOS 18",
        preco: "R$ 9.299",
        parcelas: "20x R$ 465",
        img: "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=300&h=300&fit=crop&auto=format",
        badge: "Novo",
        badgeCor: BLUE,
        desconto: "15% OFF clientes Diamante",
      },
      {
        nome: "iPhone 15",
        desc: "128GB · Preto · iOS 18",
        preco: "R$ 5.999",
        parcelas: "20x R$ 300",
        img: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=300&h=300&fit=crop&auto=format",
        badge: "Oferta",
        badgeCor: "#16a34a",
        desconto: "15% OFF clientes Diamante",
      },
    ],
  },
  {
    categoria: "Computadores",
    itens: [
      {
        nome: "MacBook Air M3",
        desc: "15\" · 8GB RAM · 256GB SSD",
        preco: "R$ 12.499",
        parcelas: "20x R$ 625",
        img: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=300&h=300&fit=crop&auto=format",
        badge: "Novo",
        badgeCor: BLUE,
        desconto: "15% OFF clientes Diamante",
      },
      {
        nome: "MacBook Pro M4",
        desc: "14\" · 16GB RAM · 512GB SSD",
        preco: "R$ 19.999",
        parcelas: "20x R$ 1.000",
        img: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=300&h=300&fit=crop&auto=format",
        badge: "Top",
        badgeCor: "#7c3aed",
        desconto: "15% OFF clientes Diamante",
      },
    ],
  },
  {
    categoria: "Acessórios",
    itens: [
      {
        nome: "AirPods Pro 2",
        desc: "Cancelamento de ruído ativo · USB-C",
        preco: "R$ 1.899",
        parcelas: "20x R$ 95",
        img: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=300&h=300&fit=crop&auto=format",
        badge: "Oferta",
        badgeCor: "#16a34a",
        desconto: "15% OFF clientes Diamante",
      },
    ],
  },
];

function TabAssinaturas() {
  const [secao, setSecao] = useState<"assinaturas" | "produtos">("assinaturas");
  const [ativos, setAtivos] = useState<string[]>(["Netflix Standard", "Spotify Premium"]);
  const [carrinho, setCarrinho] = useState<string[]>([]);

  const toggle = (nome: string) =>
    setAtivos((prev) => prev.includes(nome) ? prev.filter((n) => n !== nome) : [...prev, nome]);

  const toggleCarrinho = (nome: string) =>
    setCarrinho((prev) => prev.includes(nome) ? prev.filter((n) => n !== nome) : [...prev, nome]);

  return (
    <div className="flex flex-col gap-4 pb-6">
      {/* Toggle principal */}
      <div className="bg-white rounded-2xl p-1 flex shadow-sm border border-border">
        {([
          { id: "assinaturas", label: "📱 Assinaturas" },
          { id: "produtos",    label: "🛍️ Produtos" },
        ] as const).map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setSecao(id)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${secao === id ? "text-white" : "text-muted-foreground"}`}
            style={secao === id ? { background: BLUE } : {}}
          >
            {label}
          </button>
        ))}
      </div>

      {secao === "assinaturas" && (
        <>
          <div
            className="rounded-2xl p-4 text-white flex items-center gap-3"
            style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${BLUE} 100%)` }}
          >
            <Package size={22} />
            <div>
              <p className="font-bold text-sm">Marketplace de Assinaturas</p>
              <p className="text-xs text-white/60">Adicione serviços à sua conta Global Fiber</p>
            </div>
          </div>

          {assinaturas.map(({ categoria, icon: Icon, cor, itens }) => (
            <div key={categoria}>
              <div className="flex items-center gap-2 mb-3 px-1">
                <Icon size={16} style={{ color: cor }} />
                <h3 className="font-bold text-sm text-foreground">{categoria}</h3>
              </div>
              <div className="flex flex-col gap-3">
                {itens.map((item) => {
                  const ativo = ativos.includes(item.nome);
                  return (
                    <div key={item.nome} className="bg-white rounded-2xl p-4 shadow-sm border border-border">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm text-foreground">{item.nome}</p>
                            {ativo && (
                              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">Ativo</span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                          <p className="font-mono font-bold text-sm mt-1.5" style={{ color: cor }}>{item.preco}</p>
                        </div>
                        <button
                          onClick={() => toggle(item.nome)}
                          className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${ativo ? "bg-red-50 text-red-600 border border-red-100" : "text-white"}`}
                          style={!ativo ? { background: cor } : {}}
                        >
                          {ativo ? "Cancelar" : "Adicionar"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="bg-secondary rounded-2xl p-4 text-center">
            <p className="text-xs text-muted-foreground">Assinaturas adicionadas são cobradas na sua fatura mensal da Global Fiber.</p>
          </div>
        </>
      )}

      {secao === "produtos" && (
        <>
          {/* Banner loja */}
          <div
            className="rounded-2xl p-4 text-white relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${BLUE} 100%)` }}
          >
            <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-20" style={{ background: TURQUESA }} />
            <p className="text-xs font-mono tracking-widest uppercase mb-1" style={{ color: TURQUESA }}>Global Fiber Store</p>
            <p className="font-extrabold text-base" style={{ fontFamily: "'Montserrat', sans-serif" }}>Tecnologia com desconto 👑</p>
            <p className="text-white/60 text-xs mt-0.5">Clientes Diamante têm 15% OFF em todos os produtos.</p>
            {carrinho.length > 0 && (
              <div className="mt-3 bg-white/10 rounded-xl px-3 py-2 flex items-center justify-between">
                <span className="text-xs text-white/80">{carrinho.length} item(s) no carrinho</span>
                <button className="text-xs font-bold px-3 py-1 rounded-lg text-foreground" style={{ background: TURQUESA }}>
                  Ver carrinho
                </button>
              </div>
            )}
          </div>

          {produtos.map(({ categoria, itens }) => (
            <div key={categoria} className="flex flex-col gap-3">
              <h3 className="font-bold text-sm text-foreground px-1">{categoria}</h3>
              {itens.map((p) => {
                const noCarrinho = carrinho.includes(p.nome);
                return (
                  <div key={p.nome} className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
                    <div className="relative">
                      <img
                        src={p.img}
                        alt={p.nome}
                        className="w-full h-40 object-cover"
                      />
                      {p.badge && (
                        <span
                          className="absolute top-3 left-3 text-xs font-bold px-2 py-0.5 rounded-full text-white"
                          style={{ background: p.badgeCor }}
                        >
                          {p.badge}
                        </span>
                      )}
                      <span
                        className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                        style={{ background: "rgba(0,0,0,0.55)" }}
                      >
                        {p.desconto}
                      </span>
                    </div>
                    <div className="p-4">
                      <p className="font-extrabold text-sm text-foreground">{p.nome}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{p.desc}</p>
                      <div className="flex items-end justify-between mt-3">
                        <div>
                          <p className="font-extrabold text-lg text-foreground" style={{ fontFamily: "'Montserrat', sans-serif" }}>{p.preco}</p>
                          <p className="text-xs text-muted-foreground">{p.parcelas} sem juros</p>
                        </div>
                        <button
                          onClick={() => toggleCarrinho(p.nome)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${noCarrinho ? "border-2 text-foreground" : "text-white"}`}
                          style={noCarrinho ? { borderColor: BLUE, color: BLUE } : { background: BLUE }}
                        >
                          {noCarrinho ? "✓ Adicionado" : "Comprar"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          <div className="bg-secondary rounded-2xl p-4 text-center">
            <p className="text-xs text-muted-foreground">Parcelamento em até 12x sem juros em até 20x. Entrega em todo o Brasil. Frete grátis acima de R$ 299.</p>
          </div>
        </>
      )}
    </div>
  );
}

const rankings = [
  {
    nome: "Bronze",
    emoji: "🥉",
    cor: "#cd7f32",
    grad: "linear-gradient(135deg, #7c4a1e, #cd7f32)",
    meses: 0,
    perks: ["Suporte padrão", "Acesso à área do cliente"],
  },
  {
    nome: "Prata",
    emoji: "🥈",
    cor: "#9e9e9e",
    grad: "linear-gradient(135deg, #5a5a5a, #b0b0b0)",
    meses: 4,
    perks: ["5% desconto nas assinaturas da Loja", "Suporte prioritário"],
  },
  {
    nome: "Ouro",
    emoji: "🥇",
    cor: "#f5a623",
    grad: "linear-gradient(135deg, #b7791f, #f5a623)",
    meses: 8,
    perks: ["10% desconto nas assinaturas", "5% no plano mensal", "Roteador premium grátis"],
  },
  {
    nome: "Platina",
    emoji: "💎",
    cor: "#66d9e8",
    grad: "linear-gradient(135deg, #0891b2, #66d9e8)",
    meses: 12,
    perks: ["15% desconto nas assinaturas", "10% no plano mensal", "IP fixo incluso", "Suporte 24h VIP"],
  },
  {
    nome: "Diamante",
    emoji: "👑",
    cor: TURQUESA,
    grad: `linear-gradient(135deg, ${BLUE}, ${TURQUESA})`,
    meses: 16,
    perks: ["25% desconto nas assinaturas", "15% no plano mensal", "Velocidade upgrade grátis", "Gerente de conta dedicado", "Indique e ganhe 1 mês grátis"],
  },
];

// Bônus de desconto por ranking (índice = nível do ranking)
const rankingBonus = [0, 2, 4, 6, 10]; // Bronze, Prata, Ouro, Platina, Diamante

const parceirosDiaDia = [
  {
    categoria: "Transporte",
    emoji: "🚗",
    cor: "#0891b2",
    parceiros: [
      { nome: "99Pop",  descontoBase: 10, desc: "Em todas as corridas no app",          usado: 3, economia: 18.50 },
      { nome: "Uber",   descontoBase: 8,  desc: "Nas primeiras 5 corridas do mês",      usado: 2, economia: 12.00 },
    ],
  },
  {
    categoria: "Estética",
    emoji: "💅",
    cor: "#be185d",
    parceiros: [
      { nome: "Studio Bella", descontoBase: 15, desc: "Manicure, pedicure e sobrancelha",     usado: 1, economia: 22.50 },
      { nome: "Espaço Zen",   descontoBase: 20, desc: "Massagem e tratamentos faciais",        usado: 0, economia: 0 },
    ],
  },
  {
    categoria: "Bar & Restaurante",
    emoji: "🍺",
    cor: "#d97706",
    parceiros: [
      { nome: "Bar do Zé",      descontoBase: 5,  desc: "Em consumações acima de R$ 50", usado: 4, economia: 34.00 },
      { nome: "Boteco Central", descontoBase: 8,  desc: "De segunda a quinta",            usado: 2, economia: 19.20 },
    ],
  },
  {
    categoria: "Cabeleireiro",
    emoji: "✂️",
    cor: "#7c3aed",
    parceiros: [
      { nome: "Barbearia Nobre", descontoBase: 12, desc: "Corte, barba e sobrancelha",   usado: 2, economia: 28.00 },
      { nome: "Salão Glamour",   descontoBase: 15, desc: "Coloração, corte e escova",     usado: 1, economia: 37.50 },
    ],
  },
];

function TabBeneficios({ infoPlano, onNavigate }: { infoPlano: PlanoInfo; onNavigate: (tab: Tab) => void }) {
  const [abaAtiva, setAbaAtiva] = useState<"ranking" | "diaadia" | "beneficios">("ranking");

  // Abner é cliente desde Jan/2024 → ~28 meses → Diamante (índice 4)
  const rankingAtual = 4;
  const rank = rankings[rankingAtual];
  const proximoRank = rankings[rankingAtual + 1] ?? null;
  // meses desde início do rank atual
  const mesesNoRank = (28 - rank.meses) % 4;
  const progressoPct = proximoRank ? Math.round((mesesNoRank / 4) * 100) : 100;

  return (
    <div className="flex flex-col gap-4 pb-6">
      {/* Toggle aba */}
      <div className="bg-white rounded-2xl p-1 flex shadow-sm border border-border gap-0.5">
        {([
          { id: "ranking",   label: "🏆 Ranking" },
          { id: "diaadia",   label: "🎯 Dia a Dia" },
          { id: "beneficios",label: "⭐ Plus" },
        ] as const).map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setAbaAtiva(id)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${abaAtiva === id ? "text-white" : "text-muted-foreground"}`}
            style={abaAtiva === id ? { background: BLUE } : {}}
          >
            {label}
          </button>
        ))}
      </div>

      {abaAtiva === "ranking" && (
        <>
          {/* Card ranking atual */}
          <div className="rounded-2xl p-5 text-white relative overflow-hidden" style={{ background: rank.grad }}>
            <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-20 bg-white" />
            <p className="text-xs font-mono tracking-widest uppercase text-white/70 mb-1">Seu Ranking</p>
            <div className="flex items-center gap-3">
              <span className="text-4xl">{rank.emoji}</span>
              <div>
                <h2 className="text-2xl font-extrabold" style={{ fontFamily: "'Montserrat', sans-serif" }}>{rank.nome}</h2>
                <p className="text-white/70 text-xs">Cliente há 28 meses · desde Jan/2024</p>
              </div>
            </div>

            {proximoRank ? (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-white/70 mb-1.5">
                  <span>Progresso para {proximoRank.nome}</span>
                  <span className="font-mono font-semibold text-white">{mesesNoRank}/4 meses</span>
                </div>
                <div className="h-2 rounded-full bg-white/20">
                  <div className="h-2 rounded-full bg-white transition-all" style={{ width: `${progressoPct}%` }} />
                </div>
                <p className="text-xs text-white/60 mt-1.5">Faltam {4 - mesesNoRank} meses para subir para {proximoRank.nome} {proximoRank.emoji}</p>
              </div>
            ) : (
              <div className="mt-4 bg-white/10 rounded-xl p-3 text-center">
                <p className="text-sm font-bold">🎉 Nível máximo alcançado!</p>
                <p className="text-xs text-white/70 mt-0.5">Você está no topo da Global Fiber.</p>
              </div>
            )}
          </div>

          {/* Trilha de rankings */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-border">
            <p className="font-bold text-sm text-foreground mb-4">Trilha de Rankings</p>
            <div className="flex flex-col gap-0">
              {rankings.map((r, i) => {
                const conquistado = i <= rankingAtual;
                const atual = i === rankingAtual;
                return (
                  <div key={r.nome} className="flex gap-3">
                    {/* linha vertical + ícone */}
                    <div className="flex flex-col items-center">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 font-bold border-2"
                        style={{
                          background: conquistado ? r.grad : "transparent",
                          borderColor: conquistado ? "transparent" : "#dce4f0",
                        }}
                      >
                        {conquistado ? r.emoji : <span className="text-muted-foreground text-base">{r.emoji}</span>}
                      </div>
                      {i < rankings.length - 1 && (
                        <div className="w-0.5 flex-1 my-1 rounded-full" style={{ background: i < rankingAtual ? r.cor : "#dce4f0", minHeight: 16 }} />
                      )}
                    </div>
                    {/* conteúdo */}
                    <div className={`flex-1 pb-4 ${i === rankings.length - 1 ? "pb-0" : ""}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-sm" style={{ color: conquistado ? r.cor : "#9ca3af" }}>{r.nome}</p>
                        {atual && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: r.cor }}>ATUAL</span>
                        )}
                        <p className="text-xs text-muted-foreground ml-auto font-mono">{r.meses === 0 ? "Início" : `${r.meses} meses`}</p>
                      </div>
                      <ul className="flex flex-col gap-0.5">
                        {r.perks.map((p) => (
                          <li key={p} className="text-xs flex items-center gap-1.5" style={{ color: conquistado ? "#374151" : "#9ca3af" }}>
                            <CheckCircle2 size={10} style={{ color: conquistado ? r.cor : "#9ca3af", flexShrink: 0 }} />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Descontos ativos */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-border">
            <p className="font-bold text-sm text-foreground mb-3">Seus Descontos Ativos 👑</p>
            <div className="flex flex-col gap-2">
              {[
                { label: "Assinaturas da Loja", desc: "Aplicado automaticamente", valor: "25% OFF" },
                { label: "Plano mensal", desc: "Desconto na fatura", valor: "15% OFF" },
                { label: "Indicação de amigos", desc: "1 mês grátis por indicação", valor: "2x bônus" },
              ].map(({ label, desc, valor }) => (
                <div key={label} className="flex items-center justify-between bg-secondary rounded-xl px-3 py-2.5">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <span className="font-extrabold text-sm px-2 py-1 rounded-lg text-white" style={{ background: `linear-gradient(90deg, ${BLUE}, ${TURQUESA})`, color: NAVY }}>
                    {valor}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {abaAtiva === "diaadia" && (
        <>
          {/* Card ranking + bônus */}
          <div className="rounded-2xl overflow-hidden shadow-sm border border-border">
            <div className="p-4 text-white" style={{ background: rank.grad }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{rank.emoji}</span>
                  <div>
                    <p className="font-extrabold text-base">{rank.nome}</p>
                    <p className="text-xs text-white/70">Bônus nos parceiros do dia a dia</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-extrabold" style={{ fontFamily: "'Montserrat', sans-serif" }}>+{rankingBonus[rankingAtual]}%</p>
                  <p className="text-xs text-white/70">em todos parceiros</p>
                </div>
              </div>
            </div>
            {/* Progressão de bônus por ranking */}
            <div className="bg-white px-4 py-3">
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Evolução do bônus</p>
              <div className="flex items-center gap-0">
                {rankings.map((r, i) => (
                  <div key={r.nome} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-0.5">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold border-2 transition-all"
                        style={{
                          background: i <= rankingAtual ? r.grad : "transparent",
                          borderColor: i <= rankingAtual ? "transparent" : "#dce4f0",
                        }}
                      >
                        {i <= rankingAtual ? r.emoji : <span className="text-muted-foreground text-xs">{r.emoji}</span>}
                      </div>
                      <p className="text-[9px] font-bold" style={{ color: i <= rankingAtual ? r.cor : "#9ca3af" }}>
                        +{rankingBonus[i]}%
                      </p>
                    </div>
                    {i < rankings.length - 1 && (
                      <div className="flex-1 h-0.5 mb-4" style={{ background: i < rankingAtual ? r.cor : "#dce4f0" }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Total economizado */}
          <div
            className="rounded-2xl p-5 text-white relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, #0a4a2e 0%, #16a34a 100%)` }}
          >
            <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-20 bg-white" />
            <p className="text-xs font-mono tracking-widest uppercase text-white/70 mb-2">Economia Total do Mês</p>
            <p className="text-4xl font-extrabold" style={{ fontFamily: "'Montserrat', sans-serif" }}>R$ 171,70</p>
            <p className="text-white/70 text-xs mt-1">incluindo +{rankingBonus[rankingAtual]}% de bônus {rank.nome}</p>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {[
                { label: "Transporte", val: "R$ 30,50", emoji: "🚗" },
                { label: "Estética",   val: "R$ 22,50", emoji: "💅" },
                { label: "Bar",        val: "R$ 53,20", emoji: "🍺" },
                { label: "Cabelo",     val: "R$ 65,50", emoji: "✂️" },
              ].map(({ label, val, emoji }) => (
                <div key={label} className="bg-white/10 rounded-xl p-2 text-center">
                  <p className="text-base">{emoji}</p>
                  <p className="text-xs font-bold mt-0.5">{val}</p>
                  <p className="text-[9px] text-white/60">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Parceiros por categoria */}
          {parceirosDiaDia.map(({ categoria, emoji, cor, parceiros }) => (
            <div key={categoria} className="flex flex-col gap-3">
              <div className="flex items-center gap-2 px-1">
                <span className="text-lg">{emoji}</span>
                <h3 className="font-bold text-sm text-foreground">{categoria}</h3>
              </div>
              {parceiros.map((p) => {
                const descontoFinal = p.descontoBase + rankingBonus[rankingAtual];
                return (
                  <div key={p.nome} className="bg-white rounded-2xl p-4 shadow-sm border border-border">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-sm text-foreground">{p.nome}</p>
                          <span className="text-xs font-extrabold px-2 py-0.5 rounded-full text-white" style={{ background: cor }}>
                            {descontoFinal}% OFF
                          </span>
                        </div>
                        {/* Composição do desconto */}
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                            Base {p.descontoBase}%
                          </span>
                          <span className="text-[10px] text-muted-foreground">+</span>
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white" style={{ background: rank.cor }}>
                            {rank.emoji} +{rankingBonus[rankingAtual]}%
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{p.desc}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-xs text-muted-foreground">{p.usado}x usado este mês</span>
                          {p.economia > 0 && (
                            <span className="text-xs font-semibold text-emerald-600">
                              Economizou R$ {p.economia.toFixed(2).replace(".", ",")}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold text-white"
                        style={{ background: cor }}
                      >
                        Usar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {/* Sistema de indicação */}
          <div
            className="rounded-2xl p-5 text-white relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${BLUE} 100%)` }}
          >
            <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-10" style={{ background: TURQUESA }} />
            <div className="flex items-center gap-2 mb-3">
              <Gift size={20} style={{ color: TURQUESA }} />
              <p className="font-extrabold text-base">Indique e Ganhe Mais</p>
            </div>
            <p className="text-white/70 text-xs leading-relaxed">
              Por cada amigo que contratar a Global Fiber com seu código, você recebe <span className="text-white font-bold">1 mês grátis</span> e <span className="text-white font-bold">+5% de desconto</span> extra em todos os parceiros do Dia a Dia.
            </p>

            {/* Código */}
            <div className="mt-4 bg-white/10 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-white/60">Seu código de indicação</p>
                <p className="font-mono font-extrabold text-lg tracking-widest mt-0.5" style={{ color: TURQUESA }}>{codigoIndicacao}</p>
              </div>
              <button className="bg-white/20 hover:bg-white/30 transition-colors rounded-lg px-3 py-1.5 text-xs font-semibold">
                Copiar
              </button>
            </div>

            {/* Progresso de indicações */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-white/70 mb-2">
                <span>Indicações este mês</span>
                <span className="font-mono text-white font-semibold">2 / 5</span>
              </div>
              <div className="h-2 rounded-full bg-white/20">
                <div className="h-2 rounded-full transition-all" style={{ width: "40%", background: TURQUESA }} />
              </div>
              <p className="text-xs text-white/60 mt-1.5">Indique 3 amigos para desbloquear o bônus do mês 🎁</p>
            </div>

            {/* Histórico */}
            <div className="mt-4 flex flex-col gap-2">
              <p className="text-xs font-semibold text-white/80">Indicações recentes</p>
              {[
                { nome: "Carlos M.",  data: "12/05/2025", status: "Ativo" },
                { nome: "Fernanda S.", data: "03/04/2025", status: "Ativo" },
              ].map(({ nome, data, status }) => (
                <div key={nome} className="bg-white/10 rounded-xl px-3 py-2 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold">{nome}</p>
                    <p className="text-[10px] text-white/50">{data}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">{status}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {abaAtiva === "beneficios" && (
        <>
          {/* Hero */}
          <div className="rounded-2xl p-5 text-white relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${BLUE} 100%)` }}>
            <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full opacity-20" style={{ background: TURQUESA }} />
            <Star size={22} className="mb-2" style={{ color: TURQUESA }} />
            <h2 className="text-xl font-extrabold" style={{ fontFamily: "'Montserrat', sans-serif" }}>Seus Benefícios Global Fiber</h2>
            <p className="text-white/70 text-sm mt-1">Tudo que você tem direito como nosso cliente.</p>
          </div>

          {/* Benefícios integrados com o app */}
          <div className="flex flex-col gap-3">

            {/* Plano ativo → Perfil */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-border flex gap-3 items-center" style={{ borderColor: BLUE + "30" }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: BLUE + "15" }}>
                <Wifi size={20} style={{ color: BLUE }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm text-foreground">Plano {infoPlano.nome}</p>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: BLUE }}>ATIVO</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{infoPlano.velocidade} ↓ · {infoPlano.upload} ↑ · Fibra Óptica</p>
                <button onClick={() => onNavigate("perfil")} className="mt-1.5 text-xs font-semibold flex items-center gap-0.5" style={{ color: BLUE }}>
                  Gerenciar plano <ArrowUpRight size={11} />
                </button>
              </div>
            </div>

            {/* Fatura em dia → Faturas */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-border flex gap-3 items-center">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-amber-50">
                <FileText size={20} className="text-amber-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm text-foreground">Fatura do Mês</p>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">Em aberto</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Vencimento 15/06 · R$ {infoPlano.preco.toFixed(2).replace(".", ",")}</p>
                <button onClick={() => onNavigate("faturas")} className="mt-1.5 text-xs font-semibold flex items-center gap-0.5 text-amber-600">
                  Ver e pagar via PIX <ArrowUpRight size={11} />
                </button>
              </div>
            </div>

            {/* Velocidade garantida → Consumo */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-border flex gap-3 items-center">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#0891b2" + "18" }}>
                <Gauge size={20} style={{ color: "#0891b2" }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm text-foreground">Velocidade Garantida</p>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-50 text-cyan-700">SLA 99,5%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Estabilidade monitorada · latência média 8ms</p>
                <button onClick={() => onNavigate("consumo")} className="mt-1.5 text-xs font-semibold flex items-center gap-0.5" style={{ color: "#0891b2" }}>
                  Testar velocidade agora <ArrowUpRight size={11} />
                </button>
              </div>
            </div>

            {/* Marketplace de assinaturas → Loja */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-border flex gap-3 items-center">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#7c3aed" + "15" }}>
                <Package size={20} style={{ color: "#7c3aed" }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm text-foreground">Marketplace Exclusivo</p>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#7c3aed" + "18", color: "#7c3aed" }}>2 ativos</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Netflix + Spotify inclusos · produtos Apple 20x sem juros</p>
                <button onClick={() => onNavigate("assinaturas")} className="mt-1.5 text-xs font-semibold flex items-center gap-0.5" style={{ color: "#7c3aed" }}>
                  Explorar loja <ArrowUpRight size={11} />
                </button>
              </div>
            </div>

            {/* Suporte 24h */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-border flex gap-3 items-center">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#0a7a5e" + "18" }}>
                <Headphones size={20} style={{ color: "#0a7a5e" }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm text-foreground">Suporte 24h</p>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">● Online</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Chat, telefone e WhatsApp sem fila prioritária</p>
                <button onClick={() => onNavigate("inicio")} className="mt-1.5 text-xs font-semibold flex items-center gap-0.5" style={{ color: "#0a7a5e" }}>
                  Abrir suporte <ArrowUpRight size={11} />
                </button>
              </div>
            </div>

            {/* Segurança Digital */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-border flex gap-3 items-center">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: BLUE + "15" }}>
                <Shield size={20} style={{ color: BLUE }} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-foreground">Segurança Digital</p>
                <p className="text-xs text-muted-foreground mt-0.5">Antivírus incluso para até 5 dispositivos no seu plano</p>
                <button className="mt-1.5 text-xs font-semibold flex items-center gap-0.5" style={{ color: BLUE }}>
                  Ativar proteção <ArrowUpRight size={11} />
                </button>
              </div>
            </div>

            {/* Indique e Ganhe */}
            <div className="rounded-2xl p-4 text-white relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${BLUE} 100%)` }}>
              <div className="absolute -right-3 -bottom-3 w-20 h-20 rounded-full opacity-10" style={{ background: TURQUESA }} />
              <div className="flex items-center gap-2 mb-2">
                <Gift size={18} style={{ color: TURQUESA }} />
                <p className="font-bold text-sm">Indique e Ganhe</p>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">Traga um amigo e ganhe <span className="text-white font-bold">1 mês grátis</span> + <span className="text-white font-bold">+5% de desconto</span> nos parceiros.</p>
              <div className="mt-3 bg-white/10 rounded-xl px-3 py-2 flex items-center justify-between">
                <p className="font-mono font-extrabold tracking-widest text-sm" style={{ color: TURQUESA }}>{codigoIndicacao}</p>
                <button className="text-xs font-semibold bg-white/20 hover:bg-white/30 transition-colors rounded-lg px-3 py-1">Copiar</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Nav ─────────────────────────────────────────────────────────────────────

const navItems: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: "inicio",      label: "Início",    icon: Home },
  { id: "faturas",     label: "Faturas",   icon: FileText },
  { id: "consumo",     label: "Consumo",   icon: Activity },
  { id: "assinaturas", label: "Loja", icon: Package },
  { id: "beneficios",  label: "Benefícios",icon: Star },
  { id: "perfil",      label: "Perfil",    icon: User },
  { id: "usuarios",   label: "Usuários",  icon: Users },
];

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [usuarioLogado, setUsuarioLogado] = useState<UsuarioLogado | null>(null);
  const logado = usuarioLogado !== null;
  const [tab, setTab] = useState<Tab>("inicio");
  const [planoAtivo, setPlanoAtivoState] = useState("Global Fiber 200");
  const [carregandoPerfil, setCarregandoPerfil] = useState(false);
  const infoPlano = todosOsPlanos.find((p) => p.nome === planoAtivo) ?? todosOsPlanos[1];
  const [horaAtual, setHoraAtual] = useState(() => {
    const n = new Date();
    return `${n.getHours()}:${String(n.getMinutes()).padStart(2, "0")}`;
  });

  // Ao logar, usa o plano do usuário cadastrado
  useEffect(() => {
    if (!usuarioLogado) return;
    const planoUsuario = usuarioLogado.plano;
    const planoValido = todosOsPlanos.find((p) => p.nome === planoUsuario);
    if (planoValido) setPlanoAtivoState(planoValido.nome);
  }, [usuarioLogado]);

  // Persiste troca de plano no banco
  const setPlanoAtivo = useCallback((nome: string) => {
    setPlanoAtivoState(nome);
    fetch(`${API}/perfil/plano`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ planoAtivo: nome }),
    }).catch((e) => console.log("Erro ao salvar plano:", e));
  }, []);

  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setHoraAtual(`${n.getHours()}:${String(n.getMinutes()).padStart(2, "0")}`);
    };
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const nomeExibido = usuarioLogado?.nome ?? "Usuário";
  const inicialAvatar = nomeExibido[0]?.toUpperCase() ?? "U";
  const tabTitles: Record<Tab, string> = {
    inicio:      `Olá, ${nomeExibido.split(" ")[0]} 👋`,
    faturas:     "Faturas",
    consumo:     "Consumo",
    assinaturas: "Assinaturas",
    beneficios:  "Seus Benefícios",
    perfil:      "Meu Perfil",
    usuarios:    "Usuários",
  };

  const conteudoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    conteudoRef.current?.scrollTo({ top: 0, behavior: "instant" });
  }, [tab]);

  // Estado do modal de planos (fora do scroll container)
  const [modalPlanos, setModalPlanos] = useState(false);
  const [planoSelecionado, setPlanoSelecionado] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const [tipoPlanosAtivo, setTipoPlanosAtivo] = useState<"residencial" | "pymes">("residencial");
  const planosExibidos = tipoPlanosAtivo === "residencial" ? planosResidencial : planosPymes;

  const handleSolicitarTroca = (nome: string) => {
    if (nome === planoAtivo) return;
    setPlanoSelecionado(nome);
    setConfirmando(true);
  };

  const handleConfirmarPlano = () => {
    if (planoSelecionado) setPlanoAtivo(planoSelecionado);
    setConfirmando(false);
    setModalPlanos(false);
    setPlanoSelecionado(null);
  };

  const handleLogout = () => {
    setUsuarioLogado(null);
    setTab("inicio");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <div
        className="relative w-full max-w-sm bg-background rounded-[2.5rem] overflow-hidden shadow-2xl border border-border flex flex-col"
        style={{ height: "88vh", maxHeight: 780 }}
      >
        {/* Status bar */}
        <div
          className="flex-shrink-0 flex items-center justify-between px-6 pt-3 pb-2 text-white text-xs font-semibold"
          style={{ background: NAVY }}
        >
          <span className="font-mono">{horaAtual}</span>
          <div className="flex items-center gap-1.5">
            <Wifi size={12} />
            <span className="font-mono">5G</span>
          </div>
        </div>

        {!logado ? (
          /* ── Login ── */
          <div className="flex-1 overflow-y-auto">
            <TelaLogin onLogin={(u) => setUsuarioLogado(u)} />
          </div>
        ) : (
          <>
            {/* Header */}
            <div
              className="flex-shrink-0 flex items-center justify-between px-5 py-3 text-white"
              style={{ background: NAVY }}
            >
              <div className="flex flex-col gap-1">
                <div className="bg-white rounded-xl px-3 py-1 self-start">
                  <ImageWithFallback
                    src={logoGlobal}
                    alt="Global Fiber"
                    className="h-7 w-auto object-contain"
                  />
                </div>
                <h1 className="text-base font-bold leading-tight">{tabTitles[tab]}</h1>
              </div>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Bell size={15} className="text-white" />
                </button>
                <button
                  onClick={() => setTab("perfil")}
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-opacity hover:opacity-80"
                  style={{ background: BLUE, color: "#fff" }}
                >
                  {inicialAvatar}
                </button>
              </div>
            </div>

            {/* Content */}
            <div ref={conteudoRef} className="flex-1 overflow-y-auto px-4 pt-4 scrollbar-hide relative">
              {carregandoPerfil && (
                <div className="absolute inset-0 z-40 flex items-center justify-center bg-background/80 rounded-xl">
                  <div className="flex flex-col items-center gap-2">
                    <svg className="animate-spin" width={28} height={28} viewBox="0 0 24 24" fill="none">
                      <circle cx={12} cy={12} r={10} stroke={BLUE} strokeWidth={3} strokeDasharray={31} strokeDashoffset={10} strokeLinecap="round" />
                    </svg>
                    <p className="text-xs font-semibold text-muted-foreground">Carregando…</p>
                  </div>
                </div>
              )}
              {tab === "inicio"      && <TabInicio planoAtivo={planoAtivo} infoPlano={infoPlano} onNavigate={setTab} />}
              {tab === "faturas"     && <TabFaturas infoPlano={infoPlano} />}
              {tab === "consumo"     && <TabConsumo infoPlano={infoPlano} />}
              {tab === "assinaturas" && <TabAssinaturas />}
              {tab === "beneficios"  && <TabBeneficios infoPlano={infoPlano} onNavigate={setTab} />}
              {tab === "perfil"      && <TabPerfil onLogout={handleLogout} planoAtivo={planoAtivo} onChangePlano={setPlanoAtivo} onAbrirPlanos={() => setModalPlanos(true)} usuario={usuarioLogado!} />}
              {tab === "usuarios"    && <TabUsuarios />}
            </div>

            {/* Modal Planos — fora do scroll, posicionado no shell do telefone */}
            {modalPlanos && (
              <div className="absolute inset-x-0 bottom-0 z-50 bg-background flex flex-col rounded-t-3xl" style={{ height: "90%", overflow: "hidden" }}>
                <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 text-white" style={{ background: NAVY }}>
                  <div>
                    <p className="text-[10px] font-mono tracking-widest uppercase" style={{ color: TURQUESA }}>Global Fiber</p>
                    <h1 className="text-sm font-bold leading-tight">{confirmando ? "Confirmar Alteração" : "Nossos Planos"}</h1>
                  </div>
                  <button
                    onClick={() => { setModalPlanos(false); setConfirmando(false); setPlanoSelecionado(null); }}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white font-bold text-lg"
                  >×</button>
                </div>

                {!confirmando ? (
                  <div className="flex-1 min-h-0 overflow-y-auto px-3 pt-3 pb-4 flex flex-col gap-2.5">
                    <div className="bg-white rounded-xl p-1 flex border border-border flex-shrink-0">
                      {([
                        { id: "residencial", label: "🏠 Residencial" },
                        { id: "pymes",       label: "🏢 Empresas (Pymes)" },
                      ] as const).map(({ id, label }) => (
                        <button
                          key={id}
                          onClick={() => setTipoPlanosAtivo(id)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${tipoPlanosAtivo === id ? "text-white" : "text-muted-foreground"}`}
                          style={tipoPlanosAtivo === id ? { background: BLUE } : {}}
                        >{label}</button>
                      ))}
                    </div>

                    <p className="text-[11px] text-muted-foreground">
                      Plano atual: <span className="font-bold text-foreground">{planoAtivo}</span>. Toque para solicitar alteração.
                    </p>

                    {planosExibidos.map((p) => {
                      const atual = p.nome === planoAtivo;
                      return (
                        <div key={p.nome} className="rounded-xl overflow-hidden border-2 transition-all" style={{ borderColor: atual ? p.cor : "#e5e7eb" }}>
                          <div className="px-3 py-2.5 flex items-center gap-2 text-white" style={{ background: `linear-gradient(90deg, ${NAVY} 0%, ${p.cor} 100%)` }}>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="font-extrabold text-sm leading-tight">{p.nome}</p>
                                {atual && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: TURQUESA, color: NAVY }}>ATUAL</span>}
                                {p.destaque && !atual && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/20 flex-shrink-0">⭐ POPULAR</span>}
                              </div>
                              <p className="text-white/60 text-[10px] mt-0.5">{p.velocidade} ↓ · {p.upload} ↑</p>
                            </div>
                            <div className="flex-shrink-0 text-right">
                              <p className="font-extrabold text-base leading-none">R$ {p.preco.toFixed(2).replace(".", ",")}</p>
                              <p className="text-white/60 text-[10px]">/mês</p>
                            </div>
                          </div>
                          <div className="bg-white px-3 py-2 flex items-center gap-3">
                            <ul className="flex-1 flex flex-col gap-0.5">
                              {p.recursos.slice(0, 3).map((r) => (
                                <li key={r} className="flex items-center gap-1.5 text-[10px] text-foreground">
                                  <CheckCircle2 size={10} style={{ color: p.cor, flexShrink: 0 }} />{r}
                                </li>
                              ))}
                              {p.recursos.length > 3 && <li className="text-[10px] text-muted-foreground pl-4">+{p.recursos.length - 3} benefícios</li>}
                            </ul>
                            <button
                              onClick={() => handleSolicitarTroca(p.nome)}
                              disabled={atual}
                              className="flex-shrink-0 px-3 py-2 rounded-xl text-[11px] font-bold transition-all"
                              style={atual ? { background: p.cor + "18", color: p.cor, cursor: "default" } : { background: p.cor, color: "#fff" }}
                            >{atual ? "✓ Ativo" : "Escolher"}</button>
                          </div>
                        </div>
                      );
                    })}
                    <p className="text-center text-[10px] text-muted-foreground pb-1">Alteração efetivada no próximo ciclo de faturamento.</p>
                  </div>
                ) : (
                  <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-4 pb-6 flex flex-col gap-3">
                    <div className="bg-secondary rounded-2xl p-4 flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: BLUE + "18" }}>
                          <Wifi size={18} style={{ color: BLUE }} />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Plano atual</p>
                          <p className="font-bold text-sm text-foreground">{planoAtivo}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-2">
                        <div className="flex-1 h-px bg-border" />
                        <ArrowUpRight size={14} style={{ color: BLUE }} />
                        <div className="flex-1 h-px bg-border" />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: BLUE }}>
                          <Zap size={18} className="text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Novo plano</p>
                          <p className="font-bold text-sm text-foreground">{planoSelecionado}</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground text-center leading-relaxed">
                      A alteração será aplicada no próximo ciclo de faturamento. Um técnico poderá entrar em contato caso seja necessário.
                    </p>
                    <button
                      onClick={handleConfirmarPlano}
                      className="w-full py-3.5 rounded-2xl font-bold text-sm text-white"
                      style={{ background: `linear-gradient(90deg, ${NAVY}, ${BLUE})` }}
                    >Confirmar solicitação</button>
                    <button
                      onClick={() => setConfirmando(false)}
                      className="w-full py-2.5 rounded-2xl font-semibold text-sm border border-border text-muted-foreground hover:bg-secondary transition-colors"
                    >Voltar</button>
                  </div>
                )}
              </div>
            )}

            {/* Bottom nav */}
            <div className="flex-shrink-0 bg-white border-t border-border px-1 pb-3 pt-2">
              <div className="flex">
                {navItems.filter(({ id }) => id !== "usuarios" || usuarioLogado?.perfil === "admin").map(({ id, label, icon: Icon }) => {
                  const active = tab === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setTab(id)}
                      className="flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl transition-all"
                    >
                      <div
                        className="w-7 h-7 rounded-xl flex items-center justify-center transition-all"
                        style={active ? { background: BLUE } : {}}
                      >
                        <Icon size={14} style={{ color: active ? "#ffffff" : "#3a4fa0" }} />
                      </div>
                      <span
                        className="text-[9px] font-semibold tracking-tight"
                        style={{ color: active ? BLUE : "#3a4fa0" }}
                      >
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
