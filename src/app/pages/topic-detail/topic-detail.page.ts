// src/app/pages/topic-detail/topic-detail.page.ts
import { Component, OnInit, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectAllTopics } from '../../store/topics/topics.selectors';
import { map } from 'rxjs/operators';
import { StudyTaskComponent } from 'src/app/components/study-task/study-task.component';

@Component({
  selector: 'app-topic-detail',
  templateUrl: './topic-detail.page.html',
  styleUrls: ['./topic-detail.page.scss'],
  standalone: true, 
  imports: [CommonModule, FormsModule, IonicModule, StudyTaskComponent]
 })
export class TopicDetailPage implements OnInit {
    topicID!: string;
    private route = inject(ActivatedRoute);
    private store = inject(Store);


    topic$ = this.store.select(selectAllTopics).pipe(
        map(topics => topics.find(topic => topic.id === this.topicID))
    );

    /**
     * 
     */
    ngOnInit(): void {
        this.topicID = this.route.snapshot.paramMap.get('id')!
    }


 }
