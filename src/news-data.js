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
let displayList = [
  { id: 2, path: 'join/list/2/current', name: 'City News', title: 'City News', items: []},
  { id: 1, path: 'join/list/1/current', name: 'Office of the City Manager', title: 'Announcements', items: []},
  { id: 3, path: 'join/list/3/current', name: 'Parks, Rec & Culture', title: 'Parks, Rec & Culture', items: []},
  { id: 4, path: 'join/list/4/current', name: 'Public Meetings', title: 'Public Meetings', items: []},
  { id: 5, path: 'join/list/5/current', name: 'Public Safety', title: 'Public Safety - Police', items: []},
  { id: 6, path: 'join/list/6/current', name: 'Traffic Advisories', title: 'Traffic Advisories', items: []}
];
// Don't need the old `path` because we're just going to filter all articles.
// We'll get the lists live but for timing and offline we'll start with this version.
let categoryList = [{"id":1,"name":"Announcements"},{"id":2,"name":"City News"},{"id":3,"name":"Parks, Rec & Culture"},{"id":4,"name":"Public Meetings"},{"id":5,"name":"Public Safety"},{"id":6,"name":"Traffic Advisories"},{"id":7,"name":"Top Stories"},{"id":8,"name":"Parks & Rec Landing Page"}];

let textarea = document.createElement('textarea');

class NewsData extends PolymerElement {

  static get is() { return 'news-data'; }

  static get properties() { return {

    categories: {
      type: Array,
      value: displayList,
      // readOnly: true,?
      notify: true
    },

    articles: {
      type: Array,
      value: [],
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
      computed: '_computeCategory(articles, categoryName)',
      notify: true
    },

    article: {
      type: Object,
      computed: '_computeArticle(articles, articleId)',
      notify: true
    },

    lists: {
      type: Array,
      value: categoryList
    },

    failure: {
      type: Boolean,
      readOnly: true,
      notify: true
    }

  }}

  static get observers() { return [
    //'_fetchCategory(category, offline)',
    '_fetchArticle(article, offline)'
  ]}

  //we're going to rework this completely... onload and offline -> online may update the articles list (which will contain all active articles)
  // changing the category should filter the list
  // setting article-id should grab article (then what, prepend to list and display? or just display?)
  // TODO - let's also get catgoryList so we can match while parsing article data. 
  ready() {
    super.ready();
    console.log('ready')
    this._fetch(apiRoot + 'current', 
      (response) => { 
        console.log(response); 
        this.set('articles', this._parseAllItems(response));
        // maybe we should put the articles into their categories so it's like it was?
        // but does that mean we need to parse them all first? perhaps we just do it while parsing? But what about the ones that aren't supposed to be on the main page? Different priority?
      },
      1 /* attempts */);
      this._fetch(apiRoot + 'list', 
      (response) => { console.log(response); this.set('lists', response); },
      1 /* attempts */);
  }

  _computeArticle(categoryItems, articleId) {
    console.log(`compute article: ${articleId}`);
    if (!categoryItems && !articleId) {
      return null;
    }
    for (let i = 0; i < categoryItems.length; ++i) {
      let article = categoryItems[i];
      if (article.id == articleId) {
        console.log('Found article');
        return article;
      }
    }
    console.log('Need to fetch article');
    /* Critical to tell it to fetch the article even though it's not in the list of articles  */
    return {
      id: articleId
    };
  }

  // This needs to go through the news articles and filter based on category....
  _computeCategory(articles, categoryName) {
    console.log(`Computing category from ${articles.length} articles.`);
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

    if (!article.id) return;
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
    // don't grab new ones?
    // this._fetch(apiRoot + 'current', // category.path,
    //   (response) => { this.set('category.items', this._parseCategoryItems(response)); },
    //   attempts || 1 /* attempts */);
    
    // Instead, filter from articles?
    // Or maybe, just set category == to one of the categories?

  }

  _parseCategoryItems(response) {
    let items = [];

    for (let i = 0, item; item = response[i]; ++i) {
      items.push({...this._parseArticleItem(item.pressRelease), priority: response[i].priority});
    }

    return items;
  }
  _parseAllItems(response) {
    let items = [];

    for (let i = 0, item; item = response[i]; ++i) {
      items.push({...this._parseArticleItem(item), priority: response[i].priority});
    }

    return items;
  }

