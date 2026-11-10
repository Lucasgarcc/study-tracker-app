import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Topic } from '../../store/models/topic.model';
import { selectAllTopics } from '../../store/topics/topics.selectors';
import { TopicsActions } from '../../store/topics/topics.actions';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';


@Component({
    selector: 'app-studies',
    templateUrl: 'studies.page.html',
    styleUrls: ['studies.page.scss'],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        IonicModule
    ]
})
export class StudiesPage implements OnInit {

    constructor(private readonly router: Router,) { }

    private store = inject(Store);
    topics$ = this.store.select(selectAllTopics);

    newTitle: string = '';
    newCategory: string = '';
    completed: number = 0;
    totalTasks: number = 0;
    lastStudied: Date = new Date;
    badgeColor: string = '';

    /**
     * 
     */
    ngOnInit(): void {
        this.store.dispatch(TopicsActions.loadTopics());
    };

    /**
     * Add a new topic to the store if the title is not empty.
     * @returns 
     */
    addNewTopic() {

        if (!this.newTitle.trim()) return;

        this.store.dispatch(
            TopicsActions.addTopic({
                topic: {
                    title: this.newTitle,
                    category: this.newCategory,
                    completedTasks: this.completed,
                    totalTasks: this.totalTasks,
                    lastStudied: this.lastStudied.toISOString(),
                    badgeColor: this.badgeColor,
                    progress: 0,
                    tasks: []
                }
            })
        );

        this.newTitle = '';

    };

    /**
     * Navigate to the topic detail page for the given topic ID.
     * @param id The ID of the topic to navigate to.
     */
        openTopicDetail(id: string): void {
        this.router.navigate(['/topic-detail', id]);
    }
    
    /**
     * Delete a topic by its ID.
     * @param id 
     */
    deleteTopic(id: string) {
        this.store.dispatch(TopicsActions.deleteTopic({ id }));
    }
}
