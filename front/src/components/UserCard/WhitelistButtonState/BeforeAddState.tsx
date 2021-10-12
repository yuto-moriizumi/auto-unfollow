import React from 'react';
import ButtonState from '../ButtonState';

export default class BeforeAddState implements ButtonState {
  display = (<>To Whitelist</>);

  variant = 'primary';

  disabled = false;
}
