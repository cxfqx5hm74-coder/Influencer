import { useEffect, useState } from 'react';
import { bootstrapWorkspace, createCalendarEvent, createContentItem, createIdea, getCurrentUser, loadWorkspaceSnapshot, sendLoginLink, signOut } from './lib/dataApi';
import { hasSupabaseConfig } from './lib/supabaseClient';

const platforms = ['Instagram', 'Facebook', 'TikTok', 'LinkedIn', 'X', 'Reddit'];
const mockIdeas = [{ id: 1, body: 'Story ze zákulisí dnešní práce.', source: 'mock' }];
const mockEvents = [{ id: 1, title: 'Call se značkou', time: '10:30', type: 'meeting' }];
const mockPosts = [{ id: 1, title: 'Behind the scenes teaser', status: 'Naplánováno', time: 'Dnes 18:30' }];

function Card({ children }) { return <section className="card">{children}</section>; }
function Button({ children, variant = 'primary', ...props }) { return <button className={`button button-${variant}`} {...props}>{children}</button>; }
function Status({ value }) { return <span className={`status ${value === 'Naplánováno' ? 'status-ok' : value === 'Ke kontrole' ? 'status-warning' : 'status-neutral'}`}>{value}</span>; }
function toTime(value) { const d = new Date(value); return Number.isNaN(d.getTime()) ? 'Bez času' : d.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' }); }

export default function AppWithSupabase() {
  const [tab, setTab] = useState('home');
  const [email, setEmail] = useState('');
  const [user, setUser] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [ideas, setIdeas] = useState(mockIdeas);
  const [events, setEvents] = useState(mockEvents);
  const [posts, setPosts] = useState(mockPosts);
  const [ideaText, setIdeaText] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [postText, setPostText] = useState('Ukázat zákulisí a zeptat se fanoušků, co chtějí vidět příště.');
  const [message, setMessage] = useState('');

  async function refresh() {
    if (!hasSupabaseConfig) return;
    const snapshot = await loadWorkspaceSnapshot();
    if (!snapshot) return;
    setWorkspace(snapshot.workspace);
    setIdeas(snapshot.ideas.map((i) => ({ id: i.id, body: i.body, source: i.source })));
    setEvents(snapshot.events.map((e) => ({ id: e.id, title: e.title, time: toTime(e.starts_at), type: e.event_type })));
    setPosts(snapshot.contents.map((p) => ({ id: p.id, title: p.title, status: p.status === 'scheduled' ? 'Naplánováno' : p.status === 'in_review' ? 'Ke kontrole' : 'Draft', time: p.scheduled_at ? toTime(p.scheduled_at) : 'Bez termínu' })));
    setMessage('Data načtena ze Supabase.');
  }

  useEffect(() => {
    getCurrentUser().then(async (current) => {
      setUser(current);
      if (current) await refresh();
    });
  }, []);

  async function login() {
    if (!email) return setMessage('Zadej e-mail.');
    await sendLoginLink(email);
    setMessage('Přihlašovací odkaz byl odeslán e-mailem.');
  }

  async function prepareWorkspace() {
    await bootstrapWorkspace();
    await refresh();
  }

  async function saveIdea() {
    if (!ideaText) return;
    if (workspace) {
      const saved = await createIdea(workspace.id, ideaText, 'app');
      setIdeas([{ id: saved.id, body: saved.body, source: saved.source }, ...ideas]);
    } else {
      setIdeas([{ id: Date.now(), body: ideaText, source: 'mock' }, ...ideas]);
    }
    setIdeaText('');
  }

  async function saveEvent() {
    if (!eventTitle) return;
    if (workspace) {
      const saved = await createCalendarEvent(workspace.id, eventTitle, '16:00');
      setEvents([...events, { id: saved.id, title: saved.title, time: toTime(saved.starts_at), type: saved.event_type }]);
    } else {
      setEvents([...events, { id: Date.now(), title: eventTitle, time: '16:00', type: 'term' }]);
    }
    setEventTitle('');
  }

  async function savePost() {
    const title = postText.slice(0, 42);
    const next = { id: Date.now(), title, status: 'Naplánováno', time: 'Dnes večer' };
    setPosts([next, ...posts]);
    if (workspace) await createContentItem(workspace.id, title, postText, 'post', 'safe');
    setTab('plan');
  }

  return (
    <div className="app-shell">
      <div className="container">
        <header className="hero">
          <div className="hero-top">
            <div className="brand"><div className="logo">⚔️</div><div><h1>Hrozek Studio</h1><p>Frontend je napojený na Supabase SocMan přes bezpečný klientský klíč.</p></div></div>
            <div className="hero-actions"><Button onClick={() => setTab('create')}>＋ Vytvořit</Button><Button variant="secondary" onClick={refresh}>Načíst DB</Button></div>
          </div>
        </header>

        <nav className="nav">{[['home','Dnes'],['create','Vytvořit'],['plan','Plán'],['more','Více']].map(([id,label]) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>{label}</button>)}</nav>

        {tab === 'home' && <main className="grid two-columns"><div className="stack">
          <Card><div className="card-head"><div><h2>Supabase stav</h2><p>{hasSupabaseConfig ? 'Konfigurace připravena.' : 'Doplň env.example do lokálního prostředí.'}</p></div><Status value={workspace ? 'Naplánováno' : 'Draft'} /></div>{message && <p className="warning">{message}</p>}{user ? <div className="action-row"><Button onClick={prepareWorkspace}>Připravit workspace</Button><Button variant="secondary" onClick={() => signOut().then(() => setUser(null))}>Odhlásit</Button></div> : <div className="input-row"><input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e-mail" /><Button onClick={login}>Přihlásit</Button></div>}</Card>
          <Card><h2>Inbox nápadů</h2><div className="input-row"><input value={ideaText} onChange={(e) => setIdeaText(e.target.value)} placeholder="Nový nápad" /><Button onClick={saveIdea}>Uložit</Button></div><div className="list">{ideas.map((i) => <article className="list-item" key={i.id}><p>{i.body}</p><small>{i.source}</small></article>)}</div></Card>
        </div><aside className="stack"><Card><h2>Osobní kalendář</h2><div className="input-row"><input value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} placeholder="Nový termín" /><Button onClick={saveEvent}>Přidat</Button></div><div className="list">{events.map((e) => <article className="event-item" key={e.id}><strong>{e.time}</strong><span>{e.title}</span><small>{e.type}</small></article>)}</div></Card></aside></main>}

        {tab === 'create' && <main className="grid two-columns"><Card><h2>Vytvořit příspěvek</h2><p>Jeden obsah, potom výběr sítí a termínu.</p><textarea value={postText} onChange={(e) => setPostText(e.target.value)} /><div className="platform-grid">{platforms.map((p) => <button className="platform-card selected" key={p}><span>{p.slice(0,2)}</span><b>{p}</b><small>vybráno</small></button>)}</div><div className="action-row"><Button onClick={savePost}>📅 Přidat do plánu</Button></div></Card><Card><h2>Náhled</h2><p>{postText}</p></Card></main>}

        {tab === 'plan' && <main className="grid two-columns"><Card><h2>Plán obsahu</h2><div className="list">{posts.map((p) => <article className="post-item" key={p.id}><div><strong>{p.title}</strong><span>{p.time}</span></div><Status value={p.status} /></article>)}</div></Card><Card><h2>Statistika posledního příspěvku</h2><p>Mock: dosah +18 %, engagement 6,4 %. Reálné metriky přijdou po napojení sociálních API.</p></Card></main>}

        {tab === 'more' && <main className="grid two-columns"><Card><h2>Další moduly</h2><div className="feature-grid">{['Spolupracovníci','AI asistenti','Live plánovač','Merch asistent','Compliance','Analytics'].map((x) => <div key={x}>{x}</div>)}</div></Card><Card><h2>Workspace</h2><p>{workspace ? workspace.name : 'Workspace zatím není načten.'}</p></Card></main>}
      </div>
    </div>
  );
}
