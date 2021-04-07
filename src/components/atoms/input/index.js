/* eslint-disable prettier/prettier */
/* @flow */
import * as React from 'react';
import {TextInput} from 'react-native';
import classnames from 'classnames';

import styles from './style.js';

export const InputType = {
  TEXT: 'text',
  Password: 'password',
  SUBMIT: 'submit',
};

export const InputTheme = {
  DEFAULT: 'default',
  ROUNDED: 'rounded',
  BOUNDERED:'boundered',
};

export const InputSize = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
};


const Input = (props) => {
  const {type, onClick, children, theme, size, className, disabled} = props;
 
  return (
    <TextInput
      type={type}
      onClick={onClick}
      disabled={disabled}
     >
      {children}
    </TextInput>
  );
};

Input.defaultProps = {
  type: InputType.TEXT,
  theme: InputTheme.DEFAULT,
  size: InputSize.MEDIUM,
  onClick: () => {},
  className: '',
  disabled: false,
};

export default Input;
