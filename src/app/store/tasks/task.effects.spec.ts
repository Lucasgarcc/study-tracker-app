import { TestBed } from '@angular/core/testing';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { firstValueFrom, Subject } from 'rxjs';
import { Topics } from '../../services/topics';
import { StudyTask } from '../models/study-task.model';
import { Topic } from '../models/topic.model';
import { TopicsActions } from '../topics/topics.actions';
import { topicsReducer } from '../topics/topics.reducer';
import { selectTopicById } from '../topics/topics.selectors';
import { TaskEffects } from './task.effects';
import { TasksActions } from './tasks.actions';
import { TasksReducers } from './tasks.reducer';
import { selectTaskByTopicId, selectTaskState } from './tasks.selectors';

describe('Task persistence', () => {
    let store: Store;
    let service: jasmine.SpyObj<Topics>;
    let responses: Subject<Topic>[];
    const task = (id: string, position: number): StudyTask => ({
        id, topicID: 'topic-1', title: id, text: '', completed: false, position
    });
    const existingTask = task('existing', 0);
    const topic: Topic = {
        id: 'topic-1', title: 'TypeScript', category: '', progress: 0,
        completedTasks: 0, totalTasks: 1, lastStudied: '', badgeColor: '',
        tasks: [existingTask]
    };

    beforeEach(() => {
        responses = [];
        service = jasmine.createSpyObj<Topics>('Topics', ['updateTopic']);
        service.updateTopic.and.callFake(() => {
            const response = new Subject<Topic>();
            responses.push(response);
            return response;
        });
        TestBed.configureTestingModule({
            imports: [
                StoreModule.forRoot({ topics: topicsReducer, tasks: TasksReducers }),
                EffectsModule.forRoot([TaskEffects])
            ],
            providers: [{ provide: Topics, useValue: service }]
        });
        store = TestBed.inject(Store);
        store.dispatch(TopicsActions.loadTopicsSuccess({ topics: [topic] }));
    });

    it('loads persisted tasks into the list used by the UI', async () => {
        expect(await firstValueFrom(store.select(selectTaskByTopicId(topic.id))))
            .toEqual([existingTask]);
    });

    it('shows additions immediately and preserves both rapid additions in the API and topic state', async () => {
        const first = task('first', 1);
        const second = task('second', 2);
        store.dispatch(TasksActions.addTask({ task: first }));
        store.dispatch(TasksActions.addTask({ task: second }));

        expect(await firstValueFrom(store.select(selectTaskByTopicId(topic.id))))
            .toEqual([existingTask, first, second]);
        expect(service.updateTopic.calls.count()).toBe(1);
        expect(service.updateTopic.calls.argsFor(0))
            .toEqual([topic.id, { tasks: [existingTask, first] }]);

        responses[0].next({ ...topic, tasks: [existingTask, first] });
        responses[0].complete();
        expect(service.updateTopic.calls.count()).toBe(2);
        expect(service.updateTopic.calls.argsFor(1))
            .toEqual([topic.id, { tasks: [existingTask, first, second] }]);

        responses[1].next({ ...topic, tasks: [existingTask, first, second] });
        responses[1].complete();
        const savedTopic = await firstValueFrom(store.select(selectTopicById(topic.id)));
        expect(savedTopic?.tasks).toEqual([existingTask, first, second]);

        // Simulate reloading the data returned by the API.
        store.dispatch(TopicsActions.loadTopicsSuccess({ topics: [savedTopic!] }));
        expect(await firstValueFrom(store.select(selectTaskByTopicId(topic.id))))
            .toEqual([existingTask, first, second]);
    });

    it('removes a failed addition and continues saving the next queued task', async () => {
        const failed = task('failed', 1);
        const next = task('next', 2);
        store.dispatch(TasksActions.addTask({ task: failed }));
        store.dispatch(TasksActions.addTask({ task: next }));
        responses[0].error(new Error('Network failure'));

        expect(service.updateTopic.calls.argsFor(1))
            .toEqual([topic.id, { tasks: [existingTask, next] }]);
        expect(await firstValueFrom(store.select(selectTaskByTopicId(topic.id))))
            .toEqual([existingTask, next]);
        expect((await firstValueFrom(store.select(selectTaskState))).error).toBeTruthy();

        responses[1].next({ ...topic, tasks: [existingTask, next] });
        responses[1].complete();
        expect((await firstValueFrom(store.select(selectTaskState))).error).toBeNull();
    });

    it('removes an addition when its topic does not exist', async () => {
        const missing = { ...task('missing', 0), topicID: 'missing-topic' };
        store.dispatch(TasksActions.addTask({ task: missing }));
        expect(service.updateTopic).not.toHaveBeenCalled();
        expect(await firstValueFrom(store.select(selectTaskByTopicId(missing.topicID))))
            .toEqual([]);
        expect((await firstValueFrom(store.select(selectTaskState))).error)
            .toBe('Tópico não encontrado');
    });
});
