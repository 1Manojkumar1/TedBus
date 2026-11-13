import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from './header/header';
import { Left } from './left/left';
import { Right } from './right/right';

@Component({
  selector: 'app-selectbus-page',
  standalone: true,
  imports: [CommonModule, Header, Left, Right],
  templateUrl: './selectbus-page.html',
  styleUrl: './selectbus-page.css',
})
export class SelectbusPage {}
