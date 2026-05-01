import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminFinanzasComponent } from './admin-finanzas'; // <-- Nombre corregido

describe('AdminFinanzasComponent', () => {
  let component: AdminFinanzasComponent;
  let fixture: ComponentFixture<AdminFinanzasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminFinanzasComponent], // <-- Nombre corregido
    }).compileComponents();

    fixture = TestBed.createComponent(AdminFinanzasComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
