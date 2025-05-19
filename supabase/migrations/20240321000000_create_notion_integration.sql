-- Create notion_integrations table
create table if not exists notion_integrations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id),
  access_token text not null,
  workspace_id text not null,
  workspace_name text,
  workspace_icon text,
  bot_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table notion_integrations enable row level security;

create policy "Users can view their own notion integrations"
  on notion_integrations for select
  using (auth.uid() = user_id);

create policy "Users can update their own notion integrations"
  on notion_integrations for update
  using (auth.uid() = user_id);

create policy "Users can insert their own notion integrations"
  on notion_integrations for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own notion integrations"
  on notion_integrations for delete
  using (auth.uid() = user_id); 