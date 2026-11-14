import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './Component/navbar/navbar';
import { Footer } from './Component/footer/footer';
import { ToastContainerComponent } from './Component/toast-container/toast-container.component';
import { ConfirmModalComponent } from './Component/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer, ToastContainerComponent, ConfirmModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
}
