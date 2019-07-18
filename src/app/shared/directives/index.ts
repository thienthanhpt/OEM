import { AsideToggleDirective } from './aside.directive';
import { LoadingDisableDirective, LoadingDisplayDirective } from './loading.directive';
import { NavDropdownDirective, NavDropdownToggleDirective } from './nav-dropdown.directive';
import {
  SidebarToggleDirective, SidebarMinimizeDirective, SidebarOffCanvasCloseDirective, MobileSidebarToggleDirective,
} from './sidebar.directive';


export const SHARED_DIRECTIVES = [
  AsideToggleDirective,
  LoadingDisplayDirective, LoadingDisableDirective,
  NavDropdownDirective, NavDropdownToggleDirective,
  SidebarToggleDirective, SidebarMinimizeDirective, SidebarOffCanvasCloseDirective, MobileSidebarToggleDirective,
];
