import React, { useState } from 'react';
import { TodoType } from '../../types';
import { Button, Form, Spinner, Col, Row, OverlayTrigger, Tooltip } from 'react-bootstrap';
import TodoContext from '../../contexts/todo.context';

interface ShowTodoPropsTypes {
    todo: TodoType;
    loading: boolean;
}

const ShowTodo = ({todo: {title, id, completed}, loading}: ShowTodoPropsTypes) => {
    const { editTodo, deleteTodo, completeTodo } = TodoContext.useContainer()
    const [isShown, setIsShown] = useState(false);
    const className = "todo-item";
    const [inputValue, setInputValue] = useState(title)
    const [editBtnClicked, setEditBtnClicked] = useState(false)
    const [finalTitle, setFinalTitle] = useState(title)

    const toggleEditBtn = () => {
        setEditBtnClicked(!editBtnClicked)
    }

    const onCancelBtnClicked = () => {
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

    const onTodoRadioBtnClicked = (e: any) => {
        completeTodo(id, !completed)
    }

    const renderEditTodo = () => <tr>
        <td className="py-4">
            <Form onSubmit={onSubmitForm}>
                <Row>
                    <Col sm={6}>
                        <Form.Control value={inputValue} onChange={onInputChange} className="mb-2" type="text" />
                    </Col>
                    <Col sm={6}>
                        <Button size="sm" type="submit">Save</Button>
                        <Button size="sm" onClick={onCancelBtnClicked}>Cancel</Button>
                    </Col>
                </Row>
            </Form>
        </td>

    </tr>

    const onDeleteBtnClicked = () => {
        const response = window.confirm("Are you sure, You want to delete this todo?");
        if (response === true) {
            deleteTodo(id)
        }
    }

    const renderTooltip = (props: any) => {
        return (
          <Tooltip id="radio-tooltip" {...props}>
            Mark as completed
          </Tooltip>
        );
      }
    const renderShowTodo = () => <tr 
            onMouseEnter={() => setIsShown(true)}
            onMouseLeave={() => setIsShown(false)}
            className={loading ? `text-muted ${className}` : className}
        >
        <td className="py-4"> 
            <OverlayTrigger
                key="radio-tooltip"
                placement="left"
                delay={{ show: 250, hide: 400 }}
                overlay={renderTooltip}
            >
            <Form.Check 
                checked={completed}
                onClick={onTodoRadioBtnClicked}
                inline
                label={
                    !completed 
                    ? finalTitle 
                    : <del className="text-muted">{finalTitle}</del>
                }
                type={"radio"} 
            />
  </OverlayTrigger>
</td>
            <td>{isShown ?
                (
                    !loading ?
                    <>
                        {!completed && <Button onClick={toggleEditBtn} size="sm">Edit</Button>}
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