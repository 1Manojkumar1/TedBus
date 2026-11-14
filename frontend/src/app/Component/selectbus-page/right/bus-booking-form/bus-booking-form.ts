import { Component, Input, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataserviceService } from '../../../../service/dataservice.service';
import { AuthService } from '../../../../service/auth.service';

@Component({
  selector: 'app-bus-booking-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bus-booking-form.html',
  styleUrl: './bus-booking-form.css'
})
export class BusBookingFormComponent implements OnInit {
  @Input() selectedseat: number[] = [];
  @Input() seatprice: number = 0;
  @Input() routedetails: any;
  @Input() busid: string = '';
  @Input() busarrivaltime: number = 0;
  @Input() busdeparturetime: number = 0;
  @Input() operatorname: string = '';
  @Input() boardingpoint: string = '';
  @Input() droppingpoint: string = '';
  @Input() boardingtime: string = '';
  @Input() droppingtime: string = '';

  private readonly router = inject(Router);
  private readonly dataservice = inject(DataserviceService);
  private readonly auth = inject(AuthService);

  passdetails: { name: string; age: string; gender: string }[] = [];
  passemail: string = '';
  passphn: string = '';
  passisbuisness: boolean = false;
  passinsurance: boolean = false;
  sendupdates: boolean = false;
  passiscovid: boolean = false;
  formerror: string = '';

  ngOnInit(): void {
    const user = this.auth.user();
    this.passemail = user?.email ?? '';
    this.passphn = user?.phoneNumber ?? '';
  }

  handlePassGender(event: Event, index: number): void {
    const target = event.target as HTMLInputElement;
    this.ensurepassenger(index);
    this.passdetails[index].gender = target.value;
  }

  handlePassName(event: Event, index: number): void {
    const target = event.target as HTMLInputElement;
    this.ensurepassenger(index);
    this.passdetails[index].name = target.value;
  }

  handlePassAge(event: Event, index: number): void {
    const target = event.target as HTMLInputElement;
    this.ensurepassenger(index);
    this.passdetails[index].age = target.value;
  }

  handleproceedtopay(): void {
    if (!this.selectedseat.length) {
      this.formerror = 'Select at least one seat before continuing.';
      return;
    }

    if (!this.auth.isloggedin()) {
      this.formerror = 'Sign in with Google to book this bus.';
      return;
    }

    if (!this.passemail.includes('@')) {
      this.formerror = 'Enter a valid email address.';
      return;
    }

    // `passphn` can hold a number when bound to a numeric input, so coerce it
    // before treating it as text.
    const phone = String(this.passphn ?? '').replace(/\D/g, '');

    if (phone.length !== 10) {
      this.formerror = 'Enter a valid 10 digit phone number.';
      return;
    }

    const passengers = this.selectedseat.map((_, index) => this.passdetails[index]);

    if (
      passengers.some(
        (passenger) => !passenger?.name?.trim() || !passenger?.gender || !Number(passenger?.age)
      )
    ) {
      this.formerror = 'Enter the name, gender and age for every passenger.';
      return;
    }

    this.formerror = '';

    const routeParams = {
      operatorname: this.operatorname,
      selectedseat: this.selectedseat,
      passemail: this.passemail,
      passphn: phone,
      passiscoviddonate: this.passiscovid,
      passisbuisness: this.passisbuisness,
      passinsurance: this.passinsurance,
      seatprice: this.seatprice,
      busid: this.busid,
      busarrivaltime: this.busarrivaltime,
      busdeparturetime: this.busdeparturetime,
      boardingpoint: this.boardingpoint || this.routedetails?.departureLocation?.name || '',
      droppingpoint: this.droppingpoint || this.routedetails?.arrivalLocation?.name || ''
    };

    this.dataservice.passobj(passengers);
    this.dataservice.sendobj(this.routedetails);
    this.router.navigate(['/payment'], { queryParams: routeParams });
  }

  private ensurepassenger(index: number): void {
    if (!this.passdetails[index]) {
      this.passdetails[index] = { name: '', age: '', gender: '' };
    }
  }
}
