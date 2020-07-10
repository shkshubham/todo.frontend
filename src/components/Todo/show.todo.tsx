import React, { useState } from 'react';
import { TodoType } from '../../types';
import { Button, Form, Spinner } from 'react-bootstrap';
import TodoContext from '../../contexts/todo.context';

interface ShowTodoPropsTypes {
    todo: TodoType;
    loading: boolean;
}

const ShowTodo = ({todo: {title, id}, loading}: ShowTodoPropsTypes) => {
    const { editTodo, deleteTodo } = TodoContext.useContainer()
    const [isShown, setIsShown] = useState(false);
    const className = "todo-item";
    const [inputValue, setInputValue] = useState(title)
    const [editBtnClicked, setEditBtnClicked] = useState(false)
    const [finalTitle, setFinalTitle] = useState(title)

    const toggleEditBtn = () => {
        setEditBtnClicked(!editBtnClicked)
    }

    const onClearBtnClicked = () => {
        setInputValue(title)
        toggleEditBtn()
    }

    const onInputChange = (e: any) => {
        setInputValue(e.target.value)
    }

    const onSubmitForm = (e: React.SyntheticEvent) => {
        e.preventDefault()
        toggleEditBtn();
        setFinalTitle(inputValue)
        editTodo(id, inputValue)
    }

    const renderEditTodo = () => <tr>
        <td className="py-4">
            <Form onSubmit={onSubmitForm}>
                <Form.Control value={inputValue} onChange={onInputChange} className="mb-2" type="text" />
                <Button type="submit">Save</Button>
                <Button onClick={onClearBtnClicked}>Cancel</Button>
            </Form>
        </td>

    </tr>

    const onDeleteBtnClicked = () => {
        const response = window.confirm("Are you sure, You want to delete this todo?");
        if (response == true) {
            deleteTodo(id)
        }
    }

    const renderShowTodo = () => <tr 
            onMouseEnter={() => setIsShown(true)}
            onMouseLeave={() => setIsShown(false)}
            className={loading ? `text-muted ${className}` : className}
        >
        <td className="py-4">{finalTitle}</td>
            <td>{isShown ?
                (
                    !loading ?
                    <>
                        <Button onClick={toggleEditBtn} size="sm">Edit</Button>
                        <Button size="sm" variant="danger" onClick={onDeleteBtnClicked}>Delete</Button>
                    </>
                    : <Spinner animation="grow" size="sm" />
                )
                : null}</td>
        </tr>

    return (
        <>
            {!editBtnClicked ? renderShowTodo() : renderEditTodo()}
        </>
    )
}

export default ShowTodo;