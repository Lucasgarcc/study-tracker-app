import { inject, Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, concatMap, of, take } from "rxjs";
import { Topics } from "src/app/services/topics";
import { TasksActions } from "./tasks.actions";
import { Store } from '@ngrx/store';
import { selectAllTopics, selectTopicById } from "../topics/topics.selectors";
import { TopicsActions } from "../topics/topics.actions";
import { selectAllTasks } from "./tasks.selectors";
@Injectable()
export class TaskEffects {

    private readonly actions$ = inject(Actions);
    private readonly topicsService = inject(Topics);
    private readonly store = inject(Store);

    /**
     * add
     */
    readonly addTask$ = createEffect(() =>

        this.actions$.pipe(
            ofType(TasksActions.addTask),

            // Read the topic when this request starts, after earlier saves finish.
            concatMap(({ task }) => this.store.select(selectTopicById(task.topicID)).pipe(
                take(1),

                concatMap(topic => {
                    if (!topic) {
                        return of(TasksActions.addTaskFailure({
                            taskId: task.id,
                            error: 'Tópico não encontrado'
                        }));
                    }

                    const updatedTasks = [...(topic.tasks ?? []), task];

                    return this.topicsService.updateTopic(topic.id, { tasks: updatedTasks }).pipe(
                        concatMap(updatedTopic => of(
                            TopicsActions.updateTopicSuccess({ topic: updatedTopic }),
                            TasksActions.addTaskSuccess({ task })
                        )),
                        catchError(() => of(TasksActions.addTaskFailure({
                            taskId: task.id,
                            error: 'Não foi possível salvar a tarefa.'
                        })))
                    );
                })
            ))
        )
    );

    /**
     * Delete
     */
    readonly deleteTask$ = createEffect(() => 

        this.actions$.pipe(
        ofType(TasksActions.deleteTask),

            concatMap(({ id }) =>  this.store.select(selectAllTasks).pipe(
                take(1),

                concatMap(tasks => {

                    const task = tasks.find(currentTask => currentTask.id === id);

                    if(!task) {
                        return of(
                            TasksActions.deleteTaskFailure({
                                error: 'Tarefa não encontrada.'
                            })
                        )
                    }
                        
                    return this.store.select(selectTopicById(task.topicID)).pipe(
                        take(1),

                        concatMap(topic => {

                            if (!topic) {
                                return of(
                                    TasksActions.deleteTaskFailure({
                                        error: 'Tópico não encontrado.'
                                    })
                                )
                            }

                            const updatedTasks = (topic.tasks ?? []).filter(
                                currentTask => currentTask.id !== id
                            )

                            return this.topicsService.updateTopic(topic.id, ({ tasks: updatedTasks })
                            ).pipe(
                                concatMap(updatedTopic =>
                                    of(
                                        TopicsActions.updateTopicSuccess({
                                            topic: updatedTopic
                                        }),
                                        TasksActions.deleteTaskSuccess({id})
                                    )
                                ),
                                catchError(() => 
                                    of(
                                        TasksActions.deleteTaskFailure({
                                            error: 'Não foi possível excluir a tarefa.'
                                        })
                                    )
                                )
                            )
                              
                        })

                    )
                    
                })  
            ))
        )
    );
}

