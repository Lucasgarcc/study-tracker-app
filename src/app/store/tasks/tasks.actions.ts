import { createActionGroup, props } from "@ngrx/store";
import { StudyTask } from "../models/study-task.model";


export const TasksActions = createActionGroup({
    source: 'Tasks',
    events: {

        'Add Task Success': props<{ task: StudyTask}>(),
        'Add Task Failure': props<{ taskId: string; error: string }>(),

        'Update Task Success': props<{ task: StudyTask }>(),
        'Update Task Failure': props <{ taskId: string; previousTask: StudyTask; error: string }>(),

        'Delete Task Success': props<{ id: string }>(),
        'Delete Task Failure': props<{ error: string }>(),

        'Add Task': props<{ task: StudyTask }>(),
        'Update Task': props<{ task: StudyTask, previousTask: StudyTask }>(),

        'Toggle Task': props<{ id: string }>(),
        'Delete Task': props<{ id: string }>(),
        'Reorder Task': props<{
            topicID: string;
            fromIndex: number;
            toIndex: number;
        }>(),
    } 
})  
