/**
 * HTZ A11Y TABS
 *
 * JavaScript scaffolding for accessible tab interfaces
 *
 * @module htz-a11y-tabs
 * @license MIT
 */

import { initialize, destroyInstance, gotoTab, nextTab, prevTab } from './lib/utils';

/**
 * Initialize a tab interface.
 * Depends on semantic markup, in which the tablist is a `ul` element, and each
 * tab contains an clickable tag pointing to its respective tabpanel.
 * @param {HTMLElement} container - The wrapper element around the tabs and tab panels
 * @param {Boolean} rtl - Determine if the tab interface should be right-to-left
 * @param {String} [tablistSelector='ul'] - The tablist's selector.
 * @param {String} [tabpanelSelector='section'] - The tabpanels' selector.
 * @param {Integer} [activeTab=0] - The tab number to have initially activated. Zero based.
 *
 * @fires module:htz-a11y-tabs~a11y-tabs:init - Fired from `container` after a
 *    tab interface has been initialized
 * @fires module:htz-a11y-tabs~a11y-tabs:destroy - Fired from `container` after
 *    a tab interface has been destroyed
 * @fires module:htz-a11y-tabs~a11y-tabs:before-select - Fired from `container`
 *    before a tab selection is applied. If the event handler executes
 *    `event.preventDefault()`, the selection will not be applied.
 * @fires module:htz-a11y-tabs~a11y-tabs:after-select - Fired from `container`
 *    after a tab selection is applied.
 *
 * @return {module:htz-a11y-tabs#API}
 */
export default function htzA11yTabs(
  container,
  rtl,
  tablistSelector = 'ul',
  tabpanelSelector = 'section',
  activeTab = 0
) {
  // State
  const state = {
    isInitialized: false,
    activeTab,
  };

  let [tabs, tabpanels] = initialize(
    container,
    tablistSelector,
    tabpanelSelector,
    clickHandler,
    keyHandler,
    activeTab
  );

  init(activeTab);


  /* ---- EVENT HANDLERS ----- */
  /**
   * Change focus between tabs with arrow keys
   *
   * @param {Object} evt - A keyboard event object.
   */
  function keyHandler(evt) {
    const key = evt.keyCode;
    const active = state.activeTab;
    const back = key === (rtl ? 39 : 37) || key === 38;
    const forward = key === (rtl ? 37 : 39) || key === 40;

    if (back) state.activeTab = prevTab(container, tabs, tabpanels, active, false);
    else if (forward) state.activeTab = nextTab(container, tabs, tabpanels, active, false);

    if ([undefined, null, false].indexOf(state.activeTab) >= 0) state.activeTab = active;
  }

  function clickHandler(evt) {
    evt.preventDefault();

    const targetIndex = tabs.indexOf(evt.target.closest('a, button'));
    const active = state.activeTab;

    state.activeTab = gotoTab(targetIndex, container, tabs, tabpanels, active, true);

    if ([undefined, null, false].indexOf(state.activeTab) >= 0) state.activeTab = active;
  }


  /* ---- Instance methods ----- */
  /**
   * Initialize an instance
   * @callback module:htz-a11y-tabs#init
   *
   * @param {Integer} [activate] - The tab number to activate. Zero based.
   */
  function init(activate = activeTab) {
    if (state.isInitialized) destroy();
    ([tabs, tabpanels] = initialize(
      container,
      tablistSelector,
      tabpanelSelector,
      clickHandler,
      keyHandler,
      activate
    ));

    state.isInitialized = true;
    state.activeTab = activate;
  }

  /**
   * Destroy an instance. Removes event listeners and, optionally,
   * accessibility attributes from the DOM.
   *
   * @callback module:htz-a11y-tabs#destroy
   *
   * @param {Boolean} [removeAttrs] - Determine if attributes should be remove
   */
  function destroy(removeAttrs) {
    destroyInstance(
      container,
      tablistSelector,
      tabpanelSelector,
      clickHandler,
      keyHandler,
      removeAttrs
    );

    state.isInitialized = false;
  }

  /**
   * Go to a tab
   *
   * @callback module:htz-a11y-tabs#goto
   *
   * @param {Integer} index - The index of the tab to be activated
   * @param {Boolean} [focus] - Determine if the newly activated tab should be focused.
   */
  function goto(index, focus) {
    const active = state.activeTab;

    state.activeTab = gotoTab(index, container, tabs, tabpanels, active, focus);
    if ([undefined, null, false].indexOf(state.activeTab) >= 0) state.activeTab = active;
  }

  /**
   * Go to the next tab
   *
   * @callback module:htz-a11y-tabs#next
   *
   * @param {Boolean} [focus] - Determine if the newly activated tab should be focused.
   */
  function next(focus) {
    const active = state.activeTab;

    state.activeTab = nextTab(container, tabs, tabpanels, active, focus);
    if ([undefined, null, false].indexOf(state.activeTab) >= 0) state.activeTab = active;
  }

  /**
   * Go to the previous tab
   *
   * @callback module:htz-a11y-tabs#prev
   *
   * @param {Boolean} [focus] - Determine if the newly activated tab should be focused.
   */
  function prev(focus) {
    const active = state.activeTab;

    state.activeTab = prevTab(container, tabs, tabpanels, active, focus);

    if ([undefined, null, false].indexOf(state.activeTab) >= 0) state.activeTab = active;
  }

  /**
   * Instance API
   *
   * @typedef {Object} module:htz-a11y-tabs#API
   *
   * @prop {Method} isInitialized - Returns true if the instance is initialized
   * @prop {Method} visibleTab - Returns the number of the active tab. Zero based.
   * @prop {module:htz-a11y-tabs#init} init - Initialize an instance.
   * @prop {module:htz-a11y-tabs#destroy} destroy - Destroy an instance.
   * @prop {module:htz-a11y-tabs#goto} goto - Go to a specific tab
   * @prop {module:htz-a11y-tabs#next} next - Go to the next tab
   * @prop {module:htz-a11y-tabs#prev} previous - Go to the next tab
   */
  return {
    // Status
    isInitialized() { return state.isInitialized; },
    visibleTab() { return state.activeTab; },

    // Instance handling
    init,
    destroy,

    // Instance control
    goto,
    next,
    prev,
  };
}
