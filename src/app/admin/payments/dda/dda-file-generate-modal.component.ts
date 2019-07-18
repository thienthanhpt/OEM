import { Component } from '@angular/core';

import { BsModalRef } from 'ngx-bootstrap';

@Component({
  selector: 'dda-generate',
  templateUrl: './dda-file-generate-modal.component.html',
})
export class DdaFileGenerateModalComponent {

  onComplete: (success: boolean) => { };
  generateClicked = 0;
  loading = false;

  constructor(
    public modal: BsModalRef,
  ) { }

  onGenerateClick = () => {
    this.generateClicked += 1;
  }
}
