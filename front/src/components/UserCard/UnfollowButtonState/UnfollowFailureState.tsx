import React from 'react';
import ButtonState from '../ButtonState';

export default class UnfollowFailureState implements ButtonState {
  display = (<>Failure</>);

  variant = 'warning';

  disabled = true;
}
