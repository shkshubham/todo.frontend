export interface AddTodoType extends Object {
    title: string;
    completed: boolean;
}

export interface TodoType {
    title: string;
    completed: boolean;
    id: string;
    joke?: boolean;
    [key: string]: any;
}

export interface UpdateAndDeleteTodoType extends Object {
    [key: string]: any
}

export interface PaginationType extends Object {
    limit: number;
    skip: number;
    total: number;
}

export interface UpdateTodoType {
    title?: string;
    completed?: boolean;
}

export interface APIStatusType {
    loading: boolean;
    error: boolean;
    done: boolean;
    [key: string]: boolean;
}

export interface APIStatusUpdateType {
    loading?: boolean;
    error?: boolean;
    done?: boolean;
}
