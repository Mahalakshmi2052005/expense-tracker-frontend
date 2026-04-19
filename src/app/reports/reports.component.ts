import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ExpenseService } from '../services/expense.service';

declare var Chart: any;

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
          <div class="card c1"><div class="card-icon">💰</div><div><div class="card-label">Total Spent</div><div class="card-value">₹{{ totalSpent | number:'1.2-2' }}</div></div></div>
          <div class="card c2"><div class="card-icon">📊</div><div><div class="card-label">Transactions</div><div class="card-value">{{ totalTransactions }}</div></div></div>
          <div class="card c3"><div class="card-icon">📈</div><div><div class="card-label">Daily Average</div><div class="card-value">₹{{ avgPerDay | number:'1.2-2' }}</div></div></div>
          <div class="card c4"><div class="card-icon">🏆</div><div><div class="card-label">Top Category</div><div class="card-value sm">{{ topCategory }}</div></div></div>
        </div>

        <div class="charts-row">
          <div class="chart-card">
            <div class="chart-header"><h3>Spending by Category</h3><span class="badge">Pie Chart</span></div>
            <div class="chart-wrap"><canvas #pieChart></canvas></div>
            <div class="legend">
              <div class="legend-item" *ngFor="let item of categoryData; let i=index">
                <span class="ldot" [style.background]="colors[i % colors.length]"></span>
                <span class="lname">{{ item.category }}</span>
                <span class="lval">₹{{ item.total | number:'1.0-0' }}</span>
              </div>
            </div>
          </div>
          <div class="chart-card">
            <div class="chart-header"><h3>{{ viewMode === 'monthly' ? 'Daily Trend' : 'Monthly Trend' }}</h3><span class="badge">Bar Chart</span></div>
            <div class="chart-wrap"><canvas #barChart></canvas></div>
          </div>
        </div>

        <div class="table-card">
          <div class="table-header"><h3>Category Analysis</h3></div>
          <div class="empty" *ngIf="categoryData.length === 0">No data for this period. Add some expenses!</div>
          <table *ngIf="categoryData.length > 0">
            <thead><tr><th>Category</th><th>Transactions</th><th>Amount</th><th>%</th><th>Visual</th></tr></thead>
            <tbody>
              <tr *ngFor="let item of categoryData; let i=index">
                <td><span class="dot" [style.background]="colors[i % colors.length]"></span>{{ item.category }}</td>
                <td>{{ item.count }}</td>
                <td class="amount">₹{{ item.total | number:'1.2-2' }}</td>
                <td><span class="pct-badge" [style.background]="colors[i % colors.length]+'33'" [style.color]="colors[i % colors.length]">{{ getPercent(item.total) }}%</span></td>
                <td><div class="bar-wrap"><div class="bar-fill" [style.width]="getPercent(item.total)+'%'" [style.background]="colors[i % colors.length]"></div></div></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="table-card" *ngIf="viewMode==='yearly'">
          <div class="table-header"><h3>Monthly Breakdown — {{ selectedYear }}</h3></div>
          <table>
            <thead><tr><th>Month</th><th>Transactions</th><th>Amount</th><th>Visual</th></tr></thead>
            <tbody>
              <tr *ngFor="let row of monthlyBreakdown; let i=index">
                <td><span class="dot" [style.background]="colors[i % colors.length]"></span>{{ row.month }}</td>
                <td>{{ row.count }}</td>
                <td class="amount">₹{{ row.total | number:'1.2-2' }}</td>
                <td><div class="bar-wrap"><div class="bar-fill" [style.width]="getBarWidth(row.total)+'%'" [style.background]="colors[i % colors.length]"></div></div></td>
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
    .view-toggle button { padding: 8px 20px; border: none; background: none; border-radius: 4px; font-size: 13px; font-weight: 600; cursor: pointer; color: #888; transition: all 0.2s; }
    .view-toggle button.active { background: #1a1a1a; color: #fff; }
    .filters-bar { display: flex; gap: 16px; margin-bottom: 24px; background: #fff; padding: 16px 20px; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.05); }
    .filter-group { display: flex; flex-direction: column; gap: 5px; }
    .filter-group label { font-size: 11px; font-weight: 700; color: #888; text-transform: uppercase; }
    .filter-group select { border: 1.5px solid #e0e0e0; border-radius: 4px; padding: 8px 12px; font-size: 13px; outline: none; }
    .summary-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 24px; }
    .card { border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.12); transition: transform 0.2s; }
    .card:hover { transform: translateY(-3px); }
    .c1 { background: linear-gradient(135deg, #1a1a1a, #333); }
    .c2 { background: linear-gradient(135deg, #2d6a4f, #40916c); }
    .c3 { background: linear-gradient(135deg, #e76f51, #f4a261); }
    .c4 { background: linear-gradient(135deg, #4361ee, #7209b7); }
    .card-icon { font-size: 30px; }
    .card-label { font-size: 11px; color: rgba(255,255,255,0.75); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .card-value { font-size: 20px; font-weight: 700; color: #fff; font-family: 'Georgia', serif; }
    .card-value.sm { font-size: 15px; }
    .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
    .chart-card { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .chart-header h3 { font-size: 15px; font-weight: 700; color: #1a1a1a; }
    .badge { background: #f0f0ee; color: #666; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .chart-wrap { height: 220px; position: relative; }
    .legend { margin-top: 16px; display: flex; flex-direction: column; gap: 8px; max-height: 130px; overflow-y: auto; }
    .legend-item { display: flex; align-items: center; gap: 8px; font-size: 13px; }
    .ldot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .lname { flex: 1; color: #555; }
    .lval { font-weight: 600; color: #1a1a1a; }
    .table-card { background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin-bottom: 20px; overflow: hidden; }
    .table-header { padding: 18px 24px; border-bottom: 1px solid #f0f0ee; }
    .table-header h3 { font-size: 15px; font-weight: 700; color: #1a1a1a; }
    .empty { padding: 40px; text-align: center; color: #aaa; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; }
    th { padding: 12px 24px; text-align: left; font-size: 11px; font-weight: 700; color: #888; text-transform: uppercase; background: #fafaf8; border-bottom: 1px solid #f0f0ee; }
    td { padding: 12px 24px; font-size: 14px; color: #333; border-bottom: 1px solid #f8f8f6; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #fafaf8; }
    .amount { font-weight: 700; color: #1a1a1a; font-family: 'Georgia', serif; }
    .dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 8px; }
    .pct-badge { padding: 3px 8px; border-radius: 20px; font-size: 12px; font-weight: 700; }
    .bar-wrap { background: #f0f0ee; border-radius: 4px; height: 10px; width: 150px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 4px; transition: width 0.8s ease; }
    @media (max-width: 1024px) { .summary-grid { grid-template-columns: repeat(2,1fr); } .charts-row { grid-template-columns: 1fr; } }
    @media (max-width: 768px) { .sidebar { display: none; } .main { margin-left: 0; padding: 16px; } .summary-grid { grid-template-columns: 1fr 1fr; } }
  `]
})
export class ReportsComponent implements OnInit, AfterViewInit {
  @ViewChild('pieChart') pieChartRef!: ElementRef;
  @ViewChild('barChart') barChartRef!: ElementRef;
  pieChartInstance: any = null;
  barChartInstance: any = null;
  viewMode: 'monthly' | 'yearly' = 'monthly';
  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();
  months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  years = Array.from({length: 5}, (_, i) => new Date().getFullYear() - i);
  totalSpent = 0; totalTransactions = 0; avgPerDay = 0; topCategory = '-';
  categoryData: { category: string; total: number; count: number }[] = [];
  monthlyBreakdown: { month: string; total: number; count: number }[] = [];
  maxMonthlyTotal = 1; userName = '';
  colors = ['#FF6B6B','#4ECDC4','#45B7D1','#96CEB4','#FFEAA7','#DDA0DD','#98D8C8','#F7DC6F','#BB8FCE','#F1948A'];

  constructor(private auth: AuthService, private expenseService: ExpenseService) {}

  ngOnInit() { this.userName = this.auth.currentUser()?.name || 'User'; this.loadChartJs(); }
  ngAfterViewInit() {}

  loadChartJs() {
    if (typeof Chart !== 'undefined') { this.loadData(); return; }
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js';
    s.onload = () => this.loadData();
    document.head.appendChild(s);
  }

  setView(mode: 'monthly' | 'yearly') { this.viewMode = mode; this.loadData(); }

  loadData() {
    let startDate: string, endDate: string;
    if (this.viewMode === 'monthly') {
      const lastDay = new Date(this.selectedYear, this.selectedMonth, 0).getDate();
      startDate = `${this.selectedYear}-${String(this.selectedMonth).padStart(2,'0')}-01`;
      endDate = `${this.selectedYear}-${String(this.selectedMonth).padStart(2,'0')}-${lastDay}`;
    } else { startDate = `${this.selectedYear}-01-01`; endDate = `${this.selectedYear}-12-31`; }

    this.expenseService.getExpenses({ startDate, endDate }).subscribe(res => {
      this.totalSpent = res.total; this.totalTransactions = res.expenses.length;
      const days = this.viewMode === 'monthly' ? new Date(this.selectedYear, this.selectedMonth, 0).getDate() : 365;
      this.avgPerDay = this.totalSpent / days;
      const catMap: Record<string, { total: number; count: number }> = {};
      res.expenses.forEach((e: any) => {
        if (!catMap[e.category]) catMap[e.category] = { total: 0, count: 0 };
        catMap[e.category].total += e.amount; catMap[e.category].count++;
      });
      this.categoryData = Object.entries(catMap).map(([category, d]) => ({ category, ...d })).sort((a,b) => b.total - a.total);
      this.topCategory = this.categoryData[0]?.category || '-';
      if (this.viewMode === 'yearly') {
        const mMap: Record<number, { total: number; count: number }> = {};
        res.expenses.forEach((e: any) => {
          const m = new Date(e.date).getMonth();
          if (!mMap[m]) mMap[m] = { total: 0, count: 0 };
          mMap[m].total += e.amount; mMap[m].count++;
        });
        this.monthlyBreakdown = this.months.map((month, i) => ({ month, total: mMap[i]?.total || 0, count: mMap[i]?.count || 0 }));
        this.maxMonthlyTotal = Math.max(...this.monthlyBreakdown.map(m => m.total), 1);
      }
      setTimeout(() => this.renderCharts(), 200);
    });
  }

  renderCharts() { if (typeof Chart === 'undefined') return; this.renderPie(); this.renderBar(); }

  renderPie() {
    if (!this.pieChartRef) return;
    if (this.pieChartInstance) this.pieChartInstance.destroy();
    this.pieChartInstance = new Chart(this.pieChartRef.nativeElement.getContext('2d'), {
      type: 'doughnut',
      data: { labels: this.categoryData.map(c => c.category), datasets: [{ data: this.categoryData.map(c => c.total), backgroundColor: this.colors, borderWidth: 3, borderColor: '#fff', hoverOffset: 8 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => ` ₹${ctx.raw.toLocaleString('en-IN')}` } } }, cutout: '60%' }
    });
  }

  renderBar() {
    if (!this.barChartRef) return;
    if (this.barChartInstance) this.barChartInstance.destroy();
    let labels: string[], data: number[], bgColors: string[];
    if (this.viewMode === 'yearly') {
      labels = this.months.map(m => m.substring(0,3));
      data = this.monthlyBreakdown.map(m => m.total);
      bgColors = this.colors;
    } else {
      const d = new Date(this.selectedYear, this.selectedMonth, 0).getDate();
      labels = Array.from({length: d}, (_, i) => String(i+1));
      data = Array(d).fill(0);
      bgColors = Array(d).fill(0).map((_, i) => this.colors[i % this.colors.length]);
    }
    this.barChartInstance = new Chart(this.barChartRef.nativeElement.getContext('2d'), {
      type: 'bar',
      data: { labels, datasets: [{ label: '₹', data, backgroundColor: bgColors, borderRadius: 6, borderSkipped: false }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: '#f0f0ee' }, ticks: { callback: (v: any) => `₹${v}` } }, x: { grid: { display: false } } } }
    });
  }

  getPercent(total: number): string { if (!this.totalSpent) return '0'; return ((total / this.totalSpent) * 100).toFixed(1); }
  getBarWidth(total: number): number { return (total / this.maxMonthlyTotal) * 100; }
  logout() { this.auth.logout(); }
}