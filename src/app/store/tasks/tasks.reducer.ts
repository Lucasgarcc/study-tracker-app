import { createReducer, on } from "@ngrx/store";
import { StudyTask } from "../models/study-task.model";
import { TasksActions } from "./tasks.actions";
import { TopicsActions } from "../topics/topics.actions";

export interface TasksState {
    tasks: StudyTask[];
    loading: boolean;
    error: string | null;
}

export const initialState: TasksState = {
    tasks: [],
    loading: false,
    error: null
};

export const TasksReducers = createReducer(
    
    initialState,

    on(TopicsActions.loadTopicsSuccess, (state, { topics }) => ({
        ...state,
        tasks: topics.reduce<StudyTask[]>((tasks, topic) => [...tasks, ...(topic.tasks ?? [])], []),
        loading: false,
        error: null
    })),

    on(TasksActions.addTaskFailure, (state, { taskId, error }) => ({
        ...state,
        tasks: state.tasks.filter(task => task.id !== taskId),
        error
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
    on(TasksActions.reorderTask, (state, { topicID, fromIndex, toIndex }) => {

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
            error: null
        };
    }),
    
    /**
     * Status
     */
    on(TasksActions.addTaskSuccess,
        state => ({ ...state, error: null })
    ),

    on(TasksActions.deleteTaskSuccess, (state, { id }) => ({
        ...state,
        tasks: state.tasks.filter(task => task.id !== id),
        error: null
    })),

    on(TasksActions.deleteTaskFailure, (state, { error }) => ({
        ...state,
        error
    }))
    
)
