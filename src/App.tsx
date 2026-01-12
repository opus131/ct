import './styles/global.css';

import { Router, Route } from '@solidjs/router';
import type { ParentProps } from 'solid-js';

import { Header } from './components/header';
import { Home } from './routes/home';
import { Trades } from './routes/trades';
import { Politicians } from './routes/politicians';
import { PoliticianDetail } from './routes/politician-detail';
import { PoliticianBio } from './routes/politician-bio';
import { Issuers } from './routes/issuers';
import { IssuerDetail } from './routes/issuer-detail';
import { Committees } from './routes/committees';
import { CommitteeDetail } from './routes/committee-detail';
import { States } from './routes/states';
import { StateDetail } from './routes/state-detail';
import { SportsTeam } from './routes/sports-team';

function Layout(props: ParentProps) {
  return (
    <>
      <Header />
      <main>{props.children}</main>
    </>
  );
}

export default function App() {
  return (
    <Router root={Layout}>
      <Route path="/" component={Home} />
      <Route path="/trades" component={Trades} />
      <Route path="/politicians" component={Politicians} />
      <Route path="/politicians/:id" component={PoliticianDetail} />
      <Route path="/politicians/:id/bio" component={PoliticianBio} />
      <Route path="/issuers" component={Issuers} />
      <Route path="/issuers/:id" component={IssuerDetail} />
      <Route path="/committees" component={Committees} />
      <Route path="/committees/:id" component={CommitteeDetail} />
      <Route path="/states" component={States} />
      <Route path="/states/:id" component={StateDetail} />
      <Route path="/sports/:slug" component={SportsTeam} />
    </Router>
  );
}
