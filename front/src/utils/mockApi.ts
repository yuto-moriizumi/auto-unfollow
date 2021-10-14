import axios from 'axios';
import AxiosMockAdapter from 'axios-mock-adapter';
import User from './User.d';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
if (!SERVER_URL) console.error('SERVER_URL must be specified');

export default function enableMock() {
  const mockAxios = new AxiosMockAdapter(axios, { delayResponse: 500 });
  const USERS: User[] = [
    {
      id: '0151029122',
      name: 'Taro Tanaka',
      username: 'TaroTanaka',
      profile_image_url:
        'https://pbs.twimg.com/description_images/1219493965000368129/ObOXnQp7_400x400.jpg',
      description: '今日はいい天気',
    },
    {
      id: '0151029123',
      name: 'Taro Tanaka',
      username: 'TaroTanaka',
      profile_image_url:
        'https://pbs.twimg.com/description_images/1219493965000368129/ObOXnQp7_400x400.jpg',
      description: '今日はいい天気',
    },
  ];

  mockAxios.onGet(`${SERVER_URL}/users`).reply(() => [200, USERS]);
  mockAxios.onGet(`${SERVER_URL}/users/search`).reply(() => [200, USERS]);
  mockAxios.onPost(`${SERVER_URL}/users/follow`).reply(() => [201, null]);
  mockAxios.onGet(`${SERVER_URL}/users/update`).reply(() => [200, null]);
}
