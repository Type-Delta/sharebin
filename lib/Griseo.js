//////////// Griseo ////////////
/**tools for frontend Web Javascript branch from Tools.js
 * @version 1.3.5
 * @requires Tools.js
 * @changes
 * - added `onVisibilityChange()`
 * - added encodeInnerHTML()
 * - onceClickOutside() now return listener like onClickOutside()
 */
"use strict";
let _local = {};

if (typeof window !== 'undefined') _local.Tools = window._tools;
else if (typeof require !== 'undefined') _local.Tools = require('./Tools.js');
else {
   /**clean array
    * @param {any[]} Arr array to clean
    * @param {any|any[]} itemToClean items to wipe off, optional(if None is provide,
    * will remove empty string, Array, Object),
    * can be array EX: ['0', '', 'g'] (those are Black-Listed items)
    * @returns new cleaned array
    */
   _local.Tools = function cleanArr(Arr, itemToClean = null) {
      if (itemToClean && itemToClean instanceof Array) {
         return Arr.filter(function (itemInArr) {
            return !itemToClean.includes(itemInArr);
         });
      }

      if (itemToClean) {
         return Arr.filter(function (itemInArr) {
            return itemInArr !== itemToClean;
         });
      }

      return Arr.filter(itemInArr =>
         (itemInArr !== '' && itemInArr !== '\r' && !Tools.isEmptyArray(itemInArr) && !Tools.isEmptyObject(itemInArr))
      );
   }
}


