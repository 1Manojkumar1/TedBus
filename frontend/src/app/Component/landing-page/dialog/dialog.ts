import { Component, OnInit, inject } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface BusRoute {
  position: number;
  from: string;
  to: string;
  nobus: number;
}

@Component({
  selector: 'app-dialog',
  imports: [MatTableModule, MatSortModule, MatPaginatorModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './dialog.html',
  styleUrl: './dialog.css'
})
export class DialogComponent implements OnInit {
  to: string = '';
  position: number = 0;
  from: string = '';
  nobus: number = 0;
  dataSource: BusRoute[] = Element_data;
  displayedColumns: string[] = ['position', 'from', 'to', 'nobus'];

  private dialogData = inject(MAT_DIALOG_DATA, { optional: true });

  ngOnInit() {
    if (this.dialogData) {
      const { from, to } = this.dialogData;
      if (from || to) {
        this.dataSource = Element_data.filter(route => {
          const matchFrom = !from || route.from.toLowerCase().includes(from.toLowerCase());
          const matchTo = !to || route.to.toLowerCase().includes(to.toLowerCase());
          return matchFrom && matchTo;
        });
      }
    }
  }
}
const Element_data: BusRoute[] = [
  {
    position: 1, from: 'Delhi', to: 'Jaipur', nobus: 2
  },
  {
    position: 2, from: 'Mumbai', to: 'Goa', nobus: 2
  },
  {
    position: 3, from: 'Bangalore', to: 'Mysore', nobus: 2
  },
  {
    position: 4, from: 'Kolkata', to: 'Darjeeling', nobus: 2
  },
  {
    position: 5, from: 'Chennai', to: 'Pondicherry', nobus: 2
  }
]
