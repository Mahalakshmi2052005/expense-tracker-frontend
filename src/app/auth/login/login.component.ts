import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo">
          <span class="logo-icon">₹</span>
          <h1>ExpenseTracker</h1>
        </div>
        <h2>Welcome back</h2>
        <p class="subtitle">Sign in to your account</p>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="field">
            <label>Email</label>
            <input type="email" formControlName="email" placeholder="you@email.com" />
            <span class="error" *ngIf="form.get('email')?.touched && form.get('email')?.invalid">Valid email required</span>
          </div>
          <div class="field">
            <label>Password</label>
            <input type="password" formControlName="password" placeholder="••••••••" />
            <span class="error" *ngIf="form.get('password')?.touched && form.get('password')?.invalid">Password required</span>
          </div>

          <div class="error-msg" *ngIf="error">{{ error }}</div>

          <button type="submit" [disabled]="loading" class="btn-primary">
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <p class="switch-link">Don't have an account? <a routerLink="/register">Register</a></p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      background: #f5f5f0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Georgia', serif;
    }
    .auth-card {
      background: #fff;
      border-radius: 4px;
      padding: 48px;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 2px 20px rgba(0,0,0,0.06);
    }
    .auth-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 32px;
    }
    .logo-icon {
      width: 36px;
      height: 36px;
      background: #1a1a1a;
      color: #fff;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      font-weight: bold;
    }
    .auth-logo h1 { font-size: 18px; color: #1a1a1a; margin: 0; font-weight: 600; }
    h2 { font-size: 24px; color: #1a1a1a; margin: 0 0 4px; }
    .subtitle { color: #888; font-size: 14px; margin: 0 0 28px; font-family: sans-serif; }
    .field { margin-bottom: 18px; }
    label { display: block; font-size: 13px; font-weight: 600; color: #333; margin-bottom: 6px; font-family: sans-serif; }
    input {
      width: 100%;
      padding: 10px 14px;
      border: 1.5px solid #e0e0e0;
      border-radius: 4px;
      font-size: 14px;
      font-family: sans-serif;
      outline: none;
      transition: border-color 0.2s;
      box-sizing: border-box;
    }
    input:focus { border-color: #1a1a1a; }
    .error { font-size: 12px; color: #e53e3e; font-family: sans-serif; margin-top: 4px; display: block; }
    .error-msg { background: #fff5f5; color: #e53e3e; padding: 10px; border-radius: 4px; font-size: 13px; margin-bottom: 16px; font-family: sans-serif; }
    .btn-primary {
      width: 100%;
      padding: 12px;
      background: #1a1a1a;
      color: #fff;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      font-family: sans-serif;
      transition: background 0.2s;
      margin-top: 8px;
    }
    .btn-primary:hover:not(:disabled) { background: #333; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .switch-link { text-align: center; font-size: 14px; color: #888; margin-top: 20px; font-family: sans-serif; }
    .switch-link a { color: #1a1a1a; font-weight: 600; text-decoration: none; }
  `]
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  error = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.error = '';
    this.auth.login(this.form.value).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.error = err.error?.message || 'Login failed';
        this.loading = false;
      }
    });
  }
}
