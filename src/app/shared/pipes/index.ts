import { BooleansPipe, DayPipe, PercentagePipe, SwitchPipe, UppercaseFirstLetterPipe } from './display.pipe';
import { ValuesPipe, ToArrayPipe, SearchPipe } from './object.pipe';
import { IncludesPipe } from './array.pipe';

export const SHARED_PIPES = [
  BooleansPipe, DayPipe, PercentagePipe, SwitchPipe, UppercaseFirstLetterPipe, ValuesPipe, ToArrayPipe, IncludesPipe, SearchPipe,
];
