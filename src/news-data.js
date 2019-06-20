/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';

// data api docs: https://api2.auburnalabama.org/pressrelease/apidocs/index.html
let apiRoot = 'https://api2.auburnalabama.org/pressrelease/';
let categoryList = [
  { id: 2, path: 'join/list/2/current', name: 'City News', title: 'City News'},
  { id: 1, path: 'join/list/1/current', name: 'Office of the City Manager', title: 'Announcements'},
  { id: 3, path: 'join/list/3/current', name: 'Parks, Rec & Culture', title: 'Parks, Rec & Culture'},
  { id: 4, path: 'join/list/4/current', name: 'Public Meetings', title: 'Public Meetings'},
  { id: 5, path: 'join/list/5/current', name: 'Public Safety', title: 'Public Safety - Police'},
  { id: 6, path: 'join/list/6/current', name: 'Traffic Advisories', title: 'Traffic Advisories'}
];

let textarea = document.createElement('textarea');

class NewsData extends PolymerElement {

  static get is() { return 'news-data'; }

  static get properties() { return {

    categories: {
      type: Array,
      value: categoryList,
      readOnly: true,
      notify: true
    },

    categoryName: {
      type: String,
      value: ''
    },

    articleId: String,

    offline: Boolean,

    loading: {
      type: Boolean,
      readOnly: true,
      notify: true
    },

    category: {
      type: Object,
      computed: '_computeCategory(categoryName)',
      notify: true
    },

    article: {
      type: Object,
      computed: '_computeArticle(category.items, articleId)',
      notify: true
    },

    failure: {
      type: Boolean,
      readOnly: true,
      notify: true
    }

  }}

  static get observers() { return [
    '_fetchCategory(category, offline)',
    '_fetchArticle(article, offline)'
  ]}

  _computeArticle(categoryItems, articleId) {
    console.log(categoryItems);
    console.log(articleId);
    if (!categoryItems || !articleId) {
      return null;
    }
    for (let i = 0; i < categoryItems.length; ++i) {
      let article = categoryItems[i];
      if (article.id == articleId) {
        return article;
      }
    }
    /* Critical to tell it to fetch the article even though it's not in the list of articles  */
    return {
      id: articleId
    };
  }

  _computeCategory(categoryName) {
    console.log(categoryName);
    for (let i = 0, c; c = this.categories[i]; ++i) {
      if (c.name === categoryName) {
        return c;
      }
    }
    return null;
  }

  _fetchArticle(article, offline) {
    // Don't fail if we become offline but already have a cached version, or if there's
    // nothing to fetch, or if already loading.
    if ((article && article.html) || !article || this.loading) {
      this._setFailure(false);
      return;
    }
        
    if (!article.html && article.content) {
      this.set('article.html', this._formatHTML(article.content));
      return;
    }

    this._fetch(apiRoot + article.id,
      (response) => { 
        var responseArticle = JSON.parse(response)[0];
        var parsedArticle = this._parseArticleItem(responseArticle);
        this.push('category.items', parsedArticle);
        this.set('articleId', parsedArticle.id);
        //this.set('article.html', this._formatHTML(response)); 
      },
      3 /* attempts */, true /* isRaw */);
  }

  _fetchCategory(category, offline, attempts) {
    // Don't fail if we become offline but already have a cached version, or if there's
    // nothing to fetch, or if already loading.
    if ((offline && category && category.items) || !category || this.loading) {
      this._setFailure(false);
      return;
    }
    this._fetch(apiRoot + 'current', // category.path,
      (response) => { this.set('category.items', this._parseCategoryItems(response)); },
      attempts || 1 /* attempts */);
  }

  _parseCategoryItems(response) {
    let items = [];

    for (let i = 0, item; item = response[i]; ++i) {
      items.push({...this._parseArticleItem(item.pressRelease), priority: response[i].priority});
    }

    return items;
  }

