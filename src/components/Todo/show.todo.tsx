import React, { useState, useMemo, memo } from 'react';
import { TodoType, APIStatusType, APIStatusUpdateType, UpdateTodoType } from '../../types';
import { Button, Form, Col, Row } from 'react-bootstrap';
import TodoContext from '../../contexts/todo.context';
import Loader from '../includes/Loader/loader';

interface ShowTodoPropsTypes {
    todo: TodoType;
    setLastTodoElement: any;
    addingTodoLoading: boolean;
    addingTodoError: boolean;
}

const ShowTodo = ({todo: {title, id, completed, joke}, setLastTodoElement, addingTodoLoading, addingTodoError}: ShowTodoPropsTypes) => {
    const initialApiStatus = useMemo(() =>{
        return {
            loading: false,
            error: false,
            done: false
        }
    }, [])
    const { todos, pagination, service, setPagination, addTodo, setNewAddedTodos, setCount } = TodoContext.useContainer()
    const [showToolbar, setShowToolbar] = useState(false);
    const [inputValue, setInputValue] = useState(title)
    const [editBtnClicked, setEditBtnClicked] = useState(false)
    const [updateStatus, setUpdateStatus] = useState<APIStatusType>(initialApiStatus);
    const [completeStatus, setCompleteStatus] = useState<APIStatusType>(initialApiStatus);
    const [deleteStatus, setDeleteStatus] = useState<APIStatusType>(initialApiStatus);
    const [isTodoCompleted, setIsTodoCompleted] = useState(completed);
    const [eventType, setEventType] = useState("none");
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
        setEventType(method)
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
        setEventType("PATCH")
        alterTodo(id, {completed}, setCompleteStatus).then((response) => {
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
     * @description To check api (loading & error) status of updating, deleting & changing complete status.
     *   
     * @param type: (loading | error) 
     *     
     * @returns {boolean}
     *
    */
    const checkApiStatus = (type: string) => {
        return deleteStatus[type] || updateStatus[type] || completeStatus[type] || (type === "loading" ? addingTodoLoading : addingTodoError);
    }

    const isError = checkApiStatus("error");
    const isLoading = checkApiStatus("loading");

    /**
     * On Todo Radio Button Clicked
     *
     * @description To change complete status of todo.
     *   
     * @param e: Event
     *
    */
    const onCompleteBtnClicked = () => {
        !isLoading && completeTodo(id, !isTodoCompleted)
    }

    /**
     * On Delete Button Clicked
     *
     * @description To alert user after delete button is clicked.
     *   
    */
    const onDeleteBtnClicked = () => {
        const response = window.confirm("Are you sure?");
        if (response === true) {
            alterTodo(id, {}, setDeleteStatus, "DELETE").then(() => {
                setCount((previousState => {
                    return {...previousState, total: previousState.total - 1}
                }))
                setPagination(previousPagination=> {
                    return {
                        ...previousPagination,
                        total: previousPagination.total - 1
                    }
                })
            })
        }
    }

    /**
     * On Try Again Button clicked 
     *
     * @description To retry the api call for update, delete and changing complete status.
     *   
     * @param props: Props for tooltip
     *
    */
    const onTryAgainBtnClicked = () => {
        setDeleteStatus(initialApiStatus)
        setUpdateStatus(initialApiStatus)
        if(typeof id === "number") {
            if(eventType === "PATCH") {
                alterTodo(id, {title: inputValue, completed: isTodoCompleted }, setUpdateStatus)
            } else {
                alterTodo(id, {}, setDeleteStatus, "DELETE")
            }
        } else {
            setNewAddedTodos(previousState => {
                delete previousState[id]
                return {...previousState};
            })
            addTodo({title, completed}, id)
        }
    }
    /**
     * Render Edit Todo
     *
     * @description To render edit todo section.
     *   
    */
    const renderEditTodo = () => {
        return (
            <Col xs={12}>
                <Form onSubmit={onSubmitTodoUpdateForm}>
                    <Row>
                        <Col xs={10}>
                            <input 
                                maxLength={256}
                                type="text" 
                                value={inputValue}
                                onChange={onInputChange}
                                className="mb-2 todo-input edit-todo rounded border"
                            />
                        </Col>
                        <Col sm={2}>
                            <div className="py-2 d-flex justify-content-end">
                                <Button className="mx-2" size="sm" variant="success" type="submit">Save</Button>
                                <Button size="sm" variant="danger" onClick={onCancelBtnClicked}>Cancel</Button>
                            </div>
                        </Col>
                    </Row>
                </Form>
            </Col>
        )
    }

    /**
     * Render Show Todo
     *
     * @description To render show todo section.
     *   
    */
    const renderShowTodo = () => {
        return (
            <>
            <Col xs={10}>
                <div className="d-flex">
                    <button onClick={onCompleteBtnClicked} className="btn btn-circle complete-btn">
                        <i className={isTodoCompleted ? `completed-check far fa-check-square` : "far fa-square"}></i>
                    </button>
                     <div className="py-1">
                        {
                            !isTodoCompleted 
                            ? inputValue 
                            : <del className="text-muted">{inputValue}</del>
                        }
                     </div>
                </div>
            </Col>
            <Col xs={2}>
              {  
                  !isError
                      ? (showToolbar && !isLoading) && 
                      <div className={"d-flex justify-content-end visible"}>
                          <button onClick={toggleEditBtn} className="btn btn-circle">
                              <i className="fas fa-pencil-alt"></i>
                          </button>
                          <button onClick={onDeleteBtnClicked} className="btn btn-circle">
                              <i className="far fa-trash-alt"></i>
                          </button>
                          
                      </div>
                      : <div className="d-flex justify-content-end text-center">
                          <button onClick={onTryAgainBtnClicked} className="btn btn-circle">
                              <i className="fas fa-redo"></i>
                          </button>
                      </div>
              }
               {
                  (isLoading && !isError) && 
                      <Loader />
              }
          </Col>
          </>
        )
    }

    /**
     * Set Additional Classes
     *
     * @description To check api (loading & error) status of updating, deleting & changing complete status.
     *   
     * @param type: (loading | error) 
     *     
     * @returns {boolean}
     *
    */
    // const additionalClass = isError ? "failed" : isLoading ? "disabled text-muted" : isTodoCompleted ? "completed" : "incomplete";

    const additionalClass = () => {
        if(isError) {
            return "failed"
        } else if(isLoading) {
            return "disabled text-muted"
        } else if(isTodoCompleted) {
            return "completed"
        } else if(joke) {
            return "todo-joke no-pointer"
        } else {
            return "incomplete"
        }
    }
    /**
     * Main Return
    */
    return !deleteStatus.done ? (
        <>
            <div 
                ref={(el) => todos.length && todos[todos.length -1].id === id && todos.length >= pagination.limit && setLastTodoElement(el)}
                className={`todo-container word-break-all ${additionalClass()}`} 
                onMouseEnter={() => setShowToolbar(true)} 
                onMouseLeave={() => setShowToolbar(false)}
            >
            <Row className="todo-text">
                {
                    !editBtnClicked ? renderShowTodo() : renderEditTodo()
                }
            </Row>
            </div>
        </>
    ) : null
}

export default memo(ShowTodo);