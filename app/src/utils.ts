import {
  createLocalStorageRecentSearchesPlugin,
  search as defaultLocalStorageSearch,
} from '@algolia/autocomplete-plugin-recent-searches';
import { FindAnswersResponse } from '@algolia/client-search';

/* eslint-disable camelcase */
export interface ZendeskHit {
  readonly locale: {
    readonly locale: string;
    readonly name: string;
    readonly rtl: boolean;
  };
  readonly id: string;
  readonly updated_at: number;
  readonly position: number;
  readonly title: string;
  readonly body_safe: string;
  readonly outdated: boolean;
  readonly promoted: boolean;
  readonly vote_sum: number;
  readonly comments_disabled: boolean;
  readonly category: {
    readonly id: string;
    readonly title: string;
  };
  readonly section: {
    readonly id: string;
    readonly title: string;
    readonly full_path: string;
  };
  readonly user_segment: string;
  readonly label_names: any;
  readonly created_at_iso: string;
  readonly updated_at_iso: string;
  readonly edited_at: number;
  readonly edited_at_iso: string;
  __position: number;
  __queryID: string;
  url: string;
}
/* eslint-enable camelcase */

export const getContainerAndButton = (
  inputSelector: string
): [HTMLElement, HTMLElement] => {
  // figure out parent container of the input
  const allInputs: NodeListOf<HTMLInputElement> = document.querySelectorAll(
    inputSelector
  );
  if (allInputs.length === 0) {
    throw new Error(
      `Couldn't find any input matching inputSelector '${inputSelector}'.`
    );
  }
  if (allInputs.length > 1) {
    throw new Error(
      `Too many inputs (${allInputs.length}) matching inputSelector '${inputSelector}'.`
    );
  }
  let form: HTMLElement = allInputs[0];
  while (form && form.tagName !== 'FORM') {
    form = form.parentElement;
  }
  if (!form) {
    throw new Error(
      `Couldn't find the form container of inputSelector '${inputSelector}'`
    );
  }
  const container: HTMLElement = document.createElement('div');
  container.style.position = 'relative';
  form.parentNode.replaceChild(container, form);

  const submitButton: HTMLElement = form.querySelector('input[type="submit"]');
  return [container, submitButton];
};

export const recentSearchesPlugin = createLocalStorageRecentSearchesPlugin({
  key: 'algolia-recent-searches',
  limit: 5,
  search({ query, items, limit }) {
    // in case the query is exactly the recent item, skip it to not have a useless entry
    const results = defaultLocalStorageSearch({ query, items, limit });
    if (results.length === 1 && results[0].label === query) {
      return [];
    }
    // if the query is non-empty, really display only 2 insted of 5
    if (query !== '') {
      return results.slice(0, 2);
    }
    return results;
  },
  transformSource({ source }) {
    return {
      ...source,
      // keep this open and do another search
      onSelect({ setIsOpen }) {
        setIsOpen(true);
      },
    };
  },
});

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

export const getRGB = (color: string) => {
  const ctx = document.createElement('canvas').getContext('2d');
  // the HTML5 canvas is required to parse color values when certain properties like strokeStyle and fillStyle are set
  ctx.strokeStyle = color;
  const rgb = hexToRgb(ctx.strokeStyle);
  return `${rgb.r}, ${rgb.g}, ${rgb.b}`;
};

export const buildUrl = ({
  baseUrl,
  locale,
  hit,
}: {
  baseUrl: string;
  locale: string;
  hit: FindAnswersResponse<ZendeskHit>['hits'][0];
}): string => `${baseUrl}${locale}/articles/${hit.id}`;
