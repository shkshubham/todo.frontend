import { createContainer } from "unstated-next";
import { useState, useEffect, useMemo } from "react";
import { v4 as uuid4 } from 'uuid'
import { TodoType, UpdateAndDeleteTodoType, PaginationType } from '../types';
import API from '../apis';

const useTodoContext = () => {
    const [todos, setTodos] = useState<TodoType[]>([])
    const [pagination, setPagination] = useState<PaginationType>({limit: 10, total: 0, skip: 0})
    const [newAddedTodos, setNewAddedTodos] = useState<TodoType[]>([]);
    const [addedTodos, setAddedTodos] = useState<UpdateAndDeleteTodoType>({})
    const [createdTodo, setCreatedTodo] = useState<any>({})
    const [isLoadingTodos, setIsLoadingTodos] = useState({loaded: false, error: false})
    
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
            const foundTodo = todos.find(({id}) => id === createdTodo.id)
            if(!foundTodo) {
                const foundIndex = newAddedTodos.findIndex(({title}) => title === createdTodo.title)
                if(foundIndex > -1) {
                    newAddedTodos.splice(foundIndex, 1)
                    setCreatedTodo({})
                    setNewAddedTodos([...newAddedTodos])

                    setAddedTodos(previousAddedTodos => {
                        delete previousAddedTodos[createdTodo.title]
                        return {...previousAddedTodos}
                    })
                    setPagination(previousPagination=> {
                        return {
                            ...previousPagination,
                            total: previousPagination.total + 1
                        }
                    })
                    setTodos((previousTodos) => [...previousTodos, createdTodo])
                }
            }
        }
    }, [createdTodo, setCreatedTodo, setAddedTodos, setNewAddedTodos, newAddedTodos, todos])

    /**
     * Add Todo
     *
     * @description To add new todo
     * 
     * @param todo: New todo data
     * 
    */
    const addTodo = async (todo: TodoType) => {
        setAddedTodos({...addedTodos, [todo.title]: todo});
        setNewAddedTodos(previousNewAddedTodos => [...previousNewAddedTodos, {title: todo.title, completed: false, id: uuid4()}])
        try {
            const createdTodo = await service.post(todo);
            setCreatedTodo(createdTodo)
        } catch(err) {
            console.log("Error occurred", err)
        }
    }
    /**
     * Main Return
     *
    */
    return { 
        todos,
        addedTodos,
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