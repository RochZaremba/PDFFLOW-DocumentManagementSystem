import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageTags } from './manage-tags';

describe('ManageTags', () => {
  let component: ManageTags;
  let fixture: ComponentFixture<ManageTags>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageTags]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageTags);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
