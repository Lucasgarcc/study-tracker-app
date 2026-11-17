import { IonicModule, IonInput } from '@ionic/angular';
import { Component, inject, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { StudyTask, TaskEditableFields } from 'src/app/store/models/study-task.model';
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
    editingTaskId: string | null = null;
    taskDraft: TaskEditableFields | null = null;
    taskTitleError = false;
    openedTaskActionsId: string | null = null;
    private readonly store = inject(Store);

    /**
     * Reinicia a edição e os controles ao receber um tópico, evitando que o
     * estado visual do tópico anterior seja aplicado à nova lista.
     * O template consome a lista pelo AsyncPipe, que gerencia a inscrição.
     */
    ngOnChanges(changes: SimpleChanges): void {
        if (changes['topicID'] && this.topicID) {
            this.editingTaskId = null;
            this.taskDraft = null;
            this.taskTitleError = false;
            this.openedTaskActionsId = null;
            this.tasks$ = this.store.select(
                selectTaskByTopicId(this.topicID)
            )
        }
    }

    /**
     * Solicita a adição ao tópico atual, ignorando títulos vazios.
     * Limpa o input após o dispatch; isso não representa confirmação da API.
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
            description: '',
            completed: false,
            position: tasks.length
        };

        this.store.dispatch(
            TasksActions.addTask({ task })
        );

        this.titleInput.value = '';
    }

    /**
     * Solicita a exclusão pelo ID. O effect coordena a chamada à API;
     * o componente não executa a requisição diretamente.
     */
    deleteTask(id: string) {
        this.store.dispatch(TasksActions.deleteTask({ id }))
    }

    /**
     * Mantém as ações abertas para uma única tarefa.
     * Clicar novamente na mesma tarefa fecha os controles.
     */
    toggleTaskActions(id: string) {
       this.openedTaskActionsId = 
       this.openedTaskActionsId === id ? null : id;
    }

    /**
     * Fecha os controles por Escape e devolve o foco ao botão que os abre,
     * evitando que o foco permaneça em uma ação que ficará oculta.
     */
    closeTaskActions(event: Event, toggle: HTMLButtonElement): void {
        if (this.openedTaskActionsId === null) return;

        event.stopPropagation();
        this.openedTaskActionsId = null;
        toggle.focus();
    }

    /**
     * Copia os campos editáveis para um rascunho separado da tarefa na Store.
     * Ao passar entre título e descrição da mesma tarefa, mantém o rascunho
     * existente para não substituir o texto que já foi digitado.
     */
    startTaskEditing(task: StudyTask): void {
        if (this.editingTaskId === task.id) return;

        this.editingTaskId = task.id;
        this.taskDraft = { title: task.title, description: task.description ?? '' };
        this.taskTitleError = false;
    }

    /**
     * Inicia a edição pelo título, selecionando seu conteúdo para substituição.
     * Fecha as ações para liberar espaço aos campos durante a edição.
     */
    editTask(task: StudyTask, titleInput: HTMLInputElement): void {
        this.startTaskEditing(task);
        this.openedTaskActionsId = null;
        titleInput.focus();
        titleInput.select();
    }

    /**
     * Atualiza somente o rascunho durante a digitação, sem disparar actions.
     * A validação do título fornece feedback antes de finalizar a edição.
     *
     * @param field campo editável que recebeu a alteração
     * @param value conteúdo atual do campo, ainda sem normalização
     */
    updateTaskDraft(field: keyof TaskEditableFields, value: string): void {
        if (!this.taskDraft) return;

        this.taskDraft = { ...this.taskDraft, [field]: value };
        if (field === 'title') this.taskTitleError = !value.trim();
    }

    /**
     * Finaliza a edição quando o foco sai do conjunto título/descrição.
     * A troca de foco entre esses campos não deve finalizar o rascunho.
     *
     * Mantém a edição ativa se o título estiver vazio. Com dados válidos,
     * dispara updateTask apenas se houve mudança e limpa o estado de edição.
     * A action atualiza a Store; a persistência HTTP da edição ainda não existe.
     *
     * @param event evento focusout do elemento que contém os dois campos
     * @param task tarefa atual usada para comparar e preservar os demais campos
     */
    finishTaskEditing(event: FocusEvent, task: StudyTask): void {
        const fields = event.currentTarget as HTMLElement;

        if (event.relatedTarget instanceof Node && fields.contains(event.relatedTarget)) return;

        if (this.editingTaskId !== task.id || !this.taskDraft) return;

        const title = this.taskDraft.title.trim();

        if (!title) {
            this.taskTitleError = true;
            return;
        }

        const description = this.taskDraft.description;

        if (title !== task.title || description !== (task.description ?? '')) {
            this.store.dispatch(TasksActions.updateTask({
                task: { ...task, title, description },
                previousTask: task
            }));
        }

        this.editingTaskId = null;
        this.taskDraft = null;
        this.taskTitleError = false;

    }

    /**
     * Dispara a alternância de conclusão no estado local.
     * A persistência HTTP dessa alteração ainda não está implementada.
     */
    toggleTask(id: string): void {
        this.store.dispatch(TasksActions.toggleTask({ id }));
    }


    /**
     * Envia as posições do arraste ao reducer, que recalcula a ordem local.
     * complete() encerra a interação visual do Ionic; não confirma persistência.
     * A ordem ainda não é enviada à API.
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
     * Usa UUID quando disponível e um fallback baseado em tempo e aleatoriedade
     * nos demais ambientes. O fallback não oferece a mesma garantia de um UUID.
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

