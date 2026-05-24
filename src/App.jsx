import { useMemo, useState } from 'react';

const modes = {
  mainstream: {
    label: 'Běžné sítě',
    icon: '🌐',
    helper: 'Instagram, Facebook, TikTok, LinkedIn a další běžné kanály.',
    accent: 'cyan'
  },
  adult: {
    label: 'Adult / erotika',
    icon: '🛡️',
    helper: 'Citlivější obsah s kontrolou bezpečnosti, souhlasů a vhodných kanálů.',
    accent: 'rose'
  },
  hybrid: {
    label: 'Obojí',
    icon: '⚔️',
    helper: 'Veřejný brand i citlivější brand v jednom studiu, ale odděleně a bezpečně.',
    accent: 'amber'
  }
};

const allPlatforms = [
  { id: 'instagram', name: 'Instagram', icon: 'IG', modes: ['mainstream', 'adult', 'hybrid'], bestTime: '18:30' },
  { id: 'facebook', name: 'Facebook', icon: 'FB', modes: ['mainstream', 'hybrid'], bestTime: '17:45' },
  { id: 'tiktok', name: 'TikTok', icon: 'TT', modes: ['mainstream', 'hybrid'], bestTime: '20:15' },
  { id: 'linkedin', name: 'LinkedIn', icon: 'IN', modes: ['mainstream', 'hybrid'], bestTime: '09:00' },
  { id: 'threads', name: 'Threads', icon: 'TH', modes: ['mainstream'], bestTime: '12:15' },
  { id: 'x', name: 'X', icon: 'X', modes: ['adult', 'hybrid'], bestTime: '21:00' },
  { id: 'reddit', name: 'Reddit', icon: 'RD', modes: ['adult', 'hybrid'], bestTime: '22:00' }
];

const startPosts = [
  { id: 1, title: 'Behind the scenes teaser', channels: ['Instagram', 'TikTok'], time: 'Dnes 18:30', state: 'Naplánováno' },
  { id: 2, title: 'Myšlenka týdne', channels: ['LinkedIn'], time: 'Zítra 09:00', state: 'Draft' },
  { id: 3, title: 'Community update', channels: ['X', 'Reddit'], time: 'Dnes 21:00', state: 'Ke kontrole' }
];

const startIdeas = [
  { id: 1, text: 'Story: ukázat přípravu před focením a dát fanouškům hlasovat o coveru.', source: 'Rychlá poznámka' },
  { id: 2, text: 'Reels: 3 věci, které bych si přál vědět před první spoluprací se značkou.', source: 'Nápad z rozhovoru' }
];

const startEvents = [
  { id: 1, time: '10:30', title: 'Call se značkou — návrh kampaně', type: 'Schůzka' },
  { id: 2, time: '14:00', title: 'Rozhovor pro podcast', type: 'Rozhovor' },
  { id: 3, time: '18:30', title: 'Publikovat BTS teaser', type: 'Obsah' }
];

function Status({ value }) {
  return <span className={`status ${value === 'Naplánováno' ? 'status-ok' : value === 'Ke kontrole' ? 'status-warning' : 'status-neutral'}`}>{value}</span>;
}

function Card({ children, className = '' }) {
  return <section className={`card ${className}`}>{children}</section>;
}

function Button({ children, variant = 'primary', ...props }) {
  return <button className={`button button-${variant}`} {...props}>{children}</button>;
}

