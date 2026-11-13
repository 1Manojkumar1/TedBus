import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Customer {
  _id: string;
  name: string;
  email: string;
  googleId?: string;
  profilePicture?: string;
  phoneNumber?: string;
  gender?: string;
  dateOfBirth?: string;
}

export interface GoogleProfile {
  name: string;
  email: string;
  googleId?: string;
  picture?: string;
}

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly http = inject(HttpClient);
  private readonly apiurl = `${environment.apiUrl}/customers`;

  addcustomermongo(profile: GoogleProfile): Observable<Customer> {
    return this.http.post<Customer>(this.apiurl, profile);
  }

  getcustomer(id: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiurl}/${id}`);
  }
}
