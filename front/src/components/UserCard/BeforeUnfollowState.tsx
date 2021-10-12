import React from 'react';
import ButtonState from './ButtonState';

export default class BeforeUnfollowState implements ButtonState {
  display = (<>Unfollow</>);

  variant = 'danger';

  disabled = false;
}
