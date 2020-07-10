import { createContainer } from "unstated-next";
import { useState, useEffect, useMemo } from "react";
import { TodoType, UpdateAndDeleteTodoType, AddTodoType } from '../types';
import API from '../apis';

const useTodoContext = () => {
    const [todos, setTodos] = useState<TodoType[]>([])
    const [newAddedTodos, setNewAddedTodos] = useState<AddTodoType[]>([]);
    const [editedTodos, setEditedTodos] = useState<UpdateAndDeleteTodoType>({})
    const [deletedTodos, setDeletedTodos] = useState<UpdateAndDeleteTodoType>({})
    const [addedTodos, setAddedTodos] = useState<UpdateAndDeleteTodoType>({})
    const [completedTodos, setCompletedTodos] = useState<UpdateAndDeleteTodoType>({})


    const [updatedTodo, setUpdatedTodo] = useState("")
    const [deletedTodo, setDeletedTodo] = useState("")
    const [completedTodo, setCompletedTodo] = useState<UpdateAndDeleteTodoType>({})
    const [createdTodo, setCreatedTodo] = useState<any>({})

    const service = useMemo(() => new API("todo"), []);

    const fetchTodos = useMemo(async () => {
        try {
            return await service.get();
        } catch(err) {
            return null;
        }

    }, [service])

    useEffect(() => {
        fetchTodos.then(({data}) => {
            if(data.length && !todos.length) {
                setTodos(data)
            }
        })
    }, [todos, fetchTodos, setTodos])
    
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
                    delete addedTodos[createdTodo.title]
                    setCreatedTodo({})
                    setNewAddedTodos([...newAddedTodos])
                    setAddedTodos({...addedTodos})
                    setTodos([...todos, createdTodo])
                }
            }
        }
    }, [createdTodo, setCreatedTodo, addedTodos, setAddedTodos, setNewAddedTodos, newAddedTodos])

    useEffect(() => {
        if(updatedTodo !== "") {
            delete editedTodos[updatedTodo];
            setUpdatedTodo("")
            setEditedTodos({...editedTodos})
        }
      
    }, [updatedTodo, editedTodos, setEditedTodos])

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
                todos.splice(foundTodoIndex, 1)
                delete deletedTodos[deletedTodo];
                setDeletedTodo("")
                setTodos([...todos])
                setDeletedTodos({...deletedTodos})
            }
        }
      
    }, [todos, setTodos, setDeletedTodos, setDeletedTodo, deletedTodo, deletedTodos])

    const addTodo = async (todo: AddTodoType) => {
        setAddedTodos({...addedTodos, [todo.title]: todo});
        setNewAddedTodos([...newAddedTodos, {title: todo.title, completed: false}])
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
        completedTodos
    }
}

const TodoContext = createContainer(useTodoContext)

export default TodoContext;