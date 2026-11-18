import { TasksActions } from './tasks.actions';
import { TasksReducers, TasksState } from './tasks.reducer';
import { StudyTask } from '../models/study-task.model';

describe('TasksReducers - reorder rollback', () => {
    it('reorders tasks from the same topic and recalculates positions', () => {
        const state: TasksState = {
            tasks: [
                {
                    id: 'task-a-1',
                    topicID: 'topic-a',
                    title: 'A primeira',
                    description: '',
                    completed: false,
                    position: 0
                },
                {
                    id: 'task-a-2',
                    topicID: 'topic-a',
                    title: 'A segunda',
                    description: '',
                    completed: false,
                    position: 1
                },
                {
                    id: 'task-a-3',
                    topicID: 'topic-a',
                    title: 'A terceira',
                    description: '',
                    completed: false,
                    position: 2
                },
                {
                    id: 'task-b-1',
                    topicID: 'topic-b',
                    title: 'B primeira',
                    description: '',
                    completed: false,
                    position: 0
                }
            ],
            loading: false,
            saving: false,
            error: null,
            reorderSnapshots: {},
            reorderPending: {}
        };

        const previousTasks = state.tasks.filter(task => task.topicID === 'topic-a');

        const result = TasksReducers(
            state,
            TasksActions.reorderTask({
                topicID: 'topic-a',
                fromIndex: 0,
                toIndex: 2,
                previousTasks
            })
        );

        expect(result.tasks
            .filter(task => task.topicID === 'topic-a')
            .sort((a, b) => a.position - b.position)
            .map(task => `${task.id}:${task.position}`)
        ).toEqual([
            'task-a-2:0',
            'task-a-3:1',
            'task-a-1:2'
        ]);
        expect(result.error).toBeNull();
        expect(result.reorderSnapshots['topic-a']).toEqual(previousTasks);
        expect(result.reorderPending['topic-a']).toBe(1);
        expect(result.tasks.find(task => task.id === 'task-b-1')).toEqual({
            id: 'task-b-1',
            topicID: 'topic-b',
            title: 'B primeira',
            description: '',
            completed: false,
            position: 0
        });
    });

    it('keeps the order unchanged when the source and destination are equal', () => {
        const state: TasksState = {
            tasks: [
                {
                    id: 'task-a-1', topicID: 'topic-a', title: 'A primeira',
                    description: '', completed: false, position: 0
                },
                {
                    id: 'task-a-2', topicID: 'topic-a', title: 'A segunda',
                    description: '', completed: false, position: 1
                }
            ],
            loading: false,
            saving: false,
            error: null,
            reorderSnapshots: {},
            reorderPending: {}
        };

        const result = TasksReducers(
            state,
            TasksActions.reorderTask({
                topicID: 'topic-a',
                fromIndex: 1,
                toIndex: 1,
                previousTasks: state.tasks
            })
        );

        expect(result.tasks).toEqual(state.tasks);
    });

    it('keeps the original snapshot when another reorder is still pending', () => {
        const originalTasks: StudyTask[] = [
            {
                id: 'task-a-1', topicID: 'topic-a', title: 'A primeira',
                description: '', completed: false, position: 0
            },
            {
                id: 'task-a-2', topicID: 'topic-a', title: 'A segunda',
                description: '', completed: false, position: 1
            }
        ];
        const state: TasksState = {
            tasks: originalTasks,
            loading: false,
            saving: false,
            error: null,
            reorderSnapshots: {},
            reorderPending: {}
        };

        const firstResult = TasksReducers(
            state,
            TasksActions.reorderTask({
                topicID: 'topic-a',
                fromIndex: 0,
                toIndex: 1,
                previousTasks: originalTasks
            })
        );
        const secondResult = TasksReducers(
            firstResult,
            TasksActions.reorderTask({
                topicID: 'topic-a',
                fromIndex: 1,
                toIndex: 0,
                previousTasks: firstResult.tasks
            })
        );

        expect(secondResult.reorderSnapshots['topic-a']).toEqual(originalTasks);
        expect(secondResult.reorderPending['topic-a']).toBe(2);
    });

    it('restores only the affected topic tasks when reorder fails', () => {
        // Arrange
        const previousTasks: StudyTask[] = [
            {
                id: 'task-a-1',
                topicID: 'topic-a',
                title: 'A primeira',
                description: '',
                completed: false,
                position: 0
            },
            {
                id: 'task-a-2',
                topicID: 'topic-a',
                title: 'A segunda',
                description: '',
                completed: false,
                position: 1
            }
        ];

        const state: TasksState = {
            tasks: [
                {
                    ...previousTasks[1],
                    position: 0
                },
                {
                    ...previousTasks[0],
                    position: 1
                },
                {
                    id: 'task-b-1',
                    topicID: 'topic-b',
                    title: 'B primeira',
                    description: '',
                    completed: false,
                    position: 0
                }
            ],
            loading: false,
            saving: false,
            error: null,
            reorderSnapshots: {},
            reorderPending: {}
        };

        // Act
        const result = TasksReducers(
            state,
            TasksActions.reorderTaskFailure({
                topicID: 'topic-a',
                previousTasks,
                error: 'Falha ao salvar ordem'
            })
        );

        // Assert
        expect(result.tasks).toEqual([
            {
                id: 'task-b-1',
                topicID: 'topic-b',
                title: 'B primeira',
                description: '',
                completed: false,
                position: 0
            },
            {
                ...previousTasks[0]
            },
            {
                ...previousTasks[1]
            }
        ]);
        expect(result.error).toBe('Falha ao salvar ordem');
    });

    it('keeps the snapshot when another reorder persistence is pending', () => {
        const previousTasks: StudyTask[] = [
            {
                id: 'task-a-1', topicID: 'topic-a', title: 'A primeira',
                description: '', completed: false, position: 0
            }
        ];
        const persistedTasks: StudyTask[] = [
            {
                ...previousTasks[0],
                position: 1
            }
        ];
        const state: TasksState = {
            tasks: persistedTasks,
            loading: false,
            saving: false,
            error: 'Falha anterior',
            reorderSnapshots: { 'topic-a': previousTasks },
            reorderPending: { 'topic-a': 2 }
        };

        const result = TasksReducers(
            state,
            TasksActions.reorderTaskSuccess({
                topicID: 'topic-a',
                tasks: persistedTasks
            })
        );

        expect(result.reorderPending['topic-a']).toBe(1);
        expect(result.reorderSnapshots['topic-a']).toEqual(persistedTasks);
        expect(result.error).toBeNull();
    });

    it('clears the snapshot after the last reorder persistence completes', () => {
        const persistedTasks: StudyTask[] = [{
            id: 'task-a-1', topicID: 'topic-a', title: 'A primeira',
            description: '', completed: false, position: 0
        }];
        const state: TasksState = {
            tasks: persistedTasks,
            loading: false,
            saving: false,
            error: 'Falha anterior',
            reorderSnapshots: { 'topic-a': persistedTasks },
            reorderPending: { 'topic-a': 1 }
        };

        const result = TasksReducers(
            state,
            TasksActions.reorderTaskSuccess({
                topicID: 'topic-a',
                tasks: persistedTasks
            })
        );

        expect(result.reorderPending['topic-a']).toBeUndefined();
        expect(result.reorderSnapshots['topic-a']).toBeUndefined();
        expect(result.error).toBeNull();
    });

    it('keeps the snapshot after a failure when another persistence is pending', () => {
        const originalTasks: StudyTask[] = [{
            id: 'task-a-1', topicID: 'topic-a', title: 'A primeira',
            description: '', completed: false, position: 0
        }];
        const currentTasks: StudyTask[] = [{
            ...originalTasks[0],
            position: 1
        }];
        const state: TasksState = {
            tasks: currentTasks,
            loading: false,
            saving: false,
            error: null,
            reorderSnapshots: { 'topic-a': originalTasks },
            reorderPending: { 'topic-a': 2 }
        };

        const result = TasksReducers(
            state,
            TasksActions.reorderTaskFailure({
                topicID: 'topic-a',
                previousTasks: currentTasks,
                error: 'Falha ao salvar ordem'
            })
        );

        expect(result.tasks).toEqual(originalTasks);
        expect(result.reorderPending['topic-a']).toBe(1);
        expect(result.reorderSnapshots['topic-a']).toEqual(originalTasks);
        expect(result.error).toBe('Falha ao salvar ordem');
    });
});
