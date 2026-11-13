
import { Component, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule, MatDrawer } from '@angular/material/sidenav';
import { BusBookingFormComponent } from '../bus-booking-form/bus-booking-form';

@Component({
  selector: 'app-form-drawer',
  standalone: true,
  imports: [CommonModule, MatSidenavModule, BusBookingFormComponent],
  templateUrl: './form-drawer.html',
  styleUrl: './form-drawer.css'
})
export class FormDrawerComponent {
  @Input() selectedseat:number[]=[]
  @Input() seatprice:number=0;
  @Input() routedetails: any;
  @Input() busid:string=''
  @Input() busarrivaltime: number =0;
  @Input() busdeparturetime:number=0;
  @Input() operatorname:string=''
  formdrawerstate:boolean=false;
  sidenavopened=false;

  @ViewChild('drawer') drawer!: MatDrawer;

  toogledrawer(open:boolean):void{
    this.formdrawerstate=open
  }
}

