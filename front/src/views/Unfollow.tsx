import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import NonFollowBackUserCard from '../components/UserCard/NonFollowBackUserCard';
import WhitelistUserCard from '../components/UserCard/WhitelistUserCard';
import User from '../utils/User.d';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
if (!SERVER_URL) console.error('SERVER_URL must be specified');
const AUTO_UNFOLLOW_INTERVAL_MS = 500;

type DispatchDict = { [key: string]: number };

const Unfollow: React.VFC = () => {
  const [whitelist, setWhitelist] = useState<User[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [dispatches, setDispatches] = useState<DispatchDict>({});
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${SERVER_URL}/users`, {
          headers: {
            authorization: `Bearer ${await getAccessTokenSilently()}`,
          },
        });
        setWhitelist(res.data.whitelist);
        const dict: DispatchDict = {};
        res.data.non_follow_backs.forEach((user: User) => {
          dict[user.id] = 0;
        });
        setDispatches(dict);
        setUsers(res.data.non_follow_backs);
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  async function unfollowAll() {
    const keys = Object.keys(dispatches);
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      const value = dispatches[key] + 1;
      setDispatches({ ...dispatches, key: value });
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) =>
        setTimeout(resolve, AUTO_UNFOLLOW_INTERVAL_MS)
      );
    }
  }

  const toWhitelist = (user: User) => {
    setUsers(users.filter((user2) => user.id !== user2.id));
    setWhitelist(whitelist.concat([user]));
  };

  const remove = (user: User) => {
    setWhitelist(users.filter((user2) => user.id !== user2.id));
    setUsers(users.concat([user]));
  };

  return (
    <Container fluid className="px-4">
      <Container>
        <h1>WhiteList</h1>
      </Container>
      <Row className="mt-2 pt-2 g-4">
        {whitelist.map((user) => (
          <Col key={user.id} className="mt-2">
            <WhitelistUserCard user={user} remove={remove} />
          </Col>
        ))}
      </Row>
      <Container className="mt-2">
        <Row>
          <Col>
            <h1>Non-Follow-Backs</h1>
          </Col>
          <Col>
            <Button onClick={() => unfollowAll()} size="lg">
              Auto-Unfollow
            </Button>
          </Col>
        </Row>
      </Container>
      <Row className="mt-2 pt-2 g-4">
        {users.map((user) => (
          <Col
            xs={12}
            sm={6}
            md={4}
            lg={3}
            xl={2}
            key={user.id}
            className="mt-2"
          >
            <NonFollowBackUserCard
              user={user}
              towhitelist={toWhitelist}
              dispatch={dispatches[user.id]}
            />
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Unfollow;
