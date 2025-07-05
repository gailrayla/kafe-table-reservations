import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegionSelector } from './region-selector';

describe('RegionSelector', () => {
  let component: RegionSelector;
  let fixture: ComponentFixture<RegionSelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegionSelector]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegionSelector);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
