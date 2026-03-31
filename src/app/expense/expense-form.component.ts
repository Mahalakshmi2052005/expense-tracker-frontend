import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ExpenseService, CATEGORIES } from '../services/expense.service';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="container">
        <div class="back-link">
          <a routerLink="/dashboard">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
            Back to Dashboard
          </a>
        </div>

        <div class="form-card">
          <div class="card-header">
            <div class="header-logo">
              <span class="logo-icon">₹</span>
            </div>
            <h2>{{ isEdit ? 'Edit Expense' : 'Add New Expense' }}</h2>
            <p>{{ isEdit ? 'Update the expense details' : 'Record a new expense entry' }}</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <div class="field">
                <label>Title <span class="req">*</span></label>
                <input type="text" formControlName="title" placeholder="e.g. Grocery shopping" />
                <span class="error" *ngIf="form.get('title')?.touched && form.get('title')?.invalid">Title is required</span>
              </div>
              <div class="field">
                <label>Amount (₹) <span class="req">*</span></label>
                <input type="number" formControlName="amount" placeholder="0.00" min="0" step="0.01" />
                <span class="error" *ngIf="form.get('amount')?.touched && form.get('amount')?.invalid">Valid amount required</span>
              </div>
            </div>

            <div class="form-row">
              <div class="field">
                <label>Category <span class="req">*</span></label>
                <select formControlName="category">
                  <option value="" disabled>Select a category</option>
                  <option *ngFor="let c of categories" [value]="c">{{ c }}</option>
                </select>
                <span class="error" *ngIf="form.get('category')?.touched && form.get('category')?.invalid">Category required</span>
              </div>
              <div class="field">
                <label>Date <span class="req">*</span></label>
                <input type="date" formControlName="date" />
                <span class="error" *ngIf="form.get('date')?.touched && form.get('date')?.invalid">Date required</span>
              </div>
            </div>

            <div class="field full">
              <label>Note <span class="opt">(optional)</span></label>
              <textarea formControlName="note" placeholder="Any additional notes..." rows="3"></textarea>
            </div>

            <div class="category-preview" *ngIf="form.get('category')?.value">
              <span class="preview-icon">{{ getCatIcon(form.get('category')?.value) }}</span>
              <span class="preview-label">{{ form.get('category')?.value }}</span>
            </div>

            <div class="error-msg" *ngIf="error">{{ error }}</div>
            <div class="success-msg" *ngIf="success">{{ success }}</div>

            <div class="form-actions">
              <a routerLink="/dashboard" class="btn-cancel">Cancel</a>
              <button type="submit" [disabled]="loading" class="btn-submit">
                {{ loading ? 'Saving...' : (isEdit ? 'Update Expense' : 'Add Expense') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    * { box-sizing: border-box; margin: 0; padding: 0; }
    .page {
      min-height: 100vh; background: #f5f5f0;
      display: flex; align-items: flex-start; justify-content: center;
      padding: 40px 20px; font-family: sans-serif;
    }
    .container { width: 100%; max-width: 600px; }
    .back-link { margin-bottom: 20px; }
    .back-link a {
      display: inline-flex; align-items: center; gap: 6px;
      color: #666; font-size: 13px; text-decoration: none;
      transition: color 0.15s;
    }
    .back-link a:hover { color: #1a1a1a; }
    .form-card {
      background: #fff; border-radius: 6px;
      box-shadow: 0 2px 20px rgba(0,0,0,0.06); overflow: hidden;
    }
    .card-header {
      padding: 32px 36px 28px; border-bottom: 1px solid #f0f0ee;
      background: #fafaf8;
    }
    .header-logo {
      width: 36px; height: 36px; background: #1a1a1a; color: #fff;
      border-radius: 4px; display: flex; align-items: center;
      justify-content: center; font-size: 16px; font-weight: bold;
      margin-bottom: 14px;
    }
    .logo-icon { font-size: 16px; }
    h2 { font-size: 20px; color: #1a1a1a; font-family: 'Georgia', serif; margin-bottom: 4px; }
    p { font-size: 13px; color: #888; }
    form { padding: 28px 36px 32px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
    .field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
    .field.full { margin-bottom: 16px; }
    label { font-size: 12px; font-weight: 700; color: #444; text-transform: uppercase; letter-spacing: 0.4px; }
    .req { color: #e53e3e; }
    .opt { color: #bbb; font-weight: 400; text-transform: none; }
    input, select, textarea {
      border: 1.5px solid #e8e8e8; border-radius: 4px;
      padding: 10px 14px; font-size: 14px; font-family: sans-serif;
      outline: none; transition: border-color 0.2s;
      background: #fff; color: #1a1a1a; width: 100%;
    }
    input:focus, select:focus, textarea:focus { border-color: #1a1a1a; }
    textarea { resize: vertical; min-height: 80px; }
    .error { font-size: 12px; color: #e53e3e; }
    .category-preview {
      display: inline-flex; align-items: center; gap: 8px;
      background: #f5f5f0; padding: 8px 14px; border-radius: 6px;
      margin-bottom: 20px;
    }
    .preview-icon { font-size: 18px; }
    .preview-label { font-size: 13px; color: #555; font-weight: 500; }
    .error-msg { background: #fff5f5; color: #e53e3e; padding: 10px 14px; border-radius: 4px; font-size: 13px; margin-bottom: 16px; }
    .success-msg { background: #f0fff4; color: #276749; padding: 10px 14px; border-radius: 4px; font-size: 13px; margin-bottom: 16px; }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 8px; }
    .btn-cancel {
      padding: 10px 20px; border: 1.5px solid #e0e0e0;
      border-radius: 4px; color: #666; font-size: 13px; font-weight: 600;
      text-decoration: none; transition: all 0.15s; background: #fff;
    }
    .btn-cancel:hover { border-color: #aaa; color: #333; }
    .btn-submit {
      padding: 10px 24px; background: #1a1a1a; color: #fff;
      border: none; border-radius: 4px; font-size: 13px; font-weight: 600;
      cursor: pointer; transition: background 0.2s; font-family: sans-serif;
    }
    .btn-submit:hover:not(:disabled) { background: #333; }
    .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
    @media (max-width: 500px) {
      .form-row { grid-template-columns: 1fr; }
      form { padding: 20px; }
      .card-header { padding: 24px 20px 20px; }
    }
  `]
})
export class ExpenseFormComponent implements OnInit {
  form: FormGroup;
  categories = CATEGORIES.filter(c => c !== 'All');
  isEdit = false;
  expenseId = '';
  loading = false;
  error = '';
  success = '';

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    const today = new Date().toISOString().split('T')[0];
    this.form = this.fb.group({
      title: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      category: ['', Validators.required],
      date: [today, Validators.required],
      note: ['']
    });
  }

  ngOnInit() {
    this.expenseId = this.route.snapshot.paramMap.get('id') || '';
    if (this.expenseId) {
      this.isEdit = true;
      this.expenseService.getExpense(this.expenseId).subscribe({
        next: (e) => {
          this.form.patchValue({
            title: e.title,
            amount: e.amount,
            category: e.category,
            date: new Date(e.date).toISOString().split('T')[0],
            note: e.note || ''
          });
        },
        error: () => this.router.navigate(['/dashboard'])
      });
    }
  }

  getCatIcon(cat: string): string {
    const icons: Record<string, string> = {
      Food: '🍽️', Transport: '🚗', Shopping: '🛍️',
      Bills: '📄', Health: '💊', Entertainment: '🎬',
      Education: '📚', Other: '📦'
    };
    return icons[cat] || '📦';
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.error = '';
    const data = this.form.value;

    const action = this.isEdit
      ? this.expenseService.updateExpense(this.expenseId, data)
      : this.expenseService.addExpense(data);

    action.subscribe({
      next: () => {
        this.success = this.isEdit ? 'Expense updated!' : 'Expense added!';
        setTimeout(() => this.router.navigate(['/dashboard']), 800);
      },
      error: (err) => {
        this.error = err.error?.message || 'Something went wrong';
        this.loading = false;
      }
    });
  }
}
