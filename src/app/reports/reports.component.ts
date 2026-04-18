import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ExpenseService } from '../services/expense.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page">
      <aside class="sidebar">
        <div class="sidebar-logo">
          <span class="logo-icon">₹</span>
          <span class="logo-text">ExpenseTracker</span>
        </div>
        <nav class="sidebar-nav">
          <a class="nav-item" routerLink="/dashboard">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            Dashboard
          </a>
          <a class="nav-item" routerLink="/add-expense">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Expense
          </a>
          <a class="nav-item active">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            Reports
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

      <main class="main">
        <header class="top-bar">
          <div>
            <h1>Financial Reports</h1>
            <p class="subtitle">Track your spending patterns</p>
          </div>
          <div class="view-toggle">
            <button [class.active]="viewMode==='monthly'" (click)="setView('monthly')">Monthly</button>
            <button [class.active]="viewMode==='yearly'" (click)="setView('yearly')">Yearly</button>
          </div>
        </header>

        <div class="filters-bar">
          <div class="filter-group" *ngIf="viewMode==='monthly'">
            <label>Month</label>
            <select [(ngModel)]="selectedMonth" (change)="loadData()">
              <option *ngFor="let m of months; let i=index" [value]="i+1">{{ m }}</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Year</label>
            <select [(ngModel)]="selectedYear" (change)="loadData()">
              <option *ngFor="let y of years" [value]="y">{{ y }}</option>
            </select>
          </div>
        </div>

        <div class="summary-grid">
          <div class="card dark">
            <div class="card-icon">💰</div>
            <div>
              <div class="card-label">Total Spent</div>
              <div class="card-value">₹{{ totalSpent | number:'1.2-2' }}</div>
            </div>
          </div>
          <div class="card">
            <div class="card-icon">📊</div>
            <div>
              <div class="card-label">Transactions</div>
              <div class="card-value">{{ totalTransactions }}</div>
            </div>
          </div>
          <div class="card">
            <div class="card-icon">📈</div>
            <div>
              <div class="card-label">Daily Average</div>
              <div class="card-value">₹{{ avgPerDay | number:'1.2-2' }}</div>
            </div>
          </div>
          <div class="card">
            <div class="card-icon">🏆</div>
            <div>
              <div class="card-label">Top Category</div>
              <div class="card-value sm">{{ topCategory }}</div>
            </div>
          </div>
        </div>

        <div class="table-card">
          <div class="table-header"><h3>Category Analysis</h3></div>
          <div class="empty" *ngIf="categoryData.length === 0">No data for this period</div>
          <table *ngIf="categoryData.length > 0">
            <thead>
              <tr>
                <th>Category</th>
                <th>Transactions</th>
                <th>Amount</th>
                <th>% of Total</th>
                <th>Bar</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of categoryData; let i=index">
                <td>
                  <span class="dot" [style.background]="colors[i % colors.length]"></span>
                  {{ item.category }}
                </td>
                <td>{{ item.count }}</td>
                <td class="amount">₹{{ item.total | number:'1.2-2' }}</td>
                <td>{{ getPercent(item.total) }}%</td>
                <td>
                  <div class="bar-wrap">
                    <div class="bar-fill" [style.width]="getPercent(item.total)+'%'" [style.background]="colors[i % colors.length]"></div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="table-card" *ngIf="viewMode==='yearly'">
          <div class="table-header"><h3>Monthly Breakdown — {{ selectedYear }}</h3></div>
          <table>
            <thead>
              <tr><th>Month</th><th>Transactions</th><th>Amount</th><th>Bar</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let row of monthlyBreakdown">
                <td>{{ row.month }}</td>
                <td>{{ row.count }}</td>
                <td class="amount">₹{{ row.total | number:'1.2-2' }}</td>
                <td>
                  <div class="bar-wrap">
                    <div class="bar-fill" [style.width]="getBarWidth(row.total)+'%'"></div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  `,
  styles: [`
    * { box-sizing: border-box; margin: 0; padding: 0; }
    .page { display: flex; min-height: 100vh; background: #f5f5f0; font-family: sans-serif; }
    .sidebar { width: 220px; background: #1a1a1a; color: #fff; display: flex; flex-direction: column; padding: 24px 0; position: fixed; height: 100vh; }
    .sidebar-logo { display: flex; align-items: center; gap: 10px; padding: 0 20px 28px; }
    .logo-icon { width: 30px; height: 30px; background: #fff; color: #1a1a1a; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; }
    .logo-text { font-size: 15px; font-weight: 600; }
    .sidebar-nav { flex: 1; padding: 0 12px; }
    .nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 6px; color: #aaa; font-size: 14px; cursor: pointer; text-decoration: none; transition: all 0.15s; margin-bottom: 4px; }
    .nav-item:hover, .nav-item.active { background: #2a2a2a; color: #fff; }
    .sidebar-footer { padding: 20px; border-top: 1px solid #2a2a2a; }
    .user-info { display: flex; align-items: center; gap: 10px; }
    .user-avatar { width: 32px; height: 32px; background: #444; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; }
    .user-name { font-size: 13px; color: #fff; font-weight: 500; }
    .logout-btn { background: none; border: none; color: #888; font-size: 12px; cursor: pointer; }
    .main { margin-left: 220px; flex: 1; padding: 32px; }
    .top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .top-bar h1 { font-size: 24px; color: #1a1a1a; font-family: 'Georgia', serif; }
    .subtitle { font-size: 13px; color: #888; margin-top: 4px; }
    .view-toggle { display: flex; background: #fff; border-radius: 6px; padding: 4px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
    .view-toggle button { padding: 8px 20px; border: none; background: none; border-radius: 4px; font-size: 13px; font-weight: 600; cursor: pointer; color: #888; }
    .view-toggle button.active { background: #1a1a1a; color: #fff; }
    .filters-bar { display: flex; gap: 16px; margin-bottom: 24px; background: #fff; padding: 16px 20px; border-radius: 6px; box-shadow: 0 1px 4px rgba(0,0,0,0.05); }
    .filter-group { display: flex; flex-direction: column; gap: 5px; }
    .filter-group label { font-size: 11px; font-weight: 700; color: #888; text-transform: uppercase; }
    .filter-group select { border: 1.5px solid #e0e0e0; border-radius: 4px; padding: 8px 12px; font-size: 13px; outline: none; }
    .summary-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 24px; }
    .card { background: #fff; border-radius: 8px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.05); }
    .card.dark { background: #1a1a1a; color: #fff; }
    .card-icon { font-size: 28px; }
    .card-label { font-size: 11px; color: #888; text-transform: uppercase; margin-bottom: 4px; }
    .card.dark .card-label { color: #aaa; }
    .card-value { font-size: 20px; font-weight: 700; color: #1a1a1a; font-family: 'Georgia', serif; }
    .card-value.sm { font-size: 15px; }
    .card.dark .card-value { color: #fff; }
    .table-card { background: #fff; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.05); margin-bottom: 20px; overflow: hidden; }
    .table-header { padding: 18px 24px; border-bottom: 1px solid #f0f0ee; }
    .table-header h3 { font-size: 15px; font-weight: 700; color: #1a1a1a; }
    .empty { padding: 40px; text-align: center; color: #aaa; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; }
    th { padding: 12px 24px; text-align: left; font-size: 11px; font-weight: 700; color: #888; text-transform: uppercase; background: #fafaf8; border-bottom: 1px solid #f0f0ee; }
    td { padding: 12px 24px; font-size: 14px; color: #333; border-bottom: 1px solid #f8f8f6; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #fafaf8; }
    .amount { font-weight: 700; color: #1a1a1a; }
    .dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 8px; }
    .bar-wrap { background: #f0f0ee; border-radius: 4px; height: 8px; width: 120px; overflow: hidden; }
    .bar-fill { height: 100%; background: #1a1a1a; border-radius: 4px; transition: width 0.6s; }
    @media (max-width: 1024px) { .summary-grid { grid-template-columns: repeat(2,1fr); } }
    @media (max-width: 768px) { .sidebar { display: none; } .main { margin-left: 0; padding: 16px; } }
  `]
})
export class ReportsComponent implements OnInit {
  viewMode: 'monthly' | 'yearly' = 'monthly';
  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();
  months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  years = Array.from({length: 5}, (_, i) => new Date().getFullYear() - i);
  totalSpent = 0;
  totalTransactions = 0;
  avgPerDay = 0;
  topCategory = '-';
  categoryData: { category: string; total: number; count: number }[] = [];
  monthlyBreakdown: { month: string; total: number; count: number }[] = [];
  maxMonthlyTotal = 1;
  userName = '';
  colors = ['#1a1a1a','#555','#888','#2d6a4f','#40916c','#e76f51','#f4a261','#e9c46a','#74c69d','#aaa'];

  constructor(private auth: AuthService, private expenseService: ExpenseService) {}

  ngOnInit() {
    this.userName = this.auth.currentUser()?.name || 'User';
    this.loadData();
  }

  setView(mode: 'monthly' | 'yearly') { this.viewMode = mode; this.loadData(); }

  get selectedMonthName() { return this.months[this.selectedMonth - 1]; }

  loadData() {
    let startDate: string, endDate: string;
    if (this.viewMode === 'monthly') {
      const lastDay = new Date(this.selectedYear, this.selectedMonth, 0).getDate();
      startDate = `${this.selectedYear}-${String(this.selectedMonth).padStart(2,'0')}-01`;
      endDate = `${this.selectedYear}-${String(this.selectedMonth).padStart(2,'0')}-${lastDay}`;
    } else {
      startDate = `${this.selectedYear}-01-01`;
      endDate = `${this.selectedYear}-12-31`;
    }
    this.expenseService.getExpenses({ startDate, endDate }).subscribe(res => {
      this.totalSpent = res.total;
      this.totalTransactions = res.expenses.length;
      const days = this.viewMode === 'monthly' ? new Date(this.selectedYear, this.selectedMonth, 0).getDate() : 365;
      this.avgPerDay = this.totalSpent / days;
      const catMap: Record<string, { total: number; count: number }> = {};
      res.expenses.forEach((e: any) => {
        if (!catMap[e.category]) catMap[e.category] = { total: 0, count: 0 };
        catMap[e.category].total += e.amount;
        catMap[e.category].count++;
      });
      this.categoryData = Object.entries(catMap).map(([category, d]) => ({ category, ...d })).sort((a,b) => b.total - a.total);
      this.topCategory = this.categoryData[0]?.category || '-';
      if (this.viewMode === 'yearly') {
        const monthMap: Record<number, { total: number; count: number }> = {};
        res.expenses.forEach((e: any) => {
          const m = new Date(e.date).getMonth();
          if (!monthMap[m]) monthMap[m] = { total: 0, count: 0 };
          monthMap[m].total += e.amount;
          monthMap[m].count++;
        });
        this.monthlyBreakdown = this.months.map((month, i) => ({ month, total: monthMap[i]?.total || 0, count: monthMap[i]?.count || 0 }));
        this.maxMonthlyTotal = Math.max(...this.monthlyBreakdown.map(m => m.total), 1);
      }
    });
  }

  getPercent(total: number): string {
    if (!this.totalSpent) return '0';
    return ((total / this.totalSpent) * 100).toFixed(1);
  }

  getBarWidth(total: number): number {
    return (total / this.maxMonthlyTotal) * 100;
  }

  logout() { this.auth.logout(); }
}