import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReservationSummary } from './reservation-summary';
import { ReservationFormData } from '../../../../core';

describe('ReservationSummary', () => {
  let component: ReservationSummary;
  let fixture: ComponentFixture<ReservationSummary>;

  const mockReservationData: ReservationFormData = {
    date: '2024-01-15',
    timeSlot: '19:00',
    partySize: 2,
    hasChildren: false,
    needsSmoking: false,
    regionId: 'main-hall', // Using RegionType.MAIN_HALL
    name: 'Test User',
    email: 'test@example.com',
    phone: '123-456-7890',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservationSummary],
    }).compileComponents();

    fixture = TestBed.createComponent(ReservationSummary);
    component = fixture.componentInstance;

    // Set the required input
    component.reservationData = mockReservationData;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set selectedRegion on init', () => {
    expect(component.selectedRegion).toBeTruthy();
    expect(component.selectedRegion?.id).toBe('main-hall');
  });

  it('should format date correctly', () => {
    const formatted = component.formatDate('2024-01-15');
    expect(formatted).toContain('2024');
    expect(formatted).toContain('January');
  });

  it('should format time correctly', () => {
    const formatted = component.formatTime('19:00');
    expect(formatted).toBe('7:00 PM');
  });

  it('should get party description', () => {
    const description = component.getPartyDescription();
    expect(description).toBe('2 guests');
  });

  it('should emit confirmed event', () => {
    spyOn(component.confirmed, 'emit');
    component.onConfirm();
    expect(component.confirmed.emit).toHaveBeenCalled();
  });

  it('should emit edit requested event', () => {
    spyOn(component.editRequested, 'emit');
    component.onEdit();
    expect(component.editRequested.emit).toHaveBeenCalled();
  });
});
