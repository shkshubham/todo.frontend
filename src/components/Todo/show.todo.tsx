import React, { useState, useMemo } from 'react';
import { TodoType, APIStatusType, APIStatusUpdateType, UpdateTodoType } from '../../types';
import { Button, Form, Col, Row, OverlayTrigger, Tooltip } from 'react-bootstrap';
import TodoContext from '../../contexts/todo.context';
import Loader from '../includes/Loader/loader';


interface ShowTodoPropsTypes {
    todo: TodoType;
    setLastTodoElement: React.Dispatch<React.SetStateAction<HTMLTableRowElement | null>>;
}

const ShowTodo = ({todo: {title, id, completed}, setLastTodoElement}: ShowTodoPropsTypes) => {
    const initialApiStatus = useMemo(() =>{
        return {
            loading: false,
            error: false,
            done: false
        }
    }, [])
    const { todos, pagination, service } = TodoContext.useContainer()
    const [isShown, setIsShown] = useState(false);
    const className = "todo-item";
    const [inputValue, setInputValue] = useState(title)
    const [editBtnClicked, setEditBtnClicked] = useState(false)
    const [updateStatus, setUpdateStatus] = useState<APIStatusType>(initialApiStatus);
    const [completeStatus, setCompleteStatus] = useState<APIStatusType>(initialApiStatus);
    const [deleteStatus, setDeleteStatus] = useState<APIStatusType>(initialApiStatus);
    const [isTodoCompleted, setIsTodoCompleted] = useState(completed);

    /**
     * Toggle Edit Button
     *
     * @description To toggle the edit and cancel button.
     *   
    */
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

    /**
     * Set Api Status Callback Function
     *
     * @description For setting the state for updateStatus, deleteStatus & completeStatus.
     *   
     * @param previousStatus: Previous state of updateStatus, deleteStatus & completeStatus.
     * @param newUpdatedState: New object to update state of updateStatus, deleteStatus & completeStatus.
     *
     * @returns {APIStatusType}
    */
    const setApiStatusCallback = (previousStatus: APIStatusType, newUpdatedState: APIStatusUpdateType) => {
        return {...previousStatus, ...newUpdatedState}
    }

    /**
     * Api Processing Callback Function
     *
     * @description To set state before api is called for updateStatus, deleteStatus & completeStatus.
     *   
     * @param previousStatus: Previous state of updateStatus, deleteStatus & completeStatus.
     *
     * @returns {APIStatusType}
    */
    const apiProcessingCallback  = (previousStatus: APIStatusType) => {
        return setApiStatusCallback(previousStatus, {loading: true})
    }

    /**
     * Api Success Callback Function
     *
     * @description To set state after api is resolved for updateStatus, deleteStatus & completeStatus.
     *   
     * @param previousStatus: Previous state of updateStatus, deleteStatus & completeStatus.
     *
     * @returns {APIStatusType}
    */
    const apiSuccessCallback = (previousStatus: APIStatusType) => {
        return setApiStatusCallback(previousStatus, {loading: false, done: true})
    }

    /**
     * Api Error Callback Function
     *
     * @description To set state after api is rejected for updateStatus, deleteStatus & completeStatus.
     *   
     * @param previousStatus: Previous state of updateStatus, deleteStatus & completeStatus.
     *
     * @returns {APIStatusType}
    */
    const apiErrorCallback = (previousStatus: APIStatusType) => {
        return setApiStatusCallback(previousStatus, {error: true})
    }
 
    /**
     * Alter Todo
     *
     * @description To update, complete & Delete todo.
     *   
     * @param id: Data to update in todo.
     * @param data: Id of todo.
     * @param setCallback: setState Function (setUpdateStatus | setCompleteStatus | setDeleteStatus).
     * @param method: http method.
     *
     * @returns {Promise<TodoType>}
    */
    const alterTodo = (id: string, data: UpdateTodoType, setCallback: React.Dispatch<React.SetStateAction<APIStatusType>>, method="PATCH"): Promise<TodoType> => {
        return new Promise(async (resolve) => {
            setCallback(apiProcessingCallback)
            try {
                const response: TodoType = await service.updateOrDelete(method, id, data);
                setCallback(apiSuccessCallback)
                resolve(response)
            } catch(err) {
                setCallback(apiErrorCallback)
            }
        })
    }

    /**
     * Complete Todo
     *
     * @description To change complete status of todo.
     *   
     * @param data: Id of todo.
     * @param completed: completed status of todo.
     *
    */
    const completeTodo = async(id: string, completed: boolean) => {
        alterTodo(id, {completed}, setCompleteStatus, "DELETE").then((response) => {
            setIsTodoCompleted(response.completed)
        })
    }

    /**
     * On Submit Todo Update Form
     *
     * @description To update todo.
     *   
     * @param e: Form submit event
     *
    */
    const onSubmitTodoUpdateForm = (e: React.SyntheticEvent) => {
        e.preventDefault()
        alterTodo(id, {title: inputValue}, setUpdateStatus)
        toggleEditBtn();
    }

    /**
     * Check Api Status
     *
     * @description To check api (loading & error) status of on updating, deleting & changing complete status.
     *   
     * @param type: (loading | error) 
     *     
     * @returns {boolean}
     *
    */
    const checkApiStatus = (type: string) => {
        return deleteStatus[type] || updateStatus[type] || completeStatus[type];
    }

    /**
     * On Todo Radio Button Clicked
     *
     * @description To change complete status of todo.
     *   
     * @param e: Event
     *
    */
    const onTodoRadioBtnClicked = (e: any) => {
        !checkApiStatus("loading") && completeTodo(id, !isTodoCompleted)
    }

    /**
     * On Delete Button Clicked
     *
     * @description To alert user after delete button is clicked.
     *   
    */
    const onDeleteBtnClicked = () => {
        const response = window.confirm("Are you sure, You want to delete this todo?");
        if (response === true) {
            alterTodo(id, {}, setDeleteStatus, "DELETE")
        }
    }

    /**
     * Render Tooltip
     *
     * @description Use to render tooltip.
     *   
     * @param props: Props for tooltip
     *
    */
    const renderTooltip = (props: any) => {
        return (
          <Tooltip id="radio-tooltip" {...props}>
              {
                  !checkApiStatus("loading")  ?
                  `Mark as ${isTodoCompleted ? "not completed" : "completed"}`
                  : !checkApiStatus("error") ? "Wait" : "Failed"
              }

          </Tooltip>
        );
    }

    /**
     * Render Tooltip
     *
     * @description Use to render tooltip.
     *   
     * @param props: Props for tooltip
     *
    */
    const onTryAgainBtnClicked = () => {
        setDeleteStatus(initialApiStatus)
        setUpdateStatus(initialApiStatus)
        // editTodo(id, inputValue)
        alterTodo(id, {title: inputValue, completed: isTodoCompleted }, setUpdateStatus)
    }

    /**
     * Render Edit Todo
     *
     * @description To render edit todo section.
     *   
    */
    const renderEditTodo = () => {
        return (
            <tr>
                <td className="py-4">
                    <Form onSubmit={onSubmitTodoUpdateForm}>
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
        )
    }

    /**
     * Render Show Todo
     *
     * @description To render todo section.
     *   
    */
    const renderShowTodo = () => {
        return (
            <tr 
                ref={(el) => todos.length && todos[todos.length -1].id === id && todos.length >= pagination.limit && setLastTodoElement(el)}
                onMouseEnter={() => setIsShown(true)}
                onMouseLeave={() => setIsShown(false)}
                className={checkApiStatus("loading")  ? `text-muted ${className}` : className}
            >
            <td className="py-4"> 
                <OverlayTrigger
                    key="radio-tooltip"
                    placement="left"
                    delay={{ show: 250, hide: 400 }}
                    overlay={renderTooltip}
                >
                <Form.Check 
                    disabled={checkApiStatus("error")}
                    defaultChecked={isTodoCompleted}
                    onClick={onTodoRadioBtnClicked}
                    inline
                    label={
                        <div className={checkApiStatus("error") ? "text-danger" : ""}>
                            {
                                !isTodoCompleted 
                                ? inputValue 
                                : <del className="text-muted">{inputValue}</del>
                            }
                        </div>
                    }
                    type={"radio"} 
                />
                </OverlayTrigger>
            </td>
                <td>{isShown ?
                    (
                        !checkApiStatus("loading") ?
                        <>
                            {!completed && <Button onClick={toggleEditBtn} size="sm">Edit</Button>}
                            <Button size="sm" variant="danger" onClick={onDeleteBtnClicked}>Delete</Button>
                        </>
                        : 
                        checkApiStatus("error")
                            ? <Button onClick={onTryAgainBtnClicked} variant="danger" size="sm">Try Again</Button>
                            : <Loader />
                        
                    )
                    : null}</td>
            </tr>
        )
    }

    /**
     * Main Return
    */
    return !deleteStatus.done ? (
        <>
            {!editBtnClicked ? renderShowTodo() : renderEditTodo()}
        </>
    ) : null
}

export default ShowTodo;