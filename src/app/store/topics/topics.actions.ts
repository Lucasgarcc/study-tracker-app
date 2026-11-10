import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Topic } from '../models/topic.model';

/**
 * 
 */
export const TopicsActions = createActionGroup({
    source: 'Topics',
    events: {
        'Load Topics': emptyProps(),
        'Load Topics Success': props<{ topics: Topic[] }>(),
        'Load Topics Failure': props<{ error: string }>(),
        
        'Add Topic Success': props<{ topic: Topic }>(),
        'Add Topic Failure': props<{ error: string }>(),

        'Update Topic': props<{ topic: Topic }>(),
        'Update Topic Success': props<{ topic: Topic }>(),
        'Update Topic Failure': props<{ error: string }>(),

        'Delete Topic Success': props<{ id: string }>(),
        'Delete Topic Failure': props<{ error: string }>(),

        'Add Topic': props<{ topic: Omit<Topic, 'id'> }>(),
        'Delete Topic': props<{ id: string }>()
    }
});