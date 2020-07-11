import { createContainer } from "unstated-next";
import { useState, useEffect, useMemo } from "react";
import { TodoType, UpdateAndDeleteTodoType, AddTodoType, PaginationType } from '../types';
import API from '../apis';

const useTodoContext = () => {
    const [todos, setTodos] = useState<TodoType[]>([])
    const [pagination, setPagination] = useState<PaginationType>({limit: 10, total: 0, skip: 0})
    const [newAddedTodos, setNewAddedTodos] = useState<AddTodoType[]>([]);
    const [editedTodos, setEditedTodos] = useState<UpdateAndDeleteTodoType>({})
    const [deletedTodos, setDeletedTodos] = useState<UpdateAndDeleteTodoType>({})
    const [addedTodos, setAddedTodos] = useState<UpdateAndDeleteTodoType>({})
    const [completedTodos, setCompletedTodos] = useState<UpdateAndDeleteTodoType>({})

    const [updatedTodo, setUpdatedTodo] = useState("")
    const [deletedTodo, setDeletedTodo] = useState("")
    const [completedTodo, setCompletedTodo] = useState<UpdateAndDeleteTodoType>({})
    const [createdTodo, setCreatedTodo] = useState<any>({})
    const [isLoadingTodos, setIsLoadingTodos] = useState({loaded: false, error: false})
    const service = useMemo(() => new API("todo"), []);

    useEffect(() => {
        if(!isLoadingTodos.loaded && !todos.length) {
            service.get().then(({data, limit, skip, total}) => {
                setIsLoadingTodos({loaded: true, error: false})
                if(data.length) {
                    setPagination({limit, skip, total})
                    setTodos(data)
                }
            }).catch(err => {
                setIsLoadingTodos({loaded: true, error: true})
            })
        }
    }, [todos, setTodos, service, setIsLoadingTodos])
    
    const deleteTodo = async(id: string) => {
        setDeletedTodos({...deletedTodos, [id]: true});
        try {
            const deletedTodo = await service.updateOrDelete("DELETE", id);
            setDeletedTodo(deletedTodo.id)
        } catch(err) {
            console.log("Error occured", err)
        }
    }

    const editTodo = async (id: string, title: string) => {
        setEditedTodos({...editedTodos, [id]: true});
        try {
            const updatedTodo: TodoType = await service.updateOrDelete("PATCH", id, {
                title,
            })
            setUpdatedTodo(updatedTodo.id)
        } catch(err) {
            console.log("Error occured", err)
        }
    }

    const completeTodo = async(id: string, completed: boolean) => {
        setCompletedTodos({...completedTodos, [id]: true})
        try {
            const updatedTodo: TodoType = await service.updateOrDelete("PATCH", id, {
                completed,
            })
            setCompletedTodo(updatedTodo)
        } catch(err) {
            console.log("Error occured", err)
        }

    }

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
                    setPagination(previusPagination=> {
                        return {
                            ...previusPagination,
                            total: previusPagination.total + 1
                        }
                    })
                    setTodos((previousTodos) => [...previousTodos, createdTodo])
                }
            }
        }
    }, [createdTodo, setCreatedTodo, setAddedTodos, setNewAddedTodos, newAddedTodos, todos])

    useEffect(() => {
        if(updatedTodo !== "") {
            setUpdatedTodo("")
            setEditedTodos(previousEditedTodos => {
                delete previousEditedTodos[updatedTodo];
                return {...editedTodos}
            })
        }
      
    }, [updatedTodo, setEditedTodos])

    useEffect(() => {
        if(completedTodo.hasOwnProperty("id")) {
            const foundTodo = todos.find(todo => todo.id === completedTodo.id)
            if(foundTodo) {
                foundTodo.completed = completedTodo.completed;
                delete completedTodos[completedTodo.id]
                setCompletedTodo({})
                setCompletedTodos({...completedTodos})
                setTodos([...todos])
            }
        }
    }, [completedTodo, setCompletedTodo, todos, setCompletedTodos, completedTodos])

    useEffect(() => {
        if(deletedTodo !== "") {
            const foundTodoIndex = todos.findIndex(({id}) => id === deletedTodo)
            if(foundTodoIndex > -1) {
                setDeletedTodo("")

                setTodos((previousTodos) => {
                    previousTodos.splice(foundTodoIndex, 1)
                   return  [...previousTodos]
                })
                
                setDeletedTodos(previousDeletedTodos => {
                    delete previousDeletedTodos[deletedTodo];
                    return {...previousDeletedTodos}   
                })
                
                setPagination(previusPagination=> {
                    return {
                        ...previusPagination,
                        total: previusPagination.total - 1
                    }
                })
            }
        }
      
    }, [todos, setTodos, setDeletedTodos, setDeletedTodo, deletedTodo, setPagination])

    const addTodo = async (todo: AddTodoType) => {
        setAddedTodos({...addedTodos, [todo.title]: todo});
        setNewAddedTodos(previousNewAddedTodos => [...previousNewAddedTodos, {title: todo.title, completed: false}])
        try {
            const createdTodo = await service.post(todo);
            setCreatedTodo(createdTodo)
            } catch(err) {
                console.log("Error occured", err)
            }
    }

    return { 
        todos,
        addedTodos,
        newAddedTodos,
        editedTodos,
        deletedTodos,
        deleteTodo,
        setNewAddedTodos,
        editTodo,
        addTodo,
        setEditedTodos,
        completeTodo,
        completedTodos,
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