export type TaskEditableFields = Pick<StudyTask, 'title' | 'description'>;

export interface StudyTask {
    id: string;
    topicID: string;
    title: string;
    description: string
    completed: boolean;
    position: number;
}

