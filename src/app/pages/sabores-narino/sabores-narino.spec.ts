import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaboresNarino } from './sabores-narino';

describe('SaboresNarino', () => {
  let component: SaboresNarino;
  let fixture: ComponentFixture<SaboresNarino>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaboresNarino],
    }).compileComponents();

    fixture = TestBed.createComponent(SaboresNarino);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
