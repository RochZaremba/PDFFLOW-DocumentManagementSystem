import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingPdfs } from './pending-pdfs';

describe('PendingPdfs', () => {
  let component: PendingPdfs;
  let fixture: ComponentFixture<PendingPdfs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingPdfs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendingPdfs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
