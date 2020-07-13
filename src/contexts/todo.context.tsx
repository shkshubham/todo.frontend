import { createContainer } from "unstated-next";
import { useState, useEffect, useMemo } from "react";
import { TodoType, UpdateAndDeleteTodoType, PaginationType, AddTodoType } from '../types';
import API from '../apis';
import RequestHandler from "../utils/RequestHandler";
import { CHUCK_NORRIS_URL } from "../config";

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
    const [chuckNorrisJokes, setCheckNorrisJokes] = useState<any[]>([])

    const fetchChuckNorrisJokes: any = () => {
        return new Promise((resolve, reject) => {
            const todosPromises: Promise<any>[] = [];
            const array = [1,2,3]
            array.forEach(() => {
                todosPromises.push(RequestHandler.get(CHUCK_NORRIS_URL))
            });
            todosPromises.push(service.get())
           return Promise.all(todosPromises).then((apiData) => {
                return resolve(apiData)
            }).catch(() => {
                return reject(null)
            })
        })
    }
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
            fetchChuckNorrisJokes().then((jokesList: any[]) => {
                const [todosResponse] = jokesList.splice(jokesList.length -1, jokesList.length);
                if(todosResponse) {
                    const { data, ...pagination } = todosResponse
                    if(data.length) {
                        setPagination(pagination)
                        setTodos(data)
                    }
                    setIsLoadingTodos({loaded: true, error: false})
                }
                setCheckNorrisJokes([...jokesList])
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
            setTodos(previousTodos=> [createdTodo, ...previousTodos])
        } else if(createdTodo.error) {
            newAddedTodos[createdTodo.ref].error = true
            setCreatedTodo({...newAddedTodos})
        }
    }, [createdTodo, setCreatedTodo, setNewAddedTodos, todos, newAddedTodos])

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
        chuckNorrisJokes,
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