(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.llob = {}));
})(this, (function (exports) { 'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	const root =
	  (typeof globalThis !== "undefined" && globalThis) ||
	  (typeof self !== "undefined" && self) ||
	  (typeof commonjsGlobal !== "undefined" && commonjsGlobal);

	const shouldPolyfillEvent = (function() {
	  try {
	    new root.Event("");
	  } catch (error) {
	    return true;
	  }
	  return false;
	})();

	const shouldPolyfillEventTarget = (function() {
	  try {
	    new root.EventTarget();
	  } catch (error) {
	    return true;
	  }
	  return false;
	})();

	if (shouldPolyfillEvent) {
	  root.Event = (function () {
	    function Event(type, options) {
	        this.bubbles = !!options && !!options.bubbles;
	        this.cancelable = !!options && !!options.cancelable;
	        this.composed = !!options && !!options.composed;
	      this.type = type;
	    }

	    return Event;
	  })();
	}

	if (shouldPolyfillEventTarget) {
	  root.EventTarget = (function () {
	    function EventTarget() {
	      this.__listeners = new Map();
	    }

	    EventTarget.prototype = Object.create(Object.prototype);

	    EventTarget.prototype.addEventListener = function (
	      type,
	      listener,
	      options
	    ) {
	      if (arguments.length < 2) {
	        throw new TypeError(
	          "TypeError: Failed to execute 'addEventListener' on 'EventTarget': 2 arguments required, but only " + arguments.length + " present."
	        );
	      }
	      const __listeners = this.__listeners;
	      const actualType = type.toString();
	      if (!__listeners.has(actualType)) {
	        __listeners.set(actualType, new Map());
	      }
	      const listenersForType = __listeners.get(actualType);
	      if (!listenersForType.has(listener)) {
	        // Any given listener is only registered once
	        listenersForType.set(listener, options);
	      }
	    };

	    EventTarget.prototype.removeEventListener = function (
	      type,
	      listener,
	      _options
	    ) {
	      if (arguments.length < 2) {
	        throw new TypeError(
	          "TypeError: Failed to execute 'addEventListener' on 'EventTarget': 2 arguments required, but only " + arguments.length + " present."
	        );
	      }
	      const __listeners = this.__listeners;
	      const actualType = type.toString();
	      if (__listeners.has(actualType)) {
	        const listenersForType = __listeners.get(actualType);
	        if (listenersForType.has(listener)) {
	          listenersForType.delete(listener);
	        }
	      }
	    };

	    EventTarget.prototype.dispatchEvent = function (event) {
	      if (!(event instanceof Event)) {
	        throw new TypeError(
	          "Failed to execute 'dispatchEvent' on 'EventTarget': parameter 1 is not of type 'Event'."
	        );
	      }
	      const type = event.type;
	      const __listeners = this.__listeners;
	      const listenersForType = __listeners.get(type);
	      if (listenersForType) {
	        for (var listnerEntry of listenersForType.entries()) {
	          const listener = listnerEntry[0];
	          const options = listnerEntry[1];

	          try {
	            if (typeof listener === "function") {
	              // Listener functions must be executed with the EventTarget as the `this` context.
	              listener.call(this, event);
	            } else if (listener && typeof listener.handleEvent === "function") {
	              // Listener objects have their handleEvent method called, if they have one
	              listener.handleEvent(event);
	            }
	          } catch (err) {
	            // We need to report the error to the global error handling event,
	            // but we do not want to break the loop that is executing the events.
	            // Unfortunately, this is the best we can do, which isn't great, because the
	            // native EventTarget will actually do this synchronously before moving to the next
	            // event in the loop.
	            setTimeout(() => {
	              throw err;
	            });
	          }
	          if (options && options.once) {
	            // If this was registered with { once: true }, we need
	            // to remove it now.
	            listenersForType.delete(listener);
	          }
	        }
	      }
	      // Since there are no cancellable events on a base EventTarget,
	      // this should always return true.
	      return true;
	    };

	    return EventTarget;
	  })();
	}

	let CustomEvent$1 = class CustomEvent extends Event {
	    constructor(type, eventInitDict) {
	        super(type, eventInitDict);
	        this.detail = eventInitDict?.detail ? eventInitDict.detail : {};
	    }
	    initCustomEvent(type, bubbles, cancelable, detail) {
	        return new CustomEvent(type, { bubbles, cancelable, detail });
	    }
	};
	globalThis.CustomEvent = CustomEvent$1;

	var __defProp$1 = Object.defineProperty;
	var __name$1 = (target, value) => __defProp$1(target, "name", { value, configurable: true });

	// packages/cosmokit/src/misc.ts
	function noop() {
	}
	__name$1(noop, "noop");
	function isNullable(value) {
	  return value === null || value === void 0;
	}
	__name$1(isNullable, "isNullable");
	function isPlainObject(data) {
	  return data && typeof data === "object" && !Array.isArray(data);
	}
	__name$1(isPlainObject, "isPlainObject");
	function filterKeys(object, filter) {
	  return Object.fromEntries(Object.entries(object).filter(([key, value]) => filter(key, value)));
	}
	__name$1(filterKeys, "filterKeys");
	function mapValues(object, transform) {
	  return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, transform(value, key)]));
	}
	__name$1(mapValues, "mapValues");
	function is(type, value) {
	  if (arguments.length === 1)
	    return (value2) => is(type, value2);
	  return type in globalThis && value instanceof globalThis[type] || Object.prototype.toString.call(value).slice(8, -1) === type;
	}
	__name$1(is, "is");
	function clone(source) {
	  if (!source || typeof source !== "object")
	    return source;
	  if (Array.isArray(source))
	    return source.map(clone);
	  if (is("Date", source))
	    return new Date(source.valueOf());
	  if (is("RegExp", source))
	    return new RegExp(source.source, source.flags);
	  return mapValues(source, clone);
	}
	__name$1(clone, "clone");
	function deepEqual(a, b, strict) {
	  if (a === b)
	    return true;
	  if (!strict && isNullable(a) && isNullable(b))
	    return true;
	  if (typeof a !== typeof b)
	    return false;
	  if (typeof a !== "object")
	    return false;
	  if (!a || !b)
	    return false;
	  function check(test, then) {
	    return test(a) ? test(b) ? then(a, b) : false : test(b) ? false : void 0;
	  }
	  __name$1(check, "check");
	  return check(Array.isArray, (a2, b2) => a2.length === b2.length && a2.every((item, index) => deepEqual(item, b2[index]))) ?? check(is("Date"), (a2, b2) => a2.valueOf() === b2.valueOf()) ?? check(is("RegExp"), (a2, b2) => a2.source === b2.source && a2.flags === b2.flags) ?? Object.keys({ ...a, ...b }).every((key) => deepEqual(a[key], b[key], strict));
	}
	__name$1(deepEqual, "deepEqual");
	function pick(source, keys, forced) {
	  if (!keys)
	    return { ...source };
	  const result = {};
	  for (const key of keys) {
	    if (forced || source[key] !== void 0)
	      result[key] = source[key];
	  }
	  return result;
	}
	__name$1(pick, "pick");
	function omit(source, keys) {
	  if (!keys)
	    return { ...source };
	  const result = { ...source };
	  for (const key of keys) {
	    Reflect.deleteProperty(result, key);
	  }
	  return result;
	}
	__name$1(omit, "omit");
	function defineProperty(object, key, value) {
	  return Object.defineProperty(object, key, { writable: true, value, enumerable: false });
	}
	__name$1(defineProperty, "defineProperty");

	// packages/cosmokit/src/array.ts
	function contain(array1, array2) {
	  return array2.every((item) => array1.includes(item));
	}
	__name$1(contain, "contain");
	function intersection(array1, array2) {
	  return array1.filter((item) => array2.includes(item));
	}
	__name$1(intersection, "intersection");
	function difference(array1, array2) {
	  return array1.filter((item) => !array2.includes(item));
	}
	__name$1(difference, "difference");
	function union(array1, array2) {
	  return Array.from(/* @__PURE__ */ new Set([...array1, ...array2]));
	}
	__name$1(union, "union");
	function deduplicate(array) {
	  return [...new Set(array)];
	}
	__name$1(deduplicate, "deduplicate");
	function remove(list, item) {
	  const index = list.indexOf(item);
	  if (index >= 0) {
	    list.splice(index, 1);
	    return true;
	  } else {
	    return false;
	  }
	}
	__name$1(remove, "remove");
	function makeArray(source) {
	  return Array.isArray(source) ? source : isNullable(source) ? [] : [source];
	}
	__name$1(makeArray, "makeArray");

	// packages/cosmokit/src/binary.ts
	function arrayBufferToBase64(buffer) {
	  if (typeof Buffer !== "undefined") {
	    return Buffer.from(buffer).toString("base64");
	  }
	  let binary = "";
	  const bytes = new Uint8Array(buffer);
	  for (let i = 0; i < bytes.byteLength; i++) {
	    binary += String.fromCharCode(bytes[i]);
	  }
	  return btoa(binary);
	}
	__name$1(arrayBufferToBase64, "arrayBufferToBase64");
	function base64ToArrayBuffer(base64) {
	  if (typeof Buffer !== "undefined") {
	    const buf = Buffer.from(base64, "base64");
	    return new Uint8Array(buf.buffer, buf.byteOffset, buf.length);
	  }
	  const binary = atob(base64.replace(/\s/g, ""));
	  const buffer = new Uint8Array(binary.length);
	  for (let i = 0; i < binary.length; i++) {
	    buffer[i] = binary.charCodeAt(i);
	  }
	  return buffer;
	}
	__name$1(base64ToArrayBuffer, "base64ToArrayBuffer");

	// packages/cosmokit/src/string.ts
	function capitalize(source) {
	  return source.charAt(0).toUpperCase() + source.slice(1);
	}
	__name$1(capitalize, "capitalize");
	function uncapitalize(source) {
	  return source.charAt(0).toLowerCase() + source.slice(1);
	}
	__name$1(uncapitalize, "uncapitalize");
	function camelCase(source) {
	  return source.replace(/[_-][a-z]/g, (str) => str.slice(1).toUpperCase());
	}
	__name$1(camelCase, "camelCase");
	function paramCase(source) {
	  return uncapitalize(source).replace(/_/g, "-").replace(/.[A-Z]+/g, (str) => str[0] + "-" + str.slice(1).toLowerCase());
	}
	__name$1(paramCase, "paramCase");
	function snakeCase(source) {
	  return uncapitalize(source).replace(/-/g, "_").replace(/.[A-Z]+/g, (str) => str[0] + "_" + str.slice(1).toLowerCase());
	}
	__name$1(snakeCase, "snakeCase");
	var camelize = camelCase;
	var hyphenate = paramCase;
	function trimSlash(source) {
	  return source.replace(/\/$/, "");
	}
	__name$1(trimSlash, "trimSlash");
	function sanitize(source) {
	  if (!source.startsWith("/"))
	    source = "/" + source;
	  return trimSlash(source);
	}
	__name$1(sanitize, "sanitize");

	// packages/cosmokit/src/time.ts
	exports.Time = void 0;
	((Time2) => {
	  Time2.millisecond = 1;
	  Time2.second = 1e3;
	  Time2.minute = Time2.second * 60;
	  Time2.hour = Time2.minute * 60;
	  Time2.day = Time2.hour * 24;
	  Time2.week = Time2.day * 7;
	  let timezoneOffset = (/* @__PURE__ */ new Date()).getTimezoneOffset();
	  function setTimezoneOffset(offset) {
	    timezoneOffset = offset;
	  }
	  Time2.setTimezoneOffset = setTimezoneOffset;
	  __name$1(setTimezoneOffset, "setTimezoneOffset");
	  function getTimezoneOffset() {
	    return timezoneOffset;
	  }
	  Time2.getTimezoneOffset = getTimezoneOffset;
	  __name$1(getTimezoneOffset, "getTimezoneOffset");
	  function getDateNumber(date = /* @__PURE__ */ new Date(), offset) {
	    if (typeof date === "number")
	      date = new Date(date);
	    if (offset === void 0)
	      offset = timezoneOffset;
	    return Math.floor((date.valueOf() / Time2.minute - offset) / 1440);
	  }
	  Time2.getDateNumber = getDateNumber;
	  __name$1(getDateNumber, "getDateNumber");
	  function fromDateNumber(value, offset) {
	    const date = new Date(value * Time2.day);
	    if (offset === void 0)
	      offset = timezoneOffset;
	    return new Date(+date + offset * Time2.minute);
	  }
	  Time2.fromDateNumber = fromDateNumber;
	  __name$1(fromDateNumber, "fromDateNumber");
	  const numeric = /\d+(?:\.\d+)?/.source;
	  const timeRegExp = new RegExp(`^${[
    "w(?:eek(?:s)?)?",
    "d(?:ay(?:s)?)?",
    "h(?:our(?:s)?)?",
    "m(?:in(?:ute)?(?:s)?)?",
    "s(?:ec(?:ond)?(?:s)?)?"
  ].map((unit) => `(${numeric}${unit})?`).join("")}$`);
	  function parseTime(source) {
	    const capture = timeRegExp.exec(source);
	    if (!capture)
	      return 0;
	    return (parseFloat(capture[1]) * Time2.week || 0) + (parseFloat(capture[2]) * Time2.day || 0) + (parseFloat(capture[3]) * Time2.hour || 0) + (parseFloat(capture[4]) * Time2.minute || 0) + (parseFloat(capture[5]) * Time2.second || 0);
	  }
	  Time2.parseTime = parseTime;
	  __name$1(parseTime, "parseTime");
	  function parseDate(date) {
	    const parsed = parseTime(date);
	    if (parsed) {
	      date = Date.now() + parsed;
	    } else if (/^\d{1,2}(:\d{1,2}){1,2}$/.test(date)) {
	      date = `${(/* @__PURE__ */ new Date()).toLocaleDateString()}-${date}`;
	    } else if (/^\d{1,2}-\d{1,2}-\d{1,2}(:\d{1,2}){1,2}$/.test(date)) {
	      date = `${(/* @__PURE__ */ new Date()).getFullYear()}-${date}`;
	    }
	    return date ? new Date(date) : /* @__PURE__ */ new Date();
	  }
	  Time2.parseDate = parseDate;
	  __name$1(parseDate, "parseDate");
	  function format(ms) {
	    const abs = Math.abs(ms);
	    if (abs >= Time2.day - Time2.hour / 2) {
	      return Math.round(ms / Time2.day) + "d";
	    } else if (abs >= Time2.hour - Time2.minute / 2) {
	      return Math.round(ms / Time2.hour) + "h";
	    } else if (abs >= Time2.minute - Time2.second / 2) {
	      return Math.round(ms / Time2.minute) + "m";
	    } else if (abs >= Time2.second) {
	      return Math.round(ms / Time2.second) + "s";
	    }
	    return ms + "ms";
	  }
	  Time2.format = format;
	  __name$1(format, "format");
	  function toDigits(source, length = 2) {
	    return source.toString().padStart(length, "0");
	  }
	  Time2.toDigits = toDigits;
	  __name$1(toDigits, "toDigits");
	  function template(template2, time = /* @__PURE__ */ new Date()) {
	    return template2.replace("yyyy", time.getFullYear().toString()).replace("yy", time.getFullYear().toString().slice(2)).replace("MM", toDigits(time.getMonth() + 1)).replace("dd", toDigits(time.getDate())).replace("hh", toDigits(time.getHours())).replace("mm", toDigits(time.getMinutes())).replace("ss", toDigits(time.getSeconds())).replace("SSS", toDigits(time.getMilliseconds(), 3));
	  }
	  Time2.template = template;
	  __name$1(template, "template");
	})(exports.Time || (exports.Time = {}));

	var __defProp = Object.defineProperty;
	var __getOwnPropNames = Object.getOwnPropertyNames;
	var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
	var __commonJS = (cb, mod) => function __require() {
	  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
	};
	var require_src = __commonJS({
	  "packages/schemastery/packages/core/src/index.ts"(exports, module) {
	    var kSchema = Symbol.for("schemastery");
	    globalThis.__schemastery_index__ ??= 0;
	    var Schema = /* @__PURE__ */ __name(function(options) {
	      const schema = /* @__PURE__ */ __name(function(data, options2) {
	        return Schema.resolve(data, schema, options2)[0];
	      }, "schema");
	      if (options.refs) {
	        const refs2 = mapValues(options.refs, (options2) => new Schema(options2));
	        const getRef = /* @__PURE__ */ __name((uid) => refs2[uid], "getRef");
	        for (const key in refs2) {
	          const options2 = refs2[key];
	          options2.sKey = getRef(options2.sKey);
	          options2.inner = getRef(options2.inner);
	          options2.list = options2.list && options2.list.map(getRef);
	          options2.dict = options2.dict && mapValues(options2.dict, getRef);
	        }
	        return refs2[options.uid];
	      }
	      Object.assign(schema, options);
	      if (typeof schema.callback === "string") {
	        try {
	          schema.callback = new Function("return " + schema.callback)();
	        } catch {
	        }
	      }
	      Object.defineProperty(schema, "uid", { value: globalThis.__schemastery_index__++ });
	      Object.setPrototypeOf(schema, Schema.prototype);
	      schema.meta ||= {};
	      schema.toString = schema.toString.bind(schema);
	      return schema;
	    }, "Schema");
	    Schema.prototype = Object.create(Function.prototype);
	    Schema.prototype[kSchema] = true;
	    var refs;
	    Schema.prototype.toJSON = /* @__PURE__ */ __name(function toJSON() {
	      if (refs) {
	        refs[this.uid] ??= JSON.parse(JSON.stringify({ ...this }));
	        return this.uid;
	      }
	      refs = { [this.uid]: { ...this } };
	      refs[this.uid] = JSON.parse(JSON.stringify({ ...this }));
	      const result = { uid: this.uid, refs };
	      refs = void 0;
	      return result;
	    }, "toJSON");
	    Schema.prototype.set = /* @__PURE__ */ __name(function set(key, value) {
	      this.dict[key] = value;
	      return this;
	    }, "set");
	    Schema.prototype.push = /* @__PURE__ */ __name(function push(value) {
	      this.list.push(value);
	      return this;
	    }, "push");
	    function mergeDesc(original, messages) {
	      const result = typeof original === "string" ? { "": original } : { ...original };
	      for (const locale in messages) {
	        const value = messages[locale];
	        if (value?.$description || value?.$desc) {
	          result[locale] = value.$description || value.$desc;
	        } else if (typeof value === "string") {
	          result[locale] = value;
	        }
	      }
	      return result;
	    }
	    __name(mergeDesc, "mergeDesc");
	    function getInner(value) {
	      return value?.$value ?? value?.$inner;
	    }
	    __name(getInner, "getInner");
	    function extractKeys(data) {
	      return Object.fromEntries(Object.entries(data ?? {}).filter(([key]) => !key.startsWith("$")));
	    }
	    __name(extractKeys, "extractKeys");
	    Schema.prototype.i18n = /* @__PURE__ */ __name(function i18n(messages) {
	      const schema = Schema(this);
	      schema.meta.description = mergeDesc(schema.meta.description, messages);
	      if (schema.dict) {
	        schema.dict = mapValues(schema.dict, (inner, key) => {
	          return inner.i18n(mapValues(messages, (data) => getInner(data)?.[key] ?? data?.[key]));
	        });
	      }
	      if (schema.list) {
	        schema.list = schema.list.map((inner, index) => {
	          return inner.i18n(mapValues(messages, (data = {}) => {
	            if (Array.isArray(getInner(data)))
	              return getInner(data)[index];
	            if (Array.isArray(data))
	              return data[index];
	            return extractKeys(data);
	          }));
	        });
	      }
	      if (schema.inner) {
	        schema.inner = schema.inner.i18n(mapValues(messages, (data) => {
	          if (getInner(data))
	            return getInner(data);
	          return extractKeys(data);
	        }));
	      }
	      if (schema.sKey) {
	        schema.sKey = schema.sKey.i18n(mapValues(messages, (data) => data?.$key));
	      }
	      return schema;
	    }, "i18n");
	    Schema.prototype.extra = /* @__PURE__ */ __name(function extra(key, value) {
	      const schema = Schema(this);
	      schema.meta = { ...schema.meta, [key]: value };
	      return schema;
	    }, "extra");
	    for (const key of ["required", "disabled", "collapse", "hidden", "loose"]) {
	      Object.assign(Schema.prototype, {
	        [key](value = true) {
	          const schema = Schema(this);
	          schema.meta = { ...schema.meta, [key]: value };
	          return schema;
	        }
	      });
	    }
	    Schema.prototype.deprecated = /* @__PURE__ */ __name(function deprecated() {
	      const schema = Schema(this);
	      schema.meta.badges ||= [];
	      schema.meta.badges.push({ text: "deprecated", type: "danger" });
	      return schema;
	    }, "deprecated");
	    Schema.prototype.experimental = /* @__PURE__ */ __name(function experimental() {
	      const schema = Schema(this);
	      schema.meta.badges ||= [];
	      schema.meta.badges.push({ text: "experimental", type: "warning" });
	      return schema;
	    }, "experimental");
	    Schema.prototype.pattern = /* @__PURE__ */ __name(function pattern(regexp) {
	      const schema = Schema(this);
	      const pattern2 = pick(regexp, ["source", "flags"]);
	      schema.meta = { ...schema.meta, pattern: pattern2 };
	      return schema;
	    }, "pattern");
	    Schema.prototype.simplify = /* @__PURE__ */ __name(function simplify(value) {
	      if (deepEqual(value, this.meta.default))
	        return null;
	      if (isNullable(value))
	        return value;
	      if (this.type === "object" || this.type === "dict") {
	        const result = {};
	        for (const key in value) {
	          const schema = this.type === "object" ? this.dict[key] : this.inner;
	          const item = schema?.simplify(value[key]);
	          if (!isNullable(item))
	            result[key] = item;
	        }
	        return result;
	      } else if (this.type === "array" || this.type === "tuple") {
	        const result = [];
	        value.forEach((value2, index) => {
	          const schema = this.type === "array" ? this.inner : this.list[index];
	          const item = schema ? schema.simplify(value2) : value2;
	          result.push(item);
	        });
	        return result;
	      } else if (this.type === "intersect") {
	        const result = {};
	        for (const item of this.list) {
	          Object.assign(result, item.simplify(value));
	        }
	        return result;
	      } else if (this.type === "union") {
	        for (const schema of this.list) {
	          try {
	            Schema.resolve(value, schema);
	            return schema.simplify(value);
	          } catch {
	          }
	        }
	      }
	      return value;
	    }, "simplify");
	    Schema.prototype.toString = /* @__PURE__ */ __name(function toString(inline) {
	      return formatters[this.type]?.(this, inline) ?? `Schema<${this.type}>`;
	    }, "toString");
	    Schema.prototype.role = /* @__PURE__ */ __name(function role(role, extra) {
	      const schema = Schema(this);
	      schema.meta = { ...schema.meta, role, extra };
	      return schema;
	    }, "role");
	    for (const key of ["default", "link", "comment", "description", "max", "min", "step"]) {
	      Object.assign(Schema.prototype, {
	        [key](value) {
	          const schema = Schema(this);
	          schema.meta = { ...schema.meta, [key]: value };
	          return schema;
	        }
	      });
	    }
	    var resolvers = {};
	    Schema.extend = /* @__PURE__ */ __name(function extend(type, resolve) {
	      resolvers[type] = resolve;
	    }, "extend");
	    Schema.resolve = /* @__PURE__ */ __name(function resolve(data, schema, options = {}, strict = false) {
	      if (!schema)
	        return [data];
	      if (isNullable(data)) {
	        if (schema.meta.required)
	          throw new TypeError(`missing required value`);
	        let current = schema;
	        let fallback = schema.meta.default;
	        while (current?.type === "intersect" && isNullable(fallback)) {
	          current = current.list[0];
	          fallback = current?.meta.default;
	        }
	        if (isNullable(fallback))
	          return [data];
	        data = clone(fallback);
	      }
	      const callback = resolvers[schema.type];
	      if (!callback)
	        throw new TypeError(`unsupported type "${schema.type}"`);
	      try {
	        return callback(data, schema, options, strict);
	      } catch (error) {
	        if (!schema.meta.loose)
	          throw error;
	        return [schema.meta.default];
	      }
	    }, "resolve");
	    Schema.from = /* @__PURE__ */ __name(function from(source) {
	      if (isNullable(source)) {
	        return Schema.any();
	      } else if (["string", "number", "boolean"].includes(typeof source)) {
	        return Schema.const(source).required();
	      } else if (source[kSchema]) {
	        return source;
	      } else if (typeof source === "function") {
	        switch (source) {
	          case String:
	            return Schema.string().required();
	          case Number:
	            return Schema.number().required();
	          case Boolean:
	            return Schema.boolean().required();
	          case Function:
	            return Schema.function().required();
	          default:
	            return Schema.is(source).required();
	        }
	      } else {
	        throw new TypeError(`cannot infer schema from ${source}`);
	      }
	    }, "from");
	    Schema.natural = /* @__PURE__ */ __name(function natural() {
	      return Schema.number().step(1).min(0);
	    }, "natural");
	    Schema.percent = /* @__PURE__ */ __name(function percent() {
	      return Schema.number().step(0.01).min(0).max(1).role("slider");
	    }, "percent");
	    Schema.date = /* @__PURE__ */ __name(function date() {
	      return Schema.union([
	        Schema.is(Date),
	        Schema.transform(Schema.string().role("datetime"), (value) => {
	          const date2 = new Date(value);
	          if (isNaN(+date2))
	            throw new TypeError(`invalid date "${value}"`);
	          return date2;
	        }, true)
	      ]);
	    }, "date");
	    Schema.extend("any", (data) => {
	      return [data];
	    });
	    Schema.extend("never", (data) => {
	      throw new TypeError(`expected nullable but got ${data}`);
	    });
	    Schema.extend("const", (data, { value }) => {
	      if (data === value)
	        return [value];
	      throw new TypeError(`expected ${value} but got ${data}`);
	    });
	    function checkWithinRange(data, meta, description) {
	      const { max = Infinity, min = -Infinity } = meta;
	      if (data > max)
	        throw new TypeError(`expected ${description} <= ${max} but got ${data}`);
	      if (data < min)
	        throw new TypeError(`expected ${description} >= ${min} but got ${data}`);
	    }
	    __name(checkWithinRange, "checkWithinRange");
	    Schema.extend("string", (data, { meta }) => {
	      if (typeof data !== "string")
	        throw new TypeError(`expected string but got ${data}`);
	      if (meta.pattern) {
	        const regexp = new RegExp(meta.pattern.source, meta.pattern.flags);
	        if (!regexp.test(data))
	          throw new TypeError(`expect string to match regexp ${regexp}`);
	      }
	      checkWithinRange(data.length, meta, "string length");
	      return [data];
	    });
	    function decimalShift(data, digits) {
	      const str = data.toString();
	      if (str.includes("e"))
	        return data * Math.pow(10, digits);
	      const index = str.indexOf(".");
	      if (index === -1)
	        return data * Math.pow(10, digits);
	      const frac = str.slice(index + 1);
	      const integer = str.slice(0, index);
	      if (frac.length <= digits)
	        return +(integer + frac.padEnd(digits, "0"));
	      return +(integer + frac.slice(0, digits) + "." + frac.slice(digits));
	    }
	    __name(decimalShift, "decimalShift");
	    function isMultipleOf(data, min, step) {
	      step = Math.abs(step);
	      if (!/^\d+\.\d+$/.test(step.toString())) {
	        return (data - min) % step === 0;
	      }
	      const index = step.toString().indexOf(".");
	      const digits = step.toString().slice(index + 1).length;
	      return Math.abs(decimalShift(data, digits) - decimalShift(min, digits)) % decimalShift(step, digits) === 0;
	    }
	    __name(isMultipleOf, "isMultipleOf");
	    Schema.extend("number", (data, { meta }) => {
	      if (typeof data !== "number")
	        throw new TypeError(`expected number but got ${data}`);
	      checkWithinRange(data, meta, "number");
	      const { step } = meta;
	      if (step && !isMultipleOf(data, meta.min ?? 0, step)) {
	        throw new TypeError(`expected number multiple of ${step} but got ${data}`);
	      }
	      return [data];
	    });
	    Schema.extend("boolean", (data) => {
	      if (typeof data === "boolean")
	        return [data];
	      throw new TypeError(`expected boolean but got ${data}`);
	    });
	    Schema.extend("bitset", (data, { bits, meta }) => {
	      let value = 0, keys = [];
	      if (typeof data === "number") {
	        value = data;
	        for (const key in bits) {
	          if (data & bits[key]) {
	            keys.push(key);
	          }
	        }
	      } else if (Array.isArray(data)) {
	        keys = data;
	        for (const key of keys) {
	          if (typeof key !== "string")
	            throw new TypeError(`expected string but got ${key}`);
	          if (key in bits)
	            value |= bits[key];
	        }
	      } else {
	        throw new TypeError(`expected number or array but got ${data}`);
	      }
	      if (value === meta.default)
	        return [value];
	      return [value, keys];
	    });
	    Schema.extend("function", (data) => {
	      if (typeof data === "function")
	        return [data];
	      throw new TypeError(`expected function but got ${data}`);
	    });
	    Schema.extend("is", (data, { callback }) => {
	      if (data instanceof callback)
	        return [data];
	      throw new TypeError(`expected ${callback.name} but got ${data}`);
	    });
	    function property(data, key, schema, options) {
	      try {
	        const [value, adapted] = Schema.resolve(data[key], schema, options);
	        if (adapted !== void 0)
	          data[key] = adapted;
	        return value;
	      } catch (e) {
	        if (!options?.autofix)
	          throw e;
	        delete data[key];
	        return schema.meta.default;
	      }
	    }
	    __name(property, "property");
	    Schema.extend("array", (data, { inner, meta }, options) => {
	      if (!Array.isArray(data))
	        throw new TypeError(`expected array but got ${data}`);
	      checkWithinRange(data.length, meta, "array length");
	      return [data.map((_, index) => property(data, index, inner, options))];
	    });
	    Schema.extend("dict", (data, { inner, sKey }, options, strict) => {
	      if (!isPlainObject(data))
	        throw new TypeError(`expected object but got ${data}`);
	      const result = {};
	      for (const key in data) {
	        let rKey;
	        try {
	          rKey = Schema.resolve(key, sKey)[0];
	        } catch (error) {
	          if (strict)
	            continue;
	          throw error;
	        }
	        result[rKey] = property(data, key, inner, options);
	        data[rKey] = data[key];
	        if (key !== rKey)
	          delete data[key];
	      }
	      return [result];
	    });
	    Schema.extend("tuple", (data, { list }, options, strict) => {
	      if (!Array.isArray(data))
	        throw new TypeError(`expected array but got ${data}`);
	      const result = list.map((inner, index) => property(data, index, inner, options));
	      if (strict)
	        return [result];
	      result.push(...data.slice(list.length));
	      return [result];
	    });
	    function merge(result, data) {
	      for (const key in data) {
	        if (key in result)
	          continue;
	        result[key] = data[key];
	      }
	    }
	    __name(merge, "merge");
	    Schema.extend("object", (data, { dict }, options, strict) => {
	      if (!isPlainObject(data))
	        throw new TypeError(`expected object but got ${data}`);
	      const result = {};
	      for (const key in dict) {
	        const value = property(data, key, dict[key], options);
	        if (!isNullable(value) || key in data) {
	          result[key] = value;
	        }
	      }
	      if (!strict)
	        merge(result, data);
	      return [result];
	    });
	    Schema.extend("union", (data, { list, toString }, options, strict) => {
	      for (const inner of list) {
	        try {
	          return Schema.resolve(data, inner, options, strict);
	        } catch (error) {
	        }
	      }
	      throw new TypeError(`expected ${toString()} but got ${JSON.stringify(data)}`);
	    });
	    Schema.extend("intersect", (data, { list, toString }, options, strict) => {
	      let result;
	      for (const inner of list) {
	        const value = Schema.resolve(data, inner, options, true)[0];
	        if (isNullable(value))
	          continue;
	        if (isNullable(result)) {
	          result = value;
	        } else if (typeof result !== typeof value) {
	          throw new TypeError(`expected ${toString()} but got ${JSON.stringify(data)}`);
	        } else if (typeof value === "object") {
	          merge(result ??= {}, value);
	        } else if (result !== value) {
	          throw new TypeError(`expected ${toString()} but got ${JSON.stringify(data)}`);
	        }
	      }
	      if (!strict && isPlainObject(data))
	        merge(result, data);
	      return [result];
	    });
	    Schema.extend("transform", (data, { inner, callback, preserve }, options) => {
	      const [result, adapted = data] = Schema.resolve(data, inner, options, true);
	      if (preserve) {
	        return [callback(result)];
	      } else {
	        return [callback(result), callback(adapted)];
	      }
	    });
	    var formatters = {};
	    function defineMethod(name, keys, format) {
	      formatters[name] = format;
	      Object.assign(Schema, {
	        [name](...args) {
	          const schema = new Schema({ type: name });
	          keys.forEach((key, index) => {
	            switch (key) {
	              case "sKey":
	                schema.sKey = args[index] ?? Schema.string();
	                break;
	              case "inner":
	                schema.inner = Schema.from(args[index]);
	                break;
	              case "list":
	                schema.list = args[index].map(Schema.from);
	                break;
	              case "dict":
	                schema.dict = mapValues(args[index], Schema.from);
	                break;
	              case "bits": {
	                schema.bits = {};
	                for (const key2 in args[index]) {
	                  if (typeof args[index][key2] !== "number")
	                    continue;
	                  schema.bits[key2] = args[index][key2];
	                }
	                break;
	              }
	              case "callback": {
	                schema.callback = args[index];
	                schema.callback["toJSON"] ||= () => schema.callback.toString();
	                break;
	              }
	              default:
	                schema[key] = args[index];
	            }
	          });
	          if (name === "object" || name === "dict") {
	            schema.meta.default = {};
	          } else if (name === "array" || name === "tuple") {
	            schema.meta.default = [];
	          } else if (name === "bitset") {
	            schema.meta.default = 0;
	          }
	          return schema;
	        }
	      });
	    }
	    __name(defineMethod, "defineMethod");
	    defineMethod("is", ["callback"], ({ callback }) => callback.name);
	    defineMethod("any", [], () => "any");
	    defineMethod("never", [], () => "never");
	    defineMethod("const", ["value"], ({ value }) => typeof value === "string" ? JSON.stringify(value) : value);
	    defineMethod("string", [], () => "string");
	    defineMethod("number", [], () => "number");
	    defineMethod("boolean", [], () => "boolean");
	    defineMethod("bitset", ["bits"], () => "bitset");
	    defineMethod("function", [], () => "function");
	    defineMethod("array", ["inner"], ({ inner }) => `${inner.toString(true)}[]`);
	    defineMethod("dict", ["inner", "sKey"], ({ inner, sKey }) => `{ [key: ${sKey.toString()}]: ${inner.toString()} }`);
	    defineMethod("tuple", ["list"], ({ list }) => `[${list.map((inner) => inner.toString()).join(", ")}]`);
	    defineMethod("object", ["dict"], ({ dict }) => {
	      if (Object.keys(dict).length === 0)
	        return "{}";
	      return `{ ${Object.entries(dict).map(([key, inner]) => {
        return `${key}${inner.meta.required ? "" : "?"}: ${inner.toString()}`;
      }).join(", ")} }`;
	    });
	    defineMethod("union", ["list"], ({ list }, inline) => {
	      const result = list.map(({ toString: format }) => format()).join(" | ");
	      return inline ? `(${result})` : result;
	    });
	    defineMethod("intersect", ["list"], ({ list }) => {
	      return `${list.map((inner) => inner.toString(true)).join(" & ")}`;
	    });
	    defineMethod("transform", ["inner", "callback", "preserve"], ({ inner }, isInner) => inner.toString(isInner));
	    module.exports = Schema;
	  }
	});
	var Schema = require_src();

	var version = "0.1.0";

	const PLUGIN_NAME = 'LeviOneBot';
	(version.split('.').map((v) => Number(v)));
	const BASE_PATH = `./plugins/${PLUGIN_NAME}`;
	const CONFIG_PATH = `${BASE_PATH}/config`;
	const PLUGINS_PATH = `${BASE_PATH}/plugins`;
	[BASE_PATH, CONFIG_PATH, PLUGINS_PATH].forEach((x) => {
	    if (!file.exists(x))
	        file.mkdir(x);
	});
	logger.setTitle(PLUGIN_NAME);

	function trimCharStart(str, char) {
	    while (str.startsWith(char))
	        str = str.slice(char.length);
	    return str;
	}
	function trimCharEnd(str, char) {
	    while (str.endsWith(char))
	        str = str.slice(0, -char.length);
	    return str;
	}
	function trimChar(str, char) {
	    return trimCharEnd(trimCharStart(str, char), char);
	}
	function escapeCQ(str, escapeComma = false) {
	    str = str
	        .replace(/&/g, '&amp;')
	        .replace(/\[/g, '&#91;')
	        .replace(/\]/g, '&#93;');
	    if (escapeComma)
	        str = str.replace(/,/g, '&#44;');
	    return str;
	}
	function unescapeCQ(str) {
	    return str
	        .replace(/&#44;/g, ',')
	        .replace(/&#91;/g, '[')
	        .replace(/&#93;/g, ']')
	        .replace(/&amp;/g, '&');
	}
	function formatError(e) {
	    return e instanceof Error ? `${e.message}\n${e.stack}` : String(e);
	}
	function sleep(ms) {
	    return new Promise((resolve) => {
	        setTimeout(resolve, ms);
	    });
	}
	function logErr(err) {
	    logger.error(formatError(err));
	}
	function objectKeyTransform(obj, transform) {
	    if (!obj || typeof obj !== 'object')
	        return obj;
	    if (Array.isArray(obj))
	        return obj.map((v) => objectKeyTransform(v, transform));
	    const newObj = {};
	    for (const key of Object.keys(obj))
	        newObj[transform(key)] = objectKeyTransform(obj[key], transform);
	    return newObj;
	}

	class ConfigManager {
	    constructor(schema, dirname, filename = 'config.json') {
	        this.schema = schema;
	        this.dirname = dirname;
	        this.filename = filename;
	        this.path = `${CONFIG_PATH}/${dirname}`;
	        this.filePath = `${this.path}/${filename}`;
	        this.config = this.load();
	    }
	    load() {
	        if (!file.exists(this.filePath)) {
	            const data = this.schema();
	            file.writeTo(this.filePath, JSON.stringify(data));
	            return data;
	        }
	        const str = file.readFrom(this.filePath);
	        if (!str)
	            throw new Error(`Failed to read ${this.filePath}`);
	        let data;
	        try {
	            data = JSON.parse(str);
	        }
	        catch (e) {
	            throw new Error(`Error parsing ${this.filePath}: ${formatError(e)}`);
	        }
	        return this.schema(data);
	    }
	    reload() {
	        this.config = this.load();
	    }
	    save(data) {
	        if (!data)
	            data = this.config;
	        let validated;
	        let str;
	        try {
	            validated = this.schema(data);
	            str = JSON.stringify(validated);
	        }
	        catch (e) {
	            throw new Error(`Error stringify data will save to ${this.filePath}: ` +
	                `${formatError(e)}`);
	        }
	        this.config = validated;
	        file.writeTo(this.filePath, str);
	    }
	}
	const universalConnectionSchema = Schema.object({
	    accessToken: Schema.string().required(false),
	});
	const forwardWsConnectionSchema = Schema.intersect([
	    universalConnectionSchema,
	    Schema.object({
	        type: Schema.const('ws').required(),
	        endpoint: Schema.string().required(),
	    }),
	]);
	const connectionSchema = Schema.union([forwardWsConnectionSchema]);
	const schema = Schema.object({
	    apiTimeout: Schema.number().default(30000),
	    reconnectInterval: Schema.number().default(3000),
	    connections: Schema.array(connectionSchema).default([]),
	});
	const manager = new ConfigManager(schema, PLUGIN_NAME);

	class CustomEventTarget extends EventTarget {
	    addEventListener(type, callback, options) {
	        super.addEventListener(type, callback, options);
	    }
	    removeEventListener(type, callback, options) {
	        super.removeEventListener(type, callback, options);
	    }
	}
	class ConnectionEventTarget extends CustomEventTarget {
	    constructor(endpoint) {
	        super();
	        this.endpoint = endpoint;
	    }
	    postEvent(msg) {
	        let data;
	        try {
	            data = objectKeyTransform(JSON.parse(msg), camelCase);
	        }
	        catch (e) {
	            logger.error(`Error parsing message from ${this.endpoint}: ${formatError(e)}`);
	        }
	        this.dispatchEvent(new CustomEvent('receive', { detail: data }));
	        logger.info(`Received from ${this.endpoint}: ${JSON.stringify(data)}`);
	    }
	}
	class ActionFailedError extends Error {
	    constructor(resp) {
	        super(`Error when calling API: ` +
	            `code=${resp.retcode} msg=${resp.msg} wording=${resp.wording}`);
	        this.resp = resp;
	    }
	}
	function isApiResp(data) {
	    return (typeof data === 'object' &&
	        typeof data.status === 'string' &&
	        typeof data.retcode === 'number');
	}
	class EchoManager {
	    constructor() {
	        this.identifier = `${Math.random()}`.slice(2);
	        this.lastEchoId = 0;
	    }
	    get() {
	        this.lastEchoId += 1;
	        return `${this.identifier}:${this.lastEchoId}`;
	    }
	}
	class ForwardWSConnection extends ConnectionEventTarget {
	    get connected() {
	        return this._connected;
	    }
	    constructor(endpoint, accessToken) {
	        super(endpoint);
	        this.endpoint = endpoint;
	        this.accessToken = accessToken;
	        this.enabled = false;
	        this._connected = false;
	        this.echoManager = new EchoManager();
	    }
	    connect() {
	        return Promise.race([
	            new Promise((resolve, reject) => {
	                if (!this.ws) {
	                    reject(new Error('Client not initialized'));
	                    return;
	                }
	                const endpoint = this.accessToken
	                    ? `${this.endpoint}?access_token=${this.accessToken}`
	                    : this.endpoint;
	                const pSucc = this.ws.connectAsync(endpoint, (success) => {
	                    if (success)
	                        resolve();
	                    else
	                        reject(new Error(`Failed to connect: ${this.ws?.errorCode()}`));
	                });
	                if (!pSucc)
	                    reject(new Error('Failed to prepare connect'));
	            }),
	            new Promise((_, reject) => {
	                setTimeout(() => reject(new Error('Timeout')), manager.config.apiTimeout);
	            }),
	        ]);
	    }
	    async daemon() {
	        while (this.enabled) {
	            this.ws = new WSClient();
	            try {
	                await this.connect();
	                await this.setup();
	            }
	            catch (e) {
	                await this.disable();
	                if (!this.enabled)
	                    return;
	                logger.error(`Cannot connect to ${this.endpoint}, ` +
	                    `reconnect in ${manager.config.reconnectInterval}ms: \n` +
	                    `${formatError(e)}`);
	                await sleep(manager.config.reconnectInterval);
	                continue;
	            }
	            this._connected = true;
	            logger.info(`Connected to ${this.endpoint}`);
	            this.callApi('get_login_info', {})
	                .then((resp) => {
	                logger.info(JSON.stringify(resp));
	            })
	                .catch(logErr);
	            let code;
	            try {
	                code = await this.waitUntilDisconnect();
	            }
	            catch (e) {
	                logger.error(`Error when waiting disconnect for ${this.endpoint}, ` +
	                    `reconnect in ${manager.config.reconnectInterval}ms: \n` +
	                    `${formatError(e)}`);
	            }
	            this._connected = false;
	            if (!this.enabled) {
	                logger.warn(`Dropped connection to ${this.endpoint}`);
	                return;
	            }
	            if (typeof code === 'number') {
	                logger.error(`Lost connection to ${this.endpoint}, ` +
	                    `reconnect in ${manager.config.reconnectInterval}ms: code ${code}`);
	            }
	            await sleep(manager.config.reconnectInterval);
	        }
	    }
	    async enable() {
	        this.enabled = true;
	        this.daemon().catch(logErr);
	    }
	    async disable() {
	        this.enabled = false;
	        const { ws } = this;
	        this.ws = undefined;
	        ws?.shutdown();
	        ws?.close();
	    }
	    async setup() {
	        if (!this.ws)
	            throw new Error('Client not initialized');
	        this.ws.listen('onTextReceived', (msg) => {
	            this.postEvent(msg);
	        });
	        this.ws.listen('onBinaryReceived', () => {
	            logger.warn(`Unexpected binary data received from ${this.endpoint}`);
	        });
	        this.ws.listen('onError', (msg) => {
	            logger.error(`Error from ${this.endpoint}: ${msg}`);
	        });
	    }
	    async waitUntilDisconnect() {
	        return Promise.race([
	            new Promise((resolve, reject) => {
	                if (!this.ws) {
	                    reject(new Error('Client not initialized'));
	                    return;
	                }
	                this.ws.listen('onLostConnection', (code) => resolve(code));
	            }),
	            (async () => {
	                for (;;) {
	                    if (!this.enabled)
	                        return;
	                    await sleep(1);
	                }
	            })(),
	        ]);
	    }
	    callApi(action, params) {
	        if (!this.ws)
	            throw new Error('Client not initialized');
	        const echo = this.echoManager.get();
	        let handler;
	        const promiseCall = new Promise((resolve, reject) => {
	            const body = JSON.stringify({
	                action: snakeCase(action),
	                params: objectKeyTransform(params, snakeCase),
	                echo,
	            });
	            this.ws?.send(body);
	            logger.info(`Sent to ${this.endpoint}: ${body}`);
	            handler = (ev) => {
	                const { detail } = ev;
	                if (!isApiResp(detail) || detail.echo !== echo)
	                    return;
	                if (detail.status === 'error') {
	                    reject(new ActionFailedError(detail));
	                }
	                else {
	                    this.removeEventListener('receive', handler);
	                    resolve(detail.data);
	                }
	            };
	            this.addEventListener('receive', handler);
	        });
	        const promiseTimeout = new Promise((_, reject) => {
	            setTimeout(() => {
	                this.removeEventListener('receive', handler);
	                reject(new Error('Timeout'));
	            }, manager.config.apiTimeout);
	        });
	        return Promise.race([promiseCall, promiseTimeout]);
	    }
	}
	const connections = [];
	function createConnection(connConf) {
	    const { type } = connConf;
	    switch (type) {
	        case 'ws':
	            return new ForwardWSConnection(connConf.endpoint, connConf.accessToken);
	        default:
	            throw new Error(`Unsupported connection type: ${type}`);
	    }
	}
	function resetConnections() {
	    const cachedConns = connections.slice();
	    connections.length = 0;
	    for (const conn of cachedConns)
	        conn.disable().catch(logErr);
	    connections.push(...manager.config.connections.map(createConnection));
	    connections.forEach((conn) => conn.enable().catch(logErr));
	}

	mc.listen('onServerStarted', () => {
	    const cmd = mc.newCommand('llob', PLUGIN_NAME, PermType.Console);
	    cmd.setEnum('enumReload', ['reload']);
	    cmd.mandatory('enumReload', ParamType.Enum, 'enumReload', 1);
	    cmd.overload(['enumReload']);
	    cmd.setCallback((_, __, out, res) => {
	        if ('enumReload' in res && res.enumReload) {
	            try {
	                manager.reload();
	                resetConnections();
	            }
	            catch (e) {
	                out.error(formatError(e));
	                return;
	            }
	            out.success('Successfully reloaded config');
	            logger.info(JSON.stringify(manager.config));
	        }
	    });
	    cmd.setup();
	});

	function Segment(type, data, toString = true) {
	    if (data) {
	        let entries = Object.entries(data).filter(([, v]) => !(v === null || v === undefined));
	        if (toString)
	            entries = entries.map(([k, v]) => {
	                if (typeof v === 'boolean')
	                    v = v ? 1 : 0;
	                return [snakeCase(k), `${v}`];
	            });
	        data = Object.fromEntries(entries);
	    }
	    return { type, data };
	}
	Segment.text = (text) => Segment('text', { text });
	Segment.face = (face, extra) => Segment('face', Object.assign({ face }, extra));
	Segment.image = (file, extra) => Segment('image', Object.assign({ file }, extra));
	Segment.record = (file, extra) => Segment('record', Object.assign({ file }, extra));
	Segment.video = (file, extra) => Segment('video', Object.assign({ file }, extra));
	Segment.at = (qq) => Segment('at', { qq });
	Segment.atAll = () => Segment.at('all');
	Segment.rps = (extra) => Segment('rps', Object.assign({}, extra));
	Segment.dice = (extra) => Segment('dice', Object.assign({}, extra));
	Segment.shake = (extra) => Segment('shake', Object.assign({}, extra));
	Segment.poke = (type, id, extra) => Segment('poke', Object.assign({ type, id }, extra));
	Segment.pokeGoCQ = (qq) => Segment('poke', { qq });
	Segment.anonymous = (ignore, extra) => Segment('anonymous', Object.assign({ ignore }, extra));
	Segment.share = (url, title, extra) => Segment('share', Object.assign({ url, title }, extra));
	Segment.contact = (type, id, extra) => Segment('contact', Object.assign({ type, id }, extra));
	Segment.location = (lat, lon, extra) => Segment('location', Object.assign({ lat, lon }, extra));
	Segment.music = (type, id, extra) => Segment('music', Object.assign({ type, id }, extra));
	Segment.musicCustom = (url, audio, title, extra) => Segment('music', Object.assign({ type: 'custom', url, audio, title }, extra));
	Segment.reply = (id, extra) => Segment('reply', Object.assign({ id }, extra));
	Segment.node = (id) => Segment('node', { id });
	Segment.nodeCustom = (userId, nickname, content, extra) => Segment('node', Object.assign({ userId: `${userId}`, nickname, content }, extra), false);
	Segment.xml = (data) => Segment('xml', { data });
	Segment.json = (data) => Segment('json', { data });
	Segment.resolveBool = (value) => value === '1' || value === 'yes' || value === 'true';
	const h = Segment;
	function Message(msg) {
	    if (Array.isArray(msg))
	        return msg.map((v) => (typeof v === 'string' ? h.text(v) : v));
	    const cqRegex = /\[CQ:(?<type>[a-zA-Z0-9-_.]+)(?<params>(?:,[a-zA-Z0-9-_.]+=[^,\]]*)*),?\]/gu;
	    const tmp = [];
	    let lastRightBracket = 0;
	    for (;;) {
	        const { lastIndex } = cqRegex;
	        const result = cqRegex.exec(msg);
	        if (!result)
	            break;
	        const raw = result[0];
	        const { index } = result;
	        const { type, params } = result.groups;
	        if (index > 0 && lastIndex !== index)
	            tmp.push(h.text(msg.substring(lastIndex, index)));
	        const data = Object.fromEntries(trimCharStart(params, ',')
	            .split(',')
	            .map((arr) => {
	            const [k, v] = arr.split('=');
	            return [camelCase(unescapeCQ(k)), v ? unescapeCQ(v) : ''];
	        }));
	        tmp.push(h(type, data));
	        lastRightBracket = index + raw.length;
	    }
	    const tail = msg.substring(lastRightBracket);
	    if (tail)
	        tmp.push(h.text(tail));
	    return tmp;
	}
	Message.build = (msg) => Message(msg);
	Message.toString = (msg) => msg
	    .map((seg) => {
	    if (seg.type === 'text')
	        return seg.data.text;
	    const params = Object.entries(seg.data)
	        .map(([k, v]) => (v ? `,${k}=${v}` : `,${k}`))
	        .join('');
	    return `[CQ:${seg.type}${params}]`;
	})
	    .join('');
	Message.extractPlainText = (msg) => msg
	    .filter((seg) => seg.type === 'text')
	    .map((seg) => seg.data.text)
	    .join('');
	Message.extract = (type, msg) => msg.filter((seg) => seg.type === type);

	mc.listen('onServerStarted', () => {
	    resetConnections();
	});

	exports.ConfigManager = ConfigManager;
	exports.Message = Message;
	exports.Schema = Schema;
	exports.Segment = Segment;
	exports.arrayBufferToBase64 = arrayBufferToBase64;
	exports.base64ToArrayBuffer = base64ToArrayBuffer;
	exports.camelCase = camelCase;
	exports.camelize = camelize;
	exports.capitalize = capitalize;
	exports.clone = clone;
	exports.contain = contain;
	exports.deduplicate = deduplicate;
	exports.deepEqual = deepEqual;
	exports.defineProperty = defineProperty;
	exports.difference = difference;
	exports.escapeCQ = escapeCQ;
	exports.filterKeys = filterKeys;
	exports.formatError = formatError;
	exports.h = h;
	exports.hyphenate = hyphenate;
	exports.intersection = intersection;
	exports.is = is;
	exports.isNullable = isNullable;
	exports.isPlainObject = isPlainObject;
	exports.logErr = logErr;
	exports.makeArray = makeArray;
	exports.mapValues = mapValues;
	exports.noop = noop;
	exports.objectKeyTransform = objectKeyTransform;
	exports.omit = omit;
	exports.paramCase = paramCase;
	exports.pick = pick;
	exports.remove = remove;
	exports.sanitize = sanitize;
	exports.sleep = sleep;
	exports.snakeCase = snakeCase;
	exports.trimChar = trimChar;
	exports.trimCharEnd = trimCharEnd;
	exports.trimCharStart = trimCharStart;
	exports.trimSlash = trimSlash;
	exports.uncapitalize = uncapitalize;
	exports.unescapeCQ = unescapeCQ;
	exports.union = union;
	exports.valueMap = mapValues;

}));
