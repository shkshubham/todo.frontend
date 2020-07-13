import { createContainer } from "unstated-next";
import { useState, useEffect, useMemo } from "react";
import { TodoType, UpdateAndDeleteTodoType, PaginationType, AddTodoType } from '../types';
import API from '../apis';

const useTodoContext = () => {
    const [todos, setTodos] = useState<TodoType[]>([])
    const [pagination, setPagination] = useState<PaginationType>({limit: 10, total: 0, skip: 0})
    const [newAddedTodos, setNewAddedTodos] = useState<UpdateAndDeleteTodoType>({})
    const [createdTodo, setCreatedTodo] = useState<any>({})
    const [isLoadingTodos, setIsLoadingTodos] = useState({loaded: false, error: false})
    const [count, setCount] = useState({
        total: pagination.total,
        todos: todos.length
    })

    /**
     * Generate Api Service
     *      
     * @description To Generate CRUD api service
     *   
    */
    const service = useMemo(() => new API("todo"), []);

    /**
     * Use effect Hook
     *
     * @description To fetch and set todos
     * 
    */
    useEffect(() => {
        if(!isLoadingTodos.loaded && !todos.length) {
            service.get().then(({data, limit, skip, total}) => {
                setIsLoadingTodos({loaded: true, error: false})
                if(data.length) {
                    setPagination({limit, skip, total})
                    setTodos(data)
                }
            }).catch(() => {
                setIsLoadingTodos({loaded: true, error: true})
            })
        }
    }, [todos, setTodos, service, setIsLoadingTodos, isLoadingTodos.loaded])

    /**
     * Use effect Hook
     *
     * @description To add new todo
     * 
    */
    useEffect(() => {
        if(createdTodo.hasOwnProperty("id")) {
            setCreatedTodo({})
            setNewAddedTodos(previousAddedTodos => {
                delete previousAddedTodos[createdTodo.ref]
                return {...previousAddedTodos}
            })
            setPagination(previousPagination=> {
                return {
                    ...previousPagination,
                    total: previousPagination.total + 1
                }
            })
            setTodos(previousTodos=> [...previousTodos, createdTodo])
        } else if(createdTodo.error) {
            newAddedTodos[createdTodo.ref].error = true
            setCreatedTodo({...newAddedTodos})
        }
    }, [createdTodo, setCreatedTodo, setNewAddedTodos, todos])

    /**
     * Add Todo
     *
     * @description To add new todo
     * 
     * @param todo: New todo data
     * 
    */
    const addTodo = async (todo: AddTodoType, ref: string) => {
        setNewAddedTodos(previousAddedTodos => {
            return {...previousAddedTodos, [ref]: {...todo, id: ref}}
        });
        try {
            const createdTodo = await service.post(todo, ref);
            console.log(createdTodo)
            setCreatedTodo({...createdTodo, error: false})
        } catch(err) {
            setCreatedTodo({...err, error: true})
        }
    }
    /**
     * Main Return
     *
    */
    return { 
        todos,
        count,
        setCount,
        newAddedTodos,
        setNewAddedTodos,
        addTodo,
        pagination,
        setPagination,
        service,
        setTodos,
        isLoadingTodos,
        setIsLoadingTodos
    }
}

const TodoContext = createContainer(useTodoContext)

export default TodoContext;