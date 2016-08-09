# htz a11y tabs

JavaScript scaffolding for accessible tab interfaces

### Installation
```bash
jspm install github:haaretz/htz-a11y-tabs
```

### Usage
This module is built to enhance semantic markup into an accessible tab interface, 
using ARIA and a little javascript.

```js
// Import
import a11yTabs from 'htz-a11y-tabs';

// Instanciate
a11yTabs(tabInterface [,rtl , tablistSelector, tabpanelSelector, activeTab]);
```

See [here](https://haaretz.github.io/htz-a11y-tabs/) for the full JavaScript documentation.

The tablist should be a `ul` element, with each `li` containing an anchor element
pointing to the relevant tabpanel (which should, in most likelihood be a `section`
or an `article` element):

```html
<section id="tabInterface">
  <!-- tablist -->
  <ul>
    <li><a href="#section1">Section 1</a></li>
    <li><a href="#section2">Section 2</a></li>
    <li><a href="#section3">Section 3</a></li>
    <li><a href="#section4">Section 4</a></li>
  </ul>

  <!-- tabpanels -->
  <article>
    <h2>section 1</h2>
  </article>
  <article>
    <h2>section 2</h2>
  </article>
  <article>
    <h2>section 3</h2>
  </article>
  <article>
    <h2>section 4</h2>
  </article>
</section>
```

The above markup will start us off with a basic list of links to articles within our page, which 
can still be accessible in the event of any failure in executing the script. Our tab interface can
now be progressively enhanced using JavaScript and CSS.

Once our tab interface it initialized, its markup will be transformed into:

```html
<section id="tabInterface">
  <!-- tablist -->
  <ul role="tablist">
    <li role="presentation">
      <a href="#section1" tabindex="0" role="tab" aria-controls="section1" aria-selected="true">Section 1</a>
    </li>
    <li role="presentation">
      <a href="#section2" tabindex="-1" role="tab" aria-controls="section2">Section 2</a>
    </li>
    <li role="presentation">
      <a href="#section3" tabindex="-1" role="tab" aria-controls="section3">Section 3</a>
    </li>
    <li role="presentation">
      <a href="#section4" tabindex="-1" role="tab" aria-controls="section4">Section 4</a>
    </li>
  </ul>

  <!-- tabpanels -->
  <article id="section1" role="tabpanel">
    <h2 tabindex="0">section 1</h2>
  </article>
  <article id="section2" role="tabpanel" aria-hidden="true">
    <h2>section 2</h2>
  </article>
  <article id="section3" role="tabpanel" aria-hidden="true">
    <h2>section 3</h2>
  </article>
  <article id="section4" role="tabpanel" aria-hidden="true">
    <h2>section 4</h2>
  </article>
</section>
```
Make sure that your css hides tabpanels that have the `aria-hidden` attribute 
set to `true`, and that a tab with the `aria-selected` attribute set to `true` 
are marked as the active tab. 

The script enables cycling between the selected tab and its content without having cycle 
through all the other tabs. As per [spec](https://www.w3.org/TR/wai-aria-practices-1.1/#tabpanel), 
moving through the tabs is done with `left` and `right` arrow keys, while moving between the 
selected tab and the visible tab panel is done using the `tab` key.

Pressing the `tab` key will focus the first element _inside_ the tab panel 
(which, for semantics sake, should probably be a heading), or the tab panel 
itself when it does not contain any HTML elements.

### Parameters
 * **container** (HTMLElement): The wrapper element around the tabs and tab panels.
 * **rtl** (Boolean): Determine if the tab interface should be right-to-left. _Default: false_.
 * **tablistSelector** (String): The tablist's selector. _Default: 'ul'_.
 * **tabpanelSelector** (String): The tabpanels' selector. _Default: 'section'_.
 * **activeTab** (Integer): The tab number to have initially activated. Zero based. _Default: 0_.

### Events
 * **'a11y-tabs:init'** - Fired from `container` after a tab interface has been initialized
 * **'a11y-tabs:destroy'** - Fired from `container` after a tab interface has been destroyed
 * **'a11y-tabs:before-select'** - Fired from `container` before a tab selection is applied. 
   If the event handler executes `event.preventDefault()`, the selection will not be applied.
 * **'a11y-tabs:after-select'** - Fired from `container` after a tab selection is applied.

See [the documentation](https://haaretz.github.io/htz-a11y-tabs/) for details on 
properties available in each event object.
