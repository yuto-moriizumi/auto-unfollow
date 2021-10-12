import React, { lazy } from 'react';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PromiseButton from '../components/UserCard/PromiseButton';

const ResTypo = lazy(() => import('../components/ResTypo'));

const Index: React.VFC = () => (
  <>
    <Helmet>
      <title>Auto Unfollow トップ</title>
      <meta
        name="description"
        content="Twitterユーザーを一括フォロー解除できる便利なアプリ"
      />
    </Helmet>
    <div className="bg-light p-3 p-sm-5 my-4 rounded text-center">
      <ResTypo classes={['h3', 'h1', 'display-4', 'display-2', 'display-1']}>
        Auto Unfollow
      </ResTypo>
      <ResTypo as="p" classes={['h6', 'h5', 'h4', 'h3', 'h2']}>
        Auto
        Unfollowは、Twitterユーザーを一括フォロー解除できる便利なアプリです。
      </ResTypo>
      <Link to="unfollow">
        <Button size="lg">Twitterでログイン</Button>
      </Link>
      <br />
      <br />
      <br />
      <br />
      <PromiseButton<string>
        variants={{
          initial: {
            variant: 'primary',
            display: <>initial</>,
            disabled: false,
          },
          resolving: {
            variant: 'primary',
            display: <>resolving</>,
            disabled: true,
          },
          resolved: {
            variant: 'success',
            display: <>resolved</>,
            disabled: true,
          },
          rejected: {
            variant: 'danger',
            display: <>rejected</>,
            disabled: true,
          },
        }}
        onClick={async () => {
          console.log('HEAVY PROCESS START');
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return 'test';
        }}
        resolve={(res: string) => {
          console.log(`HEAVY PROCESS END with ${res}`);
        }}
      />
      <p className="mt-3">
        ©2021 森泉友登
        <address>
          <a href="https://twitter.com/YutoMoriizumi" className="mr-3">
            Twitter
          </a>
          <a href="https://github.com/yuto-moriizumi/auto-unfollow">Github</a>
        </address>
      </p>
    </div>
  </>
);

export default Index;
