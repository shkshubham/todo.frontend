export interface AddTodoType extends Object {
    title: string;
    completed: boolean;
}

export interface TodoType extends AddTodoType {
    id: string;
}

export interface UpdateAndDeleteTodoType extends Object {
    [key: string]: any
}

export interface PaginationType extends Object {
    limit: number;
    skip: number;
    total: number;
}