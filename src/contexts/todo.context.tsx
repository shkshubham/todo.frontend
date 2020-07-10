import { createContainer } from "unstated-next";
import { useState, useEffect, useMemo } from "react";
import { TodoType, UpdateAndDeleteTodoType, AddTodoType } from '../types';
import API from '../apis';

const useTodoContext = () => {
    const [todos, setTodos] = useState<TodoType[]>([])
    const [newAddedTodos, setNewAddedTodos] = useState<AddTodoType[]>([]);
    const [editedTodos, setEditedTodos] = useState<UpdateAndDeleteTodoType>({})
    const [deletedTodos, setDeletedTodos] = useState<UpdateAndDeleteTodoType>({})
    const [inActiveTodos, setInActiveTodos] = useState<UpdateAndDeleteTodoType>({})
    const [updatedTodo, setUpdatedTodo] = useState("")
    const [deletedTodo, setDeletedTodo] = useState("")
    const [completedTodo, setCompletedTodo] = useState<UpdateAndDeleteTodoType>({})
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
                setCompletedTodo({})
                setTodos([...todos])
            }
        }
    }, [completedTodo, setCompletedTodo, todos])

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
        try {
           await service.post(todo);
        } catch(err) {
            console.log("Error occured", err)
        }
    }

    return { 
        todos,
        inActiveTodos,
        setInActiveTodos,
        deleteTodo,
        newAddedTodos,
        setNewAddedTodos,
        editTodo,
        addTodo,
        editedTodos,
        deletedTodos,
        setEditedTodos,
        completeTodo
    }
}

const TodoContext = createContainer(useTodoContext)

export default TodoContext;