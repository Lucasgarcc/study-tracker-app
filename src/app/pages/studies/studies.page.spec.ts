import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { StudiesPage } from './studies.page';
import { selectAllTopics } from '../../store/topics/topics.selectors';
import { TopicsActions } from '../../store/topics/topics.actions';

const topic = { id: '1', title: 'Angular', category: 'Frontend', progress: 0,
  completedTasks: 0, totalTasks: 0, lastStudied: 'Hoje', badgeColor: 'primary' };

describe('StudiesPage', () => {
  let fixture: ComponentFixture<StudiesPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
        teardown: {
            destroyAfterEach: true
        },
        imports: [StudiesPage],
        providers: [provideRouter([]), provideMockStore({
            selectors: [{ selector: selectAllTopics, value: [topic] }]
        })]
    }).compileComponents();
    fixture = TestBed.createComponent(StudiesPage);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('deletes a topic without opening its details', () => {
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    const dispatch = spyOn(TestBed.inject(MockStore), 'dispatch');
    fixture.nativeElement.querySelector('.topic-card ion-button').click();
    expect(dispatch).toHaveBeenCalledWith(TopicsActions.deleteTopic({ id: topic.id }));
    expect(navigate).not.toHaveBeenCalled();
  });
});
