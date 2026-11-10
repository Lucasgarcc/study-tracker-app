import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { TopicDetailPage } from './topic-detail.page';
import { selectAllTopics } from '../../store/topics/topics.selectors';

const topic = { id: '1', title: 'Angular', category: 'Frontend', progress: 75,
  completedTasks: 6, totalTasks: 8, lastStudied: 'Hoje', badgeColor: 'primary' };

describe('TopicDetailPage', () => {
    let fixture: ComponentFixture<TopicDetailPage>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
        imports: [TopicDetailPage],
        providers: [
            provideRouter([]),
            { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } } },
            provideMockStore({ selectors: [{ selector: selectAllTopics, value: [topic] }] })
        ]
        }).compileComponents();
        fixture = TestBed.createComponent(TopicDetailPage);
        fixture.detectChanges();
    });

    it('shows the topic selected by the route', () => {
        expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Angular');
        expect(fixture.nativeElement.textContent).toContain('75%');
    });

    it('shows a message when the topic does not exist', () => {
        const store = TestBed.inject(MockStore);
        store.overrideSelector(selectAllTopics, []);
        store.refreshState();
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('Tópico não encontrado.');
    });
});
