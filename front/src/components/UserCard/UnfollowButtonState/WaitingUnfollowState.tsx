import React from 'react';
import { Spinner } from 'react-bootstrap';
import ButtonState from '../ButtonState';

export default class WaitingUnfollowState implements ButtonState {
  display = (
    <Spinner
      as="span"
      animation="border"
      size="sm"
      role="status"
      aria-hidden="true"
    />
  );

  variant = 'danger';

  disabled = true;
}
