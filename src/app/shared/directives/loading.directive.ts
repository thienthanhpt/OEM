import { Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';

/**
 * Allow to display block loading when loadingDisplay is true and hide loading when loadingDisplay is false
 */
@Directive({
  selector: '[loadingDisplay]'
})
export class LoadingDisplayDirective implements OnChanges {

  @Input() loadingDisplay: boolean;

  constructor(
    private el: ElementRef
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    const { loadingDisplay } = changes;
    const el = this.el.nativeElement;

    if (loadingDisplay) {
      if (!el.classList.contains('block-loading')) {
        el.classList.add('block-loading');
      }

      loadingDisplay.currentValue
        ? el.classList.add('is-loading')
        : el.classList.remove('block-loading');
    }
  }
}

/**
 * Allow to display icon spinner in the button
 */
@Directive({
  selector: 'button[loadingDisable]'
})
export class LoadingDisableDirective implements OnChanges {

  @Input() loadingDisable: boolean;
  @Input() displaySpinner = false;

  constructor(
    private el: ElementRef
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    const { loadingDisable } = changes;
    const el = this.el.nativeElement;

    if (loadingDisable && !loadingDisable.firstChange) {
      el.disabled = loadingDisable.currentValue;
      if (this.displaySpinner) {
        el.innerHTML = loadingDisable.currentValue
          ? `${el.textContent.trim()} <i class="fas fa-spinner fa-spin"></i>`
          : `${el.textContent.trim()}`;
      }
    }
  }
}
