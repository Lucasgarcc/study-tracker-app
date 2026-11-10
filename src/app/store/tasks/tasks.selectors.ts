
import { createFeatureSelector, createSelector } from "@ngrx/store";
import { TasksState } from "./tasks.reducer"

export const selectTaskState = createFeatureSelector<TasksState>('tasks');

export const selectAllTasks = createSelector(
    selectTaskState,
    (state) => state.tasks
)

/**
 * Tasks ativas no Tópico 
 */
export const selectTaskByTopicId = (topicID: string ) => 
createSelector(
    selectAllTasks,
    (tasks) =>
    [...tasks]
    .filter(task => task.topicID === topicID)
    .sort((a , b ) => a.position - b.position)
    
);

