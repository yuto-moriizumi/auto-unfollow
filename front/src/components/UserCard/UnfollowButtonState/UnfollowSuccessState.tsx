import React from 'react';
import ButtonState from '../ButtonState';

export default class UnfollowSuccessState implements ButtonState {
  display = (<>Unfollowed</>);

  variant = 'success';

  disabled = true;
}
