import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { StoreModule } from '@ngrx/store';
import { topicsReducer } from './store/topics/topics.reducer';
import { provideHttpClient } from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';
import { TopicsEffects } from './store/topics/topics.effects';
import { TasksReducers } from './store/tasks/tasks.reducer';
import { TaskEffects } from './store/tasks/task.effects';

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        IonicModule.forRoot(),
        AppRoutingModule,

        StoreModule.forRoot({ 
            topics: topicsReducer,
            tasks: TasksReducers
        }),
        EffectsModule.forRoot([
            TopicsEffects,
            TaskEffects
        ])
       
    ],
    providers:[ 
        provideHttpClient(),
        {
            provide: RouteReuseStrategy, 
            useClass: IonicRouteStrategy
        }
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
