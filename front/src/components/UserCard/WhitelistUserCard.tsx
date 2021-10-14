import React from 'react';
import { Col, Row } from 'react-bootstrap';
import User from '../../utils/User.d';
import UserCard from './UserCard';
import RemoveButton from './RemoveButton';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
if (!SERVER_URL) console.error('SERVER_URL must be specified');

type Props = {
  user: User;
  remove: (user: User) => void;
};

const WhitelistUserCard: React.VFC<Props> = (props: Props) => {
  const { user, remove } = props;
  return (
    <UserCard user={user}>
      <Row className="px-2">
        <Col xs="auto" className="px-0 ms-auto">
          <RemoveButton
            user_id={user.id}
            resolve={() => {
              remove(user);
            }}
          />
        </Col>
      </Row>
    </UserCard>
  );
};

export default WhitelistUserCard;
