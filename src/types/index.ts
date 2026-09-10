export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  icon?: string
  color: string
  type: 'income' | 'expense'
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  category_id?: string
  category?: Category
  description: string
  amount: number
  type: 'income' | 'expense'
  date: string
  notes?: string
  is_recurring: boolean
  recurring_id?: string
  created_at: string
  updated_at: string
}

export interface RecurringTransaction {
  id: string
  user_id: string
  category_id?: string
  category?: Category
  description: string
  amount: number
  type: 'income' | 'expense'
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  start_date: string
  end_date?: string
  next_payment: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Budget {
  id: string
  user_id: string
  category_id: string
  category?: Category
  amount: number
  month: number
  year: number
  created_at: string
}

export interface Goal {
  id: string
  user_id: string
  name: string
  target_amount: number
  current_amount: number
  deadline?: string
  color: string
  icon?: string
  is_completed: boolean
  created_at: string
  updated_at: string
}

export interface GoalContribution {
  id: string
  goal_id: string
  amount: number
  date: string
  notes?: string
  created_at: string
}

export interface Investment {
  id: string
  user_id: string
  name: string
  type: 'fixed_income' | 'stocks' | 'funds' | 'crypto' | 'other'
  institution?: string
  initial_amount: number
  current_amount: number
  purchase_date: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface InvestmentTransaction {
  id: string
  investment_id: string
  type: 'deposit' | 'withdrawal' | 'dividend'
  amount: number
  date: string
  notes?: string
  created_at: string
}

export interface DashboardStats {
  balance: number
  income: number
  expenses: number
  investments: number
  incomeChange: number
  expenseChange: number
}