function Header({ mode, setMode, setTab, advancedView, setAdvancedView }) {
  return (
    <header className="hero">
      <div className="hero-top">
        <div className="brand">
          <div className="logo">⚔️</div>
          <div>
            <h1>Hrozek Studio</h1>
            <p>Jednoduchý pomocník pro postování, nápady, plán a spolupráci.</p>
          </div>
        </div>
        <div className="hero-actions">
          <Button onClick={() => setTab('create')}>＋ Vytvořit příspěvek</Button>
          <Button variant="secondary" onClick={() => setAdvancedView(!advancedView)}>
            {advancedView ? 'Jednoduchý režim' : 'Rozšířený režim'}
          </Button>
        </div>
      </div>

      <div className={`mode-panel mode-${modes[mode].accent}`}>
        <div className="mode-panel-head">
          <span>Typ práce</span>
          <b>{advancedView ? 'Rozšířené nástroje zapnuté' : 'Jednoduchý režim'}</b>
        </div>
        <div className="mode-grid">
          {Object.entries(modes).map(([id, item]) => (
            <button key={id} className={`mode-button ${mode === id ? 'active' : ''}`} onClick={() => setMode(id)}>
              <strong>{item.icon} {item.label}</strong>
              <small>{item.helper}</small>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

function Navigation({ tab, setTab }) {
  const items = [
    ['home', 'Dnes', '🏠'],
    ['create', 'Vytvořit', '＋'],
    ['plan', 'Plán', '📅'],
    ['more', 'Více', '☰']
  ];
  return (
    <nav className="nav">
      {items.map(([id, label, icon]) => (
        <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>
          <span>{icon}</span>{label}
        </button>
      ))}
    </nav>
  );
}

function IdeaInbox({ ideas, setIdeas, setDraftIdea, setTab }) {
  const [text, setText] = useState('');
  function saveIdea(source = 'Rychlá poznámka') {
    if (!text.trim()) return;
    setIdeas([{ id: Date.now(), text: text.trim(), source }, ...ideas]);
    setText('');
  }
  return (
    <Card>
      <div className="card-head">
        <div>
          <h2>Inbox nápadů</h2>
          <p>Rychle si odlož myšlenku. Dokonalý text přijde až potom.</p>
        </div>
        <span className="badge">{ideas.length} nápady</span>
      </div>
      <div className="input-row">
        <input value={text} onChange={(event) => setText(event.target.value)} placeholder="Např. Reels o zákulisí..." />
        <Button onClick={() => saveIdea()}>Uložit</Button>
        <Button variant="secondary" onClick={() => saveIdea('Diktát')}>🎙️</Button>
      </div>
      <div className="list">
        {ideas.slice(0, 3).map((idea) => (
          <article key={idea.id} className="list-item">
            <p>{idea.text}</p>
            <footer>
              <small>{idea.source}</small>
              <button onClick={() => { setDraftIdea(idea.text); setTab('create'); }}>Použít pro post</button>
            </footer>
          </article>
        ))}
      </div>
    </Card>
  );
}

function PersonalCalendar({ events, setEvents }) {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('16:00');
  function addEvent(type = 'Termín') {
    if (!title.trim()) return;
    setEvents([...events, { id: Date.now(), title: title.trim(), time, type }].sort((a, b) => a.time.localeCompare(b.time)));
    setTitle('');
  }
  return (
    <Card>
      <h2>Osobní kalendář</h2>
      <p>Schůzky, rozhovory, focení, livestreamy a důležité termíny.</p>
      <div className="input-row calendar-row">
        <input value={time} onChange={(event) => setTime(event.target.value)} />
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Např. rozhovor, focení, schůzka..." />
        <Button onClick={() => addEvent()}>Přidat</Button>
      </div>
      <div className="list compact">
        {events.map((event) => (
          <article key={event.id} className="event-item">
            <strong>{event.time}</strong>
            <span>{event.title}</span>
            <small>{event.type}</small>
          </article>
        ))}
      </div>
    </Card>
  );
}

function Home({ mode, posts, platforms, setTab, advancedView, ideas, setIdeas, events, setEvents, setDraftIdea }) {
  return (
    <main className="grid two-columns">
      <div className="stack">
        <Card className="tip-card">
          <h2>👋 Co teď?</h2>
          <p>{mode === 'mainstream' ? 'Vyber fotku nebo video, napiš jednu větu a Hrozek připraví varianty pro sítě.' : mode === 'adult' ? 'Citlivější obsah držíme bezpečně: nejdřív teaser, potom kontrola vhodných kanálů.' : 'Veřejný a citlivější brand držíme odděleně, aby se nepomíchaly.'}</p>
          {advancedView && <small>Rozšířený režim je zapnutý, ale běžné postování zůstává jednoduché.</small>}
          <Button onClick={() => setTab('create')}>Začít tvořit</Button>
        </Card>
        <IdeaInbox ideas={ideas} setIdeas={setIdeas} setDraftIdea={setDraftIdea} setTab={setTab} />
        <Card>
          <div className="card-head">
            <div>
              <h2>Dnes</h2>
              <p>Nejdůležitější věci bez zbytečného hledání.</p>
            </div>
            <span className="badge">{modes[mode].label}</span>
          </div>
          <div className="list">
            {posts.filter((post) => post.state !== 'Draft').map((post) => (
              <article key={post.id} className="post-item">
                <div>
                  <strong>{post.title}</strong>
                  <span>{post.channels.join(' + ')} · {post.time}</span>
                </div>
                <Status value={post.state} />
              </article>
            ))}
          </div>
        </Card>
      </div>
      <aside className="stack">
        <PersonalCalendar events={events} setEvents={setEvents} />
        <Card>
          <h2>Napojené sítě</h2>
          <p>Zobrazuji jen ty, které dávají smysl pro aktuální režim.</p>
          <div className="platform-list">
            {platforms.map((platform) => (
              <div key={platform.id} className="platform-line">
                <span>{platform.icon}</span>
                <b>{platform.name}</b>
                <small>{platform.bestTime}</small>
              </div>
            ))}
          </div>
        </Card>
      </aside>
    </main>
  );
}

function Create({ mode, platforms, posts, setPosts, setTab, draftIdea, setDraftIdea }) {
  const [postType, setPostType] = useState('Story');
  const [idea, setIdea] = useState(draftIdea || 'Ukázat zákulisí dnešního focení a zeptat se fanoušků, která varianta se jim líbí víc.');
  const [selected, setSelected] = useState(platforms.slice(0, 3).map((platform) => platform.id));
  const [time, setTime] = useState('Dnes večer');
  const [suggestions, setSuggestions] = useState([]);

  const selectedPlatforms = platforms.filter((platform) => selected.includes(platform.id));

  function togglePlatform(id) {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function makeSuggestions() {
    setSuggestions(selectedPlatforms.map((platform) => ({
      id: platform.id,
      platform: platform.name,
      safety: mode === 'mainstream' ? 'OK' : ['x', 'reddit'].includes(platform.id) ? 'Kontrola' : 'OK',
      text: platform.id === 'linkedin'
        ? `Profesionální verze: ${idea}\n\nKrátký post s jedním poznatkem a otázkou na závěr.`
        : platform.id === 'tiktok'
        ? `Hook: Tohle jste ze zákulisí ještě neviděli.\n${idea.slice(0, 120)}`
        : mode !== 'mainstream' && ['x', 'reddit'].includes(platform.id)
        ? `Bezpečný teaser: ${idea}\n\nPřed zveřejněním zkontrolovat vhodnost kanálu a souhlasy.`
        : `${idea}\n\nCo myslíte? Napište mi do komentářů.`
    })));
  }

  function addToPlan() {
    const title = idea.length > 42 ? `${idea.slice(0, 42)}…` : idea;
    setPosts([{ id: Date.now(), title, channels: selectedPlatforms.map((platform) => platform.name), time, state: mode === 'mainstream' ? 'Naplánováno' : 'Ke kontrole' }, ...posts]);
    setDraftIdea('');
    setTab('plan');
  }

  return (
    <main className="grid two-columns">
      <div className="stack">
        <Card>
          <h2>Co chceš dnes postnout?</h2>
          <p>Stejně jednoduše jako na Instagramu. Jen z jednoho místa.</p>
          <div className="segmented">
            {['Story', 'Příspěvek', 'Reels / video'].map((type) => <button key={type} className={postType === type ? 'active' : ''} onClick={() => setPostType(type)}>{type}</button>)}
          </div>
          <label>Text nebo nápad</label>
          <textarea value={idea} onChange={(event) => setIdea(event.target.value)} />
        </Card>
        <Card>
          <h2>Kam to pošleme?</h2>
          <div className="platform-grid">
            {platforms.map((platform) => (
              <button key={platform.id} className={`platform-card ${selected.includes(platform.id) ? 'selected' : ''}`} onClick={() => togglePlatform(platform.id)}>
                <span>{platform.icon}</span>
                <b>{platform.name}</b>
                <small>nejlépe {platform.bestTime}</small>
              </button>
            ))}
          </div>
        </Card>
        <Card>
          <h2>Kdy publikovat?</h2>
          <div className="segmented wrap">
            {['Hned', 'Dnes večer', 'Zítra ráno', 'Vlastní čas'].map((item) => <button key={item} className={time === item ? 'active' : ''} onClick={() => setTime(item)}>{item}</button>)}
          </div>
          {mode !== 'mainstream' && <p className="warning">🛡️ Citlivější režim je zapnutý. Obsah se před publikací pošle ke kontrole.</p>}
          <div className="action-row">
            <Button onClick={makeSuggestions}>✨ Připravit návrhy</Button>
            <Button variant="secondary" onClick={addToPlan}>📅 Přidat do plánu</Button>
          </div>
        </Card>
      </div>
      <aside className="stack">
        <Card>
          <h2>Náhled návrhů</h2>
          <p>Tady uvidíš, jak by text vypadal na jednotlivých sítích.</p>
          <div className="list">
            {suggestions.length === 0 && <div className="empty">Klikni na Připravit návrhy. Nic se ještě nepublikuje.</div>}
            {suggestions.map((item) => (
              <article key={item.id} className="suggestion">
                <header><strong>{item.platform}</strong><Status value={item.safety === 'OK' ? 'Naplánováno' : 'Ke kontrole'} /></header>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </Card>
      </aside>
    </main>
  );
}

function Plan({ posts, setPosts, setTab, events }) {
  function approve(id) {
    setPosts(posts.map((post) => post.id === id ? { ...post, state: 'Naplánováno' } : post));
  }
  return (
    <main className="grid two-columns">
      <Card>
        <div className="card-head">
          <div>
            <h2>Plán obsahu</h2>
            <p>Jednoduchý seznam: co, kam a kdy.</p>
          </div>
          <Button onClick={() => setTab('create')}>＋ Přidat další</Button>
        </div>
        <div className="list">
          {posts.map((post) => (
            <article key={post.id} className="post-item">
              <div>
                <strong>{post.title}</strong>
                <span>{post.channels.join(' + ')} · {post.time}</span>
              </div>
              <Status value={post.state} />
              {post.state === 'Ke kontrole' && <button className="mini-button" onClick={() => approve(post.id)}>Schválit</button>}
            </article>
          ))}
        </div>
      </Card>
      <Card>
        <h2>Dnešní osobní termíny</h2>
        <div className="list compact">
          {events.map((event) => <article className="event-item" key={event.id}><strong>{event.time}</strong><span>{event.title}</span><small>{event.type}</small></article>)}
        </div>
      </Card>
    </main>
  );
}

function More({ mode, advancedView, setAdvancedView }) {
  const items = mode === 'mainstream'
    ? ['Analytics', 'Tým', 'Brand voice', 'Napojené účty', 'Live plánovač', 'AI asistenti', 'Merch asistent']
    : ['Bezpečnost obsahu', 'Evidence souhlasů', 'Oddělení brandů', 'Audit log', 'Tým a role', 'Live plánovač', 'AI asistenti', 'Merch asistent'];
  return (
    <main className="grid two-columns">
      <Card>
        <div className="card-head">
          <div>
            <h2>Více možností</h2>
            <p>Pokročilé věci jsou schované, aby každodenní postování zůstalo jednoduché.</p>
          </div>
          <Button variant="secondary" onClick={() => setAdvancedView(!advancedView)}>{advancedView ? 'Vypnout rozšířené' : 'Zapnout rozšířené'}</Button>
        </div>
        <div className="settings-list">
          {items.map((item) => <button key={item}>{item}<span>›</span></button>)}
        </div>
      </Card>
      <Card>
        <h2>Bezpečný záměr produktu</h2>
        <p>Hlavní aplikace má být kamarádský pomocník. Pokročilé věci existují pro týmy, agentury a citlivější obsah, ale běžný uživatel je uvidí jen tehdy, když je opravdu potřebuje.</p>
        <div className="feature-grid">
          {['🔴 Live plánovač', '🤖 AI asistenti', '🛍️ Merch asistent', '👥 Spolupracovníci', '📈 Statistiky', '🛡️ Kontrola obsahu'].map((item) => <div key={item}>{item}</div>)}
        </div>
      </Card>
    </main>
  );
}

export default function App() {
  const [mode, setMode] = useState('hybrid');
  const [tab, setTab] = useState('home');
  const [posts, setPosts] = useState(startPosts);
  const [ideas, setIdeas] = useState(startIdeas);
  const [events, setEvents] = useState(startEvents);
  const [draftIdea, setDraftIdea] = useState('');
  const [advancedView, setAdvancedView] = useState(false);
  const platforms = useMemo(() => allPlatforms.filter((platform) => platform.modes.includes(mode)), [mode]);

  return (
    <div className="app-shell">
      <div className="glow glow-one" />
      <div className="glow glow-two" />
      <div className="container">
        <Header mode={mode} setMode={setMode} setTab={setTab} advancedView={advancedView} setAdvancedView={setAdvancedView} />
        <Navigation tab={tab} setTab={setTab} />
        {tab === 'home' && <Home mode={mode} posts={posts} platforms={platforms} setTab={setTab} advancedView={advancedView} ideas={ideas} setIdeas={setIdeas} events={events} setEvents={setEvents} setDraftIdea={setDraftIdea} />}
        {tab === 'create' && <Create mode={mode} platforms={platforms} posts={posts} setPosts={setPosts} setTab={setTab} draftIdea={draftIdea} setDraftIdea={setDraftIdea} />}
        {tab === 'plan' && <Plan posts={posts} setPosts={setPosts} setTab={setTab} events={events} />}
        {tab === 'more' && <More mode={mode} advancedView={advancedView} setAdvancedView={setAdvancedView} />}
      </div>
    </div>
  );
}
