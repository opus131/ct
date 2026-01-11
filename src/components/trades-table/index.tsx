import './style.css';

import { For } from 'solid-js';

import type { Trade } from '../../data/types';
import { TradeTooltip } from '../ai/trade-tooltip';
import { MemeGenerator } from '../ai/meme-generator';
import { getIssuerLogoUrl } from '../../data/issuer-logos';
import { deriveTradeLabels } from '../../data/trade-labels';
import { TradeLabelBadge } from '../trade-label-badge';

type Props = {
  trades: Trade[];
  compact?: boolean;
  showAIInsights?: boolean;
  hidePolitician?: boolean;
};

export function TradesTable(props: Props) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };

  return (
    <div class="trades-table" classList={{ compact: props.compact }}>
      <table>
        <thead>
          <tr>
            {!props.hidePolitician && <th>Politician</th>}
            <th>Traded Issuer</th>
            {!props.compact && <th>Published</th>}
            <th>Traded</th>
            {!props.compact && <th>Filed After</th>}
            {!props.compact && <th>Owner</th>}
            <th>Type</th>
            <th>Size</th>
            {!props.compact && <th>Labels</th>}
            {!props.compact && <th>Price</th>}
            {props.showAIInsights && <th class="ai-col">AI</th>}
          </tr>
        </thead>
        <tbody>
          {props.trades.map((trade) => (
            <tr>
              {!props.hidePolitician && (
                <td class="politician-cell">
                  <div class="politician-wrapper">
                    <img src={trade.politician.photoUrl} alt={trade.politician.name} />
                    <div class="politician-info">
                      <span class="name">{trade.politician.name}</span>
                      <span class="meta">
                        <span classList={{ democrat: trade.politician.party === 'Democrat', republican: trade.politician.party === 'Republican' }}>
                          {trade.politician.party === 'Democrat' ? 'D' : 'R'}
                        </span>
                        {' | '}{trade.politician.chamber}{' | '}{trade.politician.state}
                      </span>
                    </div>
                  </div>
                </td>
              )}
              <td class="issuer-cell">
                <div class="issuer-wrapper">
                  {(() => {
                    const logoUrl = getIssuerLogoUrl(trade.issuer.ticker);
                    return logoUrl ? (
                      <img src={logoUrl} alt={trade.issuer.ticker} class="issuer-logo" />
                    ) : (
                      <div class="issuer-badge">{trade.issuer.ticker?.[0] || trade.issuer.name[0]}</div>
                    );
                  })()}
                  <div class="issuer-info">
                    <span class="name">{trade.issuer.name}</span>
                    <span class="ticker">{trade.issuer.ticker}</span>
                  </div>
                </div>
              </td>
              {!props.compact && (
                <td class="date-cell">
                  <span class="time">{trade.publishedAt.split(' ')[1] || ''}</span>
                  <span class="date">{trade.publishedAt.split(' ')[0] === 'Yesterday' ? 'Yesterday' : formatDate(trade.publishedAt.split(' ')[0])}</span>
                </td>
              )}
              <td class="date-cell">
                <span class="date">{formatDate(trade.tradedAt)}</span>
              </td>
              {!props.compact && (
                <td class="filed-cell">
                  <span class="days">{trade.filedAfterDays}</span>
                  <span class="label">days</span>
                </td>
              )}
              {!props.compact && (
                <td class="owner-cell">{trade.owner}</td>
              )}
              <td>
                <span class="trade-type" classList={{ buy: trade.type === 'buy', sell: trade.type === 'sell' }}>
                  {trade.type.toUpperCase()}
                </span>
              </td>
              <td class="size-cell">
                <span class="size-badge">{trade.sizeRange}</span>
              </td>
              {!props.compact && (
                <td class="labels-cell">
                  <div class="labels-wrapper">
                    <For each={deriveTradeLabels(trade)}>
                      {(labelId) => <TradeLabelBadge labelId={labelId} size="sm" />}
                    </For>
                  </div>
                </td>
              )}
              {!props.compact && (
                <td class="price-cell">
                  {trade.price ? `$${trade.price.toLocaleString()}` : 'N/A'}
                </td>
              )}
              {props.showAIInsights && (
                <td class="ai-cell">
                  <div class="ai-wrapper">
                    <TradeTooltip trade={trade} />
                    <MemeGenerator trade={trade} />
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