  _parseArticleItem(item) {
    return {
        headline: this._unescapeText(item.name),
        // TODO - rework
        href: `/article/${item.id}`,// this._getItemHref(item),
        id: item.id,
        imageUrl: item.coverImage,// this._getItemImage(item),
        // TODO - rework
        placeholder: item.placeholder || "data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAAA8AAD/4QMxaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjYtYzExMSA3OS4xNTgzMjUsIDIwMTUvMDkvMTAtMDE6MTA6MjAgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjJFNTQzRDI0QTM4RTExRTY5NjdCRDcxN0ZDQzkwNzU3IiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjJFNTQzRDIzQTM4RTExRTY5NjdCRDcxN0ZDQzkwNzU3IiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE1IChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MUYyN0U2RkRBMzg3MTFFNjk2N0JENzE3RkNDOTA3NTciIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MUYyN0U2RkVBMzg3MTFFNjk2N0JENzE3RkNDOTA3NTciLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7/7gAmQWRvYmUAZMAAAAABAwAVBAMGCg0AAATiAAAFEgAABUsAAAV4/9sAhAAGBAQEBQQGBQUGCQYFBgkLCAYGCAsMCgoLCgoMEAwMDAwMDBAMDg8QDw4MExMUFBMTHBsbGxwfHx8fHx8fHx8fAQcHBw0MDRgQEBgaFREVGh8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx//wgARCAAGAAoDAREAAhEBAxEB/8QAhwABAQAAAAAAAAAAAAAAAAAABQYBAQAAAAAAAAAAAAAAAAAAAAAQAAIDAQAAAAAAAAAAAAAAABADAAEEJBEAAQMDBQAAAAAAAAAAAAAAAgABEdESA0JiEzOjEgEAAAAAAAAAAAAAAAAAAAAQEwEAAgIDAQAAAAAAAAAAAAABEBEhMQBRkaH/2gAMAwEAAhEDEQAAAa0WP//aAAgBAQABBQLWp97OKf/aAAgBAgABBQIf/9oACAEDAAEFAh//2gAIAQICBj8CP//aAAgBAwIGPwI//9oACAEBAQY/ArgzEOOG5QZim3bDLT1eVF//2gAIAQEDAT8hYJl0gXNk3nWYR//aAAgBAgMBPyGP/9oACAEDAwE/IY//2gAMAwEAAhEDEQAAEEP/2gAIAQEDAT8Qf2TjokQgNtX5fTw4f//aAAgBAgMBPxCP/9oACAEDAwE/EI//2Q==",
        // TODO - rework
        category: item.List ? item.List.ListName : '',
        timeAgo: this._timeAgo(new Date(item.publishDate).getTime()),
        author: item.pressContact.name,
        // TODO - rework for 4 digit data
        authorPhone: item.pressContact.phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3'),
        authorTitle: item.pressContact.title,
        // TODO - check `100` in UI, set to 500 in db
        summary: this._trimRight(item.blurb, 100),
        // TODO - rework - shouldn't need to format, at least not as much
        html: this._formatHTML(item.content),
        // TODO - rework
        mainPriority: 0, //item.MainPagePriority,
        // TODO - rework
        priority: 0, //item.Priority,
        // TODO - rework as we now have HTML, no simple string data field
        readTime: Math.max(1, Math.round(item.content.length / 3000)) + ' min read'
      };
  }

  _unescapeText(text) {
    textarea.innerHTML = text;
    return textarea.textContent;
  }

  _getItemHref(item) {
    return item.List ? '/article/' + item.List.ListName + '/' + encodeURIComponent(item.PressReleaseID) : null;
  }

  _getItemImage(item) {
    return item.Picture ? 'https://static.auburnalabama.org/media/apps/news/' + item.Picture.PictureName : '';
  }

  _timeAgo(timestamp) {
    if (!timestamp)
      return ''

    let minutes = (Date.now() - timestamp) / 1000 / 60;
    if (minutes < 2)
      return '1 min ago';
    if (minutes < 60)
      return Math.floor(minutes) + ' mins ago';
    if (minutes < 120)
      return '1 hour ago';

    let hours = minutes / 60;
    if (hours < 24)
      return Math.floor(hours) + ' hours ago';
    if (hours < 48)
      return '1 day ago';

    return Math.floor(hours / 24) + ' days ago';
  }

  _trimRight(text, maxLength) {
    let breakIdx = text.indexOf(' ', maxLength);
    return breakIdx === -1 ? text : text.substr(0, breakIdx) + '...';
  }

  _formatHTML(html) {
    let template = document.createElement('template');
    template.innerHTML = html;

    // Remove h1, .kicker, and .date from content.
    // let h1 = template.content.querySelector('h1');
    // h1 && h1.remove();
    // let kicker = template.content.querySelector('.kicker');
    // kicker && kicker.remove();
    // let date = template.content.querySelector('.date');
    // date && date.remove();

    // Remove the first image if it's the same as the item image.
    // let image = template.content.querySelector('img');
    // if (image && this._isSameImageSrc(image.src, this.article.imageUrl)) {
    //   image.remove();
    // }

    // Remove the stupid style tags
    var styledElements = template.content.querySelectorAll('*[style]');
    for (var i = 0; i < styledElements.length; i++) {
      styledElements[i].removeAttribute('style');
    }

    // Remove width/height attributes from all images.
    let images = template.content.querySelectorAll('img');
    for (let i = 0; i < images.length; ++i) {
      let img = images[i];
      img.removeAttribute('width');
      img.removeAttribute('height');
    }

    return template.innerHTML;
    //return template.content.querySelector('.content').innerHTML;
  }

  // _isSameImageSrc(a, b) {
  //   let regex = /[^/]+\.(jpg|png|gif)/;
  //   let aMatch = regex.exec(a);
  //   let bMatch = regex.exec(b);
  //   return aMatch && bMatch && aMatch[0] === bMatch[0];
  // }

  _fetch(url, callback, attempts, isRaw) {
    let xhr = new XMLHttpRequest();
    xhr.addEventListener('load', (e) => {
      this._setLoading(false);
      if (isRaw) {
        callback(e.target.responseText);
      } else {
        callback(JSON.parse(e.target.responseText));
      }
    });
    xhr.addEventListener('error', (e) => {
      // Flaky connections might fail fetching resources
      if (attempts > 1) {
        this._fetchDebouncer = Debouncer.debounce(this._fetchDebouncer,
          timeOut.after(200), this._fetch.bind(this, url, callback, attempts - 1));
      } else {
        this._setLoading(false);
        this._setFailure(true);
      }
    });

    this._setLoading(true);
    this._setFailure(false);
    xhr.open('GET', url);
    xhr.send();
  }

  refresh() {
    if (this.categoryName) {
      // Try at most 3 times to get the items.
      this._fetchCategory(this.category, this.offline, 3);
    }
  }

}

customElements.define(NewsData.is, NewsData);
