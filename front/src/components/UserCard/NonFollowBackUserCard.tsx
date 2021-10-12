import React, { useState } from 'react';
import { Card, Col, Row, Image, Button, Container } from 'react-bootstrap';
import LazyLoad from 'react-lazyload';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import User from '../../utils/User.d';

import BeforeAddState from './BeforeAddState';
import WaitingAddState from './WaitingAddState';
import AddFailureState from './AddFailureState';
import BeforeUnfollowState from './BeforeUnfollowState';
import WaitingUnfollowState from './WaitingUnfollowState';
import UnfollowFailureState from './UnfollowFailureState';
import UnfollowSuccessState from './UnfollowSuccessState';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
if (!SERVER_URL) console.error('SERVER_URL must be specified');

const WHITELIST_BUTTON_STATE = {
  BEFORE_ADD: new BeforeAddState(),
  WAITING_ADD: new WaitingAddState(),
  FAILURE: new AddFailureState(),
} as const;
type WHITELIST_BUTTON_STATE_T =
  typeof WHITELIST_BUTTON_STATE[keyof typeof WHITELIST_BUTTON_STATE];

const UNFOLLOW_BUTTON_STATE = {
  BEFORE_UNFOLLOW: new BeforeUnfollowState(),
  WAITING_UNFOLLOW: new WaitingUnfollowState(),
  FAILURE: new UnfollowFailureState(),
  SUCCESS: new UnfollowSuccessState(),
} as const;
type UNFOLLOW_BUTTON_STATE_T =
  typeof UNFOLLOW_BUTTON_STATE[keyof typeof UNFOLLOW_BUTTON_STATE];

type Props = {
  user: User;
  towhitelist: (user: User) => void;
};

const NonFollowBackUserCard: React.VFC<Props> = (props: Props) => {
  const { getAccessTokenSilently } = useAuth0();
  const { user, towhitelist } = props;
  const [whitelistButtonState, setWhitelistButtonState] =
    useState<WHITELIST_BUTTON_STATE_T>(WHITELIST_BUTTON_STATE.BEFORE_ADD);
  const [unfollowButtonState, setUnfollowButtonState] =
    useState<UNFOLLOW_BUTTON_STATE_T>(UNFOLLOW_BUTTON_STATE.BEFORE_UNFOLLOW);

  async function toWhitelist() {
    setWhitelistButtonState(WHITELIST_BUTTON_STATE.WAITING_ADD);
    axios
      .put(`${SERVER_URL}/whitelist/${user.id}`, {
        headers: {
          authorization: `Bearer ${await getAccessTokenSilently()}`,
        },
      })
      .then(() => towhitelist(user))
      .catch((e) => {
        setWhitelistButtonState(WHITELIST_BUTTON_STATE.FAILURE);
        console.error(e);
      });
  }

  async function unfollow() {
    setUnfollowButtonState(UNFOLLOW_BUTTON_STATE.WAITING_UNFOLLOW);
    axios
      .delete(`${SERVER_URL}/follow/${user.id}`, {
        headers: {
          authorization: `Bearer ${await getAccessTokenSilently()}`,
        },
      })
      .then(() => setWhitelistButtonState(UNFOLLOW_BUTTON_STATE.SUCCESS))
      .catch((e) => {
        setWhitelistButtonState(UNFOLLOW_BUTTON_STATE.FAILURE);
        console.error(e);
      });
  }

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
      <Card.Footer>
        <Row className="px-2">
          <Col xs="auto" className="px-0 ml-auto">
            <Button
              size="sm"
              variant={whitelistButtonState.variant}
              disabled={whitelistButtonState.disabled}
              onClick={whitelistButtonState.disabled ? undefined : toWhitelist}
            >
              {whitelistButtonState.display}
            </Button>
          </Col>
          <Col xs="auto" className="px-0 ml-auto">
            <Button
              size="sm"
              variant={unfollowButtonState.variant}
              disabled={unfollowButtonState.disabled}
              onClick={unfollowButtonState.disabled ? undefined : unfollow}
            >
              {unfollowButtonState.display}
            </Button>
          </Col>
        </Row>
      </Card.Footer>
    </Card>
  );
};

export default NonFollowBackUserCard;
