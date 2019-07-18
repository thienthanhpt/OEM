import { Component } from '@angular/core';

import { DdaFileType } from '@app/core';

@Component({
  selector: 'admin-dda-setup',
  templateUrl: './dda-setup.component.html',
})
export class DdaSetupComponent {
  ddaType = DdaFileType;
}
