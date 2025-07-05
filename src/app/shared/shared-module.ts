import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatePicker } from './components/date-picker/date-picker';
import { FormField } from './components/form-field/form-field';
import { LoadingSpinner } from './components/loading-spinner/loading-spinner';
import { RegionSelector } from './components/region-selector/region-selector';
import { TimeSlotSelector } from './components/time-slot-selector/time-slot-selector';

@NgModule({
  declarations: [],
  imports: [
    DatePicker,
    FormField,
    LoadingSpinner,
    RegionSelector,
    TimeSlotSelector,
    CommonModule,
  ],
})
export class SharedModule {}
