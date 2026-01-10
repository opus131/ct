import './style.css';

type Props = {
  searchPlaceholder?: string;
  secondaryPlaceholder?: string;
  filters?: string[];
};

export function FilterBar(props: Props) {
  return (
    <div class="filter-bar">
      <div class="filter-bar--search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input type="text" placeholder={props.searchPlaceholder || 'Search...'} />
      </div>

      {props.secondaryPlaceholder && (
        <div class="filter-bar--search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input type="text" placeholder={props.secondaryPlaceholder} />
        </div>
      )}

      {props.filters?.map((filter) => (
        <div class="filter-bar--select">
          <select>
            <option value="">{filter}</option>
          </select>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      ))}
    </div>
  );
}
