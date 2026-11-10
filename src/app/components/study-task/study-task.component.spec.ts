import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudyTaskComponent } from './study-task.component';

describe('StudyTaskComponent', () => {
    let fixture: ComponentFixture<StudyTaskComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({ imports: [StudyTaskComponent] }).compileComponents();
        fixture = TestBed.createComponent(StudyTaskComponent);
        fixture.componentRef.setInput('task', { id: 'task-1', title: 'Estudar Angular', completed: true });
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
