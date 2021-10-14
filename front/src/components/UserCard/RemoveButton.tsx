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
  resolve: () => void;
};

const RemoveButton = ({ size, user_id, resolve }: Props) => {
  const { getAccessTokenSilently } = useAuth0();
  return (
    <PromiseButton<AxiosResponse<any>>
      size={size}
      variants={{
        initial: {
          variant: 'primary',
          display: <>Remove</>,
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
          variant: 'primary',
          display: <>Moved</>,
          disabled: true,
        },
        rejected: {
          variant: 'danger',
          display: <>Error</>,
          disabled: true,
        },
      }}
      onClick={async () =>
        axios.delete(`${SERVER_URL}/whitelist/${user_id}`, {
          headers: {
            authorization: `Bearer ${await getAccessTokenSilently()}`,
          },
        })
      }
      resolve={resolve}
      reject={(e) => console.error(e)}
    />
  );
};
RemoveButton.defaultProps = {
  size: undefined,
};
export default RemoveButton;
