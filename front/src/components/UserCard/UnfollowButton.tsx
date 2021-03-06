import { useAuth0 } from '@auth0/auth0-react';
import axios, { AxiosResponse } from 'axios';
import React from 'react';
import { ButtonProps, Spinner } from 'react-bootstrap';
import PromiseButton from './PromiseButton';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
if (!SERVER_URL) console.error('SERVER_URL must be specified');

type Props = {
  size?: ButtonProps['size'];
  user_id: string;
  dispatch?: number;
};

const UnfollowButton = ({ size, user_id, dispatch }: Props) => {
  const { getAccessTokenSilently } = useAuth0();

  return (
    <PromiseButton<AxiosResponse<any>>
      size={size}
      dispatch={dispatch}
      variants={{
        initial: {
          variant: 'primary',
          display: <>Unfollow</>,
          disabled: false,
        },
        resolving: {
          variant: 'primary',
          display: (
            <Spinner
              as="span"
              animation="border"
              role="status"
              aria-hidden="true"
            />
          ),
          disabled: true,
        },
        resolved: {
          variant: 'success',
          display: <>Unfollowed</>,
          disabled: true,
        },
        rejected: {
          variant: 'danger',
          display: <>Error</>,
          disabled: true,
        },
      }}
      onClick={async () =>
        axios.delete(`${SERVER_URL}/follow/${user_id}`, {
          headers: {
            authorization: `Bearer ${await getAccessTokenSilently()}`,
          },
        })
      }
      reject={(e) => console.error(e)}
    />
  );
};
UnfollowButton.defaultProps = {
  size: undefined,
  dispatch: 0,
};
export default UnfollowButton;
