import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmedAccountsComponent } from './confirmed-accounts.component';

describe('ConfirmedAccountsComponent', () => {
  let component: ConfirmedAccountsComponent;
  let fixture: ComponentFixture<ConfirmedAccountsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmedAccountsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmedAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
