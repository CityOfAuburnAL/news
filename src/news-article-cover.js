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

import '@polymer/iron-icon/iron-icon.js';
import './news-img.js';

class NewsArticleCover extends PolymerElement {
  static get template() {
    return html`
    <style>
      :host {
        display: block;
      }

      [hidden] {
        display: none !important;
      }

      .flex {
        flex: 1;
      }

      .cover-text .category {
        padding: 6px 20px 7px;
        border: var(--app-border-style);
        display: inline-block;
        font-weight: bold;
        font-size: 11px;
      }

      h1 {
        font-weight: normal;
        font-size: 37px;
        line-height: 47px;
        margin: 24px 0;
      }

      h1 small {
        display: block;
        font-size: 50%;
        line-height: 1;
        font-style: italic;
      }

      .cover-text .meta {
        font-size: 11px;
        font-weight: bold;
        border-top: var(--app-border-style);
        padding: 24px 0;
      }

      .cover-img-container {
        position: relative;
        width: 100%;
      }

      .cover-img-container > news-img {
        display: block;
        width: 100%;
        height: auto;
        min-height: 60vh;
        object-fit: cover;
      }

      :host-context(.fixed-viewport-height) .cover-img-container > news-img {
        // min-height: calc(var(--viewport-height) * 0.6); no idea why, but it breaks Edge desktop
      }

      .timer-icon {
        margin-left: 30px;
      }

      /* desktop only */
      @media (min-width: 768px) {
        .align-left {
          clear: none;
          float: left;
          margin: 0 0 0.214rem 0.214rem;
        }
        .align-left {
          clear: none;
          float: right;
          margin: 0 0.214rem 0.214rem 0;
        }
      }

      /* mobile */
      @media (max-width: 767px) {
        :host {
          background: #000;
        }

        .cover-text {
          position: relative;
          display: flex;
          flex-direction: column;
          height: 100vh;
          box-sizing: border-box;
          color: var(--app-cover-text-color);
          padding: 0 24px;
          z-index: 1;
        }

        :host-context(.fixed-viewport-height) .cover-text {
          height: var(--viewport-height);
        }

        .cover-text .category {
          border: var(--app-transparent-border-style);
        }

        .cover-text .meta {
          font-size: 11px;
          font-weight: bold;
          border-top: var(--app-transparent-border-style);
        }

        .cover-img-container {
          position: absolute;
          top: 0;
        }

        .cover-img-container .scrim {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.25) 25%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.7) 80%, rgba(0,0,0,1) 100%);
        }
      }

      /* mobile and desktop small */
      @media (max-width: 1309px) {
        h1 {
          font-size: 6vh;
          line-height: 7vh;
          max-height: calc(7vh * 7);
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 7;
          -webkit-box-orient: vertical;
        }

        :host-context(.fixed-viewport-height) h1 {
          font-size: calc(var(--viewport-height) * 0.06);
          line-height: calc(var(--viewport-height) * 0.07);
          max-height: calc(var(--viewport-height) * 0.49);
        }
      }
      
      @media only print {
        :host {
          background: #FFF;
        }
        .cover-text {
          color: #000;
          height: auto;
        }
        .cover-img-container {
          position: relative;
        }
        .cover-text .flex {
          display: none;
        }
      }
    </style>

    <div class="cover-text">
      <div class="flex"></div>
      <div>
        <dom-repeat items="[[article.category]]">
          <template>
            <div class="category">[[item]]</div>
          </template>
        </dom-repeat>
      </div>
      <h1>[[article.headline]]<small>[[article.author]]&mdash;<em>[[article.authorTitle]]</em></small></h1>
      <div class="meta">
        <span>[[article.timeAgo]]</span>
        <iron-icon class="timer-icon" icon="timer"></iron-icon>
        <span>[[article.readTime]]</span>
        <iron-icon class="timer-icon" icon="call"></iron-icon>
        <span>[[article.authorPhone]]</span>
      </div>
    </div>

    <div class="cover-img-container">
      <news-img src="[[article.imageUrl]]" hidden\$="[[!article.imageUrl]]"></news-img>
      <div class="scrim"></div>
    </div>
`;
  }

  static get is() { return 'news-article-cover'; }

  static get properties() { return {

    article: Object

  }}
}

customElements.define(NewsArticleCover.is, NewsArticleCover);
