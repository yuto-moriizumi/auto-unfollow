/* eslint-disable react/prop-types */
import React, { useEffect, useRef, useState } from 'react';
import { Button, ButtonProps } from 'react-bootstrap';
import { ButtonVariant } from 'react-bootstrap/esm/types';

type ButtonProfile = {
  display: JSX.Element;
  variant: ButtonVariant;
  disabled: boolean;
};

type Props<T> = {
  size?: ButtonProps['size'];
  onClick: () => Promise<T>;
  resolve?: (value: T) => void;
  reject?: (value: any) => void;
  finallyFnc?: () => void;
  variants: {
    initial: ButtonProfile;
    resolving: ButtonProfile;
    resolved: ButtonProfile;
    rejected: ButtonProfile;
  };
  dispatch?: number;
};
const BUTTON_STATE = {
  initial: 'initial',
  resolving: 'resolving',
  resolved: 'resolved',
  rejected: 'rejected',
} as const;
type BUTTON_STATE_T = typeof BUTTON_STATE[keyof typeof BUTTON_STATE];

export type PromiseButtonComponent = <T>(props: Props<T>) => React.ReactElement;

const PromiseButton: PromiseButtonComponent = (props) => {
  const { size, onClick, resolve, reject, finallyFnc, variants, dispatch } =
    props;
  const [skin, setSkin] = useState<BUTTON_STATE_T>(BUTTON_STATE.initial);

  const promiseFnc = () => {
    setSkin(BUTTON_STATE.resolving);
    onClick()
      .then(
        (v) => {
          setSkin(BUTTON_STATE.resolved);
          if (resolve) resolve(v);
        },
        (v) => {
          setSkin(BUTTON_STATE.rejected);
          if (reject) reject(v);
        }
      )
      .finally(finallyFnc);
  };

  // refをtrueで初期化。
  const ref = useRef(true);

  useEffect(() => {
    // 初回レンダリング時はrefをfalseにして、return。
    if (ref.current) {
      ref.current = false;
      return;
    }
    if (skin !== BUTTON_STATE.initial) return; // 初期状態以外では反応しない
    // 2回目以降に実行される
    promiseFnc();
  }, [dispatch]);

  return (
    <Button
      size={size}
      variant={variants[skin].variant}
      disabled={variants[skin].disabled}
      onClick={variants[skin].disabled ? undefined : promiseFnc}
    >
      {variants[skin].display}
    </Button>
  );
};

export default PromiseButton;
