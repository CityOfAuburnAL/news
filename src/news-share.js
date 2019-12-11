import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '@polymer/paper-menu-button/paper-menu-button.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-material/paper-material.js';
import '@polymer/iron-iconset-svg/iron-iconset-svg.js';

import './news-share-icons.js';

class NewsShare extends PolymerElement {
    static get template() {
        return html`
        <style>
            :host {
                display: inline-block;
            }
            :host([monochrome]) .social-icon {
                color: var(--paper-share-button-brand-icon-monochrome-color, black) !important;
            }
            #container:hover > #cube { background-color: yellow; }
            .social-list {
                display: inline-flex;
            }
            paper-menu-button {
                padding: 0px;
            }
            paper-icon-button {
                height: var(--paper-share-button-icon-height, 40px);
                width: var(--paper-share-button-icon-width, 40px);
                color: var(--paper-icon-button-ink-color, black);
            }
            .social-icon {
                height: var(--paper-share-button-brand-icon-height, 40px);
                width: var(--paper-share-button-brand-icon-width, 40px);
            }
        </style>
        <paper-menu-button id="shareMenu"
            dynamic-align="[[dynamicAlign]]"
            horizontal-align="[[horizontalAlign]]"
            vertical-align="[[verticalAlign]]"
            horizontal-offset="[[horizontalOffset]]"
            vertical-offset="[[verticalOffset]]"
            no-overlap="[[noOverlap]]"
        >
            <span slot="dropdown-trigger" aria-label="Share on social networks">
                <paper-icon-button icon="[[buttonIcon]]" alt="Share Menu"></paper-icon-button> Share
            </span>
            <paper-material slot="dropdown-content">
            <div class="social-list">
                <div>
                <paper-icon-button href$="https://www.facebook.com/sharer/sharer.php?u=[[url]]" hidden$="[[!facebook]]" style="color:#3B5998" class="social-icon" cake="1w2" icon="brand:facebook" on-tap="_share"></paper-icon-button>
                </div>
                <div>
                <paper-icon-button href$="http://twitter.com/intent/tweet?url=[[url]]&text=[[sharingText]]" hidden$="[[!twitter]]" style="color:#1DA1F2" class="social-icon" icon="brand:twitter" on-tap="_share"></paper-icon-button>
                </div>
                <div>
                <paper-icon-button href$="http://reddit.com/submit?url=[[url]]&title=[[sharingText]]" hidden$="[[!reddit]]" style="color:#FF4500" class="social-icon" icon="brand:reddit" on-tap="_share"></paper-icon-button>
                </div>
                <div>
                <paper-icon-button href$="http://www.blogger.com/blog-this.g?n=[[sharingText]]&b=[[sharingText]]%20[[url]]" hidden$="[[!blogger]]" style="color:#F38936" class="social-icon" icon="brand:blogger" on-tap="_share"></paper-icon-button>
                </div>
                <div>
                <paper-icon-button href$="https://www.tumblr.com/widgets/share/tool?shareSource=legacy&canonicalUrl=[[url]]&posttype=link" hidden$="[[!tumblr]]" style="color:#36465D" class="social-icon" icon="brand:tumblr" on-tap="_share"></paper-icon-button>
                </div>
                <div>
                <a href$="mailto:?body=[[_cleanUrl(url)]]&subject=[[sharingText]]" tabindex="-1">
                    <paper-icon-button hidden$="[[!email]]" style="color:#000000" class="social-icon" icon="custom:email"></paper-icon-button>
                </a>
                </div>
            </div>
            </paper-material>
        </paper-menu-button>
        `;
    }

    static get is() { return 'news-share'; }

