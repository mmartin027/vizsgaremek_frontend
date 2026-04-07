import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtensionSuccessComponent } from './extension-success.component';

describe('ExtensionSuccessComponent', () => {
  let component: ExtensionSuccessComponent;
  let fixture: ComponentFixture<ExtensionSuccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExtensionSuccessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExtensionSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
