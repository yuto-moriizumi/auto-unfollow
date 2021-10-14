import React from 'react';
import { Col, Row } from 'react-bootstrap';
import User from '../../utils/User.d';

import UserCard from './UserCard';
import ToWhitelistButton from './ToWhitelistButton';
import UnfollowButton from './UnfollowButton';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
if (!SERVER_URL) console.error('SERVER_URL must be specified');

type Props = {
  user: User;
  towhitelist: (user: User) => void;
  dispatch?: number;
};

const NonFollowBackUserCard: React.VFC<Props> = (props: Props) => {
  const { user, towhitelist, dispatch } = props;

  return (
    <UserCard user={user}>
      <Row className="px-2">
        <Col xs="auto" className="px-0 ms-auto">
          <ToWhitelistButton
            user_id={user.id}
            resolve={() => towhitelist(user)}
          />
        </Col>
        <Col xs="auto" className="px-0 ms-auto">
          <UnfollowButton user_id={user.id} dispatch={dispatch} />
        </Col>
      </Row>
    </UserCard>
  );
};
NonFollowBackUserCard.defaultProps = { dispatch: 0 };

export default NonFollowBackUserCard;
