import { supabase, hasSupabaseConfig } from './supabaseClient';

export async function getCurrentUser() {
  if (!hasSupabaseConfig) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user ?? null;
}

export async function sendLoginLink(email) {
  if (!hasSupabaseConfig) throw new Error('Supabase není nakonfigurovaný.');
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin
    }
  });
  if (error) throw error;
}

export async function signOut() {
  if (!hasSupabaseConfig) return;
  await supabase.auth.signOut();
}

export async function bootstrapWorkspace() {
  if (!hasSupabaseConfig) throw new Error('Supabase není nakonfigurovaný.');
  const { data, error } = await supabase.rpc('bootstrap_workspace', {
    workspace_name: 'Hrozek Studio HQ',
    workspace_slug: 'hrozek-studio',
    workspace_mode: 'hybrid'
  });
  if (error) throw error;
  return data;
}

export async function loadWorkspaceSnapshot() {
  if (!hasSupabaseConfig) return null;

  const { data: workspaces, error: workspaceError } = await supabase
    .from('workspaces')
    .select('id,name,mode')
    .limit(1);

  if (workspaceError) throw workspaceError;
  const workspace = workspaces?.[0] ?? null;
  if (!workspace) return null;

  const [{ data: ideas, error: ideasError }, { data: events, error: eventsError }, { data: contents, error: contentsError }] = await Promise.all([
    supabase
      .from('idea_inbox_items')
      .select('id,body,source,created_at')
      .eq('workspace_id', workspace.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('personal_calendar_events')
      .select('id,title,event_type,starts_at')
      .eq('workspace_id', workspace.id)
      .order('starts_at', { ascending: true }),
    supabase
      .from('content_items')
      .select('id,title,status,scheduled_at,created_at')
      .eq('workspace_id', workspace.id)
      .order('created_at', { ascending: false })
  ]);

  if (ideasError) throw ideasError;
  if (eventsError) throw eventsError;
  if (contentsError) throw contentsError;

  return { workspace, ideas: ideas ?? [], events: events ?? [], contents: contents ?? [] };
}

export async function createIdea(workspaceId, body, source = 'app') {
  if (!hasSupabaseConfig) throw new Error('Supabase není nakonfigurovaný.');
  const user = await getCurrentUser();
  if (!user) throw new Error('Uživatel není přihlášený.');

  const { data, error } = await supabase
    .from('idea_inbox_items')
    .insert({ workspace_id: workspaceId, created_by: user.id, body, source })
    .select('id,body,source,created_at')
    .single();

  if (error) throw error;
  return data;
}

export async function createCalendarEvent(workspaceId, title, timeText) {
  if (!hasSupabaseConfig) throw new Error('Supabase není nakonfigurovaný.');
  const user = await getCurrentUser();
  if (!user) throw new Error('Uživatel není přihlášený.');

  const now = new Date();
  const [hours = '16', minutes = '00'] = String(timeText || '16:00').split(':');
  now.setHours(Number(hours), Number(minutes), 0, 0);

  const { data, error } = await supabase
    .from('personal_calendar_events')
    .insert({ workspace_id: workspaceId, created_by: user.id, title, event_type: 'term', starts_at: now.toISOString() })
    .select('id,title,event_type,starts_at')
    .single();

  if (error) throw error;
  return data;
}

export async function createContentItem(workspaceId, title, baseIdea, contentType, classification = 'safe') {
  if (!hasSupabaseConfig) throw new Error('Supabase není nakonfigurovaný.');
  const user = await getCurrentUser();
  if (!user) throw new Error('Uživatel není přihlášený.');

  const { data, error } = await supabase
    .from('content_items')
    .insert({
      workspace_id: workspaceId,
      created_by: user.id,
      title,
      base_idea: baseIdea,
      content_type: contentType,
      classification,
      status: classification === 'safe' ? 'scheduled' : 'in_review'
    })
    .select('id,title,status,scheduled_at,created_at')
    .single();

  if (error) throw error;
  return data;
}
