import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationConfirmation } from './reservation-confirmation';

describe('ReservationConfirmation', () => {
  let component: ReservationConfirmation;
  let fixture: ComponentFixture<ReservationConfirmation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservationConfirmation],
    }).compileComponents();

    fixture = TestBed.createComponent(ReservationConfirmation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
