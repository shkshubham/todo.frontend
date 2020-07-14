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

const InputForm = ({
        onSubmitForm,
        inputValue="",
        formId,
        inputId,
        className,
        children,
        placeholder="",
        size
    }: InputFormPropsType) => {
    const [value, setValue] = useState(inputValue)

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        setValue("")
        onSubmitForm(e, value);
    }

    return (
        <Form id={formId} onSubmit={(e: React.FormEvent<HTMLFormElement>) => onSubmit(e)}>
            <Row>
                <Col xs={12} sm={size}>

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