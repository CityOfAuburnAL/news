/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '@polymer/app-route/app-route.js';
import '@polymer/app-layout/app-grid/app-grid-style.js';
import './news-list-featured-item.js';
import './news-list-item.js';
import './news-side-list.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';

class NewsList extends PolymerElement {
  static get template() {
    return html`
    <style include="app-grid-style">

      :host {
        display: block;
      }

      [hidden] {
        display: none !important;
      }

      .container .fade-in {
        opacity: 0;
      }

      .container[fade-in] .fade-in {
        opacity: 1;
        transition: opacity 500ms;
      }

      .content {
        @apply --layout-flex;
      }

      .article-grid,
      .opinions-grid {
        margin: 0;
        padding: 0;
        list-style: none;
      }

      .article-grid {
        margin-top: 32px;
      }

      li {
        display: block;
      }

      h3 {
        @apply --app-sub-section-headline;
        margin: 24px 0;
      }

      news-side-list {
        margin-bottom: 32px;
      }

      /* mobile */
      @media (max-width: 767px) {
        aside {
          display: none;
        }

        .article-grid li,
        .opinions-grid li{
          border-bottom: var(--app-border-style);
          margin: 0px 24px 24px 24px;
          padding-bottom: 24px;
        }

        .article-grid li:last-of-type,
        .opinions-grid li:last-of-type {
          border-bottom: none;
        }
      }

      /* desktop */
      @media (min-width: 768px) {
        :host {
          --app-grid-columns: 4;
          --app-grid-gutter: 32px;
        }

        .opinions-grid {
          @apply --layout-horizontal;
          @apply --layout-wrap;
        }

        .opinions-grid li {
          width: calc(50% - 32px);
          margin-right: 32px;
        }

        .article-grid,
        .opinions-grid {
          margin-right: -32px;
        }
      }

      /* desktop large */
      @media (min-width: 1310px) {
        .container {
          @apply --layout-horizontal;
        }

        .content {
          margin-right: 24px;
        }

        aside {
          width: 300px;
          min-width: 300px;
        }
      }

    </style>

    <!--
      app-route provides the name of the category.
    -->
    <app-route
        route="[[route]]"
        pattern="/:category"
        data="{{routeData}}"></app-route>

    <div class="container" fade-in$="[[!loading]]" hidden$="[[failure]]">
      <div class="content">
        <news-list-featured-item item="[[_getFeaturedItem(category.items)]]">
        </news-list-featured-item>

        <ul class="app-grid article-grid fade-in">
          <dom-repeat items="[[_slice(category.items, 1, 50)]]">
            <template>
              <li>
                <news-list-item item="[[item]]"></news-list-item>
              </li>
            </template>
          </dom-repeat>
        </ul>
      </div>

      <aside>
        <news-side-list class="fade-in" items="[[_slice(category.items, 0, 3)]]">
          Most Read
        </news-side-list>
        <section>
          <h3>Archived Stories</h3>
          <a href="https://www.auburnalabama.org/news/archived" style="text-decoration: none;color: inherit;display: block;margin: 20px 0;">
            <iron-icon icon="search"></iron-icon> Search All News Stories
          </a>
        </section>
        <news-side-list class="fade-in" featured items="[[_slice(category.items, 3, 47)]]">
          More Top Stories
        </news-side-list>
      </aside>
    </div>

    <news-network-warning
        hidden$="[[!failure]]"
        offline="[[offline]]"
        on-try-reconnect="_tryReconnect"></news-network-warning>
`;
  }

  static get is() { return 'news-list'; }

  static get properties() { return {

    route: Object,

    category: {
      type: Object,
      notify: true
    },

    offline: Boolean,

    failure: Boolean,

    categoryName: {
      type: Boolean,
      computed: '_return(routeData.category)',
      notify: true
    },

    routeData: Object,

    loading: Boolean

  }}

  connectedCallback() {
    super.connectedCallback();
    this._boundResizeHandler = this._resizeHandler.bind(this);
    window.addEventListener('resize', this._boundResizeHandler);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('resize', this._boundResizeHandler);
  }

  _getFeaturedItem(items) {
    return items ? items[0] : {};
  }
  
  _filterPriorityItems(item) {
    return ((this.category.name == "top_stories") ||
              this.category.name == "Office of the City Manager" || item.priority);
  }
  
  _filterMoreItems(items) {
    if (this.category.name != "top_stories" &&
              this.category.name != "Office of the City Manager" && items)
      return items.filter((item) => { return !item.priority; });
  }

  _tryReconnect() {
    this.dispatchEvent(new CustomEvent('refresh-data', {bubbles: true, composed: true}));
  }

  _resizeHandler() {
    this._resizeDebouncer = Debouncer.debounce(this._resizeDebouncer,
      timeOut.after(50), () => { this.updateStyles(); });
  }

  _slice(list, begin, end) {
    if (list) {
      return list.slice(begin, end);
    }
  }

  _return(value) {
    return value;
  }
}

customElements.define(NewsList.is, NewsList);
