import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataserviceService {
  private datasource = new BehaviorSubject<any>(null);
  currentdata = this.datasource.asObservable();

  private passdetails = new BehaviorSubject<any>(null);
  passdata = this.passdetails.asObservable();

  private searchdatesource = new BehaviorSubject<string>('');
  searchdate = this.searchdatesource.asObservable();

  sendobj(obj: any) {
    this.datasource.next(obj);
  }

  passobj(obj: any) {
    this.passdetails.next(obj);
  }

  setsearchdate(date: string) {
    this.searchdatesource.next(date);
  }

  getsearchdate(): string {
    return this.searchdatesource.value;
  }
}
