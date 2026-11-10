import { createReducer, on } from '@ngrx/store';
import { Topic } from '../models/topic.model';
import { TopicsActions } from './topics.actions';

export interface TopicsState {
    topics: Topic[];
    loading: boolean;
    error: string | null;
}

export const initialState: TopicsState = {
    topics: [],
    loading: false,
    error: null
};

/**
 * 
 */
export const topicsReducer = createReducer(
    initialState,

    /**
     * action add topic
     */
    on(TopicsActions.addTopicSuccess, (state, { topic }) => ({
        ...state,
        topics: [...state.topics, topic],
        error: null
    })),

    /**
     * action add  topic 
     */
    on(TopicsActions.updateTopicSuccess, (state, { topic }) => ({
        ...state,
        topics: state.topics.map(currentTopic => 
            currentTopic.id === topic.id 
             ? topic
             : currentTopic
        ),
        error: null
    })),

    /**
     * action detete topic
     */
    on(TopicsActions.deleteTopicSuccess, (state, { id }) => ({
        ...state,
        topics: state.topics.filter(topic => topic.id !== id),
        error: null
    })),

    /** 
     * Status actions
     */

    on(TopicsActions.addTopicFailure, 
        TopicsActions.deleteTopicFailure,
        (state, { error }) => ({ ...state, error })
    ),

    on(TopicsActions.addTopic, 
        TopicsActions.deleteTopic,
        state => ({ ...state, error: null })
    ),

    on(
        TopicsActions.updateTopicFailure,
        (state, { error }) => ({
            ...state,
            error
        })
    ),

    on(TopicsActions.loadTopics, state => ({
        ...state,
        loading: true,
        error: null
    })),

    on(TopicsActions.loadTopicsSuccess, (state, { topics }) => ({
        ...state,
        topics,
        loading: false,
        error: null
    })),

    on(TopicsActions.loadTopicsFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),
      
);