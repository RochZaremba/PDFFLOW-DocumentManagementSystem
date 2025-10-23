import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfList } from './pdf-list';

describe('PdfList', () => {
  let component: PdfList;
  let fixture: ComponentFixture<PdfList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdfList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PdfList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
