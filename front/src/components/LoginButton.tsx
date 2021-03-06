import React from 'react';
import { Auth0ContextInterface, withAuth0 } from '@auth0/auth0-react';
import { Button } from 'react-bootstrap';

type Props = {
  auth0: Auth0ContextInterface;
};
class LoginButton extends React.Component<Props, {}> {
  render() {
    const { auth0 } = this.props;
    const { loginWithRedirect } = auth0;
    return (
      <Button variant="primary" onClick={() => loginWithRedirect()}>
        ログイン
      </Button>
    );
  }
}

export default withAuth0(LoginButton);
