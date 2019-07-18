import { Component } from '@angular/core';

@Component({
  selector: 'admin-auth',
  templateUrl: './auth.component.html'
})
export class AuthComponent {
  currentYear: number = new Date().getFullYear();
}
