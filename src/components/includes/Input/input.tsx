import { Form, Col, Row } from 'react-bootstrap';
import React, { useState } from 'react';

interface InputFormPropsType {
    onSubmitForm: any;
    inputValue?: string;
    formId: string;
    inputId?: string;
    className?: string;
    children?: any;
    placeholder?: string
    size: any;
}

const InputForm = ({onSubmitForm, inputValue="", formId, inputId, className, children, placeholder="", size}: InputFormPropsType) => {
    const [value, setValue] = useState(inputValue)
    return (
        <Form id={formId} onSubmit={(e: React.FormEvent<HTMLFormElement>) => onSubmitForm(e, value)}>
            <Row>
                <Col xs={size}>

                        <input
                            type="text" 
                            id={inputId}
                            className={className}
                            placeholder={placeholder}
                            maxLength={256}
                            value={value} 
                            onChange={(e) => setValue(e.target.value)} 
                        />
                </Col>
                {children}
            </Row>
        </Form>
    )
}

export default InputForm;