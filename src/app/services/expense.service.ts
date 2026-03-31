import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Expense {
  _id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  note?: string;
}

export interface ExpenseResponse { expenses: Expense[]; total: number; }

export const CATEGORIES = ['All','Food','Transport','Shopping','Bills','Health','Entertainment','Education','Other'];

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private apiUrl = `${environment.apiUrl}/expenses`;

  constructor(private http: HttpClient) {}

  getExpenses(filters: { category?: string; startDate?: string; endDate?: string } = {}) {
    let params = new HttpParams();
    if (filters.category && filters.category !== 'All') params = params.set('category', filters.category);
    if (filters.startDate) params = params.set('startDate', filters.startDate);
    if (filters.endDate) params = params.set('endDate', filters.endDate);
    return this.http.get<ExpenseResponse>(this.apiUrl, { params });
  }

  getExpense(id: string) {
    return this.http.get<Expense>(`${this.apiUrl}/${id}`);
  }

  addExpense(data: Omit<Expense, '_id'>) {
    return this.http.post<Expense>(this.apiUrl, data);
  }

  updateExpense(id: string, data: Partial<Expense>) {
    return this.http.put<Expense>(`${this.apiUrl}/${id}`, data);
  }

  deleteExpense(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getStats() {
    return this.http.get<{ _id: string; total: number; count: number }[]>(`${this.apiUrl}/stats`);
  }
}
