import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TopicsState } from './topics.reducer';

export const selectTopicsState = createFeatureSelector<TopicsState>('topics');

export const selectAllTopics = createSelector(
  selectTopicsState,
  (state) => state.topics
);

/**
 * Tópicos ativos para a Home (progresso menor que 100%)
 */
export const selectActiveTopics = createSelector(
  selectAllTopics,
  (topics) => topics.filter(t => t.progress < 100)
);

/**
 * 
 * @param id 
 * @returns 
 */
export const selectTopicById = (id: string) => createSelector(
    selectAllTopics,
    topics => topics.find(topic => topic.id === id)
);