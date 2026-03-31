import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ExpenseService, Expense, CATEGORIES } from '../services/expense.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="app">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-logo">
          <span class="logo-icon">₹</span>
          <span class="logo-text">ExpenseTracker</span>
        </div>
        <nav class="sidebar-nav">
          <a class="nav-item active">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            Dashboard
          </a>
          <a class="nav-item" routerLink="/add-expense">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Expense
          </a>
        </nav>
        <div class="sidebar-footer">
          <div class="user-info">
            <div class="user-avatar">{{ userName.charAt(0).toUpperCase() }}</div>
            <div>
              <div class="user-name">{{ userName }}</div>
              <button class="logout-btn" (click)="logout()">Sign out</button>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main content -->
      <main class="main">
        <header class="top-bar">
          <h1>Dashboard</h1>
          <a routerLink="/add-expense" class="btn-add">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Expense
          </a>
        </header>

        <!-- Summary cards -->
        <section class="summary-grid">
          <div class="summary-card total">
            <div class="summary-label">Total Spending</div>
            <div class="summary-amount">₹{{ total | number:'1.2-2' }}</div>
            <div class="summary-sub">{{ expenses.length }} expenses</div>
          </div>
          <div class="summary-card" *ngFor="let stat of topStats">
            <div class="summary-label">{{ stat._id }}</div>
            <div class="summary-amount sm">₹{{ stat.total | number:'1.2-2' }}</div>
            <div class="summary-sub">{{ stat.count }} transactions</div>
          </div>
        </section>

        <!-- Filters -->
        <section class="filters">
          <div class="filter-group">
            <label>Category</label>
            <select [(ngModel)]="selectedCategory" (change)="applyFilters()">
              <option *ngFor="let c of categories" [value]="c">{{ c }}</option>
            </select>
          </div>
          <div class="filter-group">
            <label>From</label>
            <input type="date" [(ngModel)]="startDate" (change)="applyFilters()" />
          </div>
          <div class="filter-group">
            <label>To</label>
            <input type="date" [(ngModel)]="endDate" (change)="applyFilters()" />
          </div>
          <button class="btn-clear" (click)="clearFilters()">Clear</button>
        </section>

        <!-- Expense list -->
        <section class="expense-list">
          <div class="list-header">
            <span>Transactions</span>
            <span class="count">{{ expenses.length }} records</span>
          </div>

          <div class="loading" *ngIf="loading">Loading...</div>

          <div class="empty" *ngIf="!loading && expenses.length === 0">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5"><path d="M9 14l-4-4 4-4"/><path d="M5 10h11a4 4 0 010 8h-1"/></svg>
            <p>No expenses found</p>
            <a routerLink="/add-expense">Add your first expense</a>
          </div>

          <div class="expense-item" *ngFor="let e of expenses">
            <div class="expense-left">
              <div class="expense-cat-badge" [ngClass]="e.category.toLowerCase()">
                {{ getCatIcon(e.category) }}
              </div>
              <div class="expense-info">
                <div class="expense-title">{{ e.title }}</div>
                <div class="expense-meta">
                  <span class="cat-tag">{{ e.category }}</span>
                  <span>{{ e.date | date:'dd MMM yyyy' }}</span>
                  <span *ngIf="e.note" class="note-text">{{ e.note }}</span>
                </div>
              </div>
            </div>
            <div class="expense-right">
              <div class="expense-amount">₹{{ e.amount | number:'1.2-2' }}</div>
              <div class="expense-actions">
                <button class="action-btn edit" (click)="editExpense(e._id)" title="Edit">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="action-btn delete" (click)="deleteExpense(e._id)" title="Delete">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  `,
  styles: [`
    * { box-sizing: border-box; margin: 0; padding: 0; }
    .app { display: flex; min-height: 100vh; background: #f5f5f0; font-family: sans-serif; }

    /* Sidebar */
    .sidebar {
      width: 220px; background: #1a1a1a; color: #fff;
      display: flex; flex-direction: column; padding: 24px 0;
      position: fixed; height: 100vh; left: 0; top: 0;
    }
    .sidebar-logo {
      display: flex; align-items: center; gap: 10px;
      padding: 0 20px 28px;
    }
    .logo-icon {
      width: 30px; height: 30px; background: #fff; color: #1a1a1a;
      border-radius: 4px; display: flex; align-items: center;
      justify-content: center; font-size: 14px; font-weight: bold;
    }
    .logo-text { font-size: 15px; font-weight: 600; }
    .sidebar-nav { flex: 1; padding: 0 12px; }
    .nav-item {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 12px; border-radius: 6px; color: #aaa;
      font-size: 14px; cursor: pointer; text-decoration: none;
      transition: all 0.15s; margin-bottom: 4px;
    }
    .nav-item:hover { background: #2a2a2a; color: #fff; }
    .nav-item.active { background: #2a2a2a; color: #fff; }
    .sidebar-footer { padding: 20px; border-top: 1px solid #2a2a2a; }
    .user-info { display: flex; align-items: center; gap: 10px; }
    .user-avatar {
      width: 32px; height: 32px; background: #444; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: 600;
    }
    .user-name { font-size: 13px; color: #fff; font-weight: 500; }
    .logout-btn { background: none; border: none; color: #888; font-size: 12px; cursor: pointer; padding: 0; }
    .logout-btn:hover { color: #fff; }

    /* Main */
    .main { margin-left: 220px; flex: 1; padding: 32px; }
    .top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; }
    .top-bar h1 { font-size: 22px; color: #1a1a1a; font-family: 'Georgia', serif; }
    .btn-add {
      display: flex; align-items: center; gap: 6px;
      background: #1a1a1a; color: #fff;
      border: none; padding: 10px 18px; border-radius: 4px;
      font-size: 13px; font-weight: 600; cursor: pointer;
      text-decoration: none; transition: background 0.2s;
    }
    .btn-add:hover { background: #333; }

    /* Summary cards */
    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .summary-card {
      background: #fff; border-radius: 6px; padding: 20px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.05);
    }
    .summary-card.total { background: #1a1a1a; color: #fff; }
    .summary-label { font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
    .summary-card.total .summary-label { color: #aaa; }
    .summary-amount { font-size: 22px; font-weight: 700; color: #1a1a1a; font-family: 'Georgia', serif; }
    .summary-amount.sm { font-size: 18px; }
    .summary-card.total .summary-amount { color: #fff; }
    .summary-sub { font-size: 12px; color: #aaa; margin-top: 4px; }
    .summary-card.total .summary-sub { color: #888; }

    /* Filters */
    .filters {
      background: #fff; border-radius: 6px; padding: 16px 20px;
      display: flex; gap: 16px; align-items: flex-end; margin-bottom: 20px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.05); flex-wrap: wrap;
    }
    .filter-group { display: flex; flex-direction: column; gap: 5px; }
    .filter-group label { font-size: 11px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
    .filter-group select, .filter-group input {
      border: 1.5px solid #e0e0e0; border-radius: 4px;
      padding: 8px 12px; font-size: 13px; outline: none;
      background: #fff; color: #1a1a1a; cursor: pointer;
    }
    .filter-group select:focus, .filter-group input:focus { border-color: #1a1a1a; }
    .btn-clear {
      background: #f0f0ee; border: none; padding: 8px 16px;
      border-radius: 4px; font-size: 13px; cursor: pointer; color: #666;
      transition: background 0.15s;
    }
    .btn-clear:hover { background: #e0e0de; }

    /* Expense list */
    .expense-list { background: #fff; border-radius: 6px; box-shadow: 0 1px 4px rgba(0,0,0,0.05); overflow: hidden; }
    .list-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 16px 20px; border-bottom: 1px solid #f0f0ee;
      font-size: 14px; font-weight: 600; color: #1a1a1a;
    }
    .count { font-size: 12px; color: #aaa; font-weight: 400; }
    .loading { padding: 40px; text-align: center; color: #aaa; font-size: 14px; }
    .empty { padding: 60px 20px; text-align: center; color: #aaa; }
    .empty p { margin: 12px 0 8px; font-size: 14px; }
    .empty a { color: #1a1a1a; font-size: 13px; font-weight: 600; text-decoration: none; }

    .expense-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 16px 20px; border-bottom: 1px solid #f8f8f6;
      transition: background 0.1s;
    }
    .expense-item:hover { background: #fafaf8; }
    .expense-item:last-child { border-bottom: none; }
    .expense-left { display: flex; align-items: center; gap: 14px; }
    .expense-cat-badge {
      width: 38px; height: 38px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-size: 17px; background: #f5f5f0;
      flex-shrink: 0;
    }
    .expense-title { font-size: 14px; font-weight: 600; color: #1a1a1a; margin-bottom: 3px; }
    .expense-meta { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #aaa; flex-wrap: wrap; }
    .cat-tag {
      background: #f0f0ee; color: #666; padding: 2px 7px;
      border-radius: 3px; font-size: 11px; font-weight: 500;
    }
    .note-text { font-style: italic; color: #bbb; }
    .expense-right { display: flex; align-items: center; gap: 16px; }
    .expense-amount { font-size: 15px; font-weight: 700; color: #1a1a1a; font-family: 'Georgia', serif; }
    .expense-actions { display: flex; gap: 6px; }
    .action-btn {
      width: 28px; height: 28px; border: 1.5px solid #e8e8e8;
      border-radius: 4px; background: #fff; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.15s; color: #888;
    }
    .action-btn.edit:hover { border-color: #1a1a1a; color: #1a1a1a; }
    .action-btn.delete:hover { border-color: #e53e3e; color: #e53e3e; }

    @media (max-width: 768px) {
      .sidebar { display: none; }
      .main { margin-left: 0; padding: 16px; }
      .summary-grid { grid-template-columns: 1fr 1fr; }
      .filters { flex-direction: column; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  expenses: Expense[] = [];
  total = 0;
  topStats: { _id: string; total: number; count: number }[] = [];
  categories = CATEGORIES;
  selectedCategory = 'All';
  startDate = '';
  endDate = '';
  loading = false;
  userName = '';

  constructor(
    private expenseService: ExpenseService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.userName = this.auth.currentUser()?.name || 'User';
    this.loadExpenses();
    this.loadStats();
  }

  loadExpenses() {
    this.loading = true;
    this.expenseService.getExpenses({
      category: this.selectedCategory,
      startDate: this.startDate,
      endDate: this.endDate
    }).subscribe({
      next: (res) => {
        this.expenses = res.expenses;
        this.total = res.total;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  loadStats() {
    this.expenseService.getStats().subscribe(stats => {
      this.topStats = stats.slice(0, 3);
    });
  }

  applyFilters() { this.loadExpenses(); }

  clearFilters() {
    this.selectedCategory = 'All';
    this.startDate = '';
    this.endDate = '';
    this.loadExpenses();
  }

  editExpense(id: string) {
    this.router.navigate(['/edit-expense', id]);
  }

  deleteExpense(id: string) {
    if (!confirm('Delete this expense?')) return;
    this.expenseService.deleteExpense(id).subscribe(() => {
      this.loadExpenses();
      this.loadStats();
    });
  }

  getCatIcon(cat: string): string {
    const icons: Record<string, string> = {
      Food: '🍽️', Transport: '🚗', Shopping: '🛍️',
      Bills: '📄', Health: '💊', Entertainment: '🎬',
      Education: '📚', Other: '📦'
    };
    return icons[cat] || '📦';
  }

  logout() { this.auth.logout(); }
}
