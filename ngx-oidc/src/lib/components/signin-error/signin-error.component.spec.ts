import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SigninErrorComponent } from './signin-error.component';

describe('SigninErrorComponent', () => {
  let component: SigninErrorComponent;
  let fixture: ComponentFixture<SigninErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SigninErrorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SigninErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
