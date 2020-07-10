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
    const service = useMemo(() => new API("todo"), []);

    const fetchTodos = useMemo(async () => {
        try {
            return await service.get();
        } catch(err) {
            return null;
        }

    }, [setTodos, service])

    useEffect(() => {
        fetchTodos.then(({data}) => {
            if(data.length && !todos.length) {
                setTodos(data)
            }
        })
    }, [setTodos])
    
    const deleteTodo = async(id: string) => {
        setDeletedTodos({...deletedTodos, [id]: true});
        console.log("iiii", id)
        setTimeout(async() => {
        try {
            const deletedTodo = await service.updateOrDelete("DELETE", id);
            setDeletedTodo(deletedTodo.id)
        } catch(err) {
            console.log("Error occured", err)
        }
        }, 2000)
    }

    const editTodo = async (id: string, title: string) => {
        const value = {id, title, updated: false}
        setEditedTodos({...editedTodos, [id]: true});
        setTimeout(async() => {
        try {
            const updatedTodo: TodoType = await service.updateOrDelete("PATCH", id, {
                title,
            })
            setUpdatedTodo(updatedTodo.id)

        } catch(err) {
            console.log("Error occured", err)
        }
        }, 10000)
    }

    useEffect(() => {
        if(updatedTodo !== "") {
            delete editedTodos[updatedTodo];
            setEditedTodos({...editedTodos})
        }
      
    }, [updatedTodo])


    useEffect(() => {
        if(deletedTodo !== "") {
            console.log(deletedTodo, "0000000")
            const foundTodoIndex = todos.findIndex(({id}) => id === deletedTodo)
            console.log(foundTodoIndex)
            if(foundTodoIndex > -1) {
                todos.splice(foundTodoIndex, 1)
                delete deletedTodos[deletedTodo];
                console.log(todos)
                setTodos([...todos])
                setDeletedTodos({...deletedTodos})
            }
        }
      
    }, [deletedTodo])

    const addTodo = async (todo: AddTodoType) => {
        try {
            const createdTodo = await service.post(todo);
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
        setEditedTodos
    }
}

const TodoContext = createContainer(useTodoContext)

export default TodoContext;