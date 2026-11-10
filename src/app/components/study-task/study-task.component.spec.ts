import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudyTaskComponent } from './study-task.component';
import { provideMockStore } from '@ngrx/store/testing';

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
                                text: '',
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
        expect(fixture.nativeElement.querySelector('ion-item ion-label').textContent).toContain('Estudar Angular');
        expect(fixture.nativeElement.querySelector('ion-checkbox').checked).toBeTrue();
    });
});