const Griseo = {
   /**set listener for every elements with the given `className`
    * @param {string} className
    * @param {string} eventName
    * @param {Function} callback
    */
   addListenerByClass(className, eventName, callback) {
      [...document.getElementsByClassName(className)].forEach(e => {
         e.addEventListener(eventName, callback);
      });
   },

   /**
    * encode HTML special characters in the given plain text
    *
    * similar to setting `textContent` of an element
    * @param {string} plainText
    * @returns {string} encoded HTML
    */
   encodeInnerHTML(plainText) {
      if (!plainText) return '';
      return plainText.replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/\n/g, '<br>')
         .replace(/'/g, "&#039;");
   },

   /**get child that contains the given class in the parent element
    * @param {string} cName
    * @param {HTMLElement} parent
    * @returns {HTMLElement[]} array of child element that contains the given class
    */
   getChildWithClassName(cName, parent) {
      if (!parent) return [];

      let targetchild = [];
      for (let child of [...parent.children]) {
         if (child.classList.contains(cName))
            targetchild.push(child);
      }
      return targetchild;
   },

   /**
    * get parent element that contains the given class
    * @param {string} cName
    * @param {HTMLElement} child
    * @param {number} [depth=5] how deep to search for the parent
    */
   getParentWithClassName(cName, child, depth = 5) {
      if (!child) return null;
      if (child.classList.contains(cName)) return child;

      let parent = child.parentElement;
      while (depth-- && parent && !parent.classList.contains(cName)) {
         parent = parent.parentElement;
      }

      return depth >= 0 ? parent : null;
   },


   /**
    * get current preferred color scheme
    *
    * return `null` if browser doesn't support `matchMedia`
    */
   getPreferredColorScheme() {
      if (!window.matchMedia) return null; // if browser doesn't support matchMedia
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
   },



   /**callback when user clicked outside the given element
    * @param {HTMLElement|Element} element
    * @param {(this: any, ev?: MouseEvent) => any} callback
    * @returns {(this: any, ev?: any) => any} use this to clear event listener
    */
   onClickOutside(element, callback) {
      const outsideClickListener = function (event) {
         if (!element.contains(event.target)) {
            callback.bind(this)(event);
         }
      }

      document.addEventListener('click', outsideClickListener);
      return outsideClickListener;
   },

   /**callback when user clicked outside the given element
    * **Similar to `onClickOutside()` but only invoke ONCE!**
    * @param {HTMLElement} element
    * @param {(this: any, ev?: any) => any} callback
    * @returns {(this: any, ev?: any) => any} use this to clear event listener
    */
   onceClickOutside(element, callback) {
      const outsideClickListener = event => {
         if (!element.contains(event.target)) {
            callback();
            document.removeEventListener('click', outsideClickListener);
         }
      }

      document.addEventListener('click', outsideClickListener);
      return outsideClickListener;
   },

   /**
    * @callback PrefferredColorSchemeChangeCB
    * @param {MediaQueryList} this
    * @param {'dark'|'light'} currentColorScheme
    * @returns {any}
    */
   /**
    * callback when preferred color scheme change
    *
    * return `null` if browser doesn't support `matchMedia`
    * @param {PrefferredColorSchemeChangeCB} callback
    * @returns {MediaQueryList|null}
    */
   onPrefferredColorSchemeChange(callback) {
      if (!window.matchMedia) return null; // if browser doesn't support matchMedia

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', function (e) {
         callback.bind(this)(e.matches ? 'dark' : 'light');
      });
      return mediaQuery;
   },


   /**
    * @callback VisibilityChangeCB
    * @param {{visibilityState: 'visible'|'hidden', browserPrefix: string}} event
    * @returns {void}
    */
   /**
    * callback when visibility state of the document changes
    *
    * A drop-in replacement for `document.visibilityState` with enhanced accuracy and better browser support.
    * @param {VisibilityChangeCB} callback
    * @param {boolean} [watchFocus=false] if true, the callback will be called when the document gains or loses focus
    */
   onVisibilityChange(callback, watchFocus = false) {
      const browserPrefixes = ['moz', 'ms', 'o', 'webkit'];
      const browserPrefix = getBrowserPrefix();
      let lastStateVisible = true;
      let lastTriggerTime = 0;

      document.addEventListener(getVisibilityEvent(browserPrefix), handleVisibilityChange, false);
      if (watchFocus) {
         document.addEventListener('focus', () => handleVisibilityChange(true), false);
         document.addEventListener('blur', () => handleVisibilityChange(false), false);
      }


      function getHiddenPropertyName(prefix) {
         return (prefix ? prefix + 'Hidden' : 'hidden');
      }

      function getVisibilityEvent(prefix) {
         return (prefix ? prefix : '') + 'visibilitychange';
      }

      function getBrowserPrefix() {
         for (var i = 0; i < browserPrefixes.length; i++) {
            if (getHiddenPropertyName(browserPrefixes[i]) in document)
               return browserPrefixes[i];
         }

         return null;
      }

      function handleVisibilityChange(flag) {
         flag = flag === true || flag === false ? flag : false;

         if (!flag || document[getHiddenPropertyName(browserPrefix)]) {
            if (watchFocus && lastStateVisible === false && Date.now() - lastTriggerTime < 200)
               return;

            callback({
               visibilityState: 'hidden',
               browserPrefix: browserPrefix,
            });
         }
         else {
            if (watchFocus && lastStateVisible === true && Date.now() - lastTriggerTime < 200)
               return;

            callback({
               visibilityState: 'visible',
               browserPrefix: browserPrefix,
            });
         }

         if (watchFocus) {
            lastStateVisible = flag;
            lastTriggerTime = Date.now();
         }
      }
   },

   /**clear event listener for `onClickOutside()` and `hideOnClickOutside()`
    * @example
    * let listener = onClickOutside(elem, doStuff);
    * function doStuff(){
    *    // . . .
    *    clearClickOutside(listener);
    * }
    * @param {(this: any, ev?: any) => any} listener
    */
   clearClickOutside(listener) {
      document.removeEventListener('click', listener);
   },



   /**HTMLElement handler for textarea 'keydown' event
    * this prevent Tab key from select other element
    * and make Tab works like it should in most text editors
    * @param {KeyboardEvent} event
    * @param {HTMLTextAreaElement} _this element that cause this `KeyboardEvent`
    */
   handleTextarea_TabKeyPressed(event, _this) {
      if (event.key != 'Tab') return;
      event.preventDefault();
      const start = _this.selectionStart;
      const end = _this.selectionEnd;

      // if user didn't select any text, just place caret somewhere without selection
      if (start == end) {
         // set textarea value to: text before caret + tab + text after caret
         _this.value = _this.value.substring(0, start) +
            "\t" + _this.value.substring(end);

         // put caret at the right position again
         _this.selectionStart = _this.selectionEnd = start + 1;
         return;
      }


      let selectedText = _this.value.substring(start, end + 1);
      let addedLength = selectedText.length;
      selectedText = selectedText.replace(/\n/g, '\n\t');

      addedLength = selectedText.length - addedLength;
      /**
       * if there are no '\n' replace all content in `selectedText`
       * else remove trailing '\t' and it to the front
       *
       * (v no '\n' here, no indent added)
       * |some text to add
       * |tab indent
       * |         (^ extra '\n')
       */
      if (!addedLength) selectedText = '\t';
      else {
         if (selectedText.endsWith('\t'))
            selectedText = selectedText.slice(0, selectedText.length - 1);
         selectedText = '\t' + selectedText;
      }

      _this.value = _this.value.substring(0, start) +
         selectedText + _this.value.substring(end);

      _this.selectionStart = start;
      _this.selectionEnd = end + addedLength;
   },



   /**make the element automatically hide itself when
    * user click outside this element
    * @param {HTMLElement} element
    * @param {string|HTMLElement} elemToHide
    * @returns {Function} use this to clear event listener
    */
   hideOnClickOutside(element, elemToHide = 'this') {
      const targetElem = elemToHide === 'this' ? element : elemToHide;

      const outsideClickListener = event => {
         if (!element.contains(event.target) && Griseo.isVisible(targetElem)) { // or use: event.target.closest(selector) === null
            targetElem.style.display = 'none';
         }
      }

      document.addEventListener('click', outsideClickListener);
      return outsideClickListener;
   },



   /**set all selected elements that matched the `specifier` as visible
    * and hide others the that doesn't match
    * @param {string} selector querySelector for 'selected elements'
    * @param {{id: string, class: string}} specifier ID and or ClassName any selected element that
    * match this specifier will be visible
    * @param {string} displayType Element style.display
    */
   hideOtherElements(selector, specifier, displayType = null) {
      const elements = document.querySelectorAll(selector);
      const hasId = !!specifier.id;
      const hasClass = !!specifier.class;

      for (const elem of [...elements]) {
         // pls ignore this mess T^T
         const validId = hasId ? elem.id == specifier.id : false;
         const validClass = hasClass ? isClassMatched(elem.className) : false;

         if ((validClass && (!hasId || validId)) || validId && !hasClass) {
            if (displayType) elem.style.display = displayType;
         } else elem.style.display = 'none';
      }

      function isClassMatched(className) {
         if (specifier.class.includes(' ')) {
            const eClassList = className.split(' ');
            if (eClassList.length <= 0) return false;

            for (const sClass of specifier.class.split(' ')) {
               if (!eClassList.includes(sClass)) return false;
            }
            return true;
         }

         return className == specifier.class;
      }
   },






   /**hides all element selected by the `selector`
    * this function hide elements by set its display type to 'none'
    * @param {string} selector querySelector
    */
   hideAllElements(selector) {
      const elements = document.querySelectorAll(selector);
      for (const e of [...elements]) {
         e.style.display = 'none';
      }
   },


   /**check if the given coordinates is inside
    * the element Rect or not
    * @param {DOMRect} elemRect
    * @param {number} x
    * @param {number} y
    */
   isPosInside(x, y, elemRect) {
      return (
         x > elemRect.left && x < elemRect.right &&
         y > elemRect.top && y < elemRect.bottom
      );
   },


   /**check if coordinates of the given element is inside
    * the element Rect or not
    * @param {DOMRect} elemRect
    * @param {HTMLElement} elem
    */
   isElemPosInside(elem, elemRect) {
      const { x, y } = elem.getBoundingClientRect();

      return Griseo.isPosInside(x, y, elemRect);
   },



   /**predicates whether any of the selected element can be seen
    * @param {string} selector querySelector
    */
   isSelectedVisible(selector) {
      const elements = document.querySelectorAll(selector);
      for (const e of [...elements]) {
         if (Griseo.isVisible(e)) return true;
      }
      return false;
   },



   /**predicates whether the element is currently visible or not
    * (source (2018-03-11): https://github.com/jquery/jquery/blob/master/src/css/hiddenVisibleSelectors.js)
    * @param {HTMLElement} elem
    */
   isVisible: elem =>
      !!elem &&
      !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length) &&
      window.getComputedStyle(elem).visibility !== "hidden",



   KeyBind: class KeyBind {
      /**raw keybinding, each keys separated by '+'
       */
      rawBinding;
      /**normalized keybinding stored in Set
       * each keys are normalize so that it can be compared directly
       * with `KeyboardEvent.Key`
       */
      keys;
      /**
       * @param {string} strKeyBind raw keybinding, each keys seperated by '+'
       */
      constructor(strKeyBind) {
         this.rawBinding = strKeyBind;
         this.keys = this.#normalize(strKeyBind);
      }

      /**
       * @deprecated use `KeyBind.of()` instead.
       * @param {string} strKeyBind raw keybinding, each keys seperated by '+'
       * @returns {KeyBind} new KeyBind instance
       */
      static key(strKeyBind) {
         return new KeyBind(strKeyBind);
      }

      /**
       * Create a KeyBind instance from a raw keybinding string.
       * All the key names can be found here: https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_code_values
       * Plus some extra aliases:
       * - `Ctrl` for `ControlLeft` and `ControlRight`
       * - `Cmd` or `Command` for `MetaLeft` and `MetaRight`
       * - `Esc` for `Escape`
       * - `Enter` for `Enter` and `NumpadEnter`
       * - `CtrlOrCmd` for `ControlLeft`, `ControlRight`, `MetaLeft`, and `MetaRight`
       * - `Alt` for `AltLeft` and `AltRight`
       * - `Shift` for `ShiftLeft` and `ShiftRight`
       * - `Num0` to `Num9` for `Numpad0` to `Numpad9`
       * - `A` to `Z` for `KeyA` to `KeyZ`
       * - `0` to `9` for `Digit0` to `Digit9` and `Numpad0` to `Numpad9`
       *
       * ## Note that: All the key names are case-sensitive!
       * @param {string} strKeyBind raw keybinding, each keys seperated by '+'
       * @returns {KeyBind} new KeyBind instance
       */
      static of(strKeyBind) {
         return new KeyBind(strKeyBind);
      }

      /**
       * check if the given key is part of the keybind
       * @param {string} key
       * @returns {boolean} true if the key is part of the keybind
       */
      has(key) {
         for (const k of this.keys) {
            if (k.includes(key)) return true;
         }
         return false;
      }

      /**check if the given keysHeld matches the keybind
       * @param {Set<string>} keysHeld
       * @returns {boolean} true if the keysHeld matches the keybind
       */
      matches(keysHeld, allowExtraKeys = false) {
         let matchedIndexes = [];

         for (const key of keysHeld) {
            let matched = false;
            for (let i = 0; i < this.keys.length; i++) {
               if (this.keys[i].includes(key)) {
                  matched = true;
                  if (!matchedIndexes.includes(i)) matchedIndexes.push(i);
                  break;
               }
            }

            if (!matched && !allowExtraKeys) return false; // if the key is not part of the keybind and allowExtraKeys is false
         }

         for (let i = this.keys.length - 1; i >= 0; i--) {
            if (matchedIndexes[i] !== i)
               return false;
         }
         return true;
      }

      /**
       * @param {string} strKeyBind
       * @returns {string[][]} normalized keybind
       */
      #normalize(strKeyBind) {
         const keys = _local.Tools.cleanArr(strKeyBind.split('+'));

         return keys.map((v, i, a) => {
            v = v.trim();
            switch (v) {
               case 'Ctrl':
                  return ['ControlLeft', 'ControlRight'];
               case 'Cmd':
               case 'Command':
                  return ['MetaLeft', 'MetaRight', 'OSLeft', 'OSRight'];
               case 'Esc':
                  return ['Escape'];
               case 'Enter':
                  return ['Enter', 'NumpadEnter'];
               case 'CtrlOrCmd':
                  // if user is on Mac, use Command keys, otherwise use Control keys
                  if (navigator.userAgent.includes('Mac'))
                     return ['MetaLeft', 'MetaRight', 'OSLeft', 'OSRight'];
                  else return ['ControlLeft', 'ControlRight'];
               case 'Alt':
                  return ['AltLeft', 'AltRight'];
               case 'Shift':
                  return ['ShiftLeft', 'ShiftRight'];
               default:
                  if (/^\d$/.test(v)) {
                     return ['Digit' + v, 'Numpad' + v];
                  }
                  else if (/^[A-Z]$/.test(v)) {
                     return ['Key' + v];
                  }
                  else if (/^Num\d$/.test(v)) {
                     return ['Numpad' + v.slice(3)];
                  }
            }
         });
      }
   },




   Keyboard: class Keyboard {
      /**map every keys that's being pressed
       * @type {Set<string>}
       */
      activeKeys;
      /**
       * @type {Map<KeyBind, Function>}
       */
      catchList;
      debugMode = false;
      constructor() {
         this.activeKeys = new Set();
         this.catchList = new Map();
      }
      /**Keep track of what key is currently being pressed
       * **this function should be called everytime `keydown` and `keyup`
       * Events trigger**
       * @param {KeyboardEvent} ev
       */
      handleKeyPress = (ev) => {
         if (ev.type == 'keydown') {
            this.activeKeys.add(ev.code);
            //if(this.debugMode) console.log(this.activeKeys);

            for (const [keybind, callback] of this.catchList) {
               if (this.test(keybind, false)) {
                  if (callback() !== false)
                     ev.preventDefault();
               }
            }
         } else if (ev.type == 'keyup') this.activeKeys.delete(ev.code);
      }

      /**test if the given keybind is being pressed by user
       * @param {KeyBind} keybind
       */
      test(keybind, allowExtraKeys = false) {
         if (this.debugMode) {
            console.log('activeKeys: ', this.activeKeys);
            console.log('keybind: ', keybind.keys);
         }
         return keybind.matches(this.activeKeys, allowExtraKeys);
      }

      /**
       * listen for the given keybind, `preventDefault()`
       * and call a callback function
       *
       * to disable `preventDefault()` return `false` in the callback
       * @param {Function} callback
       * @param {Partial<KeyBind>} keybind
       */
      catch(keybind, callback) {
         this.catchList.set(keybind, callback);
         return this;
      }

      /**remove catch listener
       * @param {KeyBind} keybind
       */
      unCatch(keybind) {
         this.catchList.delete(keybind);
         return this;
      }

      /**
       * bind the Keyboard to the given element
       * @param {HTMLElement} element
       */
      bind(element) {
         element.addEventListener('keydown', this.handleKeyPress);
         element.addEventListener('keyup', this.handleKeyPress);
         return this;
      }

      /**unbind the Keyboard from the given element
       * @param {HTMLElement} element
       * @return {Keyboard} this
       */
      unbind(element) {
         element.removeEventListener('keydown', this.handleKeyPress);
         element.removeEventListener('keyup', this.handleKeyPress);
         return this;
      }
   },



   /**### Navigation
    * Handle URL related tasks
    */
   navigation: {
      /**
       * get query from the current URL
       * @returns {{ [key: string]: any }} return an object that contains all query
       */
      getQuery() {
         let entries = [
            ...(new URLSearchParams(window.location.search)).entries()
         ];

         return entries.map(([key, value]) => [key, value === '' ? true : value])
            .reduce((acc, [key, value]) => {
               if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"'))
                  value = value.slice(1, -1);

               value = _local.Tools.parseValue(value);

               if (acc[key] === undefined) acc[key] = value;
               else if (acc[key] instanceof Array) acc[key].push(value);
               else acc[key] = [acc[key], value];

               return acc;
            }, {});
      }
   },




   /**reload all CSS in the document
    */
   reloadCSS() {
      const links = document.getElementsByTagName("link");
      for (const cl in links) {
         const link = links[cl];
         if (link.rel === "stylesheet") link.href += "";
      }
   },


   /**Function used to determine the order of the elements.
    * It is expected to return a negative value
    * if the first argument is less than the second argument,
    * zero if they're equal, and a positive value otherwise.
    * If omitted, the elements are sorted in ascending, ASCII character order,
    * judging from the `textContent` value.
    * @callback CompareFunction
    * @param {HTMLElement} elemA
    * @param {HTMLElement} elemB
    * @returns {number}
    */

   /**Sort elements in place, this function does not modify the given Array/Collection
   * but the actual orders of those elements in the `document`
   * @param {HTMLCollection|HTMLElement[]} elements an array of Element or HTMLCollection
   * @param {CompareFunction} compareFn
   * Function used to determine the order of the elements.
   * It is expected to return a negative value
   * if the first argument is less than the second argument,
   * zero if they're equal, and a positive value otherwise.
   * If omitted, the elements are sorted in ascending, ASCII character order,
   * judging from the `textContent` value.
   */
   sortElements(
      elements,
      compareFn = (a, b) => a.textContent.localeCompare(b.textContent)
   ) {
      if (elements instanceof HTMLCollection) elements = [...elements];
      const parent = elements[0].parentElement;

      quickSort(0, elements.length);

      function quickSort(start, end) {
         if (end === start) return;
         const pivot = get3Median(start, end);
         let pivotIndex = elements.findIndex(e => e.isSameNode(pivot));

         for (let i = start; i < end; i++) {
            if (elements[i].isSameNode(pivot)) continue;

            if (compareFn(elements[i], pivot) <= 0) {
               if (i < pivotIndex) continue;
               pivot.insertAdjacentElement('beforebegin', elements[i]);
            }
            else {
               if (i > pivotIndex) continue;
               pivot.insertAdjacentElement('afterend', elements[i]);
            }
         }

         const sorted = [...parent.children];
         pivotIndex = sorted.findIndex(e => e.isSameNode(pivot));

         for (let i = start; i < end; i++) elements[i] = sorted[i];
         quickSort(start, pivotIndex);
         quickSort(pivotIndex + 1, end);
      }


      function get3Median(start, end) {
         const first = elements[start];
         const mid = elements[(end - start) >> 1];
         const last = elements[end - 1];
         let medElem, belowMed;

         // find the potential median: the greater value of two is the potential median
         if (compareFn(first, mid) < 0) { // first is lessthan mid
            medElem = mid;
            belowMed = first;
         } else {
            medElem = first;
            belowMed = mid;
         }

         // find the real median
         if (compareFn(medElem, last) < 0);// potential median is less then last: potential median is median
         else if (compareFn(last, belowMed) < 0) medElem = belowMed;
         else medElem = last;
         return medElem;
      }
   },


   /**
    * @param {{[key: string]: any}} query query object
    */
   stringifyQuery(query) {
      return Object.entries(query)
         .map(([key, value]) => {
            key = encodeURIComponent(key);

            if (value instanceof Array)
               return value.map(v => `${key}=${encodeURIComponent(v)}`).join('&');
            return `${key}=${encodeURIComponent(value)}`;
         })
         .join('&');
   }
}


if (typeof module !== 'undefined') module.exports = Griseo;
if (typeof window !== 'undefined') window._griseo = Griseo;
