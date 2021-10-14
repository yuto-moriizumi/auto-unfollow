import React, { lazy, Suspense } from 'react';
import { Link, Route, Switch } from 'react-router-dom';
import { Nav, Navbar, Image } from 'react-bootstrap';
import { useAuth0 } from '@auth0/auth0-react';

import ProtectedRoute from './components/ProtectedRoute';

const Index = lazy(() => import('./views/Index'));
const Unfollow = lazy(() => import('./views/Unfollow'));
const NotFound = lazy(() => import('./views/NotFound'));
const LoginButton = lazy(() => import('./components/LoginButton'));
const LogoutButton = lazy(() => import('./components/LogoutButton'));
const ResTypo = lazy(() => import('./components/ResTypo'));

export default function App() {
  const { isLoading, isAuthenticated, user } = useAuth0();
  if (isLoading) return <h1>LOADING</h1>;
  return (
    <Suspense fallback={<h1>LOADING</h1>}>
      <Navbar expand="md" className="px-4">
        <Navbar.Brand>
          <Link to="/">
            <ResTypo as="span" classes={['h3', 'h2', 'h2', 'h2', 'h2']}>
              Auto Unfollow
            </ResTypo>
          </Link>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto my-auto">
            <Nav.Item className="me-1">
              <a
                className="twitter-share-button btn btn-info"
                href="https://twitter.com/share?text=Auto Unfollowで一括フォロー解除！&url=https://shizudaisei-finder-2.yuto-moriizumi.net/&related=kurvarian,YutoMoriizumi&lang=ja&show-count=false"
                target="_blank"
                rel="noreferrer"
              >
                共有する
              </a>
            </Nav.Item>
            {isAuthenticated ? (
              <>
                <Nav.Item className="my-auto">
                  <Image
                    src={user?.picture}
                    alt="ログインしたユーザのサムネイル"
                    thumbnail
                    className="img-fluid"
                    style={{ maxHeight: '5vh' }}
                  />
                </Nav.Item>
                <Nav.Item className="pt-2 mx-2">{user?.nickname}</Nav.Item>
                <Nav.Item>
                  <LogoutButton />
                </Nav.Item>
              </>
            ) : (
              <Nav.Item>
                <LoginButton />
              </Nav.Item>
            )}
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <Switch>
        <Route exact path="/" component={Index} />
        <ProtectedRoute path="/unfollow" component={Unfollow} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}
