import React, { lazy } from 'react';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

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
    <div className="bg-light p-3 p-sm-5 rounded text-center">
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
      <div className="mt-3">
        ©2021 森泉友登
        <address>
          <p>
            <a href="https://twitter.com/YutoMoriizumi" className="me-1">
              Twitter
            </a>
            <a href="https://github.com/yuto-moriizumi/auto-unfollow">Github</a>
          </p>
        </address>
      </div>
    </div>
  </>
);

export default Index;
