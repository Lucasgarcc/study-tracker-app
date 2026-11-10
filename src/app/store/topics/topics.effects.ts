import { inject, Injectable } from "@angular/core";
import { createEffect } from "@ngrx/effects";
import { Actions, ofType } from "@ngrx/effects";
import { Topics } from "src/app/services/topics";
import { TopicsActions } from "./topics.actions";
import { catchError, concatMap, exhaustMap, map, of } from "rxjs";

@Injectable()

export class TopicsEffects {
    
    private readonly actions$ = inject(Actions);
    private readonly topicsServices = inject(Topics);

    /**
     * Effect of load 
     */
    readonly loadTopics$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TopicsActions.loadTopics),
            exhaustMap(() => 
                this.topicsServices.getTopics().pipe(
                    map(topics => 
                        TopicsActions.loadTopicsSuccess({ topics})
                    ),
                    catchError(() => 
                        of(
                            TopicsActions.loadTopicsFailure ({
                            error: 'Não foi possível carregar os tópicos.'
                        }))
                    )
                )
            ) 
        )
    );

    /**
     * effect of update
     */
    readonly addTopics$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TopicsActions.addTopic),
            concatMap(({ topic }) =>
                this.topicsServices.addTopic(topic).pipe(
                    map(createTopic => 
                        TopicsActions.addTopicSuccess({ topic: createTopic})
                    ),
                    catchError(() => 
                        of(
                            TopicsActions.addTopicFailure({
                            error: 'Não foi possível adicionar o tópico.'
                        }))
                    )
                )
            )
        )
    );

    /**
     * effect of add
     */
    readonly updateTopics$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TopicsActions.updateTopic),
            concatMap(({ topic }) =>
                this.topicsServices.updateTopic(topic.id, {tasks: topic.tasks}).pipe(
                    map(updateTopics =>
                        TopicsActions.updateTopicSuccess({ topic: updateTopics })
                    ),
                    catchError(() =>
                        of(
                            TopicsActions.updateTopicFailure({
                            error: 'Não foi possível atualizar o tópico.'
                        }))
                    )
                )
            )
        )
    );

    /**
     *  effect of delete
     */
    readonly deleteTopic$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TopicsActions.deleteTopic),
            concatMap(({ id }) =>
                this.topicsServices.deleteTopic(id).pipe(
                    map(() => TopicsActions.deleteTopicSuccess({ id })),
                    catchError(() =>
                        of(TopicsActions.deleteTopicFailure({
                            error: 'Não foi possível excluir o tópico.'
                        }))
                    )
                )
            )
        )
    );
}