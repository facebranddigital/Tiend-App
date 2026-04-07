import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface EmailResponse {
  success: boolean;
  message: string;
  emailId?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private http = inject(HttpClient);

  sendWelcomeEmail(data: RegisterData): Observable<EmailResponse> {
    return this.http.post<EmailResponse>('/api/send-welcome-email', data);
  }
}
