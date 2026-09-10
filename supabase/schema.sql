-- LifeOS Database Schema
-- Execute this SQL in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Categories table
create table categories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  icon text,
  color text default '#8B5CF6',
  type text check (type in ('income', 'expense')) not null default 'expense',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, name, type)
);

-- Transactions table
create table transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  category_id uuid references categories(id) on delete set null,
  description text not null,
  amount decimal(12,2) not null,
  type text check (type in ('income', 'expense')) not null,
  date date not null default current_date,
  notes text,
  is_recurring boolean default false,
  recurring_id uuid,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Recurring transactions table
create table recurring_transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  category_id uuid references categories(id) on delete set null,
  description text not null,
  amount decimal(12,2) not null,
  type text check (type in ('income', 'expense')) not null,
  frequency text check (frequency in ('daily', 'weekly', 'monthly', 'yearly')) not null,
  start_date date not null,
  end_date date,
  next_payment date not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Budgets table
create table budgets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  category_id uuid references categories(id) on delete cascade not null,
  amount decimal(12,2) not null,
  month integer not null check (month between 1 and 12),
  year integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, category_id, month, year)
);

-- Goals table
create table goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  target_amount decimal(12,2) not null,
  current_amount decimal(12,2) default 0,
  deadline date,
  color text default '#8B5CF6',
  icon text,
  is_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Goal contributions table
create table goal_contributions (
  id uuid default uuid_generate_v4() primary key,
  goal_id uuid references goals(id) on delete cascade not null,
  amount decimal(12,2) not null,
  date date not null default current_date,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Investments table
create table investments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text check (type in ('fixed_income', 'stocks', 'funds', 'crypto', 'other')) not null,
  institution text,
  initial_amount decimal(12,2) not null,
  current_amount decimal(12,2) not null,
  purchase_date date not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Investment transactions table
create table investment_transactions (
  id uuid default uuid_generate_v4() primary key,
  investment_id uuid references investments(id) on delete cascade not null,
  type text check (type in ('deposit', 'withdrawal', 'dividend')) not null,
  amount decimal(12,2) not null,
  date date not null default current_date,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes
create index idx_transactions_user_id on transactions(user_id);
create index idx_transactions_date on transactions(date);
create index idx_transactions_category_id on transactions(category_id);
create index idx_categories_user_id on categories(user_id);
create index idx_budgets_user_id on budgets(user_id);
create index idx_goals_user_id on goals(user_id);
create index idx_investments_user_id on investments(user_id);
create index idx_recurring_transactions_user_id on recurring_transactions(user_id);

-- Enable Row Level Security
alter table categories enable row level security;
alter table transactions enable row level security;
alter table recurring_transactions enable row level security;
alter table budgets enable row level security;
alter table goals enable row level security;
alter table goal_contributions enable row level security;
alter table investments enable row level security;
alter table investment_transactions enable row level security;

-- Create RLS policies
create policy "Users can view own categories" on categories for select using (auth.uid() = user_id);
create policy "Users can insert own categories" on categories for insert with check (auth.uid() = user_id);
create policy "Users can update own categories" on categories for update using (auth.uid() = user_id);
create policy "Users can delete own categories" on categories for delete using (auth.uid() = user_id);

create policy "Users can view own transactions" on transactions for select using (auth.uid() = user_id);
create policy "Users can insert own transactions" on transactions for insert with check (auth.uid() = user_id);
create policy "Users can update own transactions" on transactions for update using (auth.uid() = user_id);
create policy "Users can delete own transactions" on transactions for delete using (auth.uid() = user_id);

create policy "Users can view own recurring" on recurring_transactions for select using (auth.uid() = user_id);
create policy "Users can insert own recurring" on recurring_transactions for insert with check (auth.uid() = user_id);
create policy "Users can update own recurring" on recurring_transactions for update using (auth.uid() = user_id);
create policy "Users can delete own recurring" on recurring_transactions for delete using (auth.uid() = user_id);

create policy "Users can view own budgets" on budgets for select using (auth.uid() = user_id);
create policy "Users can insert own budgets" on budgets for insert with check (auth.uid() = user_id);
create policy "Users can update own budgets" on budgets for update using (auth.uid() = user_id);
create policy "Users can delete own budgets" on budgets for delete using (auth.uid() = user_id);

create policy "Users can view own goals" on goals for select using (auth.uid() = user_id);
create policy "Users can insert own goals" on goals for insert with check (auth.uid() = user_id);
create policy "Users can update own goals" on goals for update using (auth.uid() = user_id);
create policy "Users can delete own goals" on goals for delete using (auth.uid() = user_id);

create policy "Users can view own goal_contributions" on goal_contributions for select using (
  exists (select 1 from goals where goals.id = goal_id and goals.user_id = auth.uid())
);
create policy "Users can insert own goal_contributions" on goal_contributions for insert with check (
  exists (select 1 from goals where goals.id = goal_id and goals.user_id = auth.uid())
);

create policy "Users can view own investments" on investments for select using (auth.uid() = user_id);
create policy "Users can insert own investments" on investments for insert with check (auth.uid() = user_id);
create policy "Users can update own investments" on investments for update using (auth.uid() = user_id);
create policy "Users can delete own investments" on investments for delete using (auth.uid() = user_id);

create policy "Users can view own investment_transactions" on investment_transactions for select using (
  exists (select 1 from investments where investments.id = investment_id and investments.user_id = auth.uid())
);
create policy "Users can insert own investment_transactions" on investment_transactions for insert with check (
  exists (select 1 from investments where investments.id = investment_id and investments.user_id = auth.uid())
);

-- Create function to update updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create triggers
create trigger update_transactions_updated_at before update on transactions
  for each row execute function update_updated_at_column();

create trigger update_recurring_transactions_updated_at before update on recurring_transactions
  for each row execute function update_updated_at_column();

create trigger update_goals_updated_at before update on goals
  for each row execute function update_updated_at_column();

create trigger update_investments_updated_at before update on investments
  for each row execute function update_updated_at_column();

-- Insert default categories for new users
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into categories (user_id, name, icon, color, type) values
    (new.id, 'Salário', '💼', '#10B981', 'income'),
    (new.id, 'Freelance', '💻', '#3B82F6', 'income'),
    (new.id, 'Investimentos', '📈', '#8B5CF6', 'income'),
    (new.id, 'Outros', '💰', '#F59E0B', 'income'),
    (new.id, 'Aluguel', '🏠', '#EF4444', 'expense'),
    (new.id, 'Alimentação', '🍔', '#F97316', 'expense'),
    (new.id, 'Transporte', '🚗', '#EC4899', 'expense'),
    (new.id, 'Saúde', '🏥', '#14B8A6', 'expense'),
    (new.id, 'Educação', '📚', '#6366F1', 'expense'),
    (new.id, 'Lazer', '🎮', '#A855F7', 'expense'),
    (new.id, 'Assinaturas', '📱', '#06B6D4', 'expense'),
    (new.id, 'Outros', '📦', '#6B7280', 'expense');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
