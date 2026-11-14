import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { DataserviceService } from '../../service/dataservice.service';
import { BusService } from '../../service/bus.service';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-payment-page',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './payment-page.html',
  styleUrl: './payment-page.css',
})
export class PaymentPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dataservice = inject(DataserviceService);
  private readonly busservice = inject(BusService);
  readonly auth = inject(AuthService);

  passseatarray: number[] = [];
  seatprice: number = 0;
  routedetails: any = null;
  busdepauturetime: number = 0;
  busarrivaltime: number = 0;
  operatorname: string = '';
  passengerdetails: any[] = [];
  email: string = '';
  busid: string = '';
  phonenumber: string = '';
  isbuisnesstravel: boolean = false;
  isinsurance: boolean = false;
  iscoviddonated: boolean = false;
  traveldate: string = new Date().toISOString().slice(0, 10);
  boardingpoint: string = '';
  droppingpoint: string = '';

  readonly errormessage = signal('');
  readonly posting = signal(false);
  readonly paymentmode = signal('mock');

  get totalfare(): number {
    return this.seatprice * this.passseatarray.length;
  }

  ngOnInit(): void {
    this.traveldate = this.dataservice.getsearchdate() || new Date().toISOString().slice(0, 10);

    this.route.queryParams.subscribe((params) => {
      const seats = params['selectedseat'];
      this.passseatarray = (Array.isArray(seats) ? seats : seats ? [seats] : [])
        .map((seat: unknown) => Number(seat))
        .filter((seat: number) => Number.isFinite(seat) && seat > 0);

      this.email = params['passemail'] ?? this.auth.user()?.email ?? '';
      this.phonenumber = String(params['passphn'] ?? '');
      this.isbuisnesstravel = params['passisbuisness'] === 'true' || params['passisbuisness'] === true;
      this.isinsurance = params['passinsurance'] === 'true' || params['passinsurance'] === true;
      this.iscoviddonated = params['passiscoviddonate'] === 'true' || params['passiscoviddonate'] === true;
      this.operatorname = params['operatorname'] ?? '';
      this.seatprice = Number(params['seatprice']) || 0;
      this.busid = params['busid'] ?? '';
      this.busarrivaltime = Number(params['busarrivaltime']) || 0;
      this.busdepauturetime = Number(params['busdeparturetime']) || 0;
      this.boardingpoint = params['boardingpoint'] ?? '';
      this.droppingpoint = params['droppingpoint'] ?? '';

      if (!this.passseatarray.length) {
        this.errormessage.set('No seats were selected. Please search again and pick your seats.');
      }
    });

    this.dataservice.currentdata.subscribe((data) => {
      this.routedetails = data;
    });

    this.dataservice.passdata.subscribe((data) => {
      this.passengerdetails = Array.isArray(data) ? data : [];
    });

    this.busservice.getpaymentconfig().subscribe({
      next: (config) => this.paymentmode.set(config.mode ?? 'mock'),
      error: () => this.paymentmode.set('mock'),
    });
  }

  formattime(value: number): string {
    const hours = Math.floor(value) % 24;
    const minutes = Math.round((value - Math.floor(value)) * 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  backtobus(): void {
    this.router.navigate(['/selectbus'], {
      queryParams: {
        from: this.routedetails?.departureLocation?.name,
        to: this.routedetails?.arrivalLocation?.name,
        date: this.traveldate,
      },
    });
  }

  makepayment(): void {
    if (this.posting()) {
      return;
    }

    const user = this.auth.user();
    if (!user) {
      this.errormessage.set('Please sign in with Google before paying for this booking.');
      return;
    }

    if (!user._id) {
      this.errormessage.set(
        'Your account is not linked to the booking service yet. Make sure the Tedbus API is running, then sign in again.'
      );
      return;
    }

    if (!this.passseatarray.length || !this.busid || !this.routedetails) {
      this.errormessage.set('Booking details are missing. Please search for your bus again.');
      return;
    }

    if (!this.email.includes('@') || this.phonenumber.replace(/\D/g, '').length < 10) {
      this.errormessage.set('Enter a valid email address and a 10 digit phone number.');
      return;
    }

    const passengers = this.passengerdetails.map((passenger) => ({
      name: String(passenger?.name ?? '').trim(),
      gender: String(passenger?.gender ?? ''),
      age: Number(passenger?.age),
    }));

    if (
      passengers.length !== this.passseatarray.length ||
      passengers.some((passenger) => !passenger.name || !passenger.gender || !passenger.age)
    ) {
      this.errormessage.set('Please fill in the name, gender and age for every passenger.');
      return;
    }

    if (this.seatprice <= 0) {
      this.errormessage.set('The fare for this bus could not be calculated. Please search again.');
      return;
    }

    const now = new Date();
    const booking = {
      customerId: user._id,
      passengerDetails: passengers,
      email: this.email,
      phoneNumber: this.phonenumber,
      fare: this.totalfare,
      status: 'upcoming',
      busId: this.busid,
      bookingDate: now.toISOString().slice(0, 10),
      seats: this.passseatarray,
      departureDetails: {
        city: this.routedetails.departureLocation.name,
        location: this.boardingpoint || this.routedetails.departureLocation.name,
        time: this.busdepauturetime,
        date: this.traveldate,
      },
      arrivalDetails: {
        city: this.routedetails.arrivalLocation.name,
        location: this.droppingpoint || this.routedetails.arrivalLocation.name,
        time: this.busarrivaltime,
        date: this.traveldate,
      },
      boardingPoint: this.boardingpoint || this.routedetails.departureLocation.name,
      droppingPoint: this.droppingpoint || this.routedetails.arrivalLocation.name,
      duration: String(this.routedetails.duration),
      isBusinessTravel: this.isbuisnesstravel,
      isInsurance: this.isinsurance,
      isCovidDonated: this.iscoviddonated,
    };

    this.errormessage.set('');
    this.posting.set(true);

    if (this.paymentmode() === 'stripe') {
      this.busservice.createcheckout(booking).subscribe({
        next: (result) => {
          this.posting.set(false);
          if (result.checkoutUrl) {
            window.location.href = result.checkoutUrl;
            return;
          }
          this.router.navigate(['/profile']);
        },
        error: (error) => {
          console.error('Checkout failed', error);
          this.posting.set(false);
          this.errormessage.set(
            error?.error?.error ?? 'We could not start the payment. Please try again.'
          );
        },
      });
      return;
    }

    this.busservice.addbusmongo(booking).subscribe({
      next: () => {
        this.posting.set(false);
        this.router.navigate(['/profile']);
      },
      error: (error) => {
        console.error('Booking failed', error);
        this.posting.set(false);
        this.errormessage.set(
          error?.error?.error ?? 'We could not confirm your booking. Please try again.'
        );
      },
    });
  }
}
