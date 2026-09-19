-- 1. Table for clothes
create table wardrobe_items (
    id uuid primary key default gen_random_uuid(),
    user_id text not null,
    category text not null,
    sub_category text not null,
    color_primary text not null,
    color_secondary text,
    material text,
    pattern text default 'solid',
    formality text not null,
    season_suitability text[] default array['warm', 'transitional', 'cool'],
    last_worn_at timestamptz,
    created_at timestamptz default now()
);

-- 2. Table for worn outfit history
create table outfit_logs (
    id uuid primary key default gen_random_uuid(),
    user_id text not null,
    item_ids uuid[] not null,
    event_name text,
    worn_date date not null default current_date,
    created_at timestamptz default now()
);
