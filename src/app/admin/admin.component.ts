import { Component, Inject, HostListener } from '@angular/core';

import { DOCUMENT } from '@angular/platform-browser';

import { AuthService } from '@app/core';

/**
 * This class represents the lazy loaded AdminComponent.
 */
@Component({
  selector: 'sd-admin',
  templateUrl: 'admin.component.html',
})
export class AdminComponent {
  disabled = false;
  navIsFixed = false;
  currentYear: number = new Date().getFullYear();

  profile: { [name: string]: any };

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private  authService: AuthService,
  ) {
    this.profile = this.authService.authToken;
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop > 200) {
      this.navIsFixed = true;
    } else if (this.navIsFixed && window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop < 200) {
      this.navIsFixed = false;
    }
  }
  scrollToTop() {(
    function smoothScroll() {
      const currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
      if (currentScroll > 0) {
        window.requestAnimationFrame(smoothScroll);
        window.scrollTo(0, currentScroll - (currentScroll / 5));
      }
    })();
  }

  logout = () => {
    this.authService.logout();
    this.authService.goToLoginPage();
  }
}
