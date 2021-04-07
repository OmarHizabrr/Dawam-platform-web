/* eslint-disable prettier/prettier */
/* @flow */
import * as React from 'react';
import {Image} from 'react-native';
import classnames from 'classnames';

import styles from './style.js';



export const ImageTheme = {
  DEFAULT: 'default',
  ROUNDED: 'rounded',
  BOUNDERED:'boundered',
  CORNERROUNDED:'corner-rounded',
};

export const ImageSize = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
};

const Props = {
  theme: string,
  size: string,
  onClick: Function,
  children: React.Node,
  className: string,
  disabled: boolean,
};

const Image = (props) => {
  const {type, onClick, children, theme, size, className, disabled} = props;
  const classProps: string = classnames(
    styles.input,
    styles[theme],
    styles[size],
    {
      [styles.disabled]: disabled,
    },
    className,
  );

  return (
    <Image
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classProps}/>
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

export default Image;
