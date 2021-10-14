import express from 'express';
import jwt from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import Twitter, { TwitterApiReadWrite, UserV2 } from 'twitter-api-v2';
import auth0 from 'auth0';
import ErrorResponse from '../ErrorResponse';

const router = express.Router();

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN ?? 'AUTH0_DOMAIN';
const AUTH0_FQDN = `https://${AUTH0_DOMAIN}/`;
const WHITELIST_NAME = 'auto-unfollow-whitelist'; // ホワイトリスト用に使用するリストの名前

const CONSUMER_KEYSET = {
  appKey: process.env.TWITTER_CONSUMER_KEY ?? 'TWITTER_CONSUMER_KEY',
  appSecret: process.env.TWITTER_CONSUMER_SECRET ?? 'TWITTER_CONSUMER_SECRET',
};

// ダミー
router.get('/', (req, res) => {
  res.status(200).send('Welcome to auto unfollow api server!');
});

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${AUTH0_FQDN}.well-known/jwks.json`,
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: AUTH0_FQDN,
  algorithms: ['RS256'],
});

// express-jwtは、tokenデコード後reqオブジェクトのuserプロパティに結果オブジェクトを格納します
// しかしなぜか型定義が用意されていないのでここで作ります
declare global {
  // eslint-disable-next-line no-unused-vars
  namespace Express {
    // eslint-disable-next-line no-unused-vars
    interface Request {
      user?: {
        sub: string;
      }; // subはユーザのIDです
    }
  }
}

type AuthUser = {
  access_token: string;
  access_token_secret: string;
  user_id: string;
};

/**
 * 認証したユーザのアクセストークンを取得
 * @param {string} auth0_id
 * @param {boolean} [retry=true]
 * @returns {(Promise<AuthUser | ErrorResponse>)}
 */
async function getAuthUser(
  auth0_id: string,
  retry = true
): Promise<AuthUser | ErrorResponse> {
  const { ManagementClient } = auth0;
  const management = new ManagementClient({
    domain: AUTH0_DOMAIN,
    clientId: process.env.AUTH0_BACK_CLIENT_ID,
    clientSecret: process.env.AUTH0_BACK_CLIENT_SECRET,
  });
  try {
    const user = await management.getUser({ id: auth0_id });
    if (!user.identities)
      return new ErrorResponse(401, { error: 'User identities not found' });
    const identity = JSON.parse(JSON.stringify(user.identities[0]));
    return {
      access_token: identity.access_token as string,
      access_token_secret: identity.access_token_secret as string,
      user_id: identity.user_id as string,
    };
  } catch (error: any) {
    if (retry) return getAuthUser(auth0_id, false);
    return new ErrorResponse(429, { error: error.message });
  }
}

/**
 * 一括フォロー対象外ユーザを管理するためのホワイトリストを取得する
 * @param {TwitterApiReadWrite} rwClient Twitterクライアントオブジェクト
 */
async function getWhiteListId(rwClient: TwitterApiReadWrite) {
  const lists = await rwClient.v1.listOwnerships({ count: 1000 });
  const whitelists = lists.lists.filter((list) => list.name === WHITELIST_NAME);
  let whitelist_id: string;
  if (whitelists.length === 0) {
    // 存在しない場合は新規作成
    const list = await rwClient.v2.createList({
      name: WHITELIST_NAME,
      description: 'Whitelist for Auto Unfollow web application.',
      private: true,
    });
    if (list.errors) return new ErrorResponse(500, { errors: list.errors });
    whitelist_id = list.data.id;
  } else {
    whitelist_id = whitelists[0].id_str;
  }
  return whitelist_id;
}

// ホワイトリストユーザの一覧と、非フォロバユーザの一覧を取得
router.get('/users', checkJwt, async (req, res) => {
  if (!req.user) {
    res
      .status(403)
      .send({ errors: ['token does not contain user information'] });
    return;
  }
  try {
    // 認証しているユーザのTwitterアクセストークンを取得
    const auth_user = await getAuthUser(req.user.sub, false);
    if (auth_user instanceof ErrorResponse) {
      res.status(auth_user.status).send(auth_user.body);
      return;
    }

    // Twitterインスタンス化
    const client = new Twitter({
      ...CONSUMER_KEYSET,
      accessToken: auth_user.access_token,
      accessSecret: auth_user.access_token_secret,
    });
    const rwClient = client.readWrite;

    // TODO: ページネーションを使って全フォロワーを取得
    const followings = await rwClient.v2.following(auth_user.user_id, {
      max_results: 1000,
      'user.fields': 'description,profile_image_url',
    });
    const followers = await rwClient.v2.followers(auth_user.user_id, {
      max_results: 1000,
      'user.fields': 'description,profile_image_url',
    });

    // 非フォロバユーザのみをフィルタ
    const nfb_dict = new Map<string, UserV2>();
    followings.data.forEach((user) => nfb_dict.set(user.id, user));
    followers.data.forEach((user) => {
      nfb_dict.delete(user.id);
    });

    // ホワイトリストを取得
    const whitelist_id = await getWhiteListId(rwClient);
    if (whitelist_id instanceof ErrorResponse) {
      res.status(whitelist_id.status).send(whitelist_id.body);
      return;
    }
    const whitelist = await rwClient.v1.listMembers({
      list_id: whitelist_id,
    });

    // ホワイトリストのメンバーをNFBから除外
    whitelist.users.forEach((user) => {
      nfb_dict.delete(user.id_str);
    });

    const non_follow_backs = Array.from(nfb_dict.values());
    // console.log({ non_follow_backs, whitelist: whitelist.users });
    res.send({ non_follow_backs, whitelist: whitelist.users });
  } catch (error) {
    console.error(error);
    res.status(500).send({ errors: error });
  }
});

// フォロー解除
router.delete('/follow/:user_id', checkJwt, async (req, res) => {
  if (!req.user) {
    res
      .status(403)
      .send({ errors: ['token does not contain user information'] });
    return;
  }
  const { user_id } = req.params;

  // 認証しているユーザのTwitterアクセストークンを取得
  const auth_user = await getAuthUser(req.user.sub);
  if (auth_user instanceof ErrorResponse) {
    res.status(auth_user.status).send(auth_user.body);
    return;
  }
  // Twitterインスタンス化
  const client = new Twitter({
    ...CONSUMER_KEYSET,
    accessToken: auth_user.access_token,
    accessSecret: auth_user.access_token_secret,
  });
  const rwClient = client.readWrite;

  try {
    // フォロー解除
    const result = await rwClient.v2.unfollow(auth_user.user_id, user_id);
    if (!result.data.following) {
      res.status(204).send();
      return;
    }
    res.status(500).send({ error: result.errors });
  } catch (error) {
    res.status(500).send({ errors: error });
  }
});

// ホワイトリストにユーザを追加
router.put('/whitelist/:user_id', checkJwt, async (req, res) => {
  if (!req.user) {
    res
      .status(403)
      .send({ errors: ['token does not contain user information'] });
    return;
  }
  const { user_id } = req.params;

  // 認証しているユーザのTwitterアクセストークンを取得
  const auth_user = await getAuthUser(req.user.sub);
  if (auth_user instanceof ErrorResponse) {
    res.status(auth_user.status).send(auth_user.body);
    return;
  }
  // Twitterインスタンス化
  const client = new Twitter({
    ...CONSUMER_KEYSET,
    accessToken: auth_user.access_token,
    accessSecret: auth_user.access_token_secret,
  });
  const rwClient = client.readWrite;

  // ホワイトリストを取得
  const whitelist_id = await getWhiteListId(rwClient);
  if (whitelist_id instanceof ErrorResponse) {
    res.status(whitelist_id.status).send(whitelist_id.body);
    return;
  }

  // ホワイトリストにユーザを追加
  const result = await rwClient.v2.addListMember(whitelist_id, user_id);
  if (result.errors) {
    res.status(500).send({ errors: result.errors });
    return;
  }
  res.status(201).send();
});

// ホワイトリストからユーザを削除
router.delete('/whitelist/:user_id', checkJwt, async (req, res) => {
  if (!req.user) {
    res
      .status(403)
      .send({ errors: ['token does not contain user information'] });
    return;
  }
  const { user_id } = req.params;

  // 認証しているユーザのTwitterアクセストークンを取得
  const auth_user = await getAuthUser(req.user.sub);
  if (auth_user instanceof ErrorResponse) {
    res.status(auth_user.status).send(auth_user.body);
    return;
  }
  // Twitterインスタンス化
  const client = new Twitter({
    ...CONSUMER_KEYSET,
    accessToken: auth_user.access_token,
    accessSecret: auth_user.access_token_secret,
  });
  const rwClient = client.readWrite;

  // ホワイトリストを取得
  const whitelist_id = await getWhiteListId(rwClient);
  if (whitelist_id instanceof ErrorResponse) {
    res.status(whitelist_id.status).send(whitelist_id.body);
    return;
  }

  // ホワイトリストからユーザを削除
  const result = await rwClient.v2.removeListMember(whitelist_id, user_id);
  if (result.errors) {
    res.status(500).send({ errors: result.errors });
    return;
  }
  res.status(204).send();
});

export default router;
