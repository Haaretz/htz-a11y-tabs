/**
 * HTZ A11Y TABS UTILS
 *
 * Utility function for the htz-a11y-tabs module
 * @module htz-a11y-tabs/utils
 */

import dispatchEvent from 'htz-dispatch-event';

/**
 * Initialize an instance
 *
 * @param {HTMLElement} container - The wrapper element around the tabs and tab panels
 * @param {String} tablistSelector - The tablist's selector.
 * @param {String} tabpanelSelector - The tabpanel's selector.
 * @param {clickHandler} clickHandler - A callback to handle click events.
 * @param {keyHandler} keyHandler - A callback to handle keydown events.
 * @param {Integer} activeTab - The tab number to activate. Zero based.
 *
 * @fires module:htz-a11y-tabs~a11y-tabs:init
 *
 * @return {Array} - An array whose items are:
 *    0: the `tablist` HTMLElement
 *    1: An Array of the clickable tab HTMLElements
 */
export function initialize(
  container,
  tablistSelector,
  tabpanelSelector,
  clickHandler,
  keyHandler,
  activeTab
) {
  const tablist = container.querySelector(tablistSelector);
  const tabpanels = Array.from(container.querySelectorAll(tabpanelSelector));
  const tabs = Array.from(tablist.children);
  const clickables = Array.from(tablist.querySelectorAll('a, button'));

  tablist.setAttribute('role', 'tablist');

  tabs.forEach((tab, index) => {
    const clickable = tab.querySelector('a, button');
    const tabpanel = tabpanels[index];
    const isActive = index === activeTab;
    const href = clickable.href;
    const controls = href ? href.match(/#([^?&]*)/)[1] :
      tabpanel ?
        tabpanel.id || `tab${Math.random()}` :
        `tab${Math.random()}`;

    tab.setAttribute('role', 'presentation');
    clickable.setAttribute('role', 'tab');
    clickable.setAttribute('tabindex', isActive ? '0' : '-1');
    clickable.setAttribute('aria-controls', controls);

    isActive ?
      clickable.setAttribute('aria-selected', 'true') :
      clickable.removeAttribute('aria-selected');


    tabpanel.setAttribute('role', 'tabpanel');
    if (!isActive) tabpanel.setAttribute('aria-hidden', 'true');
    if (!tabpanel.id) tabpanel.id = controls;

    if (isActive) makeFocusable(tabpanel);
  });

  // Attach event listeners
  tablist.addEventListener('keydown', keyHandler);
  tablist.addEventListener('click', clickHandler);

  /**
   * Fired from `container` when a tab interface is initialized
   * @event module:htz-a11y-tabs~a11y-tabs:init
   *
   * @type {Object}
   *
   * @prop {Object} detail
   * @prop {HTMLElement} detail.activeTab - The active tab element.
   * @prop {HTMLElement} detail.activeTabpanel - The active tabpanel element.
   */
  dispatchEvent(
    container,
    'a11y-tabs:init',
    {
      activeTab: clickables[activeTab],
      activeTabpanel: tabpanels[activeTab],
    }
  );

  return [clickables, tabpanels];
}


/**
 * Remove event listeners
 *
 * @param {HTMLElement} container - The container wrapping the tab interface
 * @param {clickHandler} clickHandler - A callback to handle click events.
 * @param {keyHandler} keyHandler - A callback to handle keydown events.
 */
export function destroyInstance(container, clickHandler, keyHandler) {
  container.removeEventListener('click', clickHandler);
  container.removeEventListener('keydown', keyHandler);

  /**
   * Fired from `container` after a tab interface has been destroyed.
   *
   * @event module:htz-a11y-tabs~a11y-tabs:destroy
   *
   * @type {Object}
   */
  dispatchEvent(container, 'a11y-tabs:destroy');
}


/**
 * Go to the next tab
 *
 * @param {HTMLElement} container - The container wrapping the tab interface
 * @param {HTMLElement[]} tabs - An array containing the tab elements
 * @param {HTMLElement[]} tabpanels - An array containing tabpanel element
 * @param {Integer} activeTabIndex - The index of the currently active tab
 * @param {Boolean} focus - Determine if the newly activated tab should be focused.
 *
 * @return {Integer} The index of the newly active tab.
 */
export function nextTab(container, tabs, tabpanels, activeTabIndex, focus) {
  const targetIndex = activeTabIndex + 1;

  return gotoTab(targetIndex, container, tabs, tabpanels, activeTabIndex, focus);
}

/**
 * Go to the previous tab
 *
 * @param {HTMLElement} container - The container wrapping the tab interface
 * @param {HTMLElement[]} tabs - An array containing the tab elements
 * @param {HTMLElement[]} tabpanels - An array containing tabpanel element
 * @param {Integer} activeTabIndex - The index of the currently active tab
 * @param {Boolean} focus - Determine if the newly activated tab should be focused.
 *
 * @return {Integer} The index of the newly active tab.
 */
export function prevTab(container, tabs, tabpanels, activeTabIndex, focus) {
  const targetIndex = activeTabIndex - 1;

  return gotoTab(targetIndex, container, tabs, tabpanels, activeTabIndex, focus);
}


/**
 * Go to a tab
 *
 * @param {Integer} targetIndex - The index of the tab to be activated
 * @param {HTMLElement} container - The container wrapping the tab interface
 * @param {HTMLElement[]} tabs - An array containing the tab elements
 * @param {HTMLElement[]} tabpanels - An array containing tabpanel element
 * @param {Integer} activeTabIndex - The index of the currently active tab
 * @param {Boolean} focus - Determine if the newly activated tab should be focused.
 *
 * @fires module:htz-a11y-tabs~a11y-tabs:before-select
 * @fires module:htz-a11y-tabs~a11y-tabs:after-select
 *
 * @return {Integer} The index of the newly active tab.
 */
export function gotoTab(targetIndex, container, tabs, tabpanels, activeTabIndex, focus) {
  const currentTab = tabs[activeTabIndex];
  const targetTab = tabs[targetIndex];
  const currentTabpanel = tabpanels[activeTabIndex];
  const targetTabpanel = tabpanels[targetIndex];


  if (targetTab && targetTabpanel) {
    /**
     * Fired from `container` before a tab selection is applied. If the event
     * handler executes `event.preventDefault()`, the selection will not be applied.
     *
     * @event module:htz-a11y-tabs~a11y-tabs:before-select
     *
     * @type {Object}
     * @prop {Object} detail
     * @prop {HTMLElement} detail.currentTab - The currently active tab
     * @prop {HTMLElement} detail.targetTab - The tab that will be activated
     *    after the selection is applied.
     * @prop {HTMLElement} detail.currentTabpanel - The currently active tabpanel
     * @prop {HTMLElement} detail.targetTabpanel - The tabpanel that will be
     *    activated after the selection is applied.
     */
    const allowed = dispatchEvent(
      container,
      'a11y-tabs:before-select',
      { currentTab, targetTab, currentTabpanel, targetTabpanel }
    );

    if (allowed) {
      handleTabSwitch(currentTab, targetTab, currentTabpanel, targetTabpanel, focus);

      /**
       * Fired from `container` after a tab selection is applied.
       *
       * @event module:htz-a11y-tabs~a11y-tabs:after-select
       *
       * @type {Object}
       * @prop {Object} detail
       * @prop {HTMLElement} detail.prevTab - The previously active tab
       * @prop {HTMLElement} detail.targetTab - The tab that has been activated
       *    by the selection.
       * @prop {HTMLElement} detail.prevTabpanel - The previously active tabpanel
       * @prop {HTMLElement} detail.targetTabpanel - The tabpanel that will be activated
       *    after the selection is applied.
       */
      dispatchEvent(
        container,
        'a11y-tabs:after-select',
        {
          prevTab: currentTab,
          targetTab,
          prevTabpanel: currentTabpanel,
          targetTabpanel,
        }
      );

      return targetIndex;
    }
  }

  return undefined;
}

/**
 * Make the first child of an element focusable. If the element has
 * no children, make the element itself focusable.
 *
 * @param {HTMLElement} elem - The Element to target
 *
 * @return {HTMLElement} - The focusable element.
 *
 * @private
 */
export function makeFocusable(elem) {
  const firstChild = elem.firstElementChild;

  (firstChild || elem).setAttribute('tabindex', '0');

  return firstChild || elem;
}

/**
 * Handle DOM changes related to switching tabs
 *
 * @param {HTMLElement} currentTab - The currently selected tab
 * @param {HTMLElement} targetTab - The tab to be selected
 * @param {HTMLElement} currentTabpanel - The currently selected tabpanel
 * @param {HTMLElement} targetTabpanel - The tabpanel to be selected
 * @param {Boolean} moveFocus - Determine if the newly activated tab should be focused.
 *
 * @private
 */
function handleTabSwitch(currentTab, targetTab, currentTabpanel, targetTabpanel, moveFocus) {
  targetTab.setAttribute('tabindex', '0');
  targetTab.setAttribute('aria-selected', 'true');
  targetTab.focus();

  currentTab.setAttribute('tabindex', '-1');
  currentTab.removeAttribute('aria-selected');

  currentTabpanel.setAttribute('aria-hidden', 'true');
  targetTabpanel.removeAttribute('aria-hidden');

  const focusable = makeFocusable(targetTabpanel);

  if (moveFocus) focusable.focus();
}
