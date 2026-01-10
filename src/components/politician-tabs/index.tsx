import './style.css';

import { A, useLocation } from '@solidjs/router';

type Props = {
  politicianId: string;
};

export function PoliticianTabs(props: Props) {
  const location = useLocation();
  const isBioPage = () => location.pathname.endsWith('/bio');

  return (
    <nav class="politician-tabs">
      <A
        href={`/politicians/${props.politicianId}`}
        class="politician-tabs--tab"
        classList={{ active: !isBioPage() }}
        end
      >
        Trading Activity
      </A>
      <A
        href={`/politicians/${props.politicianId}/bio`}
        class="politician-tabs--tab"
        classList={{ active: isBioPage() }}
      >
        Biography
      </A>
    </nav>
  );
}
