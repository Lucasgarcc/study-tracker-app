import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudyTaskComponent } from './study-task.component';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { TasksActions } from '../../store/tasks/tasks.actions';

describe('StudyTaskComponent', () => {

    let fixture: ComponentFixture<StudyTaskComponent>;
    
    beforeEach(async () => {
        await TestBed.configureTestingModule({ 
            imports: [StudyTaskComponent],
            providers: [
                provideMockStore({
                    initialState: {
                        tasks: {
                            tasks: [{
                                id: 'task-1',
                                topicID: 'topic-1',
                                title: 'Estudar Angular',
                                description: '',
                                completed: true,
                                position: 0
                            }],
                            loading: false,
                            error: null
                        }
                    }
                })
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(StudyTaskComponent);
        fixture.componentRef.setInput('topicID', 'topic-1');
        fixture.detectChanges();
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(fixture.componentInstance).toBeTruthy();
    });

    it('renders the received task and completion state', () => {
        expect(fixture.nativeElement.querySelector('.task-title').value).toBe('Estudar Angular');
        expect(fixture.nativeElement.querySelector('ion-checkbox').checked).toBeTrue();
    });

    it('starts editing at the title and closes the action controls', () => {
        fixture.nativeElement.querySelector('.task-actions-toggle').click();
        fixture.detectChanges();
        fixture.nativeElement.querySelector('[title="Editar tarefa"]').click();
        fixture.detectChanges();

        expect(document.activeElement).toBe(fixture.nativeElement.querySelector('.task-title'));
        expect(fixture.nativeElement.querySelector('.task-actions-toggle').getAttribute('aria-expanded')).toBe('false');
    });

    it('keeps changes as a draft between fields and updates both fields once on leaving', () => {
        const dispatch = spyOn(TestBed.inject(MockStore), 'dispatch');
        const title: HTMLInputElement = fixture.nativeElement.querySelector('.task-title');
        const description: HTMLTextAreaElement = fixture.nativeElement.querySelector('.task-description');
        title.focus();
        title.value = '  Angular e RxJS  ';
        title.dispatchEvent(new Event('input', { bubbles: true }));
        description.focus();
        expect(dispatch).not.toHaveBeenCalled();

        description.value = 'Praticar effects';
        description.dispatchEvent(new Event('input', { bubbles: true }));
        description.blur();
        fixture.detectChanges();

        expect(dispatch).toHaveBeenCalledOnceWith(TasksActions.updateTask({ task: {
            id: 'task-1', topicID: 'topic-1', title: 'Angular e RxJS',
            description: 'Praticar effects', completed: true, position: 0
        } }));
    });

    it('does not dispatch an unchanged edit', () => {
        const dispatch = spyOn(TestBed.inject(MockStore), 'dispatch');
        const title: HTMLInputElement = fixture.nativeElement.querySelector('.task-title');
        title.focus();
        title.blur();

        expect(dispatch).not.toHaveBeenCalled();
    });

    it('preserves the draft and shows an error instead of saving a blank title', () => {
        const dispatch = spyOn(TestBed.inject(MockStore), 'dispatch');
        const title: HTMLInputElement = fixture.nativeElement.querySelector('.task-title');
        title.focus();
        title.value = '   ';
        title.dispatchEvent(new Event('input', { bubbles: true }));
        title.blur();
        fixture.detectChanges();

        expect(dispatch).not.toHaveBeenCalled();
        expect(title.value).toBe('   ');
        expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('Informe um título');
    });
});
