import { createReducer, on } from "@ngrx/store";
import { StudyTask } from "../models/study-task.model";
import { TasksActions } from "./tasks.actions";
import { TopicsActions } from "../topics/topics.actions";

export interface TasksState {
    tasks: StudyTask[];
    loading: boolean;    
    saving: boolean;
    error: string | null;
    reorderSnapshots: Record<string, StudyTask[]>,
    reorderPending: Record<string, number>,
}

export const initialState: TasksState = {
    tasks: [],
    loading: false,
    saving: false,
    error: null,
    reorderSnapshots: {},
    reorderPending: {},
};

export const TasksReducers = createReducer(
    
    initialState,

    on(TopicsActions.loadTopicsSuccess, (state, { topics }) => ({
        ...state,
        tasks: topics.reduce<StudyTask[]>((tasks, topic) => [...tasks, ...(topic.tasks ?? [])], []),
        loading: false,
        error: null
    })),

    /**
     * action add task
     */

    on(TasksActions.addTask, (state, { task }) => ({
        ...state,
        tasks: [...state.tasks, task],
        error: null
    })),



    /**
     * action update task
     */
    on(TasksActions.updateTask, (state, { task }) => ({
        ...state,
        tasks: state.tasks.map(currentTask => currentTask.id === task.id ? task : currentTask),
        saving: true,
        error: null
    })),

    /**
     * action check/ unchecked task
     */
    on(TasksActions.toggleTask, (state, { id }) => ({
        ...state,
        tasks: state.tasks.map(task => 
            task.id ===  id ? {
                ...task, completed: !task.completed
            }
            : task
        )
    })),

    /**
     * action delete task
     */
    on(TasksActions.deleteTask, state => ({
        ...state,
        error: null
    })),

    /**
     * reorganize task
     */
    on(TasksActions.reorderTask, (state, { topicID, fromIndex, toIndex, previousTasks }) => {

        const topicTasks = state.tasks 
            .filter(task => task.topicID === topicID)
            .sort((a, b) => a.position - b.position);


        const [movedTask] = topicTasks.splice(fromIndex, 1);

        if (!movedTask) {
            return state;
        }

        topicTasks.splice(toIndex, 0, movedTask);

        const positions = new Map(
            topicTasks.map((task, index) => [task.id, index])
        );

        return {
            ...state,
            tasks: state.tasks.map(task => {
                const newPosition = positions.get(task.id);
                
                return newPosition === undefined ? task : {
                    ...task, 
                    position: newPosition
                }
            }),
            error: null,
            reorderSnapshots: {
                ...state.reorderSnapshots,
                [topicID]: state.reorderSnapshots[topicID] ?? previousTasks
            },
            reorderPending: {
                ...state.reorderPending,
                [topicID]: (state.reorderPending[topicID] ?? 0) + 1
            }
        };
    }),

    on(TasksActions.reorderTaskFailure, (state, {topicID, previousTasks, error }) => {

        const snapshot =
            state.reorderSnapshots[topicID] ?? previousTasks;

        const pending = Math.max(
            (state.reorderPending[topicID] ?? 1) - 1,
            0
        );

        const restoredState = {
            ...state,
            tasks: [
                ...state.tasks.filter(task => task.topicID !== topicID),
                ...snapshot
            ],
            error
        };
        
        if (pending > 0) {
            return {
                ...restoredState,
                reorderSnapshots: {
                    ...state.reorderSnapshots,
                    [topicID]: snapshot
                },
                reorderPending: {
                    ...state.reorderPending,
                    [topicID]: pending
                }
            };
        }

        const { [topicID]: _snapshot, ...reorderSnapshots } = state.reorderSnapshots;
        const { [topicID]: _pending, ...reorderPending } = state.reorderPending

        return {
            ...restoredState,
            reorderSnapshots,
            reorderPending
        };

    }),

    /**
     * Status
     */
    on(TasksActions.addTaskSuccess,
        state => ({ ...state, error: null })
    ),

    on(TasksActions.addTaskFailure, (state, { taskId, error }) => ({
        ...state,
        tasks: state.tasks.filter(task => task.id !== taskId),
        error
    })),

    on(TasksActions.updateTaskSuccess,
        state => ({ ...state, saving: false,  error: null})
    ),

    on(TasksActions.updateTaskFailure, (state, { taskId, previousTask , error}) => ({
        ...state,
        tasks: state.tasks.map(currentTask =>
            currentTask.id === taskId ? previousTask : currentTask
        ),
        saving: false,
        error
    })),

    on(TasksActions.deleteTaskSuccess, (state, { id }) => ({
        ...state,
        tasks: state.tasks.filter(task => task.id !== id),
        error: null
    })),

    on(TasksActions.deleteTaskFailure, (state, { error }) => ({
        ...state,
        error
    })),

    on(TasksActions.reorderTaskSuccess, (state, { topicID, tasks }) => {
        const pending = Math.max((state.reorderPending[topicID] ?? 1) - 1,
            0
        );

        if(pending > 0) {
            return {
                ...state,
                error: null,
                reorderSnapshots: {
                    ...state.reorderSnapshots,
                    [topicID]: tasks
                },
                reorderPending: {
                    ...state.reorderPending,
                    [topicID]: pending
                }
            };
        }

        const { [topicID]: _snapshot, ...reorderSnapshots } = state.reorderSnapshots;
        const { [topicID]: _pending, ...reorderPending } = state.reorderPending;

        return {
            ...state,
            error: null,
            reorderSnapshots,
            reorderPending
        }
    })
    
)
