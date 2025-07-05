import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeSlotSelector } from './time-slot-selector';

describe('TimeSlotSelector', () => {
  let component: TimeSlotSelector;
  let fixture: ComponentFixture<TimeSlotSelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeSlotSelector]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimeSlotSelector);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
