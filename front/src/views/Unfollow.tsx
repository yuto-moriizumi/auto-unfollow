import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import NonFollowBackUserCard from '../components/UserCard/NonFollowBackUserCard';
import User from '../utils/User.d';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
if (!SERVER_URL) console.error('SERVER_URL must be specified');
const AUTO_UNFOLLOW_INTERVAL_MS = 500;

const Unfollow: React.VFC = () => {
  const [whitelist, setWhitelist] = useState<User[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    axios
      .get(`${SERVER_URL}/users`)
      .then((res) => {
        setWhitelist(res.data.whitelist);
        setUsers(res.data.users);
      })
      .catch((e) => console.error(e));
  }, []);

  async function unfollowAll() {
    // eslint-disable-next-line no-restricted-syntax
    for (const user of users) {
      unfollow(user);
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

  return (
    <>
      <h1>WhiteList</h1>
      {whitelist.map((user) => (
        <UserCard user={user} />
      ))}
      <h1>Non-Follow-Backs</h1>
      <Button onClick={() => unfollowAll()}>Auto-Unfollow</Button>
      {users.map((user) => (
        <NonFollowBackUserCard user={user} towhitelist={toWhitelist} />
      ))}
    </>
  );
};

export default Unfollow;
