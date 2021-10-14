import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import NonFollowBackUserCard from '../components/UserCard/NonFollowBackUserCard';
import WhitelistUserCard from '../components/UserCard/WhitelistUserCard';
import User from '../utils/User.d';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
if (!SERVER_URL) console.error('SERVER_URL must be specified');
const AUTO_UNFOLLOW_INTERVAL_MS = 500;

const Unfollow: React.VFC = () => {
  const [whitelist, setWhitelist] = useState<User[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [dispatches, setDispatches] = useState<number[]>([]);
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
        setUsers(res.data.non_follow_backs);
        setDispatches(res.data.users.map((user: any, i: any) => i));
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  async function unfollowAll() {
    for (let i = 0; i < dispatches.length; i += 1) {
      const t = dispatches.slice();
      t[i] += 1;
      setDispatches(t);
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
    <>
      <h1>WhiteList</h1>
      {whitelist.map((user) => (
        <WhitelistUserCard user={user} remove={remove} />
      ))}
      <h1>Non-Follow-Backs</h1>
      <Button onClick={() => unfollowAll()}>Auto-Unfollow</Button>
      {users.map((user, i) => (
        <NonFollowBackUserCard
          user={user}
          towhitelist={toWhitelist}
          dispatch={dispatches[i]}
        />
      ))}
    </>
  );
};

export default Unfollow;
