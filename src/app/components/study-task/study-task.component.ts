import { IonicModule, IonInput } from '@ionic/angular';
import { Component, inject, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { StudyTask } from 'src/app/store/models/study-task.model';
import { Store } from '@ngrx/store';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { selectTaskByTopicId } from 'src/app/store/tasks/tasks.selectors';
import { TasksActions } from 'src/app/store/tasks/tasks.actions';

@Component({
    selector: 'app-study-task',
    standalone: true,
    imports: [IonicModule, AsyncPipe],
    templateUrl: './study-task.component.html',
    styleUrls: ['./study-task.component.scss'],
})
export class StudyTaskComponent implements OnChanges {

    @Input({ required: true }) topicID!: string;
    @ViewChild('titleInput') titleInput!: IonInput;

    tasks$!: Observable<StudyTask[]>;
    private readonly store = inject(Store);

    /**
     * Atualiza o selector das tasks quando o tópico recebido pelo componente
     * é definido ou alterado.
     *
     * @param changes alterações detectadas nos inputs do componente
     */
    ngOnChanges(changes: SimpleChanges): void {
        if (changes['topicID'] && this.topicID) {
            this.tasks$ = this.store.select(
                selectTaskByTopicId(this.topicID)
            )
        }
    }

    /**
     * Cria uma nova task vinculada ao tópico atual e a adiciona ao store.
     * O título é normalizado antes do cadastro e o campo de input é limpo
     * depois que a task é adicionada.
     *
     * @param value valor informado no campo de título
     * @param tasks tasks atuais do tópico, usadas para definir a posição inicial
     */
    addNewTask(value: string | number | null, tasks: StudyTask[]): void {
        const title = String(value ?? '').trim();

        if (!title) {
            return;
        }

        const task: StudyTask = {
            id: this.generationIdTask(),
            topicID: this.topicID,
            title,
            text: '',
            completed: false,
            position: tasks.length
        };

        this.store.dispatch(
            TasksActions.addTask({ task })
        );

        this.titleInput.value = '';
    }

    /**
     * Remove uma task do store usando o seu identificador.
     *
     * @param id identificador da task que será removida
     */
    deleteTask(id: string) {
        this.store.dispatch(TasksActions.deleteTask({ id }))
    }

    /**
     * Alterna o status de conclusão da task selecionada.
     *
     * @param id identificador da task que terá o status alterado
     */
    toggleTask(id: string): void {
        this.store.dispatch(TasksActions.toggleTask({ id }));
    }


    /**
     * Reorganiza uma task dentro da lista do tópico atual.
     * O Ionic informa as posições inicial e final, enquanto o reducer atualiza
     * a propriedade position das tasks envolvidas.
     *
     * @param event evento emitido pelo ion-reorder-group
     */
    onReorder(event: CustomEvent): void {
        const { from, to, complete } = event.detail;

        this.store.dispatch(
            TasksActions.reorderTask({
                topicID: this.topicID,
                fromIndex: from,
                toIndex: to
            })
        );

        complete();
    }

    /**
     * 
     * @returns 
     */
    /**
     * Gera um identificador único para uma nova task.
     * Usa crypto.randomUUID quando disponível e um fallback compatível com
     * ambientes que não oferecem esse recurso, como alguns contextos mobile.
     *
     * @returns identificador da nova task
     */
    private generationIdTask(): string {
        if (typeof crypto.randomUUID === 'function') {
            return crypto.randomUUID();
        }

        return `
            task-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 10)
            }
        `;
    }
}