    static get properties() { return {
        /** URL to share. Don't forget to use http:// or https:// at the beginning of the url! */
        url: {
            type: String
        },
        /** Use window.location.href as url. (Only if the url is not set) */
        autoUrl: {
            type: Boolean
        },
        /** The icon for the button (share icon by default)*/
        buttonIcon: {
            type: String,
            value: 'custom:share'
        },
        /** text to share with the URL. (Compatible w/ Twitter / Reddit / Blogger) */
        sharingText: {
            type: String,
            value: ''
        },
        /** Set to true to make all the logo black & white */
        monochrome: {
            type: Boolean,
            value: false
        },
        /** Enable Popup sharing. Only working with compatible website (Facebook, Google Plus, Twitter)*/
        popup: {
            type: Boolean,
            value: false
        },
        /** Set to true to enable share with email (mailto) */
        email: {
            type: Boolean,
            value: false
        },
        /** Set to true to enable share with Facebook */
        facebook: {
            type: Boolean,
            value: false
        },
        /** Set to true to enable share with Google Plus */
        google: {
            type: Boolean,
            value: false
        },
        /** Set to true to enable share with Twitter */
        twitter: {
            type: Boolean,
            value: false
        },
        /** Set to true to enable share with Reddit */
        reddit: {
            type: Boolean,
            value: false
        },
        /** Set to true to enable share with VK */
        vk: {
            type: Boolean,
            value: false
        },
        /** Set to true to enable share with Blogger */
        blogger: {
            type: Boolean,
            value: false
        },
        /** Set to true to enable share with Tumblr */
        tumblr: {
            type: Boolean,
            value: false
        },
        /**
        * The orientation against which to align the menu dropdown
        * horizontally relative to the dropdown trigger.
        */
       horizontalAlign: {
         type: String,
         value: 'left',
         reflectToAttribute: true
       },
       /**
        * The orientation against which to align the menu dropdown
        * vertically relative to the dropdown trigger.
        */
       verticalAlign: {
         type: String,
         value: 'top',
         reflectToAttribute: true
       },
       /**
        * If true, the `horizontalAlign` and `verticalAlign` properties will
        * be considered preferences instead of strict requirements when
        * positioning the dropdown and may be changed if doing so reduces
        * the area of the dropdown falling outside of `fitInto`.
        */
       dynamicAlign: {
         type: Boolean
       },
       /**
        * A pixel value that will be added to the position calculated for the
        * given `horizontalAlign`. Use a negative value to offset to the
        * left, or a positive value to offset to the right.
        */
       horizontalOffset: {
         type: Number,
         value: 0,
         notify: true
       },
       /**
        * A pixel value that will be added to the position calculated for the
        * given `verticalAlign`. Use a negative value to offset towards the
        * top, or a positive value to offset towards the bottom.
        */
       verticalOffset: {
         type: Number,
         value: 0,
         notify: true
       },
       /**
        * If true, the dropdown will be positioned so that it doesn't overlap
        * the button.
        */
       noOverlap: {
         type: Boolean
       },
    }}

    _cleanUrl(url) {
        return url.replace(/ /g, '%2520')
                    .replace(/%20/g, '%2520')
                    .replace(/&/g, '%26'); //encode ampersand (Parks & Rec)
    }

    _share(event) {
        event.stopImmediatePropagation();
        event.preventDefault();
        //var element = Polymer.dom(event).localTarget; Polymer-element doesn't have this functionality
        var element = event.currentTarget;
        element.icon = element.getAttribute('icon');
        
        if (!this.url && this.autoUrl) {
            this.url = window.location.href;
        }
        if (this.url) {
            if (this.popup) {
                switch (element.icon) {
                    case 'brand:facebook':
                        this._openPopup(element.getAttribute('href'), 'Sharing', 600, 375);
                        break;
                    case 'brand:tumblr':
                        this._openPopup(this._cleanUrl(element.getAttribute('href')), 'Sharing');
                        break;
                    case 'brand:twitter':
                        this._openPopup(this._cleanUrl(element.getAttribute('href')), 'Sharing', 500, 230);
                        break;
                    default:
                        window.open(this._cleanUrl(element.getAttribute('href')), 'Sharing');
                }
            } else {
                window.open(this._cleanUrl(element.getAttribute('href')), 'Sharing');
            }
        } else {
            console.error("Impossible to share, no url set");
        }
        this.$.shareMenu.close();
    }

    _openPopup(url, title, w, h) {
        debugger;
        //Center and open the popup.
        var y = window.top.outerHeight / 2 + window.top.screenY - (h / 2)
        var x = window.top.outerWidth / 2 + window.top.screenX - (w / 2)
        window.open(url, title, 'width=' + w + ', height=' + h + ', top=' + y + ', left=' + x);
    }
}

customElements.define(NewsShare.is, NewsShare);
