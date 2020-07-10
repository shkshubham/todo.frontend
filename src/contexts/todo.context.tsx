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

    useEffect(() => {
        if(updatedTodo !== "") {
            delete editedTodos[updatedTodo];
            setEditedTodos({...editedTodos})
        }
      
    }, [updatedTodo, editedTodos, setEditedTodos])


    useEffect(() => {
        if(deletedTodo !== "") {
            const foundTodoIndex = todos.findIndex(({id}) => id === deletedTodo)
            if(foundTodoIndex > -1) {
                todos.splice(foundTodoIndex, 1)
                delete deletedTodos[deletedTodo];
                console.log(todos)
                setTodos([...todos])
                setDeletedTodos({...deletedTodos})
            }
        }
      
    }, [todos, setTodos, setDeletedTodos, deletedTodo, deletedTodos])

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
        setEditedTodos
    }
}

const TodoContext = createContainer(useTodoContext)

export default TodoContext;