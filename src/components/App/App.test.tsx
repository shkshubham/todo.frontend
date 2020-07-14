import React from 'react';
// import { render } from '@testing-library/react';
import {mount, ReactWrapper } from 'enzyme';
import App from './App';
import { equal } from 'assert';

describe("App Testing", () => {
  let wrapper: ReactWrapper<any, Readonly<{}>, React.Component<{}, {}, any>>

  const mockIntersectionObserver: any = class {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  };

  beforeEach(() => {
    window.IntersectionObserver = mockIntersectionObserver;
    wrapper = mount(<App />);
  })

  it('check container class', () => {
    equal(wrapper.find(".container").length, 1);
  });

  it('checking add todo input field', () => {
    equal(wrapper.find("#add-todo-input").length, 1);
  });

  it("adding todo", () => {
    const value = "Test Title";
    const inputField = wrapper.find("#add-todo-input");
    const form = wrapper.find("#add-todo-form").at(0);
    inputField.simulate('change', {target: {value}});
    form.simulate("submit");
    const todoNode = wrapper.find(".todo-item").last()
    equal(todoNode.text(), value)
  })

})