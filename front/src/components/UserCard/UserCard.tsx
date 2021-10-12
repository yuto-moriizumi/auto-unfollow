import React from 'react';
import { Card, Col, Row, Image, Container } from 'react-bootstrap';
import LazyLoad from 'react-lazyload';
import User from '../../utils/User.d';

type Props = {
  user: User;
};

const UserCard: React.FC<Props> = (props) => {
  const { user, children } = props;

  return (
    <Card key={user.id} className="mb-4">
      <Card.Header className="p-2">
        <Container fluid>
          <Row>
            <Col className="px-0" xs="2">
              <LazyLoad height={48}>
                <Image
                  fluid
                  src={user.img_url}
                  alt={`${user.screen_name}のサムネイル`}
                  style={{ maxHeight: '48px' }}
                  width="48px"
                  height="48px"
                />
              </LazyLoad>
            </Col>
            <Col className="pl-1 pr-0" xs="10">
              <Card.Link
                href={`https://twitter.com/${user.screen_name}`}
                target="_blank"
              >
                <h6 className="mb-0">{user.name}</h6>
                <small>@{user.screen_name}</small>
              </Card.Link>
            </Col>
          </Row>
        </Container>
      </Card.Header>
      <Card.Body className="p-3">{user.profile}</Card.Body>
      <Card.Footer>{children}</Card.Footer>
    </Card>
  );
};

export default UserCard;
