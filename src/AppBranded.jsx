import { useEffect, useState } from 'react';
import { hrozekCrestDataUrl } from './assets/hrozekCrestData';
import { bootstrapWorkspace, createCalendarEvent, createContentItem, createIdea, getCurrentUser, loadWorkspaceSnapshot, sendLoginLink, signOut } from './lib/dataApi';
import { hasSupabaseConfig } from './lib/supabaseClient';

const platforms = ['Instagram', 'Facebook', 'TikTok', 'LinkedIn', 'X', 'Reddit'];
const emptyState = { ideas: [{ id: 'mock-idea', body: 'Story: zákulisí dnešní práce + anketa pro fanoušky.', source: 'starter' }], events: [{ id: 'mock-event', title: 'Call se značkou', time: '10:30', type: 'meeting' }], posts: [{ id: 'mock-post', title: 'Behind the scenes teaser', status: 'Naplánováno', time: 'Dnes 18:30' }] };

function Button({ children, muted = false, ...props }) { return <button className={`button ${muted ? 'button-secondary' : 'button-primary'}`} {...props}>{children}</button>; }
function Card({ children, className = '' }) { return <section className={`card ${className}`}>{children}</section>; }
function Status({ value }) { return <span className={`status ${value === 'Naplánováno' ? 'status-ok' : value === 'Ke kontrole' ? 'status-warning' : 'status-neutral'}`}>{value}</span>; }
function time(value) { const date = new Date(value); return Number.isNaN(date.getTime()) ? 'Bez času' : date.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' }); }

export default function AppBranded() {
  const [tab, setTab] = useState('today');
  const [user, setUser] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [email, setEmail] = useState('');
  const [idea, setIdea] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [postText, setPostText] = useState('Ukázat zákulisí a zeptat se fanoušků, co chtějí vidět příště.');
  const [message, setMessage] = useState('');
  const [ideas, setIdeas] = useState(emptyState.ideas);
  const [events, setEvents] = useState(emptyState.events);
  const [posts, setPosts] = useState(emptyState.posts);

  async function refresh() {
    if (!hasSupabaseConfig) return setMessage('Chybí Supabase konfigurace. Zkontroluj env.');
    const snapshot = await loadWorkspaceSnapshot();
    if (!snapshot) return setMessage('Supabase funguje, workspace zatím není připravený.');
    setWorkspace(snapshot.workspace);
    setIdeas(snapshot.ideas.map((item) => ({ id: item.id, body: item.body, source: item.source || 'db' })));
    setEvents(snapshot.events.map((item) => ({ id: item.id, title: item.title, time: time(item.starts_at), type: item.event_type || 'term' })));
    setPosts(snapshot.contents.map((item) => ({ id: item.id, title: item.title, status: item.status === 'scheduled' ? 'Naplánováno' : item.status === 'in_review' ? 'Ke kontrole' : 'Draft', time: item.scheduled_at ? time(item.scheduled_at) : 'Bez termínu' })));
    setMessage('Data načtena ze Supabase SocMan.');
  }

  useEffect(() => { getCurrentUser().then(async (current) => { setUser(current); if (current) await refresh(); }); }, []);

  async function login() { if (!email) return setMessage('Zadej e-mail.'); await sendLoginLink(email); setMessage('Přihlašovací odkaz odeslán e-mailem.'); }
  async function prepare() { await bootstrapWorkspace(); await refresh(); }
  async function saveIdea() { if (!idea) return; if (workspace) { const saved = await createIdea(workspace.id, idea, 'app'); setIdeas([{ id: saved.id, body: saved.body, source: saved.source }, ...ideas]); } else setIdeas([{ id: Date.now(), body: idea, source: 'lokálně' }, ...ideas]); setIdea(''); }
  async function saveEvent() { if (!eventTitle) return; if (workspace) { const saved = await createCalendarEvent(workspace.id, eventTitle, '16:00'); setEvents([...events, { id: saved.id, title: saved.title, time: time(saved.starts_at), type: saved.event_type }]); } else setEvents([...events, { id: Date.now(), title: eventTitle, time: '16:00', type: 'term' }]); setEventTitle(''); }
  async function savePost() { const title = postText.length > 44 ? `${postText.slice(0, 44)}…` : postText; const next = { id: Date.now(), title, status: 'Naplánováno', time: 'Dnes večer' }; setPosts([next, ...posts]); if (workspace) await createContentItem(workspace.id, title, postText, 'post', 'safe'); setTab('plan'); }

  return <div className="app-shell">
    <div className="container">
      <header className="hero compact-hero">
        <img src={hrozekCrestDataUrl} alt="Erb Hrozka" className="crest-watermark" />
        <div className="hero-top">
          <div className="brand">
            <div className="crest-mini"><img src={hrozekCrestDataUrl} alt="Erb Hrozka" /></div>
            <div><h1>Hrozek Studio</h1><p>Malé kompaktní studio, které zvládne velké věci.</p></div>
          </div>
          <div className="hero-actions"><Button onClick={() => setTab('create')}>＋ Vytvořit</Button><Button muted onClick={refresh}>Načíst DB</Button></div>
        </div>
        <div className="brand-strip"><span>Social command center</span><span>AI ready</span><span>Live</span><span>Merch</span><span>Supabase SocMan</span></div>
      </header>

      <nav className="nav">{[['today','Dnes'],['create','Vytvořit'],['plan','Plán'],['more','Více']].map(([id, label]) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>{label}</button>)}</nav>
      {message && <Card className="notice-card"><p>{message}</p></Card>}

      {tab === 'today' && <main className="grid two-columns"><div className="stack">
        <Card className="status-card"><div className="card-head"><div><h2>Supabase</h2><p>{hasSupabaseConfig ? 'Konfigurace připravena. Přihlášení běží přes magic link.' : 'Chybí environment konfigurace.'}</p></div><Status value={workspace ? 'Naplánováno' : 'Draft'} /></div>{user ? <div className="action-row"><Button onClick={prepare}>Připravit workspace</Button><Button muted onClick={() => signOut().then(() => setUser(null))}>Odhlásit</Button></div> : <div className="input-row"><input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e-mail" /><Button onClick={login}>Přihlásit</Button></div>}</Card>
        <Card><h2>Inbox nápadů</h2><p>Rychlá schránka pro nápady, diktování a pozdější posty.</p><div className="input-row"><input value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="Nový nápad" /><Button onClick={saveIdea}>Uložit</Button></div><div className="list">{ideas.map((item) => <article className="list-item" key={item.id}><p>{item.body}</p><small>{item.source}</small></article>)}</div></Card>
      </div><aside className="stack"><Card><h2>Osobní kalendář</h2><p>Schůzky, rozhovory, focení a live termíny.</p><div className="input-row"><input value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} placeholder="Nový termín" /><Button onClick={saveEvent}>Přidat</Button></div><div className="list">{events.map((item) => <article className="event-item" key={item.id}><strong>{item.time}</strong><span>{item.title}</span><small>{item.type}</small></article>)}</div></Card></aside></main>}

      {tab === 'create' && <main className="grid two-columns"><Card><h2>Vytvořit příspěvek</h2><p>Jeden obsah, potom výběr sítí a termínu. Nic se samo nepublikuje.</p><textarea value={postText} onChange={(e) => setPostText(e.target.value)} /><div className="platform-grid">{platforms.map((p) => <button className="platform-card selected" key={p}><span>{p.slice(0,2)}</span><b>{p}</b><small>vybráno</small></button>)}</div><div className="action-row"><Button onClick={savePost}>📅 Přidat do plánu</Button></div></Card><Card className="preview-card"><h2>Náhled</h2><p>{postText}</p></Card></main>}

      {tab === 'plan' && <main className="grid two-columns"><Card><h2>Plán obsahu</h2><div className="list">{posts.map((item) => <article className="post-item" key={item.id}><div><strong>{item.title}</strong><span>{item.time}</span></div><Status value={item.status} /></article>)}</div></Card><Card><h2>Statistika posledního příspěvku</h2><p>Mock: dosah +18 %, engagement 6,4 %. Reálné metriky přidáme po sociálních API.</p></Card></main>}

      {tab === 'more' && <main className="grid two-columns"><Card><h2>Velké věci schované v malém studiu</h2><div className="feature-grid">{['Spolupracovníci','AI asistenti','Live plánovač','Merch asistent','Compliance','Analytics'].map((x) => <div key={x}>{x}</div>)}</div></Card><Card><h2>Brand</h2><p>Erb Hrozka je vložen decentně: jako kompaktní znak v hlavičce a lehký watermark. Druhé logo doplníme stejným způsobem později.</p></Card></main>}
    </div>
  </div>;
}