  _parseArticleItem(item) {
    if (!item) return; // short circuit parsing nothing, not sure where this is even coming from.
    // press release LISTS
    let categoryNames = [];
    for (let i = 0; i < item.pressReleaseListsJoin.length; i++) {
      //polyfill for IE?
      let l = this.lists.find(e => e.id === item.pressReleaseListsJoin[i].pressReleaseListID);
      if (l) categoryNames.push(l.name);
    }
    // PHONE
    if (item.pressContact && item.pressContact.phone && item.pressContact.phone.length === 4)
      item.pressContact.phone = '334501' + item.pressContact.phone;
    // make article object
    let article = {
        headline: this._unescapeText(item.name),
        // reworked?
        href: `/article/${item.id}`,// this._getItemHref(item),
        id: item.id,
        imageUrl: item.coverImage,// this._getItemImage(item),
        // TODO - rework
        placeholder: item.placeholder || "data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAAA8AAD/4QMxaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjYtYzExMSA3OS4xNTgzMjUsIDIwMTUvMDkvMTAtMDE6MTA6MjAgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjJFNTQzRDI0QTM4RTExRTY5NjdCRDcxN0ZDQzkwNzU3IiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjJFNTQzRDIzQTM4RTExRTY5NjdCRDcxN0ZDQzkwNzU3IiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE1IChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MUYyN0U2RkRBMzg3MTFFNjk2N0JENzE3RkNDOTA3NTciIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MUYyN0U2RkVBMzg3MTFFNjk2N0JENzE3RkNDOTA3NTciLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7/7gAmQWRvYmUAZMAAAAABAwAVBAMGCg0AAATiAAAFEgAABUsAAAV4/9sAhAAGBAQEBQQGBQUGCQYFBgkLCAYGCAsMCgoLCgoMEAwMDAwMDBAMDg8QDw4MExMUFBMTHBsbGxwfHx8fHx8fHx8fAQcHBw0MDRgQEBgaFREVGh8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx//wgARCAAGAAoDAREAAhEBAxEB/8QAhwABAQAAAAAAAAAAAAAAAAAABQYBAQAAAAAAAAAAAAAAAAAAAAAQAAIDAQAAAAAAAAAAAAAAABADAAEEJBEAAQMDBQAAAAAAAAAAAAAAAgABEdESA0JiEzOjEgEAAAAAAAAAAAAAAAAAAAAQEwEAAgIDAQAAAAAAAAAAAAABEBEhMQBRkaH/2gAMAwEAAhEDEQAAAa0WP//aAAgBAQABBQLWp97OKf/aAAgBAgABBQIf/9oACAEDAAEFAh//2gAIAQICBj8CP//aAAgBAwIGPwI//9oACAEBAQY/ArgzEOOG5QZim3bDLT1eVF//2gAIAQEDAT8hYJl0gXNk3nWYR//aAAgBAgMBPyGP/9oACAEDAwE/IY//2gAMAwEAAhEDEQAAEEP/2gAIAQEDAT8Qf2TjokQgNtX5fTw4f//aAAgBAgMBPxCP/9oACAEDAwE/EI//2Q==",
        // reworked?
        category: item.pressReleaseListsJoin ? categoryNames : [],
        timeAgo: this._timeAgo(new Date(item.publishDate).getTime()),
        author: item.pressContact.name,
        // reworked? for 4 digit data
        authorPhone: item.pressContact.phone ? item.pressContact.phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3') : '',
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
    //put article into displayCategory pages?
    if (this.categories) {
      let minPriority = 100;
      let maxCategoryIndex = null;
      for (let i = 0; i < item.pressReleaseListsJoin.length; i++) {
        //polyfill for IE?
        let c = this.categories.findIndex(e => e.id === item.pressReleaseListsJoin[i].pressReleaseListID);
        if (c) {
          this.categories[c].items.push({...article, priority: item.pressReleaseListsJoin[i].priority });
          if (item.pressReleaseListsJoin[i].priority < minPriority) maxCategoryIndex = c;
        }
      }
      // set a category if none exists, the alternative is to change what news-article sets for the aside lists
      if (!this.category && maxCategoryIndex) {
        this.set('category', this.categories[maxCategoryIndex]);
        console.log(this.categories[maxCategoryIndex].items);
        this.set('category.items', this.categories[maxCategoryIndex].items);
        //do I also need to set category.items... or will it come through?
      }
    }

    // return
    return article;
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
