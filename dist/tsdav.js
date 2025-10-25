var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function getAugmentedNamespace(n) {
  if (Object.prototype.hasOwnProperty.call(n, '__esModule')) return n;
  var f = n.default;
	if (typeof f == "function") {
		var a = function a () {
			var isInstance = false;
      try {
        isInstance = this instanceof a;
      } catch {}
			if (isInstance) {
        return Reflect.construct(f, arguments, this.constructor);
			}
			return f.apply(this, arguments);
		};
		a.prototype = f.prototype;
  } else a = {};
  Object.defineProperty(a, '__esModule', {value: true});
	Object.keys(n).forEach(function (k) {
		var d = Object.getOwnPropertyDescriptor(n, k);
		Object.defineProperty(a, k, d.get ? d : {
			enumerable: true,
			get: function () {
				return n[k];
			}
		});
	});
	return a;
}

var browserPonyfill = {exports: {}};

var hasRequiredBrowserPonyfill;

function requireBrowserPonyfill () {
	if (hasRequiredBrowserPonyfill) return browserPonyfill.exports;
	hasRequiredBrowserPonyfill = 1;
	(function (module, exports) {
		// Save global object in a variable
		var __global__ =
		(typeof globalThis !== 'undefined' && globalThis) ||
		(typeof self !== 'undefined' && self) ||
		(typeof commonjsGlobal !== 'undefined' && commonjsGlobal);
		// Create an object that extends from __global__ without the fetch function
		var __globalThis__ = (function () {
		function F() {
		this.fetch = false;
		this.DOMException = __global__.DOMException;
		}
		F.prototype = __global__; // Needed for feature detection on whatwg-fetch's code
		return new F();
		})();
		// Wraps whatwg-fetch with a function scope to hijack the global object
		// "globalThis" that's going to be patched
		(function(globalThis) {

		((function (exports) {

		  /* eslint-disable no-prototype-builtins */
		  var g =
		    (typeof globalThis !== 'undefined' && globalThis) ||
		    (typeof self !== 'undefined' && self) ||
		    // eslint-disable-next-line no-undef
		    (typeof commonjsGlobal !== 'undefined' && commonjsGlobal) ||
		    {};

		  var support = {
		    searchParams: 'URLSearchParams' in g,
		    iterable: 'Symbol' in g && 'iterator' in Symbol,
		    blob:
		      'FileReader' in g &&
		      'Blob' in g &&
		      (function() {
		        try {
		          new Blob();
		          return true
		        } catch (e) {
		          return false
		        }
		      })(),
		    formData: 'FormData' in g,
		    arrayBuffer: 'ArrayBuffer' in g
		  };

		  function isDataView(obj) {
		    return obj && DataView.prototype.isPrototypeOf(obj)
		  }

		  if (support.arrayBuffer) {
		    var viewClasses = [
		      '[object Int8Array]',
		      '[object Uint8Array]',
		      '[object Uint8ClampedArray]',
		      '[object Int16Array]',
		      '[object Uint16Array]',
		      '[object Int32Array]',
		      '[object Uint32Array]',
		      '[object Float32Array]',
		      '[object Float64Array]'
		    ];

		    var isArrayBufferView =
		      ArrayBuffer.isView ||
		      function(obj) {
		        return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
		      };
		  }

		  function normalizeName(name) {
		    if (typeof name !== 'string') {
		      name = String(name);
		    }
		    if (/[^a-z0-9\-#$%&'*+.^_`|~!]/i.test(name) || name === '') {
		      throw new TypeError('Invalid character in header field name: "' + name + '"')
		    }
		    return name.toLowerCase()
		  }

		  function normalizeValue(value) {
		    if (typeof value !== 'string') {
		      value = String(value);
		    }
		    return value
		  }

		  // Build a destructive iterator for the value list
		  function iteratorFor(items) {
		    var iterator = {
		      next: function() {
		        var value = items.shift();
		        return {done: value === undefined, value: value}
		      }
		    };

		    if (support.iterable) {
		      iterator[Symbol.iterator] = function() {
		        return iterator
		      };
		    }

		    return iterator
		  }

		  function Headers(headers) {
		    this.map = {};

		    if (headers instanceof Headers) {
		      headers.forEach(function(value, name) {
		        this.append(name, value);
		      }, this);
		    } else if (Array.isArray(headers)) {
		      headers.forEach(function(header) {
		        if (header.length != 2) {
		          throw new TypeError('Headers constructor: expected name/value pair to be length 2, found' + header.length)
		        }
		        this.append(header[0], header[1]);
		      }, this);
		    } else if (headers) {
		      Object.getOwnPropertyNames(headers).forEach(function(name) {
		        this.append(name, headers[name]);
		      }, this);
		    }
		  }

		  Headers.prototype.append = function(name, value) {
		    name = normalizeName(name);
		    value = normalizeValue(value);
		    var oldValue = this.map[name];
		    this.map[name] = oldValue ? oldValue + ', ' + value : value;
		  };

		  Headers.prototype['delete'] = function(name) {
		    delete this.map[normalizeName(name)];
		  };

		  Headers.prototype.get = function(name) {
		    name = normalizeName(name);
		    return this.has(name) ? this.map[name] : null
		  };

		  Headers.prototype.has = function(name) {
		    return this.map.hasOwnProperty(normalizeName(name))
		  };

		  Headers.prototype.set = function(name, value) {
		    this.map[normalizeName(name)] = normalizeValue(value);
		  };

		  Headers.prototype.forEach = function(callback, thisArg) {
		    for (var name in this.map) {
		      if (this.map.hasOwnProperty(name)) {
		        callback.call(thisArg, this.map[name], name, this);
		      }
		    }
		  };

		  Headers.prototype.keys = function() {
		    var items = [];
		    this.forEach(function(value, name) {
		      items.push(name);
		    });
		    return iteratorFor(items)
		  };

		  Headers.prototype.values = function() {
		    var items = [];
		    this.forEach(function(value) {
		      items.push(value);
		    });
		    return iteratorFor(items)
		  };

		  Headers.prototype.entries = function() {
		    var items = [];
		    this.forEach(function(value, name) {
		      items.push([name, value]);
		    });
		    return iteratorFor(items)
		  };

		  if (support.iterable) {
		    Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
		  }

		  function consumed(body) {
		    if (body._noBody) return
		    if (body.bodyUsed) {
		      return Promise.reject(new TypeError('Already read'))
		    }
		    body.bodyUsed = true;
		  }

		  function fileReaderReady(reader) {
		    return new Promise(function(resolve, reject) {
		      reader.onload = function() {
		        resolve(reader.result);
		      };
		      reader.onerror = function() {
		        reject(reader.error);
		      };
		    })
		  }

		  function readBlobAsArrayBuffer(blob) {
		    var reader = new FileReader();
		    var promise = fileReaderReady(reader);
		    reader.readAsArrayBuffer(blob);
		    return promise
		  }

		  function readBlobAsText(blob) {
		    var reader = new FileReader();
		    var promise = fileReaderReady(reader);
		    var match = /charset=([A-Za-z0-9_-]+)/.exec(blob.type);
		    var encoding = match ? match[1] : 'utf-8';
		    reader.readAsText(blob, encoding);
		    return promise
		  }

		  function readArrayBufferAsText(buf) {
		    var view = new Uint8Array(buf);
		    var chars = new Array(view.length);

		    for (var i = 0; i < view.length; i++) {
		      chars[i] = String.fromCharCode(view[i]);
		    }
		    return chars.join('')
		  }

		  function bufferClone(buf) {
		    if (buf.slice) {
		      return buf.slice(0)
		    } else {
		      var view = new Uint8Array(buf.byteLength);
		      view.set(new Uint8Array(buf));
		      return view.buffer
		    }
		  }

		  function Body() {
		    this.bodyUsed = false;

		    this._initBody = function(body) {
		      /*
		        fetch-mock wraps the Response object in an ES6 Proxy to
		        provide useful test harness features such as flush. However, on
		        ES5 browsers without fetch or Proxy support pollyfills must be used;
		        the proxy-pollyfill is unable to proxy an attribute unless it exists
		        on the object before the Proxy is created. This change ensures
		        Response.bodyUsed exists on the instance, while maintaining the
		        semantic of setting Request.bodyUsed in the constructor before
		        _initBody is called.
		      */
		      // eslint-disable-next-line no-self-assign
		      this.bodyUsed = this.bodyUsed;
		      this._bodyInit = body;
		      if (!body) {
		        this._noBody = true;
		        this._bodyText = '';
		      } else if (typeof body === 'string') {
		        this._bodyText = body;
		      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
		        this._bodyBlob = body;
		      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
		        this._bodyFormData = body;
		      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
		        this._bodyText = body.toString();
		      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
		        this._bodyArrayBuffer = bufferClone(body.buffer);
		        // IE 10-11 can't handle a DataView body.
		        this._bodyInit = new Blob([this._bodyArrayBuffer]);
		      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
		        this._bodyArrayBuffer = bufferClone(body);
		      } else {
		        this._bodyText = body = Object.prototype.toString.call(body);
		      }

		      if (!this.headers.get('content-type')) {
		        if (typeof body === 'string') {
		          this.headers.set('content-type', 'text/plain;charset=UTF-8');
		        } else if (this._bodyBlob && this._bodyBlob.type) {
		          this.headers.set('content-type', this._bodyBlob.type);
		        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
		          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
		        }
		      }
		    };

		    if (support.blob) {
		      this.blob = function() {
		        var rejected = consumed(this);
		        if (rejected) {
		          return rejected
		        }

		        if (this._bodyBlob) {
		          return Promise.resolve(this._bodyBlob)
		        } else if (this._bodyArrayBuffer) {
		          return Promise.resolve(new Blob([this._bodyArrayBuffer]))
		        } else if (this._bodyFormData) {
		          throw new Error('could not read FormData body as blob')
		        } else {
		          return Promise.resolve(new Blob([this._bodyText]))
		        }
		      };
		    }

		    this.arrayBuffer = function() {
		      if (this._bodyArrayBuffer) {
		        var isConsumed = consumed(this);
		        if (isConsumed) {
		          return isConsumed
		        } else if (ArrayBuffer.isView(this._bodyArrayBuffer)) {
		          return Promise.resolve(
		            this._bodyArrayBuffer.buffer.slice(
		              this._bodyArrayBuffer.byteOffset,
		              this._bodyArrayBuffer.byteOffset + this._bodyArrayBuffer.byteLength
		            )
		          )
		        } else {
		          return Promise.resolve(this._bodyArrayBuffer)
		        }
		      } else if (support.blob) {
		        return this.blob().then(readBlobAsArrayBuffer)
		      } else {
		        throw new Error('could not read as ArrayBuffer')
		      }
		    };

		    this.text = function() {
		      var rejected = consumed(this);
		      if (rejected) {
		        return rejected
		      }

		      if (this._bodyBlob) {
		        return readBlobAsText(this._bodyBlob)
		      } else if (this._bodyArrayBuffer) {
		        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
		      } else if (this._bodyFormData) {
		        throw new Error('could not read FormData body as text')
		      } else {
		        return Promise.resolve(this._bodyText)
		      }
		    };

		    if (support.formData) {
		      this.formData = function() {
		        return this.text().then(decode)
		      };
		    }

		    this.json = function() {
		      return this.text().then(JSON.parse)
		    };

		    return this
		  }

		  // HTTP methods whose capitalization should be normalized
		  var methods = ['CONNECT', 'DELETE', 'GET', 'HEAD', 'OPTIONS', 'PATCH', 'POST', 'PUT', 'TRACE'];

		  function normalizeMethod(method) {
		    var upcased = method.toUpperCase();
		    return methods.indexOf(upcased) > -1 ? upcased : method
		  }

		  function Request(input, options) {
		    if (!(this instanceof Request)) {
		      throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.')
		    }

		    options = options || {};
		    var body = options.body;

		    if (input instanceof Request) {
		      if (input.bodyUsed) {
		        throw new TypeError('Already read')
		      }
		      this.url = input.url;
		      this.credentials = input.credentials;
		      if (!options.headers) {
		        this.headers = new Headers(input.headers);
		      }
		      this.method = input.method;
		      this.mode = input.mode;
		      this.signal = input.signal;
		      if (!body && input._bodyInit != null) {
		        body = input._bodyInit;
		        input.bodyUsed = true;
		      }
		    } else {
		      this.url = String(input);
		    }

		    this.credentials = options.credentials || this.credentials || 'same-origin';
		    if (options.headers || !this.headers) {
		      this.headers = new Headers(options.headers);
		    }
		    this.method = normalizeMethod(options.method || this.method || 'GET');
		    this.mode = options.mode || this.mode || null;
		    this.signal = options.signal || this.signal || (function () {
		      if ('AbortController' in g) {
		        var ctrl = new AbortController();
		        return ctrl.signal;
		      }
		    }());
		    this.referrer = null;

		    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
		      throw new TypeError('Body not allowed for GET or HEAD requests')
		    }
		    this._initBody(body);

		    if (this.method === 'GET' || this.method === 'HEAD') {
		      if (options.cache === 'no-store' || options.cache === 'no-cache') {
		        // Search for a '_' parameter in the query string
		        var reParamSearch = /([?&])_=[^&]*/;
		        if (reParamSearch.test(this.url)) {
		          // If it already exists then set the value with the current time
		          this.url = this.url.replace(reParamSearch, '$1_=' + new Date().getTime());
		        } else {
		          // Otherwise add a new '_' parameter to the end with the current time
		          var reQueryString = /\?/;
		          this.url += (reQueryString.test(this.url) ? '&' : '?') + '_=' + new Date().getTime();
		        }
		      }
		    }
		  }

		  Request.prototype.clone = function() {
		    return new Request(this, {body: this._bodyInit})
		  };

		  function decode(body) {
		    var form = new FormData();
		    body
		      .trim()
		      .split('&')
		      .forEach(function(bytes) {
		        if (bytes) {
		          var split = bytes.split('=');
		          var name = split.shift().replace(/\+/g, ' ');
		          var value = split.join('=').replace(/\+/g, ' ');
		          form.append(decodeURIComponent(name), decodeURIComponent(value));
		        }
		      });
		    return form
		  }

		  function parseHeaders(rawHeaders) {
		    var headers = new Headers();
		    // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
		    // https://tools.ietf.org/html/rfc7230#section-3.2
		    var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
		    // Avoiding split via regex to work around a common IE11 bug with the core-js 3.6.0 regex polyfill
		    // https://github.com/github/fetch/issues/748
		    // https://github.com/zloirock/core-js/issues/751
		    preProcessedHeaders
		      .split('\r')
		      .map(function(header) {
		        return header.indexOf('\n') === 0 ? header.substr(1, header.length) : header
		      })
		      .forEach(function(line) {
		        var parts = line.split(':');
		        var key = parts.shift().trim();
		        if (key) {
		          var value = parts.join(':').trim();
		          try {
		            headers.append(key, value);
		          } catch (error) {
		            console.warn('Response ' + error.message);
		          }
		        }
		      });
		    return headers
		  }

		  Body.call(Request.prototype);

		  function Response(bodyInit, options) {
		    if (!(this instanceof Response)) {
		      throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.')
		    }
		    if (!options) {
		      options = {};
		    }

		    this.type = 'default';
		    this.status = options.status === undefined ? 200 : options.status;
		    if (this.status < 200 || this.status > 599) {
		      throw new RangeError("Failed to construct 'Response': The status provided (0) is outside the range [200, 599].")
		    }
		    this.ok = this.status >= 200 && this.status < 300;
		    this.statusText = options.statusText === undefined ? '' : '' + options.statusText;
		    this.headers = new Headers(options.headers);
		    this.url = options.url || '';
		    this._initBody(bodyInit);
		  }

		  Body.call(Response.prototype);

		  Response.prototype.clone = function() {
		    return new Response(this._bodyInit, {
		      status: this.status,
		      statusText: this.statusText,
		      headers: new Headers(this.headers),
		      url: this.url
		    })
		  };

		  Response.error = function() {
		    var response = new Response(null, {status: 200, statusText: ''});
		    response.ok = false;
		    response.status = 0;
		    response.type = 'error';
		    return response
		  };

		  var redirectStatuses = [301, 302, 303, 307, 308];

		  Response.redirect = function(url, status) {
		    if (redirectStatuses.indexOf(status) === -1) {
		      throw new RangeError('Invalid status code')
		    }

		    return new Response(null, {status: status, headers: {location: url}})
		  };

		  exports.DOMException = g.DOMException;
		  try {
		    new exports.DOMException();
		  } catch (err) {
		    exports.DOMException = function(message, name) {
		      this.message = message;
		      this.name = name;
		      var error = Error(message);
		      this.stack = error.stack;
		    };
		    exports.DOMException.prototype = Object.create(Error.prototype);
		    exports.DOMException.prototype.constructor = exports.DOMException;
		  }

		  function fetch(input, init) {
		    return new Promise(function(resolve, reject) {
		      var request = new Request(input, init);

		      if (request.signal && request.signal.aborted) {
		        return reject(new exports.DOMException('Aborted', 'AbortError'))
		      }

		      var xhr = new XMLHttpRequest();

		      function abortXhr() {
		        xhr.abort();
		      }

		      xhr.onload = function() {
		        var options = {
		          statusText: xhr.statusText,
		          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
		        };
		        // This check if specifically for when a user fetches a file locally from the file system
		        // Only if the status is out of a normal range
		        if (request.url.indexOf('file://') === 0 && (xhr.status < 200 || xhr.status > 599)) {
		          options.status = 200;
		        } else {
		          options.status = xhr.status;
		        }
		        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL');
		        var body = 'response' in xhr ? xhr.response : xhr.responseText;
		        setTimeout(function() {
		          resolve(new Response(body, options));
		        }, 0);
		      };

		      xhr.onerror = function() {
		        setTimeout(function() {
		          reject(new TypeError('Network request failed'));
		        }, 0);
		      };

		      xhr.ontimeout = function() {
		        setTimeout(function() {
		          reject(new TypeError('Network request timed out'));
		        }, 0);
		      };

		      xhr.onabort = function() {
		        setTimeout(function() {
		          reject(new exports.DOMException('Aborted', 'AbortError'));
		        }, 0);
		      };

		      function fixUrl(url) {
		        try {
		          return url === '' && g.location.href ? g.location.href : url
		        } catch (e) {
		          return url
		        }
		      }

		      xhr.open(request.method, fixUrl(request.url), true);

		      if (request.credentials === 'include') {
		        xhr.withCredentials = true;
		      } else if (request.credentials === 'omit') {
		        xhr.withCredentials = false;
		      }

		      if ('responseType' in xhr) {
		        if (support.blob) {
		          xhr.responseType = 'blob';
		        } else if (
		          support.arrayBuffer
		        ) {
		          xhr.responseType = 'arraybuffer';
		        }
		      }

		      if (init && typeof init.headers === 'object' && !(init.headers instanceof Headers || (g.Headers && init.headers instanceof g.Headers))) {
		        var names = [];
		        Object.getOwnPropertyNames(init.headers).forEach(function(name) {
		          names.push(normalizeName(name));
		          xhr.setRequestHeader(name, normalizeValue(init.headers[name]));
		        });
		        request.headers.forEach(function(value, name) {
		          if (names.indexOf(name) === -1) {
		            xhr.setRequestHeader(name, value);
		          }
		        });
		      } else {
		        request.headers.forEach(function(value, name) {
		          xhr.setRequestHeader(name, value);
		        });
		      }

		      if (request.signal) {
		        request.signal.addEventListener('abort', abortXhr);

		        xhr.onreadystatechange = function() {
		          // DONE (success or failure)
		          if (xhr.readyState === 4) {
		            request.signal.removeEventListener('abort', abortXhr);
		          }
		        };
		      }

		      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
		    })
		  }

		  fetch.polyfill = true;

		  if (!g.fetch) {
		    g.fetch = fetch;
		    g.Headers = Headers;
		    g.Request = Request;
		    g.Response = Response;
		  }

		  exports.Headers = Headers;
		  exports.Request = Request;
		  exports.Response = Response;
		  exports.fetch = fetch;

		  return exports;

		}))({});
		})(__globalThis__);
		// This is a ponyfill, so...
		__globalThis__.fetch.ponyfill = true;
		delete __globalThis__.fetch.polyfill;
		// Choose between native implementation (__global__) or custom implementation (__globalThis__)
		var ctx = __global__.fetch ? __global__ : __globalThis__;
		exports = ctx.fetch; // To enable: import fetch from 'cross-fetch'
		exports.default = ctx.fetch; // For TypeScript consumers without esModuleInterop.
		exports.fetch = ctx.fetch; // To enable: import {fetch} from 'cross-fetch'
		exports.Headers = ctx.Headers;
		exports.Request = ctx.Request;
		exports.Response = ctx.Response;
		module.exports = exports; 
	} (browserPonyfill, browserPonyfill.exports));
	return browserPonyfill.exports;
}

var browserPonyfillExports = requireBrowserPonyfill();

var global$1 = (typeof global !== "undefined" ? global :
  typeof self !== "undefined" ? self :
  typeof window !== "undefined" ? window : {});

// shim for using process in browser
// based off https://github.com/defunctzombie/node-process/blob/master/browser.js

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
var cachedSetTimeout = defaultSetTimout;
var cachedClearTimeout = defaultClearTimeout;
if (typeof global$1.setTimeout === 'function') {
    cachedSetTimeout = setTimeout;
}
if (typeof global$1.clearTimeout === 'function') {
    cachedClearTimeout = clearTimeout;
}

function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}
function nextTick(fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
}
// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
var title = 'browser';
var platform = 'browser';
var browser$1 = true;
var env = {};
var argv = [];
var version = ''; // empty string to avoid regexp issues
var versions = {};
var release = {};
var config = {};

function noop() {}

var on = noop;
var addListener = noop;
var once = noop;
var off = noop;
var removeListener = noop;
var removeAllListeners = noop;
var emit = noop;

function binding(name) {
    throw new Error('process.binding is not supported');
}

function cwd () { return '/' }
function chdir (dir) {
    throw new Error('process.chdir is not supported');
}function umask() { return 0; }

// from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
var performance = global$1.performance || {};
var performanceNow =
  performance.now        ||
  performance.mozNow     ||
  performance.msNow      ||
  performance.oNow       ||
  performance.webkitNow  ||
  function(){ return (new Date()).getTime() };

// generate timestamp or delta
// see http://nodejs.org/api/process.html#process_process_hrtime
function hrtime(previousTimestamp){
  var clocktime = performanceNow.call(performance)*1e-3;
  var seconds = Math.floor(clocktime);
  var nanoseconds = Math.floor((clocktime%1)*1e9);
  if (previousTimestamp) {
    seconds = seconds - previousTimestamp[0];
    nanoseconds = nanoseconds - previousTimestamp[1];
    if (nanoseconds<0) {
      seconds--;
      nanoseconds += 1e9;
    }
  }
  return [seconds,nanoseconds]
}

var startTime = new Date();
function uptime() {
  var currentTime = new Date();
  var dif = currentTime - startTime;
  return dif / 1000;
}

var browser$1$1 = {
  nextTick: nextTick,
  title: title,
  browser: browser$1,
  env: env,
  argv: argv,
  version: version,
  versions: versions,
  on: on,
  addListener: addListener,
  once: once,
  off: off,
  removeListener: removeListener,
  removeAllListeners: removeAllListeners,
  emit: emit,
  binding: binding,
  cwd: cwd,
  chdir: chdir,
  umask: umask,
  hrtime: hrtime,
  platform: platform,
  release: release,
  config: config,
  uptime: uptime
};

var browser = {exports: {}};

/**
 * Helpers.
 */

var ms;
var hasRequiredMs;

function requireMs () {
	if (hasRequiredMs) return ms;
	hasRequiredMs = 1;
	var s = 1000;
	var m = s * 60;
	var h = m * 60;
	var d = h * 24;
	var w = d * 7;
	var y = d * 365.25;

	/**
	 * Parse or format the given `val`.
	 *
	 * Options:
	 *
	 *  - `long` verbose formatting [false]
	 *
	 * @param {String|Number} val
	 * @param {Object} [options]
	 * @throws {Error} throw an error if val is not a non-empty string or a number
	 * @return {String|Number}
	 * @api public
	 */

	ms = function (val, options) {
	  options = options || {};
	  var type = typeof val;
	  if (type === 'string' && val.length > 0) {
	    return parse(val);
	  } else if (type === 'number' && isFinite(val)) {
	    return options.long ? fmtLong(val) : fmtShort(val);
	  }
	  throw new Error(
	    'val is not a non-empty string or a valid number. val=' +
	      JSON.stringify(val)
	  );
	};

	/**
	 * Parse the given `str` and return milliseconds.
	 *
	 * @param {String} str
	 * @return {Number}
	 * @api private
	 */

	function parse(str) {
	  str = String(str);
	  if (str.length > 100) {
	    return;
	  }
	  var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
	    str
	  );
	  if (!match) {
	    return;
	  }
	  var n = parseFloat(match[1]);
	  var type = (match[2] || 'ms').toLowerCase();
	  switch (type) {
	    case 'years':
	    case 'year':
	    case 'yrs':
	    case 'yr':
	    case 'y':
	      return n * y;
	    case 'weeks':
	    case 'week':
	    case 'w':
	      return n * w;
	    case 'days':
	    case 'day':
	    case 'd':
	      return n * d;
	    case 'hours':
	    case 'hour':
	    case 'hrs':
	    case 'hr':
	    case 'h':
	      return n * h;
	    case 'minutes':
	    case 'minute':
	    case 'mins':
	    case 'min':
	    case 'm':
	      return n * m;
	    case 'seconds':
	    case 'second':
	    case 'secs':
	    case 'sec':
	    case 's':
	      return n * s;
	    case 'milliseconds':
	    case 'millisecond':
	    case 'msecs':
	    case 'msec':
	    case 'ms':
	      return n;
	    default:
	      return undefined;
	  }
	}

	/**
	 * Short format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function fmtShort(ms) {
	  var msAbs = Math.abs(ms);
	  if (msAbs >= d) {
	    return Math.round(ms / d) + 'd';
	  }
	  if (msAbs >= h) {
	    return Math.round(ms / h) + 'h';
	  }
	  if (msAbs >= m) {
	    return Math.round(ms / m) + 'm';
	  }
	  if (msAbs >= s) {
	    return Math.round(ms / s) + 's';
	  }
	  return ms + 'ms';
	}

	/**
	 * Long format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function fmtLong(ms) {
	  var msAbs = Math.abs(ms);
	  if (msAbs >= d) {
	    return plural(ms, msAbs, d, 'day');
	  }
	  if (msAbs >= h) {
	    return plural(ms, msAbs, h, 'hour');
	  }
	  if (msAbs >= m) {
	    return plural(ms, msAbs, m, 'minute');
	  }
	  if (msAbs >= s) {
	    return plural(ms, msAbs, s, 'second');
	  }
	  return ms + ' ms';
	}

	/**
	 * Pluralization helper.
	 */

	function plural(ms, msAbs, n, name) {
	  var isPlural = msAbs >= n * 1.5;
	  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
	}
	return ms;
}

var common;
var hasRequiredCommon;

function requireCommon () {
	if (hasRequiredCommon) return common;
	hasRequiredCommon = 1;
	/**
	 * This is the common logic for both the Node.js and web browser
	 * implementations of `debug()`.
	 */

	function setup(env) {
		createDebug.debug = createDebug;
		createDebug.default = createDebug;
		createDebug.coerce = coerce;
		createDebug.disable = disable;
		createDebug.enable = enable;
		createDebug.enabled = enabled;
		createDebug.humanize = requireMs();
		createDebug.destroy = destroy;

		Object.keys(env).forEach(key => {
			createDebug[key] = env[key];
		});

		/**
		* The currently active debug mode names, and names to skip.
		*/

		createDebug.names = [];
		createDebug.skips = [];

		/**
		* Map of special "%n" handling functions, for the debug "format" argument.
		*
		* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
		*/
		createDebug.formatters = {};

		/**
		* Selects a color for a debug namespace
		* @param {String} namespace The namespace string for the debug instance to be colored
		* @return {Number|String} An ANSI color code for the given namespace
		* @api private
		*/
		function selectColor(namespace) {
			let hash = 0;

			for (let i = 0; i < namespace.length; i++) {
				hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
				hash |= 0; // Convert to 32bit integer
			}

			return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
		}
		createDebug.selectColor = selectColor;

		/**
		* Create a debugger with the given `namespace`.
		*
		* @param {String} namespace
		* @return {Function}
		* @api public
		*/
		function createDebug(namespace) {
			let prevTime;
			let enableOverride = null;
			let namespacesCache;
			let enabledCache;

			function debug(...args) {
				// Disabled?
				if (!debug.enabled) {
					return;
				}

				const self = debug;

				// Set `diff` timestamp
				const curr = Number(new Date());
				const ms = curr - (prevTime || curr);
				self.diff = ms;
				self.prev = prevTime;
				self.curr = curr;
				prevTime = curr;

				args[0] = createDebug.coerce(args[0]);

				if (typeof args[0] !== 'string') {
					// Anything else let's inspect with %O
					args.unshift('%O');
				}

				// Apply any `formatters` transformations
				let index = 0;
				args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
					// If we encounter an escaped % then don't increase the array index
					if (match === '%%') {
						return '%';
					}
					index++;
					const formatter = createDebug.formatters[format];
					if (typeof formatter === 'function') {
						const val = args[index];
						match = formatter.call(self, val);

						// Now we need to remove `args[index]` since it's inlined in the `format`
						args.splice(index, 1);
						index--;
					}
					return match;
				});

				// Apply env-specific formatting (colors, etc.)
				createDebug.formatArgs.call(self, args);

				const logFn = self.log || createDebug.log;
				logFn.apply(self, args);
			}

			debug.namespace = namespace;
			debug.useColors = createDebug.useColors();
			debug.color = createDebug.selectColor(namespace);
			debug.extend = extend;
			debug.destroy = createDebug.destroy; // XXX Temporary. Will be removed in the next major release.

			Object.defineProperty(debug, 'enabled', {
				enumerable: true,
				configurable: false,
				get: () => {
					if (enableOverride !== null) {
						return enableOverride;
					}
					if (namespacesCache !== createDebug.namespaces) {
						namespacesCache = createDebug.namespaces;
						enabledCache = createDebug.enabled(namespace);
					}

					return enabledCache;
				},
				set: v => {
					enableOverride = v;
				}
			});

			// Env-specific initialization logic for debug instances
			if (typeof createDebug.init === 'function') {
				createDebug.init(debug);
			}

			return debug;
		}

		function extend(namespace, delimiter) {
			const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
			newDebug.log = this.log;
			return newDebug;
		}

		/**
		* Enables a debug mode by namespaces. This can include modes
		* separated by a colon and wildcards.
		*
		* @param {String} namespaces
		* @api public
		*/
		function enable(namespaces) {
			createDebug.save(namespaces);
			createDebug.namespaces = namespaces;

			createDebug.names = [];
			createDebug.skips = [];

			const split = (typeof namespaces === 'string' ? namespaces : '')
				.trim()
				.replace(/\s+/g, ',')
				.split(',')
				.filter(Boolean);

			for (const ns of split) {
				if (ns[0] === '-') {
					createDebug.skips.push(ns.slice(1));
				} else {
					createDebug.names.push(ns);
				}
			}
		}

		/**
		 * Checks if the given string matches a namespace template, honoring
		 * asterisks as wildcards.
		 *
		 * @param {String} search
		 * @param {String} template
		 * @return {Boolean}
		 */
		function matchesTemplate(search, template) {
			let searchIndex = 0;
			let templateIndex = 0;
			let starIndex = -1;
			let matchIndex = 0;

			while (searchIndex < search.length) {
				if (templateIndex < template.length && (template[templateIndex] === search[searchIndex] || template[templateIndex] === '*')) {
					// Match character or proceed with wildcard
					if (template[templateIndex] === '*') {
						starIndex = templateIndex;
						matchIndex = searchIndex;
						templateIndex++; // Skip the '*'
					} else {
						searchIndex++;
						templateIndex++;
					}
				} else if (starIndex !== -1) { // eslint-disable-line no-negated-condition
					// Backtrack to the last '*' and try to match more characters
					templateIndex = starIndex + 1;
					matchIndex++;
					searchIndex = matchIndex;
				} else {
					return false; // No match
				}
			}

			// Handle trailing '*' in template
			while (templateIndex < template.length && template[templateIndex] === '*') {
				templateIndex++;
			}

			return templateIndex === template.length;
		}

		/**
		* Disable debug output.
		*
		* @return {String} namespaces
		* @api public
		*/
		function disable() {
			const namespaces = [
				...createDebug.names,
				...createDebug.skips.map(namespace => '-' + namespace)
			].join(',');
			createDebug.enable('');
			return namespaces;
		}

		/**
		* Returns true if the given mode name is enabled, false otherwise.
		*
		* @param {String} name
		* @return {Boolean}
		* @api public
		*/
		function enabled(name) {
			for (const skip of createDebug.skips) {
				if (matchesTemplate(name, skip)) {
					return false;
				}
			}

			for (const ns of createDebug.names) {
				if (matchesTemplate(name, ns)) {
					return true;
				}
			}

			return false;
		}

		/**
		* Coerce `val`.
		*
		* @param {Mixed} val
		* @return {Mixed}
		* @api private
		*/
		function coerce(val) {
			if (val instanceof Error) {
				return val.stack || val.message;
			}
			return val;
		}

		/**
		* XXX DO NOT USE. This is a temporary stub function.
		* XXX It WILL be removed in the next major release.
		*/
		function destroy() {
			console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
		}

		createDebug.enable(createDebug.load());

		return createDebug;
	}

	common = setup;
	return common;
}

var hasRequiredBrowser;

function requireBrowser () {
	if (hasRequiredBrowser) return browser.exports;
	hasRequiredBrowser = 1;
	(function (module, exports) {
		/**
		 * This is the web browser implementation of `debug()`.
		 */

		exports.formatArgs = formatArgs;
		exports.save = save;
		exports.load = load;
		exports.useColors = useColors;
		exports.storage = localstorage();
		exports.destroy = (() => {
			let warned = false;

			return () => {
				if (!warned) {
					warned = true;
					console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
				}
			};
		})();

		/**
		 * Colors.
		 */

		exports.colors = [
			'#0000CC',
			'#0000FF',
			'#0033CC',
			'#0033FF',
			'#0066CC',
			'#0066FF',
			'#0099CC',
			'#0099FF',
			'#00CC00',
			'#00CC33',
			'#00CC66',
			'#00CC99',
			'#00CCCC',
			'#00CCFF',
			'#3300CC',
			'#3300FF',
			'#3333CC',
			'#3333FF',
			'#3366CC',
			'#3366FF',
			'#3399CC',
			'#3399FF',
			'#33CC00',
			'#33CC33',
			'#33CC66',
			'#33CC99',
			'#33CCCC',
			'#33CCFF',
			'#6600CC',
			'#6600FF',
			'#6633CC',
			'#6633FF',
			'#66CC00',
			'#66CC33',
			'#9900CC',
			'#9900FF',
			'#9933CC',
			'#9933FF',
			'#99CC00',
			'#99CC33',
			'#CC0000',
			'#CC0033',
			'#CC0066',
			'#CC0099',
			'#CC00CC',
			'#CC00FF',
			'#CC3300',
			'#CC3333',
			'#CC3366',
			'#CC3399',
			'#CC33CC',
			'#CC33FF',
			'#CC6600',
			'#CC6633',
			'#CC9900',
			'#CC9933',
			'#CCCC00',
			'#CCCC33',
			'#FF0000',
			'#FF0033',
			'#FF0066',
			'#FF0099',
			'#FF00CC',
			'#FF00FF',
			'#FF3300',
			'#FF3333',
			'#FF3366',
			'#FF3399',
			'#FF33CC',
			'#FF33FF',
			'#FF6600',
			'#FF6633',
			'#FF9900',
			'#FF9933',
			'#FFCC00',
			'#FFCC33'
		];

		/**
		 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
		 * and the Firebug extension (any Firefox version) are known
		 * to support "%c" CSS customizations.
		 *
		 * TODO: add a `localStorage` variable to explicitly enable/disable colors
		 */

		// eslint-disable-next-line complexity
		function useColors() {
			// NB: In an Electron preload script, document will be defined but not fully
			// initialized. Since we know we're in Chrome, we'll just detect this case
			// explicitly
			if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
				return true;
			}

			// Internet Explorer and Edge do not support colors.
			if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
				return false;
			}

			let m;

			// Is webkit? http://stackoverflow.com/a/16459606/376773
			// document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
			// eslint-disable-next-line no-return-assign
			return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
				// Is firebug? http://stackoverflow.com/a/398120/376773
				(typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
				// Is firefox >= v31?
				// https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
				(typeof navigator !== 'undefined' && navigator.userAgent && (m = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m[1], 10) >= 31) ||
				// Double check webkit in userAgent just in case we are in a worker
				(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
		}

		/**
		 * Colorize log arguments if enabled.
		 *
		 * @api public
		 */

		function formatArgs(args) {
			args[0] = (this.useColors ? '%c' : '') +
				this.namespace +
				(this.useColors ? ' %c' : ' ') +
				args[0] +
				(this.useColors ? '%c ' : ' ') +
				'+' + module.exports.humanize(this.diff);

			if (!this.useColors) {
				return;
			}

			const c = 'color: ' + this.color;
			args.splice(1, 0, c, 'color: inherit');

			// The final "%c" is somewhat tricky, because there could be other
			// arguments passed either before or after the %c, so we need to
			// figure out the correct index to insert the CSS into
			let index = 0;
			let lastC = 0;
			args[0].replace(/%[a-zA-Z%]/g, match => {
				if (match === '%%') {
					return;
				}
				index++;
				if (match === '%c') {
					// We only are interested in the *last* %c
					// (the user may have provided their own)
					lastC = index;
				}
			});

			args.splice(lastC, 0, c);
		}

		/**
		 * Invokes `console.debug()` when available.
		 * No-op when `console.debug` is not a "function".
		 * If `console.debug` is not available, falls back
		 * to `console.log`.
		 *
		 * @api public
		 */
		exports.log = console.debug || console.log || (() => {});

		/**
		 * Save `namespaces`.
		 *
		 * @param {String} namespaces
		 * @api private
		 */
		function save(namespaces) {
			try {
				if (namespaces) {
					exports.storage.setItem('debug', namespaces);
				} else {
					exports.storage.removeItem('debug');
				}
			} catch (error) {
				// Swallow
				// XXX (@Qix-) should we be logging these?
			}
		}

		/**
		 * Load `namespaces`.
		 *
		 * @return {String} returns the previously persisted debug modes
		 * @api private
		 */
		function load() {
			let r;
			try {
				r = exports.storage.getItem('debug') || exports.storage.getItem('DEBUG') ;
			} catch (error) {
				// Swallow
				// XXX (@Qix-) should we be logging these?
			}

			// If debug isn't set in LS, and we're in Electron, try to load $DEBUG
			if (!r && typeof browser$1$1 !== 'undefined' && 'env' in browser$1$1) {
				r = browser$1$1.env.DEBUG;
			}

			return r;
		}

		/**
		 * Localstorage attempts to return the localstorage.
		 *
		 * This is necessary because safari throws
		 * when a user disables cookies/localstorage
		 * and you attempt to access it.
		 *
		 * @return {LocalStorage}
		 * @api private
		 */

		function localstorage() {
			try {
				// TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
				// The Browser also has localStorage in the global context.
				return localStorage;
			} catch (error) {
				// Swallow
				// XXX (@Qix-) should we be logging these?
			}
		}

		module.exports = requireCommon()(exports);

		const {formatters} = module.exports;

		/**
		 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
		 */

		formatters.j = function (v) {
			try {
				return JSON.stringify(v);
			} catch (error) {
				return '[UnexpectedJSONParseError]: ' + error.message;
			}
		}; 
	} (browser, browser.exports));
	return browser.exports;
}

var browserExports = requireBrowser();
var getLogger = /*@__PURE__*/getDefaultExportFromCjs(browserExports);

var DAVNamespace;
(function (DAVNamespace) {
    DAVNamespace["CALENDAR_SERVER"] = "http://calendarserver.org/ns/";
    DAVNamespace["CALDAV_APPLE"] = "http://apple.com/ns/ical/";
    DAVNamespace["CALDAV"] = "urn:ietf:params:xml:ns:caldav";
    DAVNamespace["CARDDAV"] = "urn:ietf:params:xml:ns:carddav";
    DAVNamespace["DAV"] = "DAV:";
})(DAVNamespace || (DAVNamespace = {}));
const DAVAttributeMap = {
    [DAVNamespace.CALDAV]: 'xmlns:c',
    [DAVNamespace.CARDDAV]: 'xmlns:card',
    [DAVNamespace.CALENDAR_SERVER]: 'xmlns:cs',
    [DAVNamespace.CALDAV_APPLE]: 'xmlns:ca',
    [DAVNamespace.DAV]: 'xmlns:d',
};
var DAVNamespaceShort;
(function (DAVNamespaceShort) {
    DAVNamespaceShort["CALDAV"] = "c";
    DAVNamespaceShort["CARDDAV"] = "card";
    DAVNamespaceShort["CALENDAR_SERVER"] = "cs";
    DAVNamespaceShort["CALDAV_APPLE"] = "ca";
    DAVNamespaceShort["DAV"] = "d";
})(DAVNamespaceShort || (DAVNamespaceShort = {}));
var ICALObjects;
(function (ICALObjects) {
    ICALObjects["VEVENT"] = "VEVENT";
    ICALObjects["VTODO"] = "VTODO";
    ICALObjects["VJOURNAL"] = "VJOURNAL";
    ICALObjects["VFREEBUSY"] = "VFREEBUSY";
    ICALObjects["VTIMEZONE"] = "VTIMEZONE";
    ICALObjects["VALARM"] = "VALARM";
})(ICALObjects || (ICALObjects = {}));

var lookup = [];
var revLookup = [];
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;
var inited = false;
function init () {
  inited = true;
  var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  for (var i = 0, len = code.length; i < len; ++i) {
    lookup[i] = code[i];
    revLookup[code.charCodeAt(i)] = i;
  }

  revLookup['-'.charCodeAt(0)] = 62;
  revLookup['_'.charCodeAt(0)] = 63;
}

function toByteArray (b64) {
  if (!inited) {
    init();
  }
  var i, j, l, tmp, placeHolders, arr;
  var len = b64.length;

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  placeHolders = b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0;

  // base64 is 4/3 + up to two characters of the original data
  arr = new Arr(len * 3 / 4 - placeHolders);

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len;

  var L = 0;

  for (i = 0, j = 0; i < l; i += 4, j += 3) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)];
    arr[L++] = (tmp >> 16) & 0xFF;
    arr[L++] = (tmp >> 8) & 0xFF;
    arr[L++] = tmp & 0xFF;
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4);
    arr[L++] = tmp & 0xFF;
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2);
    arr[L++] = (tmp >> 8) & 0xFF;
    arr[L++] = tmp & 0xFF;
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp;
  var output = [];
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
    output.push(tripletToBase64(tmp));
  }
  return output.join('')
}

function fromByteArray (uint8) {
  if (!inited) {
    init();
  }
  var tmp;
  var len = uint8.length;
  var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
  var output = '';
  var parts = [];
  var maxChunkLength = 16383; // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)));
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1];
    output += lookup[tmp >> 2];
    output += lookup[(tmp << 4) & 0x3F];
    output += '==';
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1]);
    output += lookup[tmp >> 10];
    output += lookup[(tmp >> 4) & 0x3F];
    output += lookup[(tmp << 2) & 0x3F];
    output += '=';
  }

  parts.push(output);

  return parts.join('')
}

function read (buffer, offset, isLE, mLen, nBytes) {
  var e, m;
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var nBits = -7;
  var i = isLE ? (nBytes - 1) : 0;
  var d = isLE ? -1 : 1;
  var s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

function write (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c;
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0);
  var i = isLE ? 0 : (nBytes - 1);
  var d = isLE ? 1 : -1;
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128;
}

var toString = {}.toString;

var isArray$1 = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */


var INSPECT_MAX_BYTES = 50;

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global$1.TYPED_ARRAY_SUPPORT !== undefined
  ? global$1.TYPED_ARRAY_SUPPORT
  : true;

/*
 * Export kMaxLength after typed array support is determined.
 */
kMaxLength();

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length);
    that.__proto__ = Buffer.prototype;
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length);
    }
    that.length = length;
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192; // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype;
  return arr
};

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
};

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype;
  Buffer.__proto__ = Uint8Array;
  if (typeof Symbol !== 'undefined' && Symbol.species &&
      Buffer[Symbol.species] === Buffer) ;
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size);
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
};

function allocUnsafe (that, size) {
  assertSize(size);
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0);
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0;
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
};
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
};

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8';
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0;
  that = createBuffer(that, length);

  var actual = that.write(string, encoding);

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    that = that.slice(0, actual);
  }

  return that
}

function fromArrayLike (that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0;
  that = createBuffer(that, length);
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255;
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {
  array.byteLength; // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array);
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset);
  } else {
    array = new Uint8Array(array, byteOffset, length);
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array;
    that.__proto__ = Buffer.prototype;
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array);
  }
  return that
}

function fromObject (that, obj) {
  if (internalIsBuffer(obj)) {
    var len = checked(obj.length) | 0;
    that = createBuffer(that, len);

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len);
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isArray$1(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength()` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}
Buffer.isBuffer = isBuffer;
function internalIsBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!internalIsBuffer(a) || !internalIsBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length;
  var y = b.length;

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i];
      y = b[i];
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
};

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
};

Buffer.concat = function concat (list, length) {
  if (!isArray$1(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i;
  if (length === undefined) {
    length = 0;
    for (i = 0; i < list.length; ++i) {
      length += list[i].length;
    }
  }

  var buffer = Buffer.allocUnsafe(length);
  var pos = 0;
  for (i = 0; i < list.length; ++i) {
    var buf = list[i];
    if (!internalIsBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos);
    pos += buf.length;
  }
  return buffer
};

function byteLength (string, encoding) {
  if (internalIsBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string;
  }

  var len = string.length;
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false;
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase();
        loweredCase = true;
    }
  }
}
Buffer.byteLength = byteLength;

function slowToString (encoding, start, end) {
  var loweredCase = false;

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0;
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length;
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0;
  start >>>= 0;

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8';

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase();
        loweredCase = true;
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true;

function swap (b, n, m) {
  var i = b[n];
  b[n] = b[m];
  b[m] = i;
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length;
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1);
  }
  return this
};

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length;
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3);
    swap(this, i + 1, i + 2);
  }
  return this
};

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length;
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7);
    swap(this, i + 1, i + 6);
    swap(this, i + 2, i + 5);
    swap(this, i + 3, i + 4);
  }
  return this
};

Buffer.prototype.toString = function toString () {
  var length = this.length | 0;
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
};

Buffer.prototype.equals = function equals (b) {
  if (!internalIsBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
};

Buffer.prototype.inspect = function inspect () {
  var str = '';
  var max = INSPECT_MAX_BYTES;
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ');
    if (this.length > max) str += ' ... ';
  }
  return '<Buffer ' + str + '>'
};

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!internalIsBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0;
  }
  if (end === undefined) {
    end = target ? target.length : 0;
  }
  if (thisStart === undefined) {
    thisStart = 0;
  }
  if (thisEnd === undefined) {
    thisEnd = this.length;
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0;
  end >>>= 0;
  thisStart >>>= 0;
  thisEnd >>>= 0;

  if (this === target) return 0

  var x = thisEnd - thisStart;
  var y = end - start;
  var len = Math.min(x, y);

  var thisCopy = this.slice(thisStart, thisEnd);
  var targetCopy = target.slice(start, end);

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i];
      y = targetCopy[i];
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
};

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset;
    byteOffset = 0;
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff;
  } else if (byteOffset < -2147483648) {
    byteOffset = -2147483648;
  }
  byteOffset = +byteOffset;  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1);
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1;
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0;
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding);
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (internalIsBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF; // Search for a byte value [0-255]
    if (Buffer.TYPED_ARRAY_SUPPORT &&
        typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1;
  var arrLength = arr.length;
  var valLength = val.length;

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase();
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2;
      arrLength /= 2;
      valLength /= 2;
      byteOffset /= 2;
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i;
  if (dir) {
    var foundIndex = -1;
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i;
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex;
        foundIndex = -1;
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
    for (i = byteOffset; i >= 0; i--) {
      var found = true;
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false;
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
};

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
};

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
};

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0;
  var remaining = buf.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = Number(length);
    if (length > remaining) {
      length = remaining;
    }
  }

  // must be an even number of digits
  var strLen = string.length;
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2;
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16);
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed;
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8';
    length = this.length;
    offset = 0;
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset;
    length = this.length;
    offset = 0;
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0;
    if (isFinite(length)) {
      length = length | 0;
      if (encoding === undefined) encoding = 'utf8';
    } else {
      encoding = length;
      length = undefined;
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset;
  if (length === undefined || length > remaining) length = remaining;

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8';

  var loweredCase = false;
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase();
        loweredCase = true;
    }
  }
};

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
};

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return fromByteArray(buf)
  } else {
    return fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end);
  var res = [];

  var i = start;
  while (i < end) {
    var firstByte = buf[i];
    var codePoint = null;
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1;

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint;

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte;
          }
          break
        case 2:
          secondByte = buf[i + 1];
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F);
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint;
            }
          }
          break
        case 3:
          secondByte = buf[i + 1];
          thirdByte = buf[i + 2];
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F);
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint;
            }
          }
          break
        case 4:
          secondByte = buf[i + 1];
          thirdByte = buf[i + 2];
          fourthByte = buf[i + 3];
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F);
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint;
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD;
      bytesPerSequence = 1;
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000;
      res.push(codePoint >>> 10 & 0x3FF | 0xD800);
      codePoint = 0xDC00 | codePoint & 0x3FF;
    }

    res.push(codePoint);
    i += bytesPerSequence;
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000;

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length;
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = '';
  var i = 0;
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    );
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = '';
  end = Math.min(buf.length, end);

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F);
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = '';
  end = Math.min(buf.length, end);

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i]);
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length;

  if (!start || start < 0) start = 0;
  if (!end || end < 0 || end > len) end = len;

  var out = '';
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i]);
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end);
  var res = '';
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length;
  start = ~~start;
  end = end === undefined ? len : ~~end;

  if (start < 0) {
    start += len;
    if (start < 0) start = 0;
  } else if (start > len) {
    start = len;
  }

  if (end < 0) {
    end += len;
    if (end < 0) end = 0;
  } else if (end > len) {
    end = len;
  }

  if (end < start) end = start;

  var newBuf;
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end);
    newBuf.__proto__ = Buffer.prototype;
  } else {
    var sliceLen = end - start;
    newBuf = new Buffer(sliceLen, undefined);
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start];
    }
  }

  return newBuf
};

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) checkOffset(offset, byteLength, this.length);

  var val = this[offset];
  var mul = 1;
  var i = 0;
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul;
  }

  return val
};

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length);
  }

  var val = this[offset + --byteLength];
  var mul = 1;
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul;
  }

  return val
};

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length);
  return this[offset]
};

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  return this[offset] | (this[offset + 1] << 8)
};

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  return (this[offset] << 8) | this[offset + 1]
};

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
};

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
};

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) checkOffset(offset, byteLength, this.length);

  var val = this[offset];
  var mul = 1;
  var i = 0;
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul;
  }
  mul *= 0x80;

  if (val >= mul) val -= Math.pow(2, 8 * byteLength);

  return val
};

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) checkOffset(offset, byteLength, this.length);

  var i = byteLength;
  var mul = 1;
  var val = this[offset + --i];
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul;
  }
  mul *= 0x80;

  if (val >= mul) val -= Math.pow(2, 8 * byteLength);

  return val
};

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length);
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
};

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  var val = this[offset] | (this[offset + 1] << 8);
  return (val & 0x8000) ? val | 0xFFFF0000 : val
};

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  var val = this[offset + 1] | (this[offset] << 8);
  return (val & 0x8000) ? val | 0xFFFF0000 : val
};

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
};

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
};

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);
  return read(this, offset, true, 23, 4)
};

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);
  return read(this, offset, false, 23, 4)
};

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length);
  return read(this, offset, true, 52, 8)
};

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length);
  return read(this, offset, false, 52, 8)
};

function checkInt (buf, value, offset, ext, max, min) {
  if (!internalIsBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1;
    checkInt(this, value, offset, byteLength, maxBytes, 0);
  }

  var mul = 1;
  var i = 0;
  this[offset] = value & 0xFF;
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF;
  }

  return offset + byteLength
};

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1;
    checkInt(this, value, offset, byteLength, maxBytes, 0);
  }

  var i = byteLength - 1;
  var mul = 1;
  this[offset + i] = value & 0xFF;
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF;
  }

  return offset + byteLength
};

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
  this[offset] = (value & 0xff);
  return offset + 1
};

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1;
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8;
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff);
    this[offset + 1] = (value >>> 8);
  } else {
    objectWriteUInt16(this, value, offset, true);
  }
  return offset + 2
};

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8);
    this[offset + 1] = (value & 0xff);
  } else {
    objectWriteUInt16(this, value, offset, false);
  }
  return offset + 2
};

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1;
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff;
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24);
    this[offset + 2] = (value >>> 16);
    this[offset + 1] = (value >>> 8);
    this[offset] = (value & 0xff);
  } else {
    objectWriteUInt32(this, value, offset, true);
  }
  return offset + 4
};

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24);
    this[offset + 1] = (value >>> 16);
    this[offset + 2] = (value >>> 8);
    this[offset + 3] = (value & 0xff);
  } else {
    objectWriteUInt32(this, value, offset, false);
  }
  return offset + 4
};

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1);

    checkInt(this, value, offset, byteLength, limit - 1, -limit);
  }

  var i = 0;
  var mul = 1;
  var sub = 0;
  this[offset] = value & 0xFF;
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1;
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
  }

  return offset + byteLength
};

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1);

    checkInt(this, value, offset, byteLength, limit - 1, -limit);
  }

  var i = byteLength - 1;
  var mul = 1;
  var sub = 0;
  this[offset + i] = value & 0xFF;
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1;
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
  }

  return offset + byteLength
};

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -128);
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
  if (value < 0) value = 0xff + value + 1;
  this[offset] = (value & 0xff);
  return offset + 1
};

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -32768);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff);
    this[offset + 1] = (value >>> 8);
  } else {
    objectWriteUInt16(this, value, offset, true);
  }
  return offset + 2
};

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -32768);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8);
    this[offset + 1] = (value & 0xff);
  } else {
    objectWriteUInt16(this, value, offset, false);
  }
  return offset + 2
};

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -2147483648);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff);
    this[offset + 1] = (value >>> 8);
    this[offset + 2] = (value >>> 16);
    this[offset + 3] = (value >>> 24);
  } else {
    objectWriteUInt32(this, value, offset, true);
  }
  return offset + 4
};

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -2147483648);
  if (value < 0) value = 0xffffffff + value + 1;
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24);
    this[offset + 1] = (value >>> 16);
    this[offset + 2] = (value >>> 8);
    this[offset + 3] = (value & 0xff);
  } else {
    objectWriteUInt32(this, value, offset, false);
  }
  return offset + 4
};

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4);
  }
  write(buf, value, offset, littleEndian, 23, 4);
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
};

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
};

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8);
  }
  write(buf, value, offset, littleEndian, 52, 8);
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
};

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
};

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0;
  if (!end && end !== 0) end = this.length;
  if (targetStart >= target.length) targetStart = target.length;
  if (!targetStart) targetStart = 0;
  if (end > 0 && end < start) end = start;

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length;
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start;
  }

  var len = end - start;
  var i;

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start];
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start];
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    );
  }

  return len
};

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start;
      start = 0;
      end = this.length;
    } else if (typeof end === 'string') {
      encoding = end;
      end = this.length;
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0);
      if (code < 256) {
        val = code;
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255;
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0;
  end = end === undefined ? this.length : end >>> 0;

  if (!val) val = 0;

  var i;
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val;
    }
  } else {
    var bytes = internalIsBuffer(val)
      ? val
      : utf8ToBytes(new Buffer(val, encoding).toString());
    var len = bytes.length;
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len];
    }
  }

  return this
};

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '');
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '=';
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity;
  var codePoint;
  var length = string.length;
  var leadSurrogate = null;
  var bytes = [];

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i);

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
          continue
        }

        // valid lead
        leadSurrogate = codePoint;

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
        leadSurrogate = codePoint;
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
    }

    leadSurrogate = null;

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint);
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      );
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      );
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      );
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = [];
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF);
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo;
  var byteArray = [];
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i);
    hi = c >> 8;
    lo = c % 256;
    byteArray.push(lo);
    byteArray.push(hi);
  }

  return byteArray
}


function base64ToBytes (str) {
  return toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i];
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}


// the following is from is-buffer, also by Feross Aboukhadijeh and with same lisence
// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
function isBuffer(obj) {
  return obj != null && (!!obj._isBuffer || isFastBuffer(obj) || isSlowBuffer(obj))
}

function isFastBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isFastBuffer(obj.slice(0, 0))
}

var sax = {};

var domain;

// This constructor is used to store event handlers. Instantiating this is
// faster than explicitly calling `Object.create(null)` to get a "clean" empty
// object (tested with v8 v4.9).
function EventHandlers() {}
EventHandlers.prototype = Object.create(null);

function EventEmitter() {
  EventEmitter.init.call(this);
}

// nodejs oddity
// require('events') === require('events').EventEmitter
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.usingDomains = false;

EventEmitter.prototype.domain = undefined;
EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

EventEmitter.init = function() {
  this.domain = null;
  if (EventEmitter.usingDomains) {
    // if there is an active domain, then attach to it.
    if (domain.active && !(this instanceof domain.Domain)) {
      this.domain = domain.active;
    }
  }

  if (!this._events || this._events === Object.getPrototypeOf(this)._events) {
    this._events = new EventHandlers();
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || isNaN(n))
    throw new TypeError('"n" argument must be a positive number');
  this._maxListeners = n;
  return this;
};

function $getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return $getMaxListeners(this);
};

// These standalone emit* functions are used to optimize calling of event
// handlers for fast cases because emit() itself often has a variable number of
// arguments and can be deoptimized because of that. These functions always have
// the same number of arguments and thus do not get deoptimized, so the code
// inside them can execute faster.
function emitNone(handler, isFn, self) {
  if (isFn)
    handler.call(self);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self);
  }
}
function emitOne(handler, isFn, self, arg1) {
  if (isFn)
    handler.call(self, arg1);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1);
  }
}
function emitTwo(handler, isFn, self, arg1, arg2) {
  if (isFn)
    handler.call(self, arg1, arg2);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2);
  }
}
function emitThree(handler, isFn, self, arg1, arg2, arg3) {
  if (isFn)
    handler.call(self, arg1, arg2, arg3);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2, arg3);
  }
}

function emitMany(handler, isFn, self, args) {
  if (isFn)
    handler.apply(self, args);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].apply(self, args);
  }
}

EventEmitter.prototype.emit = function emit(type) {
  var er, handler, len, args, i, events, domain;
  var doError = (type === 'error');

  events = this._events;
  if (events)
    doError = (doError && events.error == null);
  else if (!doError)
    return false;

  domain = this.domain;

  // If there is no 'error' event listener then throw.
  if (doError) {
    er = arguments[1];
    if (domain) {
      if (!er)
        er = new Error('Uncaught, unspecified "error" event');
      er.domainEmitter = this;
      er.domain = domain;
      er.domainThrown = false;
      domain.emit('error', er);
    } else if (er instanceof Error) {
      throw er; // Unhandled 'error' event
    } else {
      // At least give some kind of context to the user
      var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
      err.context = er;
      throw err;
    }
    return false;
  }

  handler = events[type];

  if (!handler)
    return false;

  var isFn = typeof handler === 'function';
  len = arguments.length;
  switch (len) {
    // fast cases
    case 1:
      emitNone(handler, isFn, this);
      break;
    case 2:
      emitOne(handler, isFn, this, arguments[1]);
      break;
    case 3:
      emitTwo(handler, isFn, this, arguments[1], arguments[2]);
      break;
    case 4:
      emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
      break;
    // slower
    default:
      args = new Array(len - 1);
      for (i = 1; i < len; i++)
        args[i - 1] = arguments[i];
      emitMany(handler, isFn, this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');

  events = target._events;
  if (!events) {
    events = target._events = new EventHandlers();
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener) {
      target.emit('newListener', type,
                  listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (!existing) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] = prepend ? [listener, existing] :
                                          [existing, listener];
    } else {
      // If we've already got an array, just append.
      if (prepend) {
        existing.unshift(listener);
      } else {
        existing.push(listener);
      }
    }

    // Check for listener leak
    if (!existing.warned) {
      m = $getMaxListeners(target);
      if (m && m > 0 && existing.length > m) {
        existing.warned = true;
        var w = new Error('Possible EventEmitter memory leak detected. ' +
                            existing.length + ' ' + type + ' listeners added. ' +
                            'Use emitter.setMaxListeners() to increase limit');
        w.name = 'MaxListenersExceededWarning';
        w.emitter = target;
        w.type = type;
        w.count = existing.length;
        emitWarning(w);
      }
    }
  }

  return target;
}
function emitWarning(e) {
  typeof console.warn === 'function' ? console.warn(e) : console.log(e);
}
EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function _onceWrap(target, type, listener) {
  var fired = false;
  function g() {
    target.removeListener(type, g);
    if (!fired) {
      fired = true;
      listener.apply(target, arguments);
    }
  }
  g.listener = listener;
  return g;
}

EventEmitter.prototype.once = function once(type, listener) {
  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');

      events = this._events;
      if (!events)
        return this;

      list = events[type];
      if (!list)
        return this;

      if (list === listener || (list.listener && list.listener === listener)) {
        if (--this._eventsCount === 0)
          this._events = new EventHandlers();
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length; i-- > 0;) {
          if (list[i] === listener ||
              (list[i].listener && list[i].listener === listener)) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (list.length === 1) {
          list[0] = undefined;
          if (--this._eventsCount === 0) {
            this._events = new EventHandlers();
            return this;
          } else {
            delete events[type];
          }
        } else {
          spliceOne(list, position);
        }

        if (events.removeListener)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };
    
// Alias for removeListener added in NodeJS 10.0
// https://nodejs.org/api/events.html#events_emitter_off_eventname_listener
EventEmitter.prototype.off = function(type, listener){
    return this.removeListener(type, listener);
};

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events;

      events = this._events;
      if (!events)
        return this;

      // not listening for removeListener, no need to emit
      if (!events.removeListener) {
        if (arguments.length === 0) {
          this._events = new EventHandlers();
          this._eventsCount = 0;
        } else if (events[type]) {
          if (--this._eventsCount === 0)
            this._events = new EventHandlers();
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        for (var i = 0, key; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = new EventHandlers();
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners) {
        // LIFO order
        do {
          this.removeListener(type, listeners[listeners.length - 1]);
        } while (listeners[0]);
      }

      return this;
    };

EventEmitter.prototype.listeners = function listeners(type) {
  var evlistener;
  var ret;
  var events = this._events;

  if (!events)
    ret = [];
  else {
    evlistener = events[type];
    if (!evlistener)
      ret = [];
    else if (typeof evlistener === 'function')
      ret = [evlistener.listener || evlistener];
    else
      ret = unwrapListeners(evlistener);
  }

  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount$1.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount$1;
function listenerCount$1(type) {
  var events = this._events;

  if (events) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
};

// About 1.5x faster than the two-arg version of Array#splice().
function spliceOne(list, index) {
  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
    list[i] = list[k];
  list.pop();
}

function arrayClone(arr, i) {
  var copy = new Array(i);
  while (i--)
    copy[i] = arr[i];
  return copy;
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

var inherits;
if (typeof Object.create === 'function'){
  inherits = function inherits(ctor, superCtor) {
    // implementation from standard node.js 'util' module
    ctor.super_ = superCtor;
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  inherits = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor;
    var TempCtor = function () {};
    TempCtor.prototype = superCtor.prototype;
    ctor.prototype = new TempCtor();
    ctor.prototype.constructor = ctor;
  };
}

var formatRegExp = /%[sdj%]/g;
function format(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
}

// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
function deprecate(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global$1.process)) {
    return function() {
      return deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (browser$1$1.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (browser$1$1.throwDeprecation) {
        throw new Error(msg);
      } else if (browser$1$1.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
}

var debugs = {};
var debugEnviron;
function debuglog(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = browser$1$1.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = 0;
      debugs[set] = function() {
        var msg = format.apply(null, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
}

/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    _extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}

// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var length = output.reduce(function(prev, cur) {
    if (cur.indexOf('\n') >= 0) ;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}

function isBoolean(arg) {
  return typeof arg === 'boolean';
}

function isNull(arg) {
  return arg === null;
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isString(arg) {
  return typeof arg === 'string';
}

function isUndefined(arg) {
  return arg === void 0;
}

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}

function isFunction(arg) {
  return typeof arg === 'function';
}

function objectToString(o) {
  return Object.prototype.toString.call(o);
}

function _extend(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
}
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

function BufferList() {
  this.head = null;
  this.tail = null;
  this.length = 0;
}

BufferList.prototype.push = function (v) {
  var entry = { data: v, next: null };
  if (this.length > 0) this.tail.next = entry;else this.head = entry;
  this.tail = entry;
  ++this.length;
};

BufferList.prototype.unshift = function (v) {
  var entry = { data: v, next: this.head };
  if (this.length === 0) this.tail = entry;
  this.head = entry;
  ++this.length;
};

BufferList.prototype.shift = function () {
  if (this.length === 0) return;
  var ret = this.head.data;
  if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
  --this.length;
  return ret;
};

BufferList.prototype.clear = function () {
  this.head = this.tail = null;
  this.length = 0;
};

BufferList.prototype.join = function (s) {
  if (this.length === 0) return '';
  var p = this.head;
  var ret = '' + p.data;
  while (p = p.next) {
    ret += s + p.data;
  }return ret;
};

BufferList.prototype.concat = function (n) {
  if (this.length === 0) return Buffer.alloc(0);
  if (this.length === 1) return this.head.data;
  var ret = Buffer.allocUnsafe(n >>> 0);
  var p = this.head;
  var i = 0;
  while (p) {
    p.data.copy(ret, i);
    i += p.data.length;
    p = p.next;
  }
  return ret;
};

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var isBufferEncoding = Buffer.isEncoding
  || function(encoding) {
       switch (encoding && encoding.toLowerCase()) {
         case 'hex': case 'utf8': case 'utf-8': case 'ascii': case 'binary': case 'base64': case 'ucs2': case 'ucs-2': case 'utf16le': case 'utf-16le': case 'raw': return true;
         default: return false;
       }
     };


function assertEncoding(encoding) {
  if (encoding && !isBufferEncoding(encoding)) {
    throw new Error('Unknown encoding: ' + encoding);
  }
}

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters. CESU-8 is handled as part of the UTF-8 encoding.
//
// @TODO Handling all encodings inside a single object makes it very difficult
// to reason about this code, so it should be split up in the future.
// @TODO There should be a utf8-strict encoding that rejects invalid UTF-8 code
// points as used by CESU-8.
function StringDecoder(encoding) {
  this.encoding = (encoding || 'utf8').toLowerCase().replace(/[-_]/, '');
  assertEncoding(encoding);
  switch (this.encoding) {
    case 'utf8':
      // CESU-8 represents each of Surrogate Pair by 3-bytes
      this.surrogateSize = 3;
      break;
    case 'ucs2':
    case 'utf16le':
      // UTF-16 represents each of Surrogate Pair by 2-bytes
      this.surrogateSize = 2;
      this.detectIncompleteChar = utf16DetectIncompleteChar;
      break;
    case 'base64':
      // Base-64 stores 3 bytes in 4 chars, and pads the remainder.
      this.surrogateSize = 3;
      this.detectIncompleteChar = base64DetectIncompleteChar;
      break;
    default:
      this.write = passThroughWrite;
      return;
  }

  // Enough space to store all bytes of a single character. UTF-8 needs 4
  // bytes, but CESU-8 may require up to 6 (3 bytes per surrogate).
  this.charBuffer = new Buffer(6);
  // Number of bytes received for the current incomplete multi-byte character.
  this.charReceived = 0;
  // Number of bytes expected for the current incomplete multi-byte character.
  this.charLength = 0;
}

// write decodes the given buffer and returns it as JS string that is
// guaranteed to not contain any partial multi-byte characters. Any partial
// character found at the end of the buffer is buffered up, and will be
// returned when calling write again with the remaining bytes.
//
// Note: Converting a Buffer containing an orphan surrogate to a String
// currently works, but converting a String to a Buffer (via `new Buffer`, or
// Buffer#write) will replace incomplete surrogates with the unicode
// replacement character. See https://codereview.chromium.org/121173009/ .
StringDecoder.prototype.write = function(buffer) {
  var charStr = '';
  // if our last write ended with an incomplete multibyte character
  while (this.charLength) {
    // determine how many remaining bytes this buffer has to offer for this char
    var available = (buffer.length >= this.charLength - this.charReceived) ?
        this.charLength - this.charReceived :
        buffer.length;

    // add the new bytes to the char buffer
    buffer.copy(this.charBuffer, this.charReceived, 0, available);
    this.charReceived += available;

    if (this.charReceived < this.charLength) {
      // still not enough chars in this buffer? wait for more ...
      return '';
    }

    // remove bytes belonging to the current character from the buffer
    buffer = buffer.slice(available, buffer.length);

    // get the character that was split
    charStr = this.charBuffer.slice(0, this.charLength).toString(this.encoding);

    // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
    var charCode = charStr.charCodeAt(charStr.length - 1);
    if (charCode >= 0xD800 && charCode <= 0xDBFF) {
      this.charLength += this.surrogateSize;
      charStr = '';
      continue;
    }
    this.charReceived = this.charLength = 0;

    // if there are no more bytes in this buffer, just emit our char
    if (buffer.length === 0) {
      return charStr;
    }
    break;
  }

  // determine and set charLength / charReceived
  this.detectIncompleteChar(buffer);

  var end = buffer.length;
  if (this.charLength) {
    // buffer the incomplete character bytes we got
    buffer.copy(this.charBuffer, 0, buffer.length - this.charReceived, end);
    end -= this.charReceived;
  }

  charStr += buffer.toString(this.encoding, 0, end);

  var end = charStr.length - 1;
  var charCode = charStr.charCodeAt(end);
  // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
  if (charCode >= 0xD800 && charCode <= 0xDBFF) {
    var size = this.surrogateSize;
    this.charLength += size;
    this.charReceived += size;
    this.charBuffer.copy(this.charBuffer, size, 0, size);
    buffer.copy(this.charBuffer, 0, 0, size);
    return charStr.substring(0, end);
  }

  // or just emit the charStr
  return charStr;
};

// detectIncompleteChar determines if there is an incomplete UTF-8 character at
// the end of the given buffer. If so, it sets this.charLength to the byte
// length that character, and sets this.charReceived to the number of bytes
// that are available for this character.
StringDecoder.prototype.detectIncompleteChar = function(buffer) {
  // determine how many bytes we have to check at the end of this buffer
  var i = (buffer.length >= 3) ? 3 : buffer.length;

  // Figure out if one of the last i bytes of our buffer announces an
  // incomplete char.
  for (; i > 0; i--) {
    var c = buffer[buffer.length - i];

    // See http://en.wikipedia.org/wiki/UTF-8#Description

    // 110XXXXX
    if (i == 1 && c >> 5 == 0x06) {
      this.charLength = 2;
      break;
    }

    // 1110XXXX
    if (i <= 2 && c >> 4 == 0x0E) {
      this.charLength = 3;
      break;
    }

    // 11110XXX
    if (i <= 3 && c >> 3 == 0x1E) {
      this.charLength = 4;
      break;
    }
  }
  this.charReceived = i;
};

StringDecoder.prototype.end = function(buffer) {
  var res = '';
  if (buffer && buffer.length)
    res = this.write(buffer);

  if (this.charReceived) {
    var cr = this.charReceived;
    var buf = this.charBuffer;
    var enc = this.encoding;
    res += buf.slice(0, cr).toString(enc);
  }

  return res;
};

function passThroughWrite(buffer) {
  return buffer.toString(this.encoding);
}

function utf16DetectIncompleteChar(buffer) {
  this.charReceived = buffer.length % 2;
  this.charLength = this.charReceived ? 2 : 0;
}

function base64DetectIncompleteChar(buffer) {
  this.charReceived = buffer.length % 3;
  this.charLength = this.charReceived ? 3 : 0;
}

var _polyfillNode_string_decoder = /*#__PURE__*/Object.freeze({
	__proto__: null,
	StringDecoder: StringDecoder
});

Readable.ReadableState = ReadableState;

var debug$7 = debuglog('stream');
inherits(Readable, EventEmitter);

function prependListener(emitter, event, fn) {
  // Sadly this is not cacheable as some libraries bundle their own
  // event emitter implementation with them.
  if (typeof emitter.prependListener === 'function') {
    return emitter.prependListener(event, fn);
  } else {
    // This is a hack to make sure that our error handler is attached before any
    // userland ones.  NEVER DO THIS. This is here only because this code needs
    // to continue to work with older versions of Node.js that do not include
    // the prependListener() method. The goal is to eventually remove this hack.
    if (!emitter._events || !emitter._events[event])
      emitter.on(event, fn);
    else if (Array.isArray(emitter._events[event]))
      emitter._events[event].unshift(fn);
    else
      emitter._events[event] = [fn, emitter._events[event]];
  }
}
function listenerCount (emitter, type) {
  return emitter.listeners(type).length;
}
function ReadableState(options, stream) {

  options = options || {};

  // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away
  this.objectMode = !!options.objectMode;

  if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.readableObjectMode;

  // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"
  var hwm = options.highWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;
  this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;

  // cast to ints.
  this.highWaterMark = ~ ~this.highWaterMark;

  // A linked list is used to store data chunks instead of an array because the
  // linked list can remove elements from the beginning faster than
  // array.shift()
  this.buffer = new BufferList();
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = null;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.
  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;
  this.resumeScheduled = false;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // when piping, we only care about 'readable' events that happen
  // after read()ing all the bytes and not getting any pushback.
  this.ranOut = false;

  // the number of writers that are awaiting a drain event in .pipe()s
  this.awaitDrain = 0;

  // if true, a maybeReadMore has been scheduled
  this.readingMore = false;

  this.decoder = null;
  this.encoding = null;
  if (options.encoding) {
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}
function Readable(options) {

  if (!(this instanceof Readable)) return new Readable(options);

  this._readableState = new ReadableState(options, this);

  // legacy
  this.readable = true;

  if (options && typeof options.read === 'function') this._read = options.read;

  EventEmitter.call(this);
}

// Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.
Readable.prototype.push = function (chunk, encoding) {
  var state = this._readableState;

  if (!state.objectMode && typeof chunk === 'string') {
    encoding = encoding || state.defaultEncoding;
    if (encoding !== state.encoding) {
      chunk = Buffer.from(chunk, encoding);
      encoding = '';
    }
  }

  return readableAddChunk(this, state, chunk, encoding, false);
};

// Unshift should *always* be something directly out of read()
Readable.prototype.unshift = function (chunk) {
  var state = this._readableState;
  return readableAddChunk(this, state, chunk, '', true);
};

Readable.prototype.isPaused = function () {
  return this._readableState.flowing === false;
};

function readableAddChunk(stream, state, chunk, encoding, addToFront) {
  var er = chunkInvalid(state, chunk);
  if (er) {
    stream.emit('error', er);
  } else if (chunk === null) {
    state.reading = false;
    onEofChunk(stream, state);
  } else if (state.objectMode || chunk && chunk.length > 0) {
    if (state.ended && !addToFront) {
      var e = new Error('stream.push() after EOF');
      stream.emit('error', e);
    } else if (state.endEmitted && addToFront) {
      var _e = new Error('stream.unshift() after end event');
      stream.emit('error', _e);
    } else {
      var skipAdd;
      if (state.decoder && !addToFront && !encoding) {
        chunk = state.decoder.write(chunk);
        skipAdd = !state.objectMode && chunk.length === 0;
      }

      if (!addToFront) state.reading = false;

      // Don't add to the buffer if we've decoded to an empty string chunk and
      // we're not in object mode
      if (!skipAdd) {
        // if we want the data now, just emit it.
        if (state.flowing && state.length === 0 && !state.sync) {
          stream.emit('data', chunk);
          stream.read(0);
        } else {
          // update the buffer info.
          state.length += state.objectMode ? 1 : chunk.length;
          if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);

          if (state.needReadable) emitReadable(stream);
        }
      }

      maybeReadMore(stream, state);
    }
  } else if (!addToFront) {
    state.reading = false;
  }

  return needMoreData(state);
}

// if it's past the high water mark, we can push in some more.
// Also, if we have no data yet, we can stand some
// more bytes.  This is to work around cases where hwm=0,
// such as the repl.  Also, if the push() triggered a
// readable event, and the user called read(largeNumber) such that
// needReadable was set, then we ought to push more, so that another
// 'readable' event will be triggered.
function needMoreData(state) {
  return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
}

// backwards compatibility.
Readable.prototype.setEncoding = function (enc) {
  this._readableState.decoder = new StringDecoder(enc);
  this._readableState.encoding = enc;
  return this;
};

// Don't raise the hwm > 8MB
var MAX_HWM = 0x800000;
function computeNewHighWaterMark(n) {
  if (n >= MAX_HWM) {
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2 to prevent increasing hwm excessively in
    // tiny amounts
    n--;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    n++;
  }
  return n;
}

// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function howMuchToRead(n, state) {
  if (n <= 0 || state.length === 0 && state.ended) return 0;
  if (state.objectMode) return 1;
  if (n !== n) {
    // Only flow one buffer at a time
    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
  }
  // If we're asking for more than the current hwm, then raise the hwm.
  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
  if (n <= state.length) return n;
  // Don't have enough
  if (!state.ended) {
    state.needReadable = true;
    return 0;
  }
  return state.length;
}

// you can override either this method, or the async _read(n) below.
Readable.prototype.read = function (n) {
  debug$7('read', n);
  n = parseInt(n, 10);
  var state = this._readableState;
  var nOrig = n;

  if (n !== 0) state.emittedReadable = false;

  // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.
  if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
    debug$7('read: emitReadable', state.length, state.ended);
    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
    return null;
  }

  n = howMuchToRead(n, state);

  // if we've ended, and we're now clear, then finish it up.
  if (n === 0 && state.ended) {
    if (state.length === 0) endReadable(this);
    return null;
  }

  // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.

  // if we need a readable event, then we need to do some reading.
  var doRead = state.needReadable;
  debug$7('need readable', doRead);

  // if we currently have less than the highWaterMark, then also read some
  if (state.length === 0 || state.length - n < state.highWaterMark) {
    doRead = true;
    debug$7('length less than watermark', doRead);
  }

  // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.
  if (state.ended || state.reading) {
    doRead = false;
    debug$7('reading or ended', doRead);
  } else if (doRead) {
    debug$7('do read');
    state.reading = true;
    state.sync = true;
    // if the length is currently zero, then we *need* a readable event.
    if (state.length === 0) state.needReadable = true;
    // call internal read method
    this._read(state.highWaterMark);
    state.sync = false;
    // If _read pushed data synchronously, then `reading` will be false,
    // and we need to re-evaluate how much data we can return to the user.
    if (!state.reading) n = howMuchToRead(nOrig, state);
  }

  var ret;
  if (n > 0) ret = fromList(n, state);else ret = null;

  if (ret === null) {
    state.needReadable = true;
    n = 0;
  } else {
    state.length -= n;
  }

  if (state.length === 0) {
    // If we have nothing in the buffer, then we want to know
    // as soon as we *do* get something into the buffer.
    if (!state.ended) state.needReadable = true;

    // If we tried to read() past the EOF, then emit end on the next tick.
    if (nOrig !== n && state.ended) endReadable(this);
  }

  if (ret !== null) this.emit('data', ret);

  return ret;
};

function chunkInvalid(state, chunk) {
  var er = null;
  if (!Buffer.isBuffer(chunk) && typeof chunk !== 'string' && chunk !== null && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  return er;
}

function onEofChunk(stream, state) {
  if (state.ended) return;
  if (state.decoder) {
    var chunk = state.decoder.end();
    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }
  state.ended = true;

  // emit 'readable' now to make sure it gets picked up.
  emitReadable(stream);
}

// Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.
function emitReadable(stream) {
  var state = stream._readableState;
  state.needReadable = false;
  if (!state.emittedReadable) {
    debug$7('emitReadable', state.flowing);
    state.emittedReadable = true;
    if (state.sync) nextTick(emitReadable_, stream);else emitReadable_(stream);
  }
}

function emitReadable_(stream) {
  debug$7('emit readable');
  stream.emit('readable');
  flow(stream);
}

// at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.
function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    nextTick(maybeReadMore_, stream, state);
  }
}

function maybeReadMore_(stream, state) {
  var len = state.length;
  while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
    debug$7('maybeReadMore read 0');
    stream.read(0);
    if (len === state.length)
      // didn't get any data, stop spinning.
      break;else len = state.length;
  }
  state.readingMore = false;
}

// abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.
Readable.prototype._read = function (n) {
  this.emit('error', new Error('not implemented'));
};

Readable.prototype.pipe = function (dest, pipeOpts) {
  var src = this;
  var state = this._readableState;

  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;
    case 1:
      state.pipes = [state.pipes, dest];
      break;
    default:
      state.pipes.push(dest);
      break;
  }
  state.pipesCount += 1;
  debug$7('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

  var doEnd = (!pipeOpts || pipeOpts.end !== false);

  var endFn = doEnd ? onend : cleanup;
  if (state.endEmitted) nextTick(endFn);else src.once('end', endFn);

  dest.on('unpipe', onunpipe);
  function onunpipe(readable) {
    debug$7('onunpipe');
    if (readable === src) {
      cleanup();
    }
  }

  function onend() {
    debug$7('onend');
    dest.end();
  }

  // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.
  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);

  var cleanedUp = false;
  function cleanup() {
    debug$7('cleanup');
    // cleanup event handlers once the pipe is broken
    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', cleanup);
    src.removeListener('data', ondata);

    cleanedUp = true;

    // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.
    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
  }

  // If the user pushes more data while we're writing to dest then we'll end up
  // in ondata again. However, we only want to increase awaitDrain once because
  // dest will only emit one 'drain' event for the multiple writes.
  // => Introduce a guard on increasing awaitDrain.
  var increasedAwaitDrain = false;
  src.on('data', ondata);
  function ondata(chunk) {
    debug$7('ondata');
    increasedAwaitDrain = false;
    var ret = dest.write(chunk);
    if (false === ret && !increasedAwaitDrain) {
      // If the user unpiped during `dest.write()`, it is possible
      // to get stuck in a permanently paused state if that write
      // also returned false.
      // => Check whether `dest` is still a piping destination.
      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
        debug$7('false write response, pause', src._readableState.awaitDrain);
        src._readableState.awaitDrain++;
        increasedAwaitDrain = true;
      }
      src.pause();
    }
  }

  // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.
  function onerror(er) {
    debug$7('onerror', er);
    unpipe();
    dest.removeListener('error', onerror);
    if (listenerCount(dest, 'error') === 0) dest.emit('error', er);
  }

  // Make sure our error handler is attached before userland ones.
  prependListener(dest, 'error', onerror);

  // Both close and finish should trigger unpipe, but only once.
  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }
  dest.once('close', onclose);
  function onfinish() {
    debug$7('onfinish');
    dest.removeListener('close', onclose);
    unpipe();
  }
  dest.once('finish', onfinish);

  function unpipe() {
    debug$7('unpipe');
    src.unpipe(dest);
  }

  // tell the dest that it's being piped to
  dest.emit('pipe', src);

  // start the flow if it hasn't been started already.
  if (!state.flowing) {
    debug$7('pipe resume');
    src.resume();
  }

  return dest;
};

function pipeOnDrain(src) {
  return function () {
    var state = src._readableState;
    debug$7('pipeOnDrain', state.awaitDrain);
    if (state.awaitDrain) state.awaitDrain--;
    if (state.awaitDrain === 0 && src.listeners('data').length) {
      state.flowing = true;
      flow(src);
    }
  };
}

Readable.prototype.unpipe = function (dest) {
  var state = this._readableState;

  // if we're not piping anywhere, then do nothing.
  if (state.pipesCount === 0) return this;

  // just one destination.  most common case.
  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes) return this;

    if (!dest) dest = state.pipes;

    // got a match.
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    if (dest) dest.emit('unpipe', this);
    return this;
  }

  // slow case. multiple pipe destinations.

  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;

    for (var _i = 0; _i < len; _i++) {
      dests[_i].emit('unpipe', this);
    }return this;
  }

  // try to find the right one.
  var i = indexOf(state.pipes, dest);
  if (i === -1) return this;

  state.pipes.splice(i, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1) state.pipes = state.pipes[0];

  dest.emit('unpipe', this);

  return this;
};

// set up data events if they are asked for
// Ensure readable listeners eventually get something
Readable.prototype.on = function (ev, fn) {
  var res = EventEmitter.prototype.on.call(this, ev, fn);

  if (ev === 'data') {
    // Start flowing on next tick if stream isn't explicitly paused
    if (this._readableState.flowing !== false) this.resume();
  } else if (ev === 'readable') {
    var state = this._readableState;
    if (!state.endEmitted && !state.readableListening) {
      state.readableListening = state.needReadable = true;
      state.emittedReadable = false;
      if (!state.reading) {
        nextTick(nReadingNextTick, this);
      } else if (state.length) {
        emitReadable(this);
      }
    }
  }

  return res;
};
Readable.prototype.addListener = Readable.prototype.on;

function nReadingNextTick(self) {
  debug$7('readable nexttick read 0');
  self.read(0);
}

// pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.
Readable.prototype.resume = function () {
  var state = this._readableState;
  if (!state.flowing) {
    debug$7('resume');
    state.flowing = true;
    resume(this, state);
  }
  return this;
};

function resume(stream, state) {
  if (!state.resumeScheduled) {
    state.resumeScheduled = true;
    nextTick(resume_, stream, state);
  }
}

function resume_(stream, state) {
  if (!state.reading) {
    debug$7('resume read 0');
    stream.read(0);
  }

  state.resumeScheduled = false;
  state.awaitDrain = 0;
  stream.emit('resume');
  flow(stream);
  if (state.flowing && !state.reading) stream.read(0);
}

Readable.prototype.pause = function () {
  debug$7('call pause flowing=%j', this._readableState.flowing);
  if (false !== this._readableState.flowing) {
    debug$7('pause');
    this._readableState.flowing = false;
    this.emit('pause');
  }
  return this;
};

function flow(stream) {
  var state = stream._readableState;
  debug$7('flow', state.flowing);
  while (state.flowing && stream.read() !== null) {}
}

// wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.
Readable.prototype.wrap = function (stream) {
  var state = this._readableState;
  var paused = false;

  var self = this;
  stream.on('end', function () {
    debug$7('wrapped end');
    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) self.push(chunk);
    }

    self.push(null);
  });

  stream.on('data', function (chunk) {
    debug$7('wrapped data');
    if (state.decoder) chunk = state.decoder.write(chunk);

    // don't skip over falsy values in objectMode
    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;

    var ret = self.push(chunk);
    if (!ret) {
      paused = true;
      stream.pause();
    }
  });

  // proxy all the other methods.
  // important when wrapping filters and duplexes.
  for (var i in stream) {
    if (this[i] === undefined && typeof stream[i] === 'function') {
      this[i] = function (method) {
        return function () {
          return stream[method].apply(stream, arguments);
        };
      }(i);
    }
  }

  // proxy certain important events.
  var events = ['error', 'close', 'destroy', 'pause', 'resume'];
  forEach(events, function (ev) {
    stream.on(ev, self.emit.bind(self, ev));
  });

  // when we try to consume some more bytes, simply unpause the
  // underlying stream.
  self._read = function (n) {
    debug$7('wrapped _read', n);
    if (paused) {
      paused = false;
      stream.resume();
    }
  };

  return self;
};

// exposed for testing purposes only.
Readable._fromList = fromList;

// Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromList(n, state) {
  // nothing buffered
  if (state.length === 0) return null;

  var ret;
  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
    // read it all, truncate the list
    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.head.data;else ret = state.buffer.concat(state.length);
    state.buffer.clear();
  } else {
    // read part of list
    ret = fromListPartial(n, state.buffer, state.decoder);
  }

  return ret;
}

// Extracts only enough buffered data to satisfy the amount requested.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromListPartial(n, list, hasStrings) {
  var ret;
  if (n < list.head.data.length) {
    // slice is the same for buffers and strings
    ret = list.head.data.slice(0, n);
    list.head.data = list.head.data.slice(n);
  } else if (n === list.head.data.length) {
    // first chunk is a perfect match
    ret = list.shift();
  } else {
    // result spans more than one buffer
    ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
  }
  return ret;
}

// Copies a specified amount of characters from the list of buffered data
// chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBufferString(n, list) {
  var p = list.head;
  var c = 1;
  var ret = p.data;
  n -= ret.length;
  while (p = p.next) {
    var str = p.data;
    var nb = n > str.length ? str.length : n;
    if (nb === str.length) ret += str;else ret += str.slice(0, n);
    n -= nb;
    if (n === 0) {
      if (nb === str.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = str.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

// Copies a specified amount of bytes from the list of buffered data chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBuffer(n, list) {
  var ret = Buffer.allocUnsafe(n);
  var p = list.head;
  var c = 1;
  p.data.copy(ret);
  n -= p.data.length;
  while (p = p.next) {
    var buf = p.data;
    var nb = n > buf.length ? buf.length : n;
    buf.copy(ret, ret.length - n, 0, nb);
    n -= nb;
    if (n === 0) {
      if (nb === buf.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = buf.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

function endReadable(stream) {
  var state = stream._readableState;

  // If we get here before consuming all the bytes, then that is a
  // bug in node.  Should never happen.
  if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');

  if (!state.endEmitted) {
    state.ended = true;
    nextTick(endReadableNT, state, stream);
  }
}

function endReadableNT(state, stream) {
  // Check that we didn't get one last unshift.
  if (!state.endEmitted && state.length === 0) {
    state.endEmitted = true;
    stream.readable = false;
    stream.emit('end');
  }
}

function forEach(xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}

function indexOf(xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }
  return -1;
}

// A bit simpler than readable streams.
// Implement an async ._write(chunk, encoding, cb), and it'll handle all
// the drain event emission and buffering.

Writable.WritableState = WritableState;
inherits(Writable, EventEmitter);

function nop() {}

function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
  this.next = null;
}

function WritableState(options, stream) {
  Object.defineProperty(this, 'buffer', {
    get: deprecate(function () {
      return this.getBuffer();
    }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.')
  });
  options = options || {};

  // object stream flag to indicate whether or not this stream
  // contains buffers or objects.
  this.objectMode = !!options.objectMode;

  if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.writableObjectMode;

  // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()
  var hwm = options.highWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;
  this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;

  // cast to ints.
  this.highWaterMark = ~ ~this.highWaterMark;

  this.needDrain = false;
  // at the start of calling end()
  this.ending = false;
  // when end() has been called, and returned
  this.ended = false;
  // when 'finish' is emitted
  this.finished = false;

  // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.
  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.
  this.length = 0;

  // a flag to see when we're in the middle of a write.
  this.writing = false;

  // when true all writes will be buffered until .uncork() call
  this.corked = 0;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.
  this.bufferProcessing = false;

  // the callback that's passed to _write(chunk,cb)
  this.onwrite = function (er) {
    onwrite(stream, er);
  };

  // the callback that the user supplies to write(chunk,encoding,cb)
  this.writecb = null;

  // the amount that is being written when _write is called.
  this.writelen = 0;

  this.bufferedRequest = null;
  this.lastBufferedRequest = null;

  // number of pending user-supplied write callbacks
  // this must be 0 before 'finish' can be emitted
  this.pendingcb = 0;

  // emit prefinish if the only thing we're waiting for is _write cbs
  // This is relevant for synchronous Transform streams
  this.prefinished = false;

  // True if the error was already emitted and should not be thrown again
  this.errorEmitted = false;

  // count buffered requests
  this.bufferedRequestCount = 0;

  // allocate the first CorkedRequest, there is always
  // one allocated and free to use, and we maintain at most two
  this.corkedRequestsFree = new CorkedRequest(this);
}

WritableState.prototype.getBuffer = function writableStateGetBuffer() {
  var current = this.bufferedRequest;
  var out = [];
  while (current) {
    out.push(current);
    current = current.next;
  }
  return out;
};
function Writable(options) {

  // Writable ctor is applied to Duplexes, though they're not
  // instanceof Writable, they're instanceof Readable.
  if (!(this instanceof Writable) && !(this instanceof Duplex)) return new Writable(options);

  this._writableState = new WritableState(options, this);

  // legacy.
  this.writable = true;

  if (options) {
    if (typeof options.write === 'function') this._write = options.write;

    if (typeof options.writev === 'function') this._writev = options.writev;
  }

  EventEmitter.call(this);
}

// Otherwise people can pipe Writable streams, which is just wrong.
Writable.prototype.pipe = function () {
  this.emit('error', new Error('Cannot pipe, not readable'));
};

function writeAfterEnd(stream, cb) {
  var er = new Error('write after end');
  // TODO: defer error events consistently everywhere, not just the cb
  stream.emit('error', er);
  nextTick(cb, er);
}

// If we get something that is not a buffer, string, null, or undefined,
// and we're not in objectMode, then that's an error.
// Otherwise stream chunks are all considered to be of length=1, and the
// watermarks determine how many objects to keep in the buffer, rather than
// how many bytes or characters.
function validChunk(stream, state, chunk, cb) {
  var valid = true;
  var er = false;
  // Always throw error if a null is written
  // if we are not in object mode then throw
  // if it is not a buffer, string, or undefined.
  if (chunk === null) {
    er = new TypeError('May not write null values to stream');
  } else if (!Buffer.isBuffer(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  if (er) {
    stream.emit('error', er);
    nextTick(cb, er);
    valid = false;
  }
  return valid;
}

Writable.prototype.write = function (chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;

  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (Buffer.isBuffer(chunk)) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;

  if (typeof cb !== 'function') cb = nop;

  if (state.ended) writeAfterEnd(this, cb);else if (validChunk(this, state, chunk, cb)) {
    state.pendingcb++;
    ret = writeOrBuffer(this, state, chunk, encoding, cb);
  }

  return ret;
};

Writable.prototype.cork = function () {
  var state = this._writableState;

  state.corked++;
};

Writable.prototype.uncork = function () {
  var state = this._writableState;

  if (state.corked) {
    state.corked--;

    if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
  }
};

Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
  // node::ParseEncoding() requires lower case.
  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new TypeError('Unknown encoding: ' + encoding);
  this._writableState.defaultEncoding = encoding;
  return this;
};

function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
    chunk = Buffer.from(chunk, encoding);
  }
  return chunk;
}

// if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.
function writeOrBuffer(stream, state, chunk, encoding, cb) {
  chunk = decodeChunk(state, chunk, encoding);

  if (Buffer.isBuffer(chunk)) encoding = 'buffer';
  var len = state.objectMode ? 1 : chunk.length;

  state.length += len;

  var ret = state.length < state.highWaterMark;
  // we must ensure that previous needDrain will not be reset to false.
  if (!ret) state.needDrain = true;

  if (state.writing || state.corked) {
    var last = state.lastBufferedRequest;
    state.lastBufferedRequest = new WriteReq(chunk, encoding, cb);
    if (last) {
      last.next = state.lastBufferedRequest;
    } else {
      state.bufferedRequest = state.lastBufferedRequest;
    }
    state.bufferedRequestCount += 1;
  } else {
    doWrite(stream, state, false, len, chunk, encoding, cb);
  }

  return ret;
}

function doWrite(stream, state, writev, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}

function onwriteError(stream, state, sync, er, cb) {
  --state.pendingcb;
  if (sync) nextTick(cb, er);else cb(er);

  stream._writableState.errorEmitted = true;
  stream.emit('error', er);
}

function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}

function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;

  onwriteStateUpdate(state);

  if (er) onwriteError(stream, state, sync, er, cb);else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(state);

    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
      clearBuffer(stream, state);
    }

    if (sync) {
      /*<replacement>*/
        nextTick(afterWrite, stream, state, finished, cb);
      /*</replacement>*/
    } else {
        afterWrite(stream, state, finished, cb);
      }
  }
}

function afterWrite(stream, state, finished, cb) {
  if (!finished) onwriteDrain(stream, state);
  state.pendingcb--;
  cb();
  finishMaybe(stream, state);
}

// Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.
function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
}

// if there's something in the buffer waiting, then process it
function clearBuffer(stream, state) {
  state.bufferProcessing = true;
  var entry = state.bufferedRequest;

  if (stream._writev && entry && entry.next) {
    // Fast case, write everything using _writev()
    var l = state.bufferedRequestCount;
    var buffer = new Array(l);
    var holder = state.corkedRequestsFree;
    holder.entry = entry;

    var count = 0;
    while (entry) {
      buffer[count] = entry;
      entry = entry.next;
      count += 1;
    }

    doWrite(stream, state, true, state.length, buffer, '', holder.finish);

    // doWrite is almost always async, defer these to save a bit of time
    // as the hot path ends with doWrite
    state.pendingcb++;
    state.lastBufferedRequest = null;
    if (holder.next) {
      state.corkedRequestsFree = holder.next;
      holder.next = null;
    } else {
      state.corkedRequestsFree = new CorkedRequest(state);
    }
  } else {
    // Slow case, write chunks one-by-one
    while (entry) {
      var chunk = entry.chunk;
      var encoding = entry.encoding;
      var cb = entry.callback;
      var len = state.objectMode ? 1 : chunk.length;

      doWrite(stream, state, false, len, chunk, encoding, cb);
      entry = entry.next;
      // if we didn't call the onwrite immediately, then
      // it means that we need to wait until it does.
      // also, that means that the chunk and cb are currently
      // being processed, so move the buffer counter past them.
      if (state.writing) {
        break;
      }
    }

    if (entry === null) state.lastBufferedRequest = null;
  }

  state.bufferedRequestCount = 0;
  state.bufferedRequest = entry;
  state.bufferProcessing = false;
}

Writable.prototype._write = function (chunk, encoding, cb) {
  cb(new Error('not implemented'));
};

Writable.prototype._writev = null;

Writable.prototype.end = function (chunk, encoding, cb) {
  var state = this._writableState;

  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

  // .end() fully uncorks
  if (state.corked) {
    state.corked = 1;
    this.uncork();
  }

  // ignore unnecessary end() calls.
  if (!state.ending && !state.finished) endWritable(this, state, cb);
};

function needFinish(state) {
  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
}

function prefinish(stream, state) {
  if (!state.prefinished) {
    state.prefinished = true;
    stream.emit('prefinish');
  }
}

function finishMaybe(stream, state) {
  var need = needFinish(state);
  if (need) {
    if (state.pendingcb === 0) {
      prefinish(stream, state);
      state.finished = true;
      stream.emit('finish');
    } else {
      prefinish(stream, state);
    }
  }
  return need;
}

function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);
  if (cb) {
    if (state.finished) nextTick(cb);else stream.once('finish', cb);
  }
  state.ended = true;
  stream.writable = false;
}

// It seems a linked list but it is not
// there will be only 2 of these for each stream
function CorkedRequest(state) {
  var _this = this;

  this.next = null;
  this.entry = null;

  this.finish = function (err) {
    var entry = _this.entry;
    _this.entry = null;
    while (entry) {
      var cb = entry.callback;
      state.pendingcb--;
      cb(err);
      entry = entry.next;
    }
    if (state.corkedRequestsFree) {
      state.corkedRequestsFree.next = _this;
    } else {
      state.corkedRequestsFree = _this;
    }
  };
}

inherits(Duplex, Readable);

var keys = Object.keys(Writable.prototype);
for (var v = 0; v < keys.length; v++) {
  var method = keys[v];
  if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
}
function Duplex(options) {
  if (!(this instanceof Duplex)) return new Duplex(options);

  Readable.call(this, options);
  Writable.call(this, options);

  if (options && options.readable === false) this.readable = false;

  if (options && options.writable === false) this.writable = false;

  this.allowHalfOpen = true;
  if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;

  this.once('end', onend);
}

// the no-half-open enforcer
function onend() {
  // if we allow half-open state, or if the writable side ended,
  // then we're ok.
  if (this.allowHalfOpen || this._writableState.ended) return;

  // no more data can be written.
  // But allow more writes to happen in this tick.
  nextTick(onEndNT, this);
}

function onEndNT(self) {
  self.end();
}

// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.

inherits(Transform, Duplex);

function TransformState(stream) {
  this.afterTransform = function (er, data) {
    return afterTransform(stream, er, data);
  };

  this.needTransform = false;
  this.transforming = false;
  this.writecb = null;
  this.writechunk = null;
  this.writeencoding = null;
}

function afterTransform(stream, er, data) {
  var ts = stream._transformState;
  ts.transforming = false;

  var cb = ts.writecb;

  if (!cb) return stream.emit('error', new Error('no writecb in Transform class'));

  ts.writechunk = null;
  ts.writecb = null;

  if (data !== null && data !== undefined) stream.push(data);

  cb(er);

  var rs = stream._readableState;
  rs.reading = false;
  if (rs.needReadable || rs.length < rs.highWaterMark) {
    stream._read(rs.highWaterMark);
  }
}
function Transform(options) {
  if (!(this instanceof Transform)) return new Transform(options);

  Duplex.call(this, options);

  this._transformState = new TransformState(this);

  // when the writable side finishes, then flush out anything remaining.
  var stream = this;

  // start out asking for a readable event once data is transformed.
  this._readableState.needReadable = true;

  // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.
  this._readableState.sync = false;

  if (options) {
    if (typeof options.transform === 'function') this._transform = options.transform;

    if (typeof options.flush === 'function') this._flush = options.flush;
  }

  this.once('prefinish', function () {
    if (typeof this._flush === 'function') this._flush(function (er) {
      done(stream, er);
    });else done(stream);
  });
}

Transform.prototype.push = function (chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
};

// This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.
Transform.prototype._transform = function (chunk, encoding, cb) {
  throw new Error('Not implemented');
};

Transform.prototype._write = function (chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;
  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
  }
};

// Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.
Transform.prototype._read = function (n) {
  var ts = this._transformState;

  if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
    ts.transforming = true;
    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};

function done(stream, er) {
  if (er) return stream.emit('error', er);

  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided
  var ws = stream._writableState;
  var ts = stream._transformState;

  if (ws.length) throw new Error('Calling transform done when ws.length != 0');

  if (ts.transforming) throw new Error('Calling transform done when still transforming');

  return stream.push(null);
}

inherits(PassThrough, Transform);
function PassThrough(options) {
  if (!(this instanceof PassThrough)) return new PassThrough(options);

  Transform.call(this, options);
}

PassThrough.prototype._transform = function (chunk, encoding, cb) {
  cb(null, chunk);
};

inherits(Stream, EventEmitter);
Stream.Readable = Readable;
Stream.Writable = Writable;
Stream.Duplex = Duplex;
Stream.Transform = Transform;
Stream.PassThrough = PassThrough;

// Backwards-compat with node 0.4.x
Stream.Stream = Stream;

// old-style streams.  Note that the pipe method (the only relevant
// part of this class) is overridden in the Readable class.

function Stream() {
  EventEmitter.call(this);
}

Stream.prototype.pipe = function(dest, options) {
  var source = this;

  function ondata(chunk) {
    if (dest.writable) {
      if (false === dest.write(chunk) && source.pause) {
        source.pause();
      }
    }
  }

  source.on('data', ondata);

  function ondrain() {
    if (source.readable && source.resume) {
      source.resume();
    }
  }

  dest.on('drain', ondrain);

  // If the 'end' option is not supplied, dest.end() will be called when
  // source gets the 'end' or 'close' events.  Only dest.end() once.
  if (!dest._isStdio && (!options || options.end !== false)) {
    source.on('end', onend);
    source.on('close', onclose);
  }

  var didOnEnd = false;
  function onend() {
    if (didOnEnd) return;
    didOnEnd = true;

    dest.end();
  }


  function onclose() {
    if (didOnEnd) return;
    didOnEnd = true;

    if (typeof dest.destroy === 'function') dest.destroy();
  }

  // don't leave dangling pipes when there are errors.
  function onerror(er) {
    cleanup();
    if (EventEmitter.listenerCount(this, 'error') === 0) {
      throw er; // Unhandled stream error in pipe.
    }
  }

  source.on('error', onerror);
  dest.on('error', onerror);

  // remove all the event listeners that were added.
  function cleanup() {
    source.removeListener('data', ondata);
    dest.removeListener('drain', ondrain);

    source.removeListener('end', onend);
    source.removeListener('close', onclose);

    source.removeListener('error', onerror);
    dest.removeListener('error', onerror);

    source.removeListener('end', cleanup);
    source.removeListener('close', cleanup);

    dest.removeListener('close', cleanup);
  }

  source.on('end', cleanup);
  source.on('close', cleanup);

  dest.on('close', cleanup);

  dest.emit('pipe', source);

  // Allow for unix-like usage: A.pipe(B).pipe(C)
  return dest;
};

var _polyfillNode_stream = /*#__PURE__*/Object.freeze({
	__proto__: null,
	Duplex: Duplex,
	PassThrough: PassThrough,
	Readable: Readable,
	Stream: Stream,
	Transform: Transform,
	Writable: Writable,
	default: Stream
});

var require$$0 = /*@__PURE__*/getAugmentedNamespace(_polyfillNode_stream);

var require$$1 = /*@__PURE__*/getAugmentedNamespace(_polyfillNode_string_decoder);

var hasRequiredSax;

function requireSax () {
	if (hasRequiredSax) return sax;
	hasRequiredSax = 1;
	(function (exports) {
(function (sax) { // wrapper for non-node envs
		  sax.parser = function (strict, opt) { return new SAXParser(strict, opt) };
		  sax.SAXParser = SAXParser;
		  sax.SAXStream = SAXStream;
		  sax.createStream = createStream;

		  // When we pass the MAX_BUFFER_LENGTH position, start checking for buffer overruns.
		  // When we check, schedule the next check for MAX_BUFFER_LENGTH - (max(buffer lengths)),
		  // since that's the earliest that a buffer overrun could occur.  This way, checks are
		  // as rare as required, but as often as necessary to ensure never crossing this bound.
		  // Furthermore, buffers are only tested at most once per write(), so passing a very
		  // large string into write() might have undesirable effects, but this is manageable by
		  // the caller, so it is assumed to be safe.  Thus, a call to write() may, in the extreme
		  // edge case, result in creating at most one complete copy of the string passed in.
		  // Set to Infinity to have unlimited buffers.
		  sax.MAX_BUFFER_LENGTH = 64 * 1024;

		  var buffers = [
		    'comment', 'sgmlDecl', 'textNode', 'tagName', 'doctype',
		    'procInstName', 'procInstBody', 'entity', 'attribName',
		    'attribValue', 'cdata', 'script'
		  ];

		  sax.EVENTS = [
		    'text',
		    'processinginstruction',
		    'sgmldeclaration',
		    'doctype',
		    'comment',
		    'opentagstart',
		    'attribute',
		    'opentag',
		    'closetag',
		    'opencdata',
		    'cdata',
		    'closecdata',
		    'error',
		    'end',
		    'ready',
		    'script',
		    'opennamespace',
		    'closenamespace'
		  ];

		  function SAXParser (strict, opt) {
		    if (!(this instanceof SAXParser)) {
		      return new SAXParser(strict, opt)
		    }

		    var parser = this;
		    clearBuffers(parser);
		    parser.q = parser.c = '';
		    parser.bufferCheckPosition = sax.MAX_BUFFER_LENGTH;
		    parser.opt = opt || {};
		    parser.opt.lowercase = parser.opt.lowercase || parser.opt.lowercasetags;
		    parser.looseCase = parser.opt.lowercase ? 'toLowerCase' : 'toUpperCase';
		    parser.tags = [];
		    parser.closed = parser.closedRoot = parser.sawRoot = false;
		    parser.tag = parser.error = null;
		    parser.strict = !!strict;
		    parser.noscript = !!(strict || parser.opt.noscript);
		    parser.state = S.BEGIN;
		    parser.strictEntities = parser.opt.strictEntities;
		    parser.ENTITIES = parser.strictEntities ? Object.create(sax.XML_ENTITIES) : Object.create(sax.ENTITIES);
		    parser.attribList = [];

		    // namespaces form a prototype chain.
		    // it always points at the current tag,
		    // which protos to its parent tag.
		    if (parser.opt.xmlns) {
		      parser.ns = Object.create(rootNS);
		    }

		    // disallow unquoted attribute values if not otherwise configured
		    // and strict mode is true
		    if (parser.opt.unquotedAttributeValues === undefined) {
		      parser.opt.unquotedAttributeValues = !strict;
		    }

		    // mostly just for error reporting
		    parser.trackPosition = parser.opt.position !== false;
		    if (parser.trackPosition) {
		      parser.position = parser.line = parser.column = 0;
		    }
		    emit(parser, 'onready');
		  }

		  if (!Object.create) {
		    Object.create = function (o) {
		      function F () {}
		      F.prototype = o;
		      var newf = new F();
		      return newf
		    };
		  }

		  if (!Object.keys) {
		    Object.keys = function (o) {
		      var a = [];
		      for (var i in o) if (o.hasOwnProperty(i)) a.push(i);
		      return a
		    };
		  }

		  function checkBufferLength (parser) {
		    var maxAllowed = Math.max(sax.MAX_BUFFER_LENGTH, 10);
		    var maxActual = 0;
		    for (var i = 0, l = buffers.length; i < l; i++) {
		      var len = parser[buffers[i]].length;
		      if (len > maxAllowed) {
		        // Text/cdata nodes can get big, and since they're buffered,
		        // we can get here under normal conditions.
		        // Avoid issues by emitting the text node now,
		        // so at least it won't get any bigger.
		        switch (buffers[i]) {
		          case 'textNode':
		            closeText(parser);
		            break

		          case 'cdata':
		            emitNode(parser, 'oncdata', parser.cdata);
		            parser.cdata = '';
		            break

		          case 'script':
		            emitNode(parser, 'onscript', parser.script);
		            parser.script = '';
		            break

		          default:
		            error(parser, 'Max buffer length exceeded: ' + buffers[i]);
		        }
		      }
		      maxActual = Math.max(maxActual, len);
		    }
		    // schedule the next check for the earliest possible buffer overrun.
		    var m = sax.MAX_BUFFER_LENGTH - maxActual;
		    parser.bufferCheckPosition = m + parser.position;
		  }

		  function clearBuffers (parser) {
		    for (var i = 0, l = buffers.length; i < l; i++) {
		      parser[buffers[i]] = '';
		    }
		  }

		  function flushBuffers (parser) {
		    closeText(parser);
		    if (parser.cdata !== '') {
		      emitNode(parser, 'oncdata', parser.cdata);
		      parser.cdata = '';
		    }
		    if (parser.script !== '') {
		      emitNode(parser, 'onscript', parser.script);
		      parser.script = '';
		    }
		  }

		  SAXParser.prototype = {
		    end: function () { end(this); },
		    write: write,
		    resume: function () { this.error = null; return this },
		    close: function () { return this.write(null) },
		    flush: function () { flushBuffers(this); }
		  };

		  var Stream;
		  try {
		    Stream = require$$0.Stream;
		  } catch (ex) {
		    Stream = function () {};
		  }
		  if (!Stream) Stream = function () {};

		  var streamWraps = sax.EVENTS.filter(function (ev) {
		    return ev !== 'error' && ev !== 'end'
		  });

		  function createStream (strict, opt) {
		    return new SAXStream(strict, opt)
		  }

		  function SAXStream (strict, opt) {
		    if (!(this instanceof SAXStream)) {
		      return new SAXStream(strict, opt)
		    }

		    Stream.apply(this);

		    this._parser = new SAXParser(strict, opt);
		    this.writable = true;
		    this.readable = true;

		    var me = this;

		    this._parser.onend = function () {
		      me.emit('end');
		    };

		    this._parser.onerror = function (er) {
		      me.emit('error', er);

		      // if didn't throw, then means error was handled.
		      // go ahead and clear error, so we can write again.
		      me._parser.error = null;
		    };

		    this._decoder = null;

		    streamWraps.forEach(function (ev) {
		      Object.defineProperty(me, 'on' + ev, {
		        get: function () {
		          return me._parser['on' + ev]
		        },
		        set: function (h) {
		          if (!h) {
		            me.removeAllListeners(ev);
		            me._parser['on' + ev] = h;
		            return h
		          }
		          me.on(ev, h);
		        },
		        enumerable: true,
		        configurable: false
		      });
		    });
		  }

		  SAXStream.prototype = Object.create(Stream.prototype, {
		    constructor: {
		      value: SAXStream
		    }
		  });

		  SAXStream.prototype.write = function (data) {
		    if (typeof Buffer === 'function' &&
		      typeof Buffer.isBuffer === 'function' &&
		      Buffer.isBuffer(data)) {
		      if (!this._decoder) {
		        var SD = require$$1.StringDecoder;
		        this._decoder = new SD('utf8');
		      }
		      data = this._decoder.write(data);
		    }

		    this._parser.write(data.toString());
		    this.emit('data', data);
		    return true
		  };

		  SAXStream.prototype.end = function (chunk) {
		    if (chunk && chunk.length) {
		      this.write(chunk);
		    }
		    this._parser.end();
		    return true
		  };

		  SAXStream.prototype.on = function (ev, handler) {
		    var me = this;
		    if (!me._parser['on' + ev] && streamWraps.indexOf(ev) !== -1) {
		      me._parser['on' + ev] = function () {
		        var args = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
		        args.splice(0, 0, ev);
		        me.emit.apply(me, args);
		      };
		    }

		    return Stream.prototype.on.call(me, ev, handler)
		  };

		  // this really needs to be replaced with character classes.
		  // XML allows all manner of ridiculous numbers and digits.
		  var CDATA = '[CDATA[';
		  var DOCTYPE = 'DOCTYPE';
		  var XML_NAMESPACE = 'http://www.w3.org/XML/1998/namespace';
		  var XMLNS_NAMESPACE = 'http://www.w3.org/2000/xmlns/';
		  var rootNS = { xml: XML_NAMESPACE, xmlns: XMLNS_NAMESPACE };

		  // http://www.w3.org/TR/REC-xml/#NT-NameStartChar
		  // This implementation works on strings, a single character at a time
		  // as such, it cannot ever support astral-plane characters (10000-EFFFF)
		  // without a significant breaking change to either this  parser, or the
		  // JavaScript language.  Implementation of an emoji-capable xml parser
		  // is left as an exercise for the reader.
		  var nameStart = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;

		  var nameBody = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;

		  var entityStart = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;
		  var entityBody = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;

		  function isWhitespace (c) {
		    return c === ' ' || c === '\n' || c === '\r' || c === '\t'
		  }

		  function isQuote (c) {
		    return c === '"' || c === '\''
		  }

		  function isAttribEnd (c) {
		    return c === '>' || isWhitespace(c)
		  }

		  function isMatch (regex, c) {
		    return regex.test(c)
		  }

		  function notMatch (regex, c) {
		    return !isMatch(regex, c)
		  }

		  var S = 0;
		  sax.STATE = {
		    BEGIN: S++, // leading byte order mark or whitespace
		    BEGIN_WHITESPACE: S++, // leading whitespace
		    TEXT: S++, // general stuff
		    TEXT_ENTITY: S++, // &amp and such.
		    OPEN_WAKA: S++, // <
		    SGML_DECL: S++, // <!BLARG
		    SGML_DECL_QUOTED: S++, // <!BLARG foo "bar
		    DOCTYPE: S++, // <!DOCTYPE
		    DOCTYPE_QUOTED: S++, // <!DOCTYPE "//blah
		    DOCTYPE_DTD: S++, // <!DOCTYPE "//blah" [ ...
		    DOCTYPE_DTD_QUOTED: S++, // <!DOCTYPE "//blah" [ "foo
		    COMMENT_STARTING: S++, // <!-
		    COMMENT: S++, // <!--
		    COMMENT_ENDING: S++, // <!-- blah -
		    COMMENT_ENDED: S++, // <!-- blah --
		    CDATA: S++, // <![CDATA[ something
		    CDATA_ENDING: S++, // ]
		    CDATA_ENDING_2: S++, // ]]
		    PROC_INST: S++, // <?hi
		    PROC_INST_BODY: S++, // <?hi there
		    PROC_INST_ENDING: S++, // <?hi "there" ?
		    OPEN_TAG: S++, // <strong
		    OPEN_TAG_SLASH: S++, // <strong /
		    ATTRIB: S++, // <a
		    ATTRIB_NAME: S++, // <a foo
		    ATTRIB_NAME_SAW_WHITE: S++, // <a foo _
		    ATTRIB_VALUE: S++, // <a foo=
		    ATTRIB_VALUE_QUOTED: S++, // <a foo="bar
		    ATTRIB_VALUE_CLOSED: S++, // <a foo="bar"
		    ATTRIB_VALUE_UNQUOTED: S++, // <a foo=bar
		    ATTRIB_VALUE_ENTITY_Q: S++, // <foo bar="&quot;"
		    ATTRIB_VALUE_ENTITY_U: S++, // <foo bar=&quot
		    CLOSE_TAG: S++, // </a
		    CLOSE_TAG_SAW_WHITE: S++, // </a   >
		    SCRIPT: S++, // <script> ...
		    SCRIPT_ENDING: S++ // <script> ... <
		  };

		  sax.XML_ENTITIES = {
		    'amp': '&',
		    'gt': '>',
		    'lt': '<',
		    'quot': '"',
		    'apos': "'"
		  };

		  sax.ENTITIES = {
		    'amp': '&',
		    'gt': '>',
		    'lt': '<',
		    'quot': '"',
		    'apos': "'",
		    'AElig': 198,
		    'Aacute': 193,
		    'Acirc': 194,
		    'Agrave': 192,
		    'Aring': 197,
		    'Atilde': 195,
		    'Auml': 196,
		    'Ccedil': 199,
		    'ETH': 208,
		    'Eacute': 201,
		    'Ecirc': 202,
		    'Egrave': 200,
		    'Euml': 203,
		    'Iacute': 205,
		    'Icirc': 206,
		    'Igrave': 204,
		    'Iuml': 207,
		    'Ntilde': 209,
		    'Oacute': 211,
		    'Ocirc': 212,
		    'Ograve': 210,
		    'Oslash': 216,
		    'Otilde': 213,
		    'Ouml': 214,
		    'THORN': 222,
		    'Uacute': 218,
		    'Ucirc': 219,
		    'Ugrave': 217,
		    'Uuml': 220,
		    'Yacute': 221,
		    'aacute': 225,
		    'acirc': 226,
		    'aelig': 230,
		    'agrave': 224,
		    'aring': 229,
		    'atilde': 227,
		    'auml': 228,
		    'ccedil': 231,
		    'eacute': 233,
		    'ecirc': 234,
		    'egrave': 232,
		    'eth': 240,
		    'euml': 235,
		    'iacute': 237,
		    'icirc': 238,
		    'igrave': 236,
		    'iuml': 239,
		    'ntilde': 241,
		    'oacute': 243,
		    'ocirc': 244,
		    'ograve': 242,
		    'oslash': 248,
		    'otilde': 245,
		    'ouml': 246,
		    'szlig': 223,
		    'thorn': 254,
		    'uacute': 250,
		    'ucirc': 251,
		    'ugrave': 249,
		    'uuml': 252,
		    'yacute': 253,
		    'yuml': 255,
		    'copy': 169,
		    'reg': 174,
		    'nbsp': 160,
		    'iexcl': 161,
		    'cent': 162,
		    'pound': 163,
		    'curren': 164,
		    'yen': 165,
		    'brvbar': 166,
		    'sect': 167,
		    'uml': 168,
		    'ordf': 170,
		    'laquo': 171,
		    'not': 172,
		    'shy': 173,
		    'macr': 175,
		    'deg': 176,
		    'plusmn': 177,
		    'sup1': 185,
		    'sup2': 178,
		    'sup3': 179,
		    'acute': 180,
		    'micro': 181,
		    'para': 182,
		    'middot': 183,
		    'cedil': 184,
		    'ordm': 186,
		    'raquo': 187,
		    'frac14': 188,
		    'frac12': 189,
		    'frac34': 190,
		    'iquest': 191,
		    'times': 215,
		    'divide': 247,
		    'OElig': 338,
		    'oelig': 339,
		    'Scaron': 352,
		    'scaron': 353,
		    'Yuml': 376,
		    'fnof': 402,
		    'circ': 710,
		    'tilde': 732,
		    'Alpha': 913,
		    'Beta': 914,
		    'Gamma': 915,
		    'Delta': 916,
		    'Epsilon': 917,
		    'Zeta': 918,
		    'Eta': 919,
		    'Theta': 920,
		    'Iota': 921,
		    'Kappa': 922,
		    'Lambda': 923,
		    'Mu': 924,
		    'Nu': 925,
		    'Xi': 926,
		    'Omicron': 927,
		    'Pi': 928,
		    'Rho': 929,
		    'Sigma': 931,
		    'Tau': 932,
		    'Upsilon': 933,
		    'Phi': 934,
		    'Chi': 935,
		    'Psi': 936,
		    'Omega': 937,
		    'alpha': 945,
		    'beta': 946,
		    'gamma': 947,
		    'delta': 948,
		    'epsilon': 949,
		    'zeta': 950,
		    'eta': 951,
		    'theta': 952,
		    'iota': 953,
		    'kappa': 954,
		    'lambda': 955,
		    'mu': 956,
		    'nu': 957,
		    'xi': 958,
		    'omicron': 959,
		    'pi': 960,
		    'rho': 961,
		    'sigmaf': 962,
		    'sigma': 963,
		    'tau': 964,
		    'upsilon': 965,
		    'phi': 966,
		    'chi': 967,
		    'psi': 968,
		    'omega': 969,
		    'thetasym': 977,
		    'upsih': 978,
		    'piv': 982,
		    'ensp': 8194,
		    'emsp': 8195,
		    'thinsp': 8201,
		    'zwnj': 8204,
		    'zwj': 8205,
		    'lrm': 8206,
		    'rlm': 8207,
		    'ndash': 8211,
		    'mdash': 8212,
		    'lsquo': 8216,
		    'rsquo': 8217,
		    'sbquo': 8218,
		    'ldquo': 8220,
		    'rdquo': 8221,
		    'bdquo': 8222,
		    'dagger': 8224,
		    'Dagger': 8225,
		    'bull': 8226,
		    'hellip': 8230,
		    'permil': 8240,
		    'prime': 8242,
		    'Prime': 8243,
		    'lsaquo': 8249,
		    'rsaquo': 8250,
		    'oline': 8254,
		    'frasl': 8260,
		    'euro': 8364,
		    'image': 8465,
		    'weierp': 8472,
		    'real': 8476,
		    'trade': 8482,
		    'alefsym': 8501,
		    'larr': 8592,
		    'uarr': 8593,
		    'rarr': 8594,
		    'darr': 8595,
		    'harr': 8596,
		    'crarr': 8629,
		    'lArr': 8656,
		    'uArr': 8657,
		    'rArr': 8658,
		    'dArr': 8659,
		    'hArr': 8660,
		    'forall': 8704,
		    'part': 8706,
		    'exist': 8707,
		    'empty': 8709,
		    'nabla': 8711,
		    'isin': 8712,
		    'notin': 8713,
		    'ni': 8715,
		    'prod': 8719,
		    'sum': 8721,
		    'minus': 8722,
		    'lowast': 8727,
		    'radic': 8730,
		    'prop': 8733,
		    'infin': 8734,
		    'ang': 8736,
		    'and': 8743,
		    'or': 8744,
		    'cap': 8745,
		    'cup': 8746,
		    'int': 8747,
		    'there4': 8756,
		    'sim': 8764,
		    'cong': 8773,
		    'asymp': 8776,
		    'ne': 8800,
		    'equiv': 8801,
		    'le': 8804,
		    'ge': 8805,
		    'sub': 8834,
		    'sup': 8835,
		    'nsub': 8836,
		    'sube': 8838,
		    'supe': 8839,
		    'oplus': 8853,
		    'otimes': 8855,
		    'perp': 8869,
		    'sdot': 8901,
		    'lceil': 8968,
		    'rceil': 8969,
		    'lfloor': 8970,
		    'rfloor': 8971,
		    'lang': 9001,
		    'rang': 9002,
		    'loz': 9674,
		    'spades': 9824,
		    'clubs': 9827,
		    'hearts': 9829,
		    'diams': 9830
		  };

		  Object.keys(sax.ENTITIES).forEach(function (key) {
		    var e = sax.ENTITIES[key];
		    var s = typeof e === 'number' ? String.fromCharCode(e) : e;
		    sax.ENTITIES[key] = s;
		  });

		  for (var s in sax.STATE) {
		    sax.STATE[sax.STATE[s]] = s;
		  }

		  // shorthand
		  S = sax.STATE;

		  function emit (parser, event, data) {
		    parser[event] && parser[event](data);
		  }

		  function emitNode (parser, nodeType, data) {
		    if (parser.textNode) closeText(parser);
		    emit(parser, nodeType, data);
		  }

		  function closeText (parser) {
		    parser.textNode = textopts(parser.opt, parser.textNode);
		    if (parser.textNode) emit(parser, 'ontext', parser.textNode);
		    parser.textNode = '';
		  }

		  function textopts (opt, text) {
		    if (opt.trim) text = text.trim();
		    if (opt.normalize) text = text.replace(/\s+/g, ' ');
		    return text
		  }

		  function error (parser, er) {
		    closeText(parser);
		    if (parser.trackPosition) {
		      er += '\nLine: ' + parser.line +
		        '\nColumn: ' + parser.column +
		        '\nChar: ' + parser.c;
		    }
		    er = new Error(er);
		    parser.error = er;
		    emit(parser, 'onerror', er);
		    return parser
		  }

		  function end (parser) {
		    if (parser.sawRoot && !parser.closedRoot) strictFail(parser, 'Unclosed root tag');
		    if ((parser.state !== S.BEGIN) &&
		      (parser.state !== S.BEGIN_WHITESPACE) &&
		      (parser.state !== S.TEXT)) {
		      error(parser, 'Unexpected end');
		    }
		    closeText(parser);
		    parser.c = '';
		    parser.closed = true;
		    emit(parser, 'onend');
		    SAXParser.call(parser, parser.strict, parser.opt);
		    return parser
		  }

		  function strictFail (parser, message) {
		    if (typeof parser !== 'object' || !(parser instanceof SAXParser)) {
		      throw new Error('bad call to strictFail')
		    }
		    if (parser.strict) {
		      error(parser, message);
		    }
		  }

		  function newTag (parser) {
		    if (!parser.strict) parser.tagName = parser.tagName[parser.looseCase]();
		    var parent = parser.tags[parser.tags.length - 1] || parser;
		    var tag = parser.tag = { name: parser.tagName, attributes: {} };

		    // will be overridden if tag contails an xmlns="foo" or xmlns:foo="bar"
		    if (parser.opt.xmlns) {
		      tag.ns = parent.ns;
		    }
		    parser.attribList.length = 0;
		    emitNode(parser, 'onopentagstart', tag);
		  }

		  function qname (name, attribute) {
		    var i = name.indexOf(':');
		    var qualName = i < 0 ? [ '', name ] : name.split(':');
		    var prefix = qualName[0];
		    var local = qualName[1];

		    // <x "xmlns"="http://foo">
		    if (attribute && name === 'xmlns') {
		      prefix = 'xmlns';
		      local = '';
		    }

		    return { prefix: prefix, local: local }
		  }

		  function attrib (parser) {
		    if (!parser.strict) {
		      parser.attribName = parser.attribName[parser.looseCase]();
		    }

		    if (parser.attribList.indexOf(parser.attribName) !== -1 ||
		      parser.tag.attributes.hasOwnProperty(parser.attribName)) {
		      parser.attribName = parser.attribValue = '';
		      return
		    }

		    if (parser.opt.xmlns) {
		      var qn = qname(parser.attribName, true);
		      var prefix = qn.prefix;
		      var local = qn.local;

		      if (prefix === 'xmlns') {
		        // namespace binding attribute. push the binding into scope
		        if (local === 'xml' && parser.attribValue !== XML_NAMESPACE) {
		          strictFail(parser,
		            'xml: prefix must be bound to ' + XML_NAMESPACE + '\n' +
		            'Actual: ' + parser.attribValue);
		        } else if (local === 'xmlns' && parser.attribValue !== XMLNS_NAMESPACE) {
		          strictFail(parser,
		            'xmlns: prefix must be bound to ' + XMLNS_NAMESPACE + '\n' +
		            'Actual: ' + parser.attribValue);
		        } else {
		          var tag = parser.tag;
		          var parent = parser.tags[parser.tags.length - 1] || parser;
		          if (tag.ns === parent.ns) {
		            tag.ns = Object.create(parent.ns);
		          }
		          tag.ns[local] = parser.attribValue;
		        }
		      }

		      // defer onattribute events until all attributes have been seen
		      // so any new bindings can take effect. preserve attribute order
		      // so deferred events can be emitted in document order
		      parser.attribList.push([parser.attribName, parser.attribValue]);
		    } else {
		      // in non-xmlns mode, we can emit the event right away
		      parser.tag.attributes[parser.attribName] = parser.attribValue;
		      emitNode(parser, 'onattribute', {
		        name: parser.attribName,
		        value: parser.attribValue
		      });
		    }

		    parser.attribName = parser.attribValue = '';
		  }

		  function openTag (parser, selfClosing) {
		    if (parser.opt.xmlns) {
		      // emit namespace binding events
		      var tag = parser.tag;

		      // add namespace info to tag
		      var qn = qname(parser.tagName);
		      tag.prefix = qn.prefix;
		      tag.local = qn.local;
		      tag.uri = tag.ns[qn.prefix] || '';

		      if (tag.prefix && !tag.uri) {
		        strictFail(parser, 'Unbound namespace prefix: ' +
		          JSON.stringify(parser.tagName));
		        tag.uri = qn.prefix;
		      }

		      var parent = parser.tags[parser.tags.length - 1] || parser;
		      if (tag.ns && parent.ns !== tag.ns) {
		        Object.keys(tag.ns).forEach(function (p) {
		          emitNode(parser, 'onopennamespace', {
		            prefix: p,
		            uri: tag.ns[p]
		          });
		        });
		      }

		      // handle deferred onattribute events
		      // Note: do not apply default ns to attributes:
		      //   http://www.w3.org/TR/REC-xml-names/#defaulting
		      for (var i = 0, l = parser.attribList.length; i < l; i++) {
		        var nv = parser.attribList[i];
		        var name = nv[0];
		        var value = nv[1];
		        var qualName = qname(name, true);
		        var prefix = qualName.prefix;
		        var local = qualName.local;
		        var uri = prefix === '' ? '' : (tag.ns[prefix] || '');
		        var a = {
		          name: name,
		          value: value,
		          prefix: prefix,
		          local: local,
		          uri: uri
		        };

		        // if there's any attributes with an undefined namespace,
		        // then fail on them now.
		        if (prefix && prefix !== 'xmlns' && !uri) {
		          strictFail(parser, 'Unbound namespace prefix: ' +
		            JSON.stringify(prefix));
		          a.uri = prefix;
		        }
		        parser.tag.attributes[name] = a;
		        emitNode(parser, 'onattribute', a);
		      }
		      parser.attribList.length = 0;
		    }

		    parser.tag.isSelfClosing = !!selfClosing;

		    // process the tag
		    parser.sawRoot = true;
		    parser.tags.push(parser.tag);
		    emitNode(parser, 'onopentag', parser.tag);
		    if (!selfClosing) {
		      // special case for <script> in non-strict mode.
		      if (!parser.noscript && parser.tagName.toLowerCase() === 'script') {
		        parser.state = S.SCRIPT;
		      } else {
		        parser.state = S.TEXT;
		      }
		      parser.tag = null;
		      parser.tagName = '';
		    }
		    parser.attribName = parser.attribValue = '';
		    parser.attribList.length = 0;
		  }

		  function closeTag (parser) {
		    if (!parser.tagName) {
		      strictFail(parser, 'Weird empty close tag.');
		      parser.textNode += '</>';
		      parser.state = S.TEXT;
		      return
		    }

		    if (parser.script) {
		      if (parser.tagName !== 'script') {
		        parser.script += '</' + parser.tagName + '>';
		        parser.tagName = '';
		        parser.state = S.SCRIPT;
		        return
		      }
		      emitNode(parser, 'onscript', parser.script);
		      parser.script = '';
		    }

		    // first make sure that the closing tag actually exists.
		    // <a><b></c></b></a> will close everything, otherwise.
		    var t = parser.tags.length;
		    var tagName = parser.tagName;
		    if (!parser.strict) {
		      tagName = tagName[parser.looseCase]();
		    }
		    var closeTo = tagName;
		    while (t--) {
		      var close = parser.tags[t];
		      if (close.name !== closeTo) {
		        // fail the first time in strict mode
		        strictFail(parser, 'Unexpected close tag');
		      } else {
		        break
		      }
		    }

		    // didn't find it.  we already failed for strict, so just abort.
		    if (t < 0) {
		      strictFail(parser, 'Unmatched closing tag: ' + parser.tagName);
		      parser.textNode += '</' + parser.tagName + '>';
		      parser.state = S.TEXT;
		      return
		    }
		    parser.tagName = tagName;
		    var s = parser.tags.length;
		    while (s-- > t) {
		      var tag = parser.tag = parser.tags.pop();
		      parser.tagName = parser.tag.name;
		      emitNode(parser, 'onclosetag', parser.tagName);

		      var x = {};
		      for (var i in tag.ns) {
		        x[i] = tag.ns[i];
		      }

		      var parent = parser.tags[parser.tags.length - 1] || parser;
		      if (parser.opt.xmlns && tag.ns !== parent.ns) {
		        // remove namespace bindings introduced by tag
		        Object.keys(tag.ns).forEach(function (p) {
		          var n = tag.ns[p];
		          emitNode(parser, 'onclosenamespace', { prefix: p, uri: n });
		        });
		      }
		    }
		    if (t === 0) parser.closedRoot = true;
		    parser.tagName = parser.attribValue = parser.attribName = '';
		    parser.attribList.length = 0;
		    parser.state = S.TEXT;
		  }

		  function parseEntity (parser) {
		    var entity = parser.entity;
		    var entityLC = entity.toLowerCase();
		    var num;
		    var numStr = '';

		    if (parser.ENTITIES[entity]) {
		      return parser.ENTITIES[entity]
		    }
		    if (parser.ENTITIES[entityLC]) {
		      return parser.ENTITIES[entityLC]
		    }
		    entity = entityLC;
		    if (entity.charAt(0) === '#') {
		      if (entity.charAt(1) === 'x') {
		        entity = entity.slice(2);
		        num = parseInt(entity, 16);
		        numStr = num.toString(16);
		      } else {
		        entity = entity.slice(1);
		        num = parseInt(entity, 10);
		        numStr = num.toString(10);
		      }
		    }
		    entity = entity.replace(/^0+/, '');
		    if (isNaN(num) || numStr.toLowerCase() !== entity) {
		      strictFail(parser, 'Invalid character entity');
		      return '&' + parser.entity + ';'
		    }

		    return String.fromCodePoint(num)
		  }

		  function beginWhiteSpace (parser, c) {
		    if (c === '<') {
		      parser.state = S.OPEN_WAKA;
		      parser.startTagPosition = parser.position;
		    } else if (!isWhitespace(c)) {
		      // have to process this as a text node.
		      // weird, but happens.
		      strictFail(parser, 'Non-whitespace before first tag.');
		      parser.textNode = c;
		      parser.state = S.TEXT;
		    }
		  }

		  function charAt (chunk, i) {
		    var result = '';
		    if (i < chunk.length) {
		      result = chunk.charAt(i);
		    }
		    return result
		  }

		  function write (chunk) {
		    var parser = this;
		    if (this.error) {
		      throw this.error
		    }
		    if (parser.closed) {
		      return error(parser,
		        'Cannot write after close. Assign an onready handler.')
		    }
		    if (chunk === null) {
		      return end(parser)
		    }
		    if (typeof chunk === 'object') {
		      chunk = chunk.toString();
		    }
		    var i = 0;
		    var c = '';
		    while (true) {
		      c = charAt(chunk, i++);
		      parser.c = c;

		      if (!c) {
		        break
		      }

		      if (parser.trackPosition) {
		        parser.position++;
		        if (c === '\n') {
		          parser.line++;
		          parser.column = 0;
		        } else {
		          parser.column++;
		        }
		      }

		      switch (parser.state) {
		        case S.BEGIN:
		          parser.state = S.BEGIN_WHITESPACE;
		          if (c === '\uFEFF') {
		            continue
		          }
		          beginWhiteSpace(parser, c);
		          continue

		        case S.BEGIN_WHITESPACE:
		          beginWhiteSpace(parser, c);
		          continue

		        case S.TEXT:
		          if (parser.sawRoot && !parser.closedRoot) {
		            var starti = i - 1;
		            while (c && c !== '<' && c !== '&') {
		              c = charAt(chunk, i++);
		              if (c && parser.trackPosition) {
		                parser.position++;
		                if (c === '\n') {
		                  parser.line++;
		                  parser.column = 0;
		                } else {
		                  parser.column++;
		                }
		              }
		            }
		            parser.textNode += chunk.substring(starti, i - 1);
		          }
		          if (c === '<' && !(parser.sawRoot && parser.closedRoot && !parser.strict)) {
		            parser.state = S.OPEN_WAKA;
		            parser.startTagPosition = parser.position;
		          } else {
		            if (!isWhitespace(c) && (!parser.sawRoot || parser.closedRoot)) {
		              strictFail(parser, 'Text data outside of root node.');
		            }
		            if (c === '&') {
		              parser.state = S.TEXT_ENTITY;
		            } else {
		              parser.textNode += c;
		            }
		          }
		          continue

		        case S.SCRIPT:
		          // only non-strict
		          if (c === '<') {
		            parser.state = S.SCRIPT_ENDING;
		          } else {
		            parser.script += c;
		          }
		          continue

		        case S.SCRIPT_ENDING:
		          if (c === '/') {
		            parser.state = S.CLOSE_TAG;
		          } else {
		            parser.script += '<' + c;
		            parser.state = S.SCRIPT;
		          }
		          continue

		        case S.OPEN_WAKA:
		          // either a /, ?, !, or text is coming next.
		          if (c === '!') {
		            parser.state = S.SGML_DECL;
		            parser.sgmlDecl = '';
		          } else if (isWhitespace(c)) ; else if (isMatch(nameStart, c)) {
		            parser.state = S.OPEN_TAG;
		            parser.tagName = c;
		          } else if (c === '/') {
		            parser.state = S.CLOSE_TAG;
		            parser.tagName = '';
		          } else if (c === '?') {
		            parser.state = S.PROC_INST;
		            parser.procInstName = parser.procInstBody = '';
		          } else {
		            strictFail(parser, 'Unencoded <');
		            // if there was some whitespace, then add that in.
		            if (parser.startTagPosition + 1 < parser.position) {
		              var pad = parser.position - parser.startTagPosition;
		              c = new Array(pad).join(' ') + c;
		            }
		            parser.textNode += '<' + c;
		            parser.state = S.TEXT;
		          }
		          continue

		        case S.SGML_DECL:
		          if (parser.sgmlDecl + c === '--') {
		            parser.state = S.COMMENT;
		            parser.comment = '';
		            parser.sgmlDecl = '';
		            continue;
		          }

		          if (parser.doctype && parser.doctype !== true && parser.sgmlDecl) {
		            parser.state = S.DOCTYPE_DTD;
		            parser.doctype += '<!' + parser.sgmlDecl + c;
		            parser.sgmlDecl = '';
		          } else if ((parser.sgmlDecl + c).toUpperCase() === CDATA) {
		            emitNode(parser, 'onopencdata');
		            parser.state = S.CDATA;
		            parser.sgmlDecl = '';
		            parser.cdata = '';
		          } else if ((parser.sgmlDecl + c).toUpperCase() === DOCTYPE) {
		            parser.state = S.DOCTYPE;
		            if (parser.doctype || parser.sawRoot) {
		              strictFail(parser,
		                'Inappropriately located doctype declaration');
		            }
		            parser.doctype = '';
		            parser.sgmlDecl = '';
		          } else if (c === '>') {
		            emitNode(parser, 'onsgmldeclaration', parser.sgmlDecl);
		            parser.sgmlDecl = '';
		            parser.state = S.TEXT;
		          } else if (isQuote(c)) {
		            parser.state = S.SGML_DECL_QUOTED;
		            parser.sgmlDecl += c;
		          } else {
		            parser.sgmlDecl += c;
		          }
		          continue

		        case S.SGML_DECL_QUOTED:
		          if (c === parser.q) {
		            parser.state = S.SGML_DECL;
		            parser.q = '';
		          }
		          parser.sgmlDecl += c;
		          continue

		        case S.DOCTYPE:
		          if (c === '>') {
		            parser.state = S.TEXT;
		            emitNode(parser, 'ondoctype', parser.doctype);
		            parser.doctype = true; // just remember that we saw it.
		          } else {
		            parser.doctype += c;
		            if (c === '[') {
		              parser.state = S.DOCTYPE_DTD;
		            } else if (isQuote(c)) {
		              parser.state = S.DOCTYPE_QUOTED;
		              parser.q = c;
		            }
		          }
		          continue

		        case S.DOCTYPE_QUOTED:
		          parser.doctype += c;
		          if (c === parser.q) {
		            parser.q = '';
		            parser.state = S.DOCTYPE;
		          }
		          continue

		        case S.DOCTYPE_DTD:
		          if (c === ']') {
		            parser.doctype += c;
		            parser.state = S.DOCTYPE;
		          } else if (c === '<') {
		            parser.state = S.OPEN_WAKA;
		            parser.startTagPosition = parser.position;
		          } else if (isQuote(c)) {
		            parser.doctype += c;
		            parser.state = S.DOCTYPE_DTD_QUOTED;
		            parser.q = c;
		          } else {
		            parser.doctype += c;
		          }
		          continue

		        case S.DOCTYPE_DTD_QUOTED:
		          parser.doctype += c;
		          if (c === parser.q) {
		            parser.state = S.DOCTYPE_DTD;
		            parser.q = '';
		          }
		          continue

		        case S.COMMENT:
		          if (c === '-') {
		            parser.state = S.COMMENT_ENDING;
		          } else {
		            parser.comment += c;
		          }
		          continue

		        case S.COMMENT_ENDING:
		          if (c === '-') {
		            parser.state = S.COMMENT_ENDED;
		            parser.comment = textopts(parser.opt, parser.comment);
		            if (parser.comment) {
		              emitNode(parser, 'oncomment', parser.comment);
		            }
		            parser.comment = '';
		          } else {
		            parser.comment += '-' + c;
		            parser.state = S.COMMENT;
		          }
		          continue

		        case S.COMMENT_ENDED:
		          if (c !== '>') {
		            strictFail(parser, 'Malformed comment');
		            // allow <!-- blah -- bloo --> in non-strict mode,
		            // which is a comment of " blah -- bloo "
		            parser.comment += '--' + c;
		            parser.state = S.COMMENT;
		          } else if (parser.doctype && parser.doctype !== true) {
		            parser.state = S.DOCTYPE_DTD;
		          } else {
		            parser.state = S.TEXT;
		          }
		          continue

		        case S.CDATA:
		          if (c === ']') {
		            parser.state = S.CDATA_ENDING;
		          } else {
		            parser.cdata += c;
		          }
		          continue

		        case S.CDATA_ENDING:
		          if (c === ']') {
		            parser.state = S.CDATA_ENDING_2;
		          } else {
		            parser.cdata += ']' + c;
		            parser.state = S.CDATA;
		          }
		          continue

		        case S.CDATA_ENDING_2:
		          if (c === '>') {
		            if (parser.cdata) {
		              emitNode(parser, 'oncdata', parser.cdata);
		            }
		            emitNode(parser, 'onclosecdata');
		            parser.cdata = '';
		            parser.state = S.TEXT;
		          } else if (c === ']') {
		            parser.cdata += ']';
		          } else {
		            parser.cdata += ']]' + c;
		            parser.state = S.CDATA;
		          }
		          continue

		        case S.PROC_INST:
		          if (c === '?') {
		            parser.state = S.PROC_INST_ENDING;
		          } else if (isWhitespace(c)) {
		            parser.state = S.PROC_INST_BODY;
		          } else {
		            parser.procInstName += c;
		          }
		          continue

		        case S.PROC_INST_BODY:
		          if (!parser.procInstBody && isWhitespace(c)) {
		            continue
		          } else if (c === '?') {
		            parser.state = S.PROC_INST_ENDING;
		          } else {
		            parser.procInstBody += c;
		          }
		          continue

		        case S.PROC_INST_ENDING:
		          if (c === '>') {
		            emitNode(parser, 'onprocessinginstruction', {
		              name: parser.procInstName,
		              body: parser.procInstBody
		            });
		            parser.procInstName = parser.procInstBody = '';
		            parser.state = S.TEXT;
		          } else {
		            parser.procInstBody += '?' + c;
		            parser.state = S.PROC_INST_BODY;
		          }
		          continue

		        case S.OPEN_TAG:
		          if (isMatch(nameBody, c)) {
		            parser.tagName += c;
		          } else {
		            newTag(parser);
		            if (c === '>') {
		              openTag(parser);
		            } else if (c === '/') {
		              parser.state = S.OPEN_TAG_SLASH;
		            } else {
		              if (!isWhitespace(c)) {
		                strictFail(parser, 'Invalid character in tag name');
		              }
		              parser.state = S.ATTRIB;
		            }
		          }
		          continue

		        case S.OPEN_TAG_SLASH:
		          if (c === '>') {
		            openTag(parser, true);
		            closeTag(parser);
		          } else {
		            strictFail(parser, 'Forward-slash in opening tag not followed by >');
		            parser.state = S.ATTRIB;
		          }
		          continue

		        case S.ATTRIB:
		          // haven't read the attribute name yet.
		          if (isWhitespace(c)) {
		            continue
		          } else if (c === '>') {
		            openTag(parser);
		          } else if (c === '/') {
		            parser.state = S.OPEN_TAG_SLASH;
		          } else if (isMatch(nameStart, c)) {
		            parser.attribName = c;
		            parser.attribValue = '';
		            parser.state = S.ATTRIB_NAME;
		          } else {
		            strictFail(parser, 'Invalid attribute name');
		          }
		          continue

		        case S.ATTRIB_NAME:
		          if (c === '=') {
		            parser.state = S.ATTRIB_VALUE;
		          } else if (c === '>') {
		            strictFail(parser, 'Attribute without value');
		            parser.attribValue = parser.attribName;
		            attrib(parser);
		            openTag(parser);
		          } else if (isWhitespace(c)) {
		            parser.state = S.ATTRIB_NAME_SAW_WHITE;
		          } else if (isMatch(nameBody, c)) {
		            parser.attribName += c;
		          } else {
		            strictFail(parser, 'Invalid attribute name');
		          }
		          continue

		        case S.ATTRIB_NAME_SAW_WHITE:
		          if (c === '=') {
		            parser.state = S.ATTRIB_VALUE;
		          } else if (isWhitespace(c)) {
		            continue
		          } else {
		            strictFail(parser, 'Attribute without value');
		            parser.tag.attributes[parser.attribName] = '';
		            parser.attribValue = '';
		            emitNode(parser, 'onattribute', {
		              name: parser.attribName,
		              value: ''
		            });
		            parser.attribName = '';
		            if (c === '>') {
		              openTag(parser);
		            } else if (isMatch(nameStart, c)) {
		              parser.attribName = c;
		              parser.state = S.ATTRIB_NAME;
		            } else {
		              strictFail(parser, 'Invalid attribute name');
		              parser.state = S.ATTRIB;
		            }
		          }
		          continue

		        case S.ATTRIB_VALUE:
		          if (isWhitespace(c)) {
		            continue
		          } else if (isQuote(c)) {
		            parser.q = c;
		            parser.state = S.ATTRIB_VALUE_QUOTED;
		          } else {
		            if (!parser.opt.unquotedAttributeValues) {
		              error(parser, 'Unquoted attribute value');
		            }
		            parser.state = S.ATTRIB_VALUE_UNQUOTED;
		            parser.attribValue = c;
		          }
		          continue

		        case S.ATTRIB_VALUE_QUOTED:
		          if (c !== parser.q) {
		            if (c === '&') {
		              parser.state = S.ATTRIB_VALUE_ENTITY_Q;
		            } else {
		              parser.attribValue += c;
		            }
		            continue
		          }
		          attrib(parser);
		          parser.q = '';
		          parser.state = S.ATTRIB_VALUE_CLOSED;
		          continue

		        case S.ATTRIB_VALUE_CLOSED:
		          if (isWhitespace(c)) {
		            parser.state = S.ATTRIB;
		          } else if (c === '>') {
		            openTag(parser);
		          } else if (c === '/') {
		            parser.state = S.OPEN_TAG_SLASH;
		          } else if (isMatch(nameStart, c)) {
		            strictFail(parser, 'No whitespace between attributes');
		            parser.attribName = c;
		            parser.attribValue = '';
		            parser.state = S.ATTRIB_NAME;
		          } else {
		            strictFail(parser, 'Invalid attribute name');
		          }
		          continue

		        case S.ATTRIB_VALUE_UNQUOTED:
		          if (!isAttribEnd(c)) {
		            if (c === '&') {
		              parser.state = S.ATTRIB_VALUE_ENTITY_U;
		            } else {
		              parser.attribValue += c;
		            }
		            continue
		          }
		          attrib(parser);
		          if (c === '>') {
		            openTag(parser);
		          } else {
		            parser.state = S.ATTRIB;
		          }
		          continue

		        case S.CLOSE_TAG:
		          if (!parser.tagName) {
		            if (isWhitespace(c)) {
		              continue
		            } else if (notMatch(nameStart, c)) {
		              if (parser.script) {
		                parser.script += '</' + c;
		                parser.state = S.SCRIPT;
		              } else {
		                strictFail(parser, 'Invalid tagname in closing tag.');
		              }
		            } else {
		              parser.tagName = c;
		            }
		          } else if (c === '>') {
		            closeTag(parser);
		          } else if (isMatch(nameBody, c)) {
		            parser.tagName += c;
		          } else if (parser.script) {
		            parser.script += '</' + parser.tagName;
		            parser.tagName = '';
		            parser.state = S.SCRIPT;
		          } else {
		            if (!isWhitespace(c)) {
		              strictFail(parser, 'Invalid tagname in closing tag');
		            }
		            parser.state = S.CLOSE_TAG_SAW_WHITE;
		          }
		          continue

		        case S.CLOSE_TAG_SAW_WHITE:
		          if (isWhitespace(c)) {
		            continue
		          }
		          if (c === '>') {
		            closeTag(parser);
		          } else {
		            strictFail(parser, 'Invalid characters in closing tag');
		          }
		          continue

		        case S.TEXT_ENTITY:
		        case S.ATTRIB_VALUE_ENTITY_Q:
		        case S.ATTRIB_VALUE_ENTITY_U:
		          var returnState;
		          var buffer;
		          switch (parser.state) {
		            case S.TEXT_ENTITY:
		              returnState = S.TEXT;
		              buffer = 'textNode';
		              break

		            case S.ATTRIB_VALUE_ENTITY_Q:
		              returnState = S.ATTRIB_VALUE_QUOTED;
		              buffer = 'attribValue';
		              break

		            case S.ATTRIB_VALUE_ENTITY_U:
		              returnState = S.ATTRIB_VALUE_UNQUOTED;
		              buffer = 'attribValue';
		              break
		          }

		          if (c === ';') {
		            var parsedEntity = parseEntity(parser);
		            if (parser.opt.unparsedEntities && !Object.values(sax.XML_ENTITIES).includes(parsedEntity)) {
		              parser.entity = '';
		              parser.state = returnState;
		              parser.write(parsedEntity);
		            } else {
		              parser[buffer] += parsedEntity;
		              parser.entity = '';
		              parser.state = returnState;
		            }
		          } else if (isMatch(parser.entity.length ? entityBody : entityStart, c)) {
		            parser.entity += c;
		          } else {
		            strictFail(parser, 'Invalid character in entity name');
		            parser[buffer] += '&' + parser.entity + c;
		            parser.entity = '';
		            parser.state = returnState;
		          }

		          continue

		        default: /* istanbul ignore next */ {
		          throw new Error(parser, 'Unknown state: ' + parser.state)
		        }
		      }
		    } // while

		    if (parser.position >= parser.bufferCheckPosition) {
		      checkBufferLength(parser);
		    }
		    return parser
		  }

		  /*! http://mths.be/fromcodepoint v0.1.0 by @mathias */
		  /* istanbul ignore next */
		  if (!String.fromCodePoint) {
		    (function () {
		      var stringFromCharCode = String.fromCharCode;
		      var floor = Math.floor;
		      var fromCodePoint = function () {
		        var MAX_SIZE = 0x4000;
		        var codeUnits = [];
		        var highSurrogate;
		        var lowSurrogate;
		        var index = -1;
		        var length = arguments.length;
		        if (!length) {
		          return ''
		        }
		        var result = '';
		        while (++index < length) {
		          var codePoint = Number(arguments[index]);
		          if (
		            !isFinite(codePoint) || // `NaN`, `+Infinity`, or `-Infinity`
		            codePoint < 0 || // not a valid Unicode code point
		            codePoint > 0x10FFFF || // not a valid Unicode code point
		            floor(codePoint) !== codePoint // not an integer
		          ) {
		            throw RangeError('Invalid code point: ' + codePoint)
		          }
		          if (codePoint <= 0xFFFF) { // BMP code point
		            codeUnits.push(codePoint);
		          } else { // Astral code point; split in surrogate halves
		            // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
		            codePoint -= 0x10000;
		            highSurrogate = (codePoint >> 10) + 0xD800;
		            lowSurrogate = (codePoint % 0x400) + 0xDC00;
		            codeUnits.push(highSurrogate, lowSurrogate);
		          }
		          if (index + 1 === length || codeUnits.length > MAX_SIZE) {
		            result += stringFromCharCode.apply(null, codeUnits);
		            codeUnits.length = 0;
		          }
		        }
		        return result
		      };
		      /* istanbul ignore next */
		      if (Object.defineProperty) {
		        Object.defineProperty(String, 'fromCodePoint', {
		          value: fromCodePoint,
		          configurable: true,
		          writable: true
		        });
		      } else {
		        String.fromCodePoint = fromCodePoint;
		      }
		    }());
		  }
		})(exports); 
	} (sax));
	return sax;
}

var arrayHelper;
var hasRequiredArrayHelper;

function requireArrayHelper () {
	if (hasRequiredArrayHelper) return arrayHelper;
	hasRequiredArrayHelper = 1;
	arrayHelper = {

	  isArray: function(value) {
	    if (Array.isArray) {
	      return Array.isArray(value);
	    }
	    // fallback for older browsers like  IE 8
	    return Object.prototype.toString.call( value ) === '[object Array]';
	  }

	};
	return arrayHelper;
}

var optionsHelper;
var hasRequiredOptionsHelper;

function requireOptionsHelper () {
	if (hasRequiredOptionsHelper) return optionsHelper;
	hasRequiredOptionsHelper = 1;
	var isArray = requireArrayHelper().isArray;

	optionsHelper = {

	  copyOptions: function (options) {
	    var key, copy = {};
	    for (key in options) {
	      if (options.hasOwnProperty(key)) {
	        copy[key] = options[key];
	      }
	    }
	    return copy;
	  },

	  ensureFlagExists: function (item, options) {
	    if (!(item in options) || typeof options[item] !== 'boolean') {
	      options[item] = false;
	    }
	  },

	  ensureSpacesExists: function (options) {
	    if (!('spaces' in options) || (typeof options.spaces !== 'number' && typeof options.spaces !== 'string')) {
	      options.spaces = 0;
	    }
	  },

	  ensureAlwaysArrayExists: function (options) {
	    if (!('alwaysArray' in options) || (typeof options.alwaysArray !== 'boolean' && !isArray(options.alwaysArray))) {
	      options.alwaysArray = false;
	    }
	  },

	  ensureKeyExists: function (key, options) {
	    if (!(key + 'Key' in options) || typeof options[key + 'Key'] !== 'string') {
	      options[key + 'Key'] = options.compact ? '_' + key : key;
	    }
	  },

	  checkFnExists: function (key, options) {
	    return key + 'Fn' in options;
	  }

	};
	return optionsHelper;
}

var xml2js;
var hasRequiredXml2js;

function requireXml2js () {
	if (hasRequiredXml2js) return xml2js;
	hasRequiredXml2js = 1;
	var sax = requireSax();
	var helper = requireOptionsHelper();
	var isArray = requireArrayHelper().isArray;

	var options;
	var currentElement;

	function validateOptions(userOptions) {
	  options = helper.copyOptions(userOptions);
	  helper.ensureFlagExists('ignoreDeclaration', options);
	  helper.ensureFlagExists('ignoreInstruction', options);
	  helper.ensureFlagExists('ignoreAttributes', options);
	  helper.ensureFlagExists('ignoreText', options);
	  helper.ensureFlagExists('ignoreComment', options);
	  helper.ensureFlagExists('ignoreCdata', options);
	  helper.ensureFlagExists('ignoreDoctype', options);
	  helper.ensureFlagExists('compact', options);
	  helper.ensureFlagExists('alwaysChildren', options);
	  helper.ensureFlagExists('addParent', options);
	  helper.ensureFlagExists('trim', options);
	  helper.ensureFlagExists('nativeType', options);
	  helper.ensureFlagExists('nativeTypeAttributes', options);
	  helper.ensureFlagExists('sanitize', options);
	  helper.ensureFlagExists('instructionHasAttributes', options);
	  helper.ensureFlagExists('captureSpacesBetweenElements', options);
	  helper.ensureAlwaysArrayExists(options);
	  helper.ensureKeyExists('declaration', options);
	  helper.ensureKeyExists('instruction', options);
	  helper.ensureKeyExists('attributes', options);
	  helper.ensureKeyExists('text', options);
	  helper.ensureKeyExists('comment', options);
	  helper.ensureKeyExists('cdata', options);
	  helper.ensureKeyExists('doctype', options);
	  helper.ensureKeyExists('type', options);
	  helper.ensureKeyExists('name', options);
	  helper.ensureKeyExists('elements', options);
	  helper.ensureKeyExists('parent', options);
	  helper.checkFnExists('doctype', options);
	  helper.checkFnExists('instruction', options);
	  helper.checkFnExists('cdata', options);
	  helper.checkFnExists('comment', options);
	  helper.checkFnExists('text', options);
	  helper.checkFnExists('instructionName', options);
	  helper.checkFnExists('elementName', options);
	  helper.checkFnExists('attributeName', options);
	  helper.checkFnExists('attributeValue', options);
	  helper.checkFnExists('attributes', options);
	  return options;
	}

	function nativeType(value) {
	  var nValue = Number(value);
	  if (!isNaN(nValue)) {
	    return nValue;
	  }
	  var bValue = value.toLowerCase();
	  if (bValue === 'true') {
	    return true;
	  } else if (bValue === 'false') {
	    return false;
	  }
	  return value;
	}

	function addField(type, value) {
	  var key;
	  if (options.compact) {
	    if (
	      !currentElement[options[type + 'Key']] &&
	      (isArray(options.alwaysArray) ? options.alwaysArray.indexOf(options[type + 'Key']) !== -1 : options.alwaysArray)
	    ) {
	      currentElement[options[type + 'Key']] = [];
	    }
	    if (currentElement[options[type + 'Key']] && !isArray(currentElement[options[type + 'Key']])) {
	      currentElement[options[type + 'Key']] = [currentElement[options[type + 'Key']]];
	    }
	    if (type + 'Fn' in options && typeof value === 'string') {
	      value = options[type + 'Fn'](value, currentElement);
	    }
	    if (type === 'instruction' && ('instructionFn' in options || 'instructionNameFn' in options)) {
	      for (key in value) {
	        if (value.hasOwnProperty(key)) {
	          if ('instructionFn' in options) {
	            value[key] = options.instructionFn(value[key], key, currentElement);
	          } else {
	            var temp = value[key];
	            delete value[key];
	            value[options.instructionNameFn(key, temp, currentElement)] = temp;
	          }
	        }
	      }
	    }
	    if (isArray(currentElement[options[type + 'Key']])) {
	      currentElement[options[type + 'Key']].push(value);
	    } else {
	      currentElement[options[type + 'Key']] = value;
	    }
	  } else {
	    if (!currentElement[options.elementsKey]) {
	      currentElement[options.elementsKey] = [];
	    }
	    var element = {};
	    element[options.typeKey] = type;
	    if (type === 'instruction') {
	      for (key in value) {
	        if (value.hasOwnProperty(key)) {
	          break;
	        }
	      }
	      element[options.nameKey] = 'instructionNameFn' in options ? options.instructionNameFn(key, value, currentElement) : key;
	      if (options.instructionHasAttributes) {
	        element[options.attributesKey] = value[key][options.attributesKey];
	        if ('instructionFn' in options) {
	          element[options.attributesKey] = options.instructionFn(element[options.attributesKey], key, currentElement);
	        }
	      } else {
	        if ('instructionFn' in options) {
	          value[key] = options.instructionFn(value[key], key, currentElement);
	        }
	        element[options.instructionKey] = value[key];
	      }
	    } else {
	      if (type + 'Fn' in options) {
	        value = options[type + 'Fn'](value, currentElement);
	      }
	      element[options[type + 'Key']] = value;
	    }
	    if (options.addParent) {
	      element[options.parentKey] = currentElement;
	    }
	    currentElement[options.elementsKey].push(element);
	  }
	}

	function manipulateAttributes(attributes) {
	  if ('attributesFn' in options && attributes) {
	    attributes = options.attributesFn(attributes, currentElement);
	  }
	  if ((options.trim || 'attributeValueFn' in options || 'attributeNameFn' in options || options.nativeTypeAttributes) && attributes) {
	    var key;
	    for (key in attributes) {
	      if (attributes.hasOwnProperty(key)) {
	        if (options.trim) attributes[key] = attributes[key].trim();
	        if (options.nativeTypeAttributes) {
	          attributes[key] = nativeType(attributes[key]);
	        }
	        if ('attributeValueFn' in options) attributes[key] = options.attributeValueFn(attributes[key], key, currentElement);
	        if ('attributeNameFn' in options) {
	          var temp = attributes[key];
	          delete attributes[key];
	          attributes[options.attributeNameFn(key, attributes[key], currentElement)] = temp;
	        }
	      }
	    }
	  }
	  return attributes;
	}

	function onInstruction(instruction) {
	  var attributes = {};
	  if (instruction.body && (instruction.name.toLowerCase() === 'xml' || options.instructionHasAttributes)) {
	    var attrsRegExp = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\w+))\s*/g;
	    var match;
	    while ((match = attrsRegExp.exec(instruction.body)) !== null) {
	      attributes[match[1]] = match[2] || match[3] || match[4];
	    }
	    attributes = manipulateAttributes(attributes);
	  }
	  if (instruction.name.toLowerCase() === 'xml') {
	    if (options.ignoreDeclaration) {
	      return;
	    }
	    currentElement[options.declarationKey] = {};
	    if (Object.keys(attributes).length) {
	      currentElement[options.declarationKey][options.attributesKey] = attributes;
	    }
	    if (options.addParent) {
	      currentElement[options.declarationKey][options.parentKey] = currentElement;
	    }
	  } else {
	    if (options.ignoreInstruction) {
	      return;
	    }
	    if (options.trim) {
	      instruction.body = instruction.body.trim();
	    }
	    var value = {};
	    if (options.instructionHasAttributes && Object.keys(attributes).length) {
	      value[instruction.name] = {};
	      value[instruction.name][options.attributesKey] = attributes;
	    } else {
	      value[instruction.name] = instruction.body;
	    }
	    addField('instruction', value);
	  }
	}

	function onStartElement(name, attributes) {
	  var element;
	  if (typeof name === 'object') {
	    attributes = name.attributes;
	    name = name.name;
	  }
	  attributes = manipulateAttributes(attributes);
	  if ('elementNameFn' in options) {
	    name = options.elementNameFn(name, currentElement);
	  }
	  if (options.compact) {
	    element = {};
	    if (!options.ignoreAttributes && attributes && Object.keys(attributes).length) {
	      element[options.attributesKey] = {};
	      var key;
	      for (key in attributes) {
	        if (attributes.hasOwnProperty(key)) {
	          element[options.attributesKey][key] = attributes[key];
	        }
	      }
	    }
	    if (
	      !(name in currentElement) &&
	      (isArray(options.alwaysArray) ? options.alwaysArray.indexOf(name) !== -1 : options.alwaysArray)
	    ) {
	      currentElement[name] = [];
	    }
	    if (currentElement[name] && !isArray(currentElement[name])) {
	      currentElement[name] = [currentElement[name]];
	    }
	    if (isArray(currentElement[name])) {
	      currentElement[name].push(element);
	    } else {
	      currentElement[name] = element;
	    }
	  } else {
	    if (!currentElement[options.elementsKey]) {
	      currentElement[options.elementsKey] = [];
	    }
	    element = {};
	    element[options.typeKey] = 'element';
	    element[options.nameKey] = name;
	    if (!options.ignoreAttributes && attributes && Object.keys(attributes).length) {
	      element[options.attributesKey] = attributes;
	    }
	    if (options.alwaysChildren) {
	      element[options.elementsKey] = [];
	    }
	    currentElement[options.elementsKey].push(element);
	  }
	  element[options.parentKey] = currentElement; // will be deleted in onEndElement() if !options.addParent
	  currentElement = element;
	}

	function onText(text) {
	  if (options.ignoreText) {
	    return;
	  }
	  if (!text.trim() && !options.captureSpacesBetweenElements) {
	    return;
	  }
	  if (options.trim) {
	    text = text.trim();
	  }
	  if (options.nativeType) {
	    text = nativeType(text);
	  }
	  if (options.sanitize) {
	    text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	  }
	  addField('text', text);
	}

	function onComment(comment) {
	  if (options.ignoreComment) {
	    return;
	  }
	  if (options.trim) {
	    comment = comment.trim();
	  }
	  addField('comment', comment);
	}

	function onEndElement(name) {
	  var parentElement = currentElement[options.parentKey];
	  if (!options.addParent) {
	    delete currentElement[options.parentKey];
	  }
	  currentElement = parentElement;
	}

	function onCdata(cdata) {
	  if (options.ignoreCdata) {
	    return;
	  }
	  if (options.trim) {
	    cdata = cdata.trim();
	  }
	  addField('cdata', cdata);
	}

	function onDoctype(doctype) {
	  if (options.ignoreDoctype) {
	    return;
	  }
	  doctype = doctype.replace(/^ /, '');
	  if (options.trim) {
	    doctype = doctype.trim();
	  }
	  addField('doctype', doctype);
	}

	function onError(error) {
	  error.note = error; //console.error(error);
	}

	xml2js = function (xml, userOptions) {

	  var parser = sax.parser(true, {}) ;
	  var result = {};
	  currentElement = result;

	  options = validateOptions(userOptions);

	  {
	    parser.opt = {strictEntities: true};
	    parser.onopentag = onStartElement;
	    parser.ontext = onText;
	    parser.oncomment = onComment;
	    parser.onclosetag = onEndElement;
	    parser.onerror = onError;
	    parser.oncdata = onCdata;
	    parser.ondoctype = onDoctype;
	    parser.onprocessinginstruction = onInstruction;
	  }

	  {
	    parser.write(xml).close();
	  }

	  if (result[options.elementsKey]) {
	    var temp = result[options.elementsKey];
	    delete result[options.elementsKey];
	    result[options.elementsKey] = temp;
	    delete result.text;
	  }

	  return result;

	};
	return xml2js;
}

var xml2json;
var hasRequiredXml2json;

function requireXml2json () {
	if (hasRequiredXml2json) return xml2json;
	hasRequiredXml2json = 1;
	var helper = requireOptionsHelper();
	var xml2js = requireXml2js();

	function validateOptions (userOptions) {
	  var options = helper.copyOptions(userOptions);
	  helper.ensureSpacesExists(options);
	  return options;
	}

	xml2json = function(xml, userOptions) {
	  var options, js, json, parentKey;
	  options = validateOptions(userOptions);
	  js = xml2js(xml, options);
	  parentKey = 'compact' in options && options.compact ? '_parent' : 'parent';
	  // parentKey = ptions.compact ? '_parent' : 'parent'; // consider this
	  if ('addParent' in options && options.addParent) {
	    json = JSON.stringify(js, function (k, v) { return k === parentKey? '_' : v; }, options.spaces);
	  } else {
	    json = JSON.stringify(js, null, options.spaces);
	  }
	  return json.replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
	};
	return xml2json;
}

var js2xml;
var hasRequiredJs2xml;

function requireJs2xml () {
	if (hasRequiredJs2xml) return js2xml;
	hasRequiredJs2xml = 1;
	var helper = requireOptionsHelper();
	var isArray = requireArrayHelper().isArray;

	var currentElement, currentElementName;

	function validateOptions(userOptions) {
	  var options = helper.copyOptions(userOptions);
	  helper.ensureFlagExists('ignoreDeclaration', options);
	  helper.ensureFlagExists('ignoreInstruction', options);
	  helper.ensureFlagExists('ignoreAttributes', options);
	  helper.ensureFlagExists('ignoreText', options);
	  helper.ensureFlagExists('ignoreComment', options);
	  helper.ensureFlagExists('ignoreCdata', options);
	  helper.ensureFlagExists('ignoreDoctype', options);
	  helper.ensureFlagExists('compact', options);
	  helper.ensureFlagExists('indentText', options);
	  helper.ensureFlagExists('indentCdata', options);
	  helper.ensureFlagExists('indentAttributes', options);
	  helper.ensureFlagExists('indentInstruction', options);
	  helper.ensureFlagExists('fullTagEmptyElement', options);
	  helper.ensureFlagExists('noQuotesForNativeAttributes', options);
	  helper.ensureSpacesExists(options);
	  if (typeof options.spaces === 'number') {
	    options.spaces = Array(options.spaces + 1).join(' ');
	  }
	  helper.ensureKeyExists('declaration', options);
	  helper.ensureKeyExists('instruction', options);
	  helper.ensureKeyExists('attributes', options);
	  helper.ensureKeyExists('text', options);
	  helper.ensureKeyExists('comment', options);
	  helper.ensureKeyExists('cdata', options);
	  helper.ensureKeyExists('doctype', options);
	  helper.ensureKeyExists('type', options);
	  helper.ensureKeyExists('name', options);
	  helper.ensureKeyExists('elements', options);
	  helper.checkFnExists('doctype', options);
	  helper.checkFnExists('instruction', options);
	  helper.checkFnExists('cdata', options);
	  helper.checkFnExists('comment', options);
	  helper.checkFnExists('text', options);
	  helper.checkFnExists('instructionName', options);
	  helper.checkFnExists('elementName', options);
	  helper.checkFnExists('attributeName', options);
	  helper.checkFnExists('attributeValue', options);
	  helper.checkFnExists('attributes', options);
	  helper.checkFnExists('fullTagEmptyElement', options);
	  return options;
	}

	function writeIndentation(options, depth, firstLine) {
	  return (!firstLine && options.spaces ? '\n' : '') + Array(depth + 1).join(options.spaces);
	}

	function writeAttributes(attributes, options, depth) {
	  if (options.ignoreAttributes) {
	    return '';
	  }
	  if ('attributesFn' in options) {
	    attributes = options.attributesFn(attributes, currentElementName, currentElement);
	  }
	  var key, attr, attrName, quote, result = [];
	  for (key in attributes) {
	    if (attributes.hasOwnProperty(key) && attributes[key] !== null && attributes[key] !== undefined) {
	      quote = options.noQuotesForNativeAttributes && typeof attributes[key] !== 'string' ? '' : '"';
	      attr = '' + attributes[key]; // ensure number and boolean are converted to String
	      attr = attr.replace(/"/g, '&quot;');
	      attrName = 'attributeNameFn' in options ? options.attributeNameFn(key, attr, currentElementName, currentElement) : key;
	      result.push((options.spaces && options.indentAttributes? writeIndentation(options, depth+1, false) : ' '));
	      result.push(attrName + '=' + quote + ('attributeValueFn' in options ? options.attributeValueFn(attr, key, currentElementName, currentElement) : attr) + quote);
	    }
	  }
	  if (attributes && Object.keys(attributes).length && options.spaces && options.indentAttributes) {
	    result.push(writeIndentation(options, depth, false));
	  }
	  return result.join('');
	}

	function writeDeclaration(declaration, options, depth) {
	  currentElement = declaration;
	  currentElementName = 'xml';
	  return options.ignoreDeclaration ? '' :  '<?' + 'xml' + writeAttributes(declaration[options.attributesKey], options, depth) + '?>';
	}

	function writeInstruction(instruction, options, depth) {
	  if (options.ignoreInstruction) {
	    return '';
	  }
	  var key;
	  for (key in instruction) {
	    if (instruction.hasOwnProperty(key)) {
	      break;
	    }
	  }
	  var instructionName = 'instructionNameFn' in options ? options.instructionNameFn(key, instruction[key], currentElementName, currentElement) : key;
	  if (typeof instruction[key] === 'object') {
	    currentElement = instruction;
	    currentElementName = instructionName;
	    return '<?' + instructionName + writeAttributes(instruction[key][options.attributesKey], options, depth) + '?>';
	  } else {
	    var instructionValue = instruction[key] ? instruction[key] : '';
	    if ('instructionFn' in options) instructionValue = options.instructionFn(instructionValue, key, currentElementName, currentElement);
	    return '<?' + instructionName + (instructionValue ? ' ' + instructionValue : '') + '?>';
	  }
	}

	function writeComment(comment, options) {
	  return options.ignoreComment ? '' : '<!--' + ('commentFn' in options ? options.commentFn(comment, currentElementName, currentElement) : comment) + '-->';
	}

	function writeCdata(cdata, options) {
	  return options.ignoreCdata ? '' : '<![CDATA[' + ('cdataFn' in options ? options.cdataFn(cdata, currentElementName, currentElement) : cdata.replace(']]>', ']]]]><![CDATA[>')) + ']]>';
	}

	function writeDoctype(doctype, options) {
	  return options.ignoreDoctype ? '' : '<!DOCTYPE ' + ('doctypeFn' in options ? options.doctypeFn(doctype, currentElementName, currentElement) : doctype) + '>';
	}

	function writeText(text, options) {
	  if (options.ignoreText) return '';
	  text = '' + text; // ensure Number and Boolean are converted to String
	  text = text.replace(/&amp;/g, '&'); // desanitize to avoid double sanitization
	  text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	  return 'textFn' in options ? options.textFn(text, currentElementName, currentElement) : text;
	}

	function hasContent(element, options) {
	  var i;
	  if (element.elements && element.elements.length) {
	    for (i = 0; i < element.elements.length; ++i) {
	      switch (element.elements[i][options.typeKey]) {
	      case 'text':
	        if (options.indentText) {
	          return true;
	        }
	        break; // skip to next key
	      case 'cdata':
	        if (options.indentCdata) {
	          return true;
	        }
	        break; // skip to next key
	      case 'instruction':
	        if (options.indentInstruction) {
	          return true;
	        }
	        break; // skip to next key
	      case 'doctype':
	      case 'comment':
	      case 'element':
	        return true;
	      default:
	        return true;
	      }
	    }
	  }
	  return false;
	}

	function writeElement(element, options, depth) {
	  currentElement = element;
	  currentElementName = element.name;
	  var xml = [], elementName = 'elementNameFn' in options ? options.elementNameFn(element.name, element) : element.name;
	  xml.push('<' + elementName);
	  if (element[options.attributesKey]) {
	    xml.push(writeAttributes(element[options.attributesKey], options, depth));
	  }
	  var withClosingTag = element[options.elementsKey] && element[options.elementsKey].length || element[options.attributesKey] && element[options.attributesKey]['xml:space'] === 'preserve';
	  if (!withClosingTag) {
	    if ('fullTagEmptyElementFn' in options) {
	      withClosingTag = options.fullTagEmptyElementFn(element.name, element);
	    } else {
	      withClosingTag = options.fullTagEmptyElement;
	    }
	  }
	  if (withClosingTag) {
	    xml.push('>');
	    if (element[options.elementsKey] && element[options.elementsKey].length) {
	      xml.push(writeElements(element[options.elementsKey], options, depth + 1));
	      currentElement = element;
	      currentElementName = element.name;
	    }
	    xml.push(options.spaces && hasContent(element, options) ? '\n' + Array(depth + 1).join(options.spaces) : '');
	    xml.push('</' + elementName + '>');
	  } else {
	    xml.push('/>');
	  }
	  return xml.join('');
	}

	function writeElements(elements, options, depth, firstLine) {
	  return elements.reduce(function (xml, element) {
	    var indent = writeIndentation(options, depth, firstLine && !xml);
	    switch (element.type) {
	    case 'element': return xml + indent + writeElement(element, options, depth);
	    case 'comment': return xml + indent + writeComment(element[options.commentKey], options);
	    case 'doctype': return xml + indent + writeDoctype(element[options.doctypeKey], options);
	    case 'cdata': return xml + (options.indentCdata ? indent : '') + writeCdata(element[options.cdataKey], options);
	    case 'text': return xml + (options.indentText ? indent : '') + writeText(element[options.textKey], options);
	    case 'instruction':
	      var instruction = {};
	      instruction[element[options.nameKey]] = element[options.attributesKey] ? element : element[options.instructionKey];
	      return xml + (options.indentInstruction ? indent : '') + writeInstruction(instruction, options, depth);
	    }
	  }, '');
	}

	function hasContentCompact(element, options, anyContent) {
	  var key;
	  for (key in element) {
	    if (element.hasOwnProperty(key)) {
	      switch (key) {
	      case options.parentKey:
	      case options.attributesKey:
	        break; // skip to next key
	      case options.textKey:
	        if (options.indentText || anyContent) {
	          return true;
	        }
	        break; // skip to next key
	      case options.cdataKey:
	        if (options.indentCdata || anyContent) {
	          return true;
	        }
	        break; // skip to next key
	      case options.instructionKey:
	        if (options.indentInstruction || anyContent) {
	          return true;
	        }
	        break; // skip to next key
	      case options.doctypeKey:
	      case options.commentKey:
	        return true;
	      default:
	        return true;
	      }
	    }
	  }
	  return false;
	}

	function writeElementCompact(element, name, options, depth, indent) {
	  currentElement = element;
	  currentElementName = name;
	  var elementName = 'elementNameFn' in options ? options.elementNameFn(name, element) : name;
	  if (typeof element === 'undefined' || element === null || element === '') {
	    return 'fullTagEmptyElementFn' in options && options.fullTagEmptyElementFn(name, element) || options.fullTagEmptyElement ? '<' + elementName + '></' + elementName + '>' : '<' + elementName + '/>';
	  }
	  var xml = [];
	  if (name) {
	    xml.push('<' + elementName);
	    if (typeof element !== 'object') {
	      xml.push('>' + writeText(element,options) + '</' + elementName + '>');
	      return xml.join('');
	    }
	    if (element[options.attributesKey]) {
	      xml.push(writeAttributes(element[options.attributesKey], options, depth));
	    }
	    var withClosingTag = hasContentCompact(element, options, true) || element[options.attributesKey] && element[options.attributesKey]['xml:space'] === 'preserve';
	    if (!withClosingTag) {
	      if ('fullTagEmptyElementFn' in options) {
	        withClosingTag = options.fullTagEmptyElementFn(name, element);
	      } else {
	        withClosingTag = options.fullTagEmptyElement;
	      }
	    }
	    if (withClosingTag) {
	      xml.push('>');
	    } else {
	      xml.push('/>');
	      return xml.join('');
	    }
	  }
	  xml.push(writeElementsCompact(element, options, depth + 1, false));
	  currentElement = element;
	  currentElementName = name;
	  if (name) {
	    xml.push((indent ? writeIndentation(options, depth, false) : '') + '</' + elementName + '>');
	  }
	  return xml.join('');
	}

	function writeElementsCompact(element, options, depth, firstLine) {
	  var i, key, nodes, xml = [];
	  for (key in element) {
	    if (element.hasOwnProperty(key)) {
	      nodes = isArray(element[key]) ? element[key] : [element[key]];
	      for (i = 0; i < nodes.length; ++i) {
	        switch (key) {
	        case options.declarationKey: xml.push(writeDeclaration(nodes[i], options, depth)); break;
	        case options.instructionKey: xml.push((options.indentInstruction ? writeIndentation(options, depth, firstLine) : '') + writeInstruction(nodes[i], options, depth)); break;
	        case options.attributesKey: case options.parentKey: break; // skip
	        case options.textKey: xml.push((options.indentText ? writeIndentation(options, depth, firstLine) : '') + writeText(nodes[i], options)); break;
	        case options.cdataKey: xml.push((options.indentCdata ? writeIndentation(options, depth, firstLine) : '') + writeCdata(nodes[i], options)); break;
	        case options.doctypeKey: xml.push(writeIndentation(options, depth, firstLine) + writeDoctype(nodes[i], options)); break;
	        case options.commentKey: xml.push(writeIndentation(options, depth, firstLine) + writeComment(nodes[i], options)); break;
	        default: xml.push(writeIndentation(options, depth, firstLine) + writeElementCompact(nodes[i], key, options, depth, hasContentCompact(nodes[i], options)));
	        }
	        firstLine = firstLine && !xml.length;
	      }
	    }
	  }
	  return xml.join('');
	}

	js2xml = function (js, options) {
	  options = validateOptions(options);
	  var xml = [];
	  currentElement = js;
	  currentElementName = '_root_';
	  if (options.compact) {
	    xml.push(writeElementsCompact(js, options, 0, true));
	  } else {
	    if (js[options.declarationKey]) {
	      xml.push(writeDeclaration(js[options.declarationKey], options, 0));
	    }
	    if (js[options.elementsKey] && js[options.elementsKey].length) {
	      xml.push(writeElements(js[options.elementsKey], options, 0, !xml.length));
	    }
	  }
	  return xml.join('');
	};
	return js2xml;
}

var json2xml;
var hasRequiredJson2xml;

function requireJson2xml () {
	if (hasRequiredJson2xml) return json2xml;
	hasRequiredJson2xml = 1;
	var js2xml = requireJs2xml();

	json2xml = function (json, options) {
	  if (json instanceof Buffer) {
	    json = json.toString();
	  }
	  var js = null;
	  if (typeof (json) === 'string') {
	    try {
	      js = JSON.parse(json);
	    } catch (e) {
	      throw new Error('The JSON structure is invalid');
	    }
	  } else {
	    js = json;
	  }
	  return js2xml(js, options);
	};
	return json2xml;
}

/*jslint node:true */

var lib;
var hasRequiredLib;

function requireLib () {
	if (hasRequiredLib) return lib;
	hasRequiredLib = 1;
	var xml2js = requireXml2js();
	var xml2json = requireXml2json();
	var js2xml = requireJs2xml();
	var json2xml = requireJson2xml();

	lib = {
	  xml2js: xml2js,
	  xml2json: xml2json,
	  js2xml: js2xml,
	  json2xml: json2xml
	};
	return lib;
}

var libExports = requireLib();
var convert = /*@__PURE__*/getDefaultExportFromCjs(libExports);

const camelCase = (str) => str.replace(/([-_]\w)/g, (g) => g[1].toUpperCase());

const nativeType = (value) => {
    const nValue = Number(value);
    if (!Number.isNaN(nValue)) {
        return nValue;
    }
    const bValue = value.toLowerCase();
    if (bValue === 'true') {
        return true;
    }
    if (bValue === 'false') {
        return false;
    }
    return value;
};

const urlEquals = (urlA, urlB) => {
    if (!urlA && !urlB) {
        return true;
    }
    if (!urlA || !urlB) {
        return false;
    }
    const trimmedUrlA = urlA.trim();
    const trimmedUrlB = urlB.trim();
    if (Math.abs(trimmedUrlA.length - trimmedUrlB.length) > 1) {
        return false;
    }
    const strippedUrlA = trimmedUrlA.slice(-1) === '/' ? trimmedUrlA.slice(0, -1) : trimmedUrlA;
    const strippedUrlB = trimmedUrlB.slice(-1) === '/' ? trimmedUrlB.slice(0, -1) : trimmedUrlB;
    return urlA.includes(strippedUrlB) || urlB.includes(strippedUrlA);
};
const urlContains = (urlA, urlB) => {
    if (!urlA && !urlB) {
        return true;
    }
    if (!urlA || !urlB) {
        return false;
    }
    const trimmedUrlA = urlA.trim();
    const trimmedUrlB = urlB.trim();
    const strippedUrlA = trimmedUrlA.slice(-1) === '/' ? trimmedUrlA.slice(0, -1) : trimmedUrlA;
    const strippedUrlB = trimmedUrlB.slice(-1) === '/' ? trimmedUrlB.slice(0, -1) : trimmedUrlB;
    return urlA.includes(strippedUrlB) || urlB.includes(strippedUrlA);
};
const getDAVAttribute = (nsArr) => nsArr.reduce((prev, curr) => ({ ...prev, [DAVAttributeMap[curr]]: curr }), {});
const cleanupFalsy = (obj) => Object.entries(obj).reduce((prev, [key, value]) => {
    if (value)
        return { ...prev, [key]: value };
    return prev;
}, {});
const conditionalParam = (key, param) => {
    if (param) {
        return {
            [key]: param,
        };
    }
    return {};
};
const excludeHeaders = (headers, headersToExclude) => {
    if (!headers) {
        return {};
    }
    if (!headersToExclude || headersToExclude.length === 0) {
        return headers;
    }
    return Object.fromEntries(Object.entries(headers).filter(([key]) => !headersToExclude.includes(key)));
};
const DEFAULT_ICAL_EXTENSION = '.ics';
const defaultIcsFilter = (url) => Boolean(url === null || url === void 0 ? void 0 : url.includes(DEFAULT_ICAL_EXTENSION));
const validateISO8601TimeRange = (start, end) => {
    const ISO_8601 = /^\d{4}(-\d\d(-\d\d(T\d\d:\d\d(:\d\d)?(\.\d+)?(([+-]\d\d:\d\d)|Z)?)?)?)?$/i;
    const ISO_8601_FULL = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?(([+-]\d\d:\d\d)|Z)?$/i;
    if ((!ISO_8601.test(start) || !ISO_8601.test(end)) &&
        (!ISO_8601_FULL.test(start) || !ISO_8601_FULL.test(end))) {
        throw new Error('invalid timeRange format, not in ISO8601');
    }
};

var requestHelpers = /*#__PURE__*/Object.freeze({
	__proto__: null,
	cleanupFalsy: cleanupFalsy,
	conditionalParam: conditionalParam,
	defaultIcsFilter: defaultIcsFilter,
	excludeHeaders: excludeHeaders,
	getDAVAttribute: getDAVAttribute,
	urlContains: urlContains,
	urlEquals: urlEquals,
	validateISO8601TimeRange: validateISO8601TimeRange
});

const debug$6 = getLogger('tsdav:request');
const davRequest = async (params) => {
    var _a;
    const { url, init, convertIncoming = true, parseOutgoing = true, fetchOptions = {} } = params;
    const { headers = {}, body, namespace, method, attributes } = init;
    const xmlBody = convertIncoming
        ? convert.js2xml({
            _declaration: { _attributes: { version: '1.0', encoding: 'utf-8' } },
            ...body,
            _attributes: attributes,
        }, {
            compact: true,
            spaces: 2,
            elementNameFn: (name) => {
                // add namespace to all keys without namespace
                if (namespace && !/^.+:.+/.test(name)) {
                    return `${namespace}:${name}`;
                }
                return name;
            },
        })
        : body;
    // debug('outgoing xml:');
    // debug(`${method} ${url}`);
    // debug(
    //   `headers: ${JSON.stringify(
    //     {
    //       'Content-Type': 'text/xml;charset=UTF-8',
    //       ...cleanupFalsy(headers),
    //     },
    //     null,
    //     2
    //   )}`
    // );
    // debug(xmlBody);
    const fetchOptionsWithoutHeaders = {
        ...fetchOptions
    };
    delete fetchOptionsWithoutHeaders.headers;
    const davResponse = await browserPonyfillExports.fetch(url, {
        headers: {
            'Content-Type': 'text/xml;charset=UTF-8',
            ...cleanupFalsy(headers),
            ...(fetchOptions.headers || {})
        },
        body: xmlBody,
        method,
        ...fetchOptionsWithoutHeaders,
    });
    const resText = await davResponse.text();
    // filter out invalid responses
    // debug('response xml:');
    // debug(resText);
    // debug(davResponse);
    if (!davResponse.ok ||
        !((_a = davResponse.headers.get('content-type')) === null || _a === void 0 ? void 0 : _a.includes('xml')) ||
        !parseOutgoing) {
        return [
            {
                href: davResponse.url,
                ok: davResponse.ok,
                status: davResponse.status,
                statusText: davResponse.statusText,
                raw: resText,
            },
        ];
    }
    const result = convert.xml2js(resText, {
        compact: true,
        trim: true,
        textFn: (value, parentElement) => {
            try {
                // This is needed for xml-js design reasons
                // eslint-disable-next-line no-underscore-dangle
                const parentOfParent = parentElement._parent;
                const pOpKeys = Object.keys(parentOfParent);
                const keyNo = pOpKeys.length;
                const keyName = pOpKeys[keyNo - 1];
                const arrOfKey = parentOfParent[keyName];
                const arrOfKeyLen = arrOfKey.length;
                if (arrOfKeyLen > 0) {
                    const arr = arrOfKey;
                    const arrIndex = arrOfKey.length - 1;
                    arr[arrIndex] = nativeType(value);
                }
                else {
                    parentOfParent[keyName] = nativeType(value);
                }
            }
            catch (e) {
                debug$6(e.stack);
            }
        },
        // remove namespace & camelCase
        elementNameFn: (attributeName) => camelCase(attributeName.replace(/^.+:/, '')),
        attributesFn: (value) => {
            const newVal = { ...value };
            delete newVal.xmlns;
            return newVal;
        },
        ignoreDeclaration: true,
    });
    const responseBodies = Array.isArray(result.multistatus.response)
        ? result.multistatus.response
        : [result.multistatus.response];
    return responseBodies.map((responseBody) => {
        var _a, _b;
        const statusRegex = /^\S+\s(?<status>\d+)\s(?<statusText>.+)$/;
        if (!responseBody) {
            return {
                status: davResponse.status,
                statusText: davResponse.statusText,
                ok: davResponse.ok,
            };
        }
        const matchArr = statusRegex.exec(responseBody.status);
        return {
            raw: result,
            href: responseBody.href,
            status: (matchArr === null || matchArr === void 0 ? void 0 : matchArr.groups) ? Number.parseInt(matchArr === null || matchArr === void 0 ? void 0 : matchArr.groups.status, 10) : davResponse.status,
            statusText: (_b = (_a = matchArr === null || matchArr === void 0 ? void 0 : matchArr.groups) === null || _a === void 0 ? void 0 : _a.statusText) !== null && _b !== void 0 ? _b : davResponse.statusText,
            ok: !responseBody.error,
            error: responseBody.error,
            responsedescription: responseBody.responsedescription,
            props: (Array.isArray(responseBody.propstat)
                ? responseBody.propstat
                : [responseBody.propstat]).reduce((prev, curr) => {
                return {
                    ...prev,
                    ...curr === null || curr === void 0 ? void 0 : curr.prop,
                };
            }, {}),
        };
    });
};
const propfind = async (params) => {
    const { url, props, depth, headers, headersToExclude, fetchOptions = {} } = params;
    return davRequest({
        url,
        init: {
            method: 'PROPFIND',
            headers: excludeHeaders(cleanupFalsy({ depth, ...headers }), headersToExclude),
            namespace: DAVNamespaceShort.DAV,
            body: {
                propfind: {
                    _attributes: getDAVAttribute([
                        DAVNamespace.CALDAV,
                        DAVNamespace.CALDAV_APPLE,
                        DAVNamespace.CALENDAR_SERVER,
                        DAVNamespace.CARDDAV,
                        DAVNamespace.DAV,
                    ]),
                    prop: props,
                },
            },
        },
        fetchOptions,
    });
};
const createObject = async (params) => {
    const { url, data, headers, headersToExclude, fetchOptions = {} } = params;
    return browserPonyfillExports.fetch(url, {
        method: 'PUT',
        body: data,
        headers: excludeHeaders(headers, headersToExclude),
        ...fetchOptions,
    });
};
const updateObject = async (params) => {
    const { url, data, etag, headers, headersToExclude, fetchOptions = {} } = params;
    return browserPonyfillExports.fetch(url, {
        method: 'PUT',
        body: data,
        headers: excludeHeaders(cleanupFalsy({ 'If-Match': etag, ...headers }), headersToExclude),
        ...fetchOptions,
    });
};
const deleteObject = async (params) => {
    const { url, headers, etag, headersToExclude, fetchOptions = {} } = params;
    return browserPonyfillExports.fetch(url, {
        method: 'DELETE',
        headers: excludeHeaders(cleanupFalsy({ 'If-Match': etag, ...headers }), headersToExclude),
        ...fetchOptions,
    });
};

var request = /*#__PURE__*/Object.freeze({
	__proto__: null,
	createObject: createObject,
	davRequest: davRequest,
	deleteObject: deleteObject,
	propfind: propfind,
	updateObject: updateObject
});

function hasFields(obj, fields) {
    const inObj = (object) => fields.every((f) => object[f]);
    if (Array.isArray(obj)) {
        return obj.every((o) => inObj(o));
    }
    return inObj(obj);
}
const findMissingFieldNames = (obj, fields) => fields.reduce((prev, curr) => (obj[curr] ? prev : `${prev.length ? `${prev},` : ''}${curr.toString()}`), '');

/* eslint-disable no-underscore-dangle */
const debug$5 = getLogger('tsdav:collection');
const collectionQuery = async (params) => {
    const { url, body, depth, defaultNamespace = DAVNamespaceShort.DAV, headers, headersToExclude, fetchOptions = {} } = params;
    const queryResults = await davRequest({
        url,
        init: {
            method: 'REPORT',
            headers: excludeHeaders(cleanupFalsy({ depth, ...headers }), headersToExclude),
            namespace: defaultNamespace,
            body,
        },
        fetchOptions,
    });
    // empty query result
    if (queryResults.length === 1 && !queryResults[0].raw) {
        return [];
    }
    return queryResults;
};
const makeCollection = async (params) => {
    const { url, props, depth, headers, headersToExclude, fetchOptions = {} } = params;
    return davRequest({
        url,
        init: {
            method: 'MKCOL',
            headers: excludeHeaders(cleanupFalsy({ depth, ...headers }), headersToExclude),
            namespace: DAVNamespaceShort.DAV,
            body: props
                ? {
                    mkcol: {
                        set: {
                            prop: props,
                        },
                    },
                }
                : undefined,
        },
        fetchOptions
    });
};
const supportedReportSet = async (params) => {
    var _a, _b, _c, _d, _e;
    const { collection, headers, headersToExclude, fetchOptions = {} } = params;
    const res = await propfind({
        url: collection.url,
        props: {
            [`${DAVNamespaceShort.DAV}:supported-report-set`]: {},
        },
        depth: '0',
        headers: excludeHeaders(headers, headersToExclude),
        fetchOptions
    });
    return ((_e = (_d = (_c = (_b = (_a = res[0]) === null || _a === void 0 ? void 0 : _a.props) === null || _b === void 0 ? void 0 : _b.supportedReportSet) === null || _c === void 0 ? void 0 : _c.supportedReport) === null || _d === void 0 ? void 0 : _d.map((sr) => Object.keys(sr.report)[0])) !== null && _e !== void 0 ? _e : []);
};
const isCollectionDirty = async (params) => {
    var _a, _b, _c;
    const { collection, headers, headersToExclude, fetchOptions = {} } = params;
    const responses = await propfind({
        url: collection.url,
        props: {
            [`${DAVNamespaceShort.CALENDAR_SERVER}:getctag`]: {},
        },
        depth: '0',
        headers: excludeHeaders(headers, headersToExclude),
        fetchOptions
    });
    const res = responses.filter((r) => urlContains(collection.url, r.href))[0];
    if (!res) {
        throw new Error('Collection does not exist on server');
    }
    return {
        isDirty: `${collection.ctag}` !== `${(_a = res.props) === null || _a === void 0 ? void 0 : _a.getctag}`,
        newCtag: (_c = (_b = res.props) === null || _b === void 0 ? void 0 : _b.getctag) === null || _c === void 0 ? void 0 : _c.toString(),
    };
};
/**
 * This is for webdav sync-collection only
 */
const syncCollection = (params) => {
    const { url, props, headers, syncLevel, syncToken, headersToExclude, fetchOptions } = params;
    return davRequest({
        url,
        init: {
            method: 'REPORT',
            namespace: DAVNamespaceShort.DAV,
            headers: excludeHeaders({ ...headers }, headersToExclude),
            body: {
                'sync-collection': {
                    _attributes: getDAVAttribute([
                        DAVNamespace.CALDAV,
                        DAVNamespace.CARDDAV,
                        DAVNamespace.DAV,
                    ]),
                    'sync-level': syncLevel,
                    'sync-token': syncToken,
                    [`${DAVNamespaceShort.DAV}:prop`]: props,
                },
            },
        },
        fetchOptions
    });
};
/** remote collection to local */
const smartCollectionSync = async (params) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    const { collection, method, headers, headersToExclude, account, detailedResult, fetchOptions = {} } = params;
    const requiredFields = ['accountType', 'homeUrl'];
    if (!account || !hasFields(account, requiredFields)) {
        if (!account) {
            throw new Error('no account for smartCollectionSync');
        }
        throw new Error(`account must have ${findMissingFieldNames(account, requiredFields)} before smartCollectionSync`);
    }
    const syncMethod = method !== null && method !== void 0 ? method : (((_a = collection.reports) === null || _a === void 0 ? void 0 : _a.includes('syncCollection')) ? 'webdav' : 'basic');
    debug$5(`smart collection sync with type ${account.accountType} and method ${syncMethod}`);
    if (syncMethod === 'webdav') {
        const result = await syncCollection({
            url: collection.url,
            props: {
                [`${DAVNamespaceShort.DAV}:getetag`]: {},
                [`${account.accountType === 'caldav' ? DAVNamespaceShort.CALDAV : DAVNamespaceShort.CARDDAV}:${account.accountType === 'caldav' ? 'calendar-data' : 'address-data'}`]: {},
                [`${DAVNamespaceShort.DAV}:displayname`]: {},
            },
            syncLevel: 1,
            syncToken: collection.syncToken,
            headers: excludeHeaders(headers, headersToExclude),
            fetchOptions
        });
        const objectResponses = result.filter((r) => {
            var _a;
            const extName = account.accountType === 'caldav' ? '.ics' : '.vcf';
            return ((_a = r.href) === null || _a === void 0 ? void 0 : _a.slice(-4)) === extName;
        });
        const changedObjectUrls = objectResponses.filter((o) => o.status !== 404).map((r) => r.href);
        const deletedObjectUrls = objectResponses.filter((o) => o.status === 404).map((r) => r.href);
        const multiGetObjectResponse = changedObjectUrls.length
            ? ((_c = (await ((_b = collection === null || collection === void 0 ? void 0 : collection.objectMultiGet) === null || _b === void 0 ? void 0 : _b.call(collection, {
                url: collection.url,
                props: {
                    [`${DAVNamespaceShort.DAV}:getetag`]: {},
                    [`${account.accountType === 'caldav'
                        ? DAVNamespaceShort.CALDAV
                        : DAVNamespaceShort.CARDDAV}:${account.accountType === 'caldav' ? 'calendar-data' : 'address-data'}`]: {},
                },
                objectUrls: changedObjectUrls,
                depth: '1',
                headers: excludeHeaders(headers, headersToExclude),
                fetchOptions
            })))) !== null && _c !== void 0 ? _c : [])
            : [];
        const remoteObjects = multiGetObjectResponse.map((res) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
            return {
                url: (_a = res.href) !== null && _a !== void 0 ? _a : '',
                etag: (_b = res.props) === null || _b === void 0 ? void 0 : _b.getetag,
                data: (account === null || account === void 0 ? void 0 : account.accountType) === 'caldav'
                    ? ((_e = (_d = (_c = res.props) === null || _c === void 0 ? void 0 : _c.calendarData) === null || _d === void 0 ? void 0 : _d._cdata) !== null && _e !== void 0 ? _e : (_f = res.props) === null || _f === void 0 ? void 0 : _f.calendarData)
                    : ((_j = (_h = (_g = res.props) === null || _g === void 0 ? void 0 : _g.addressData) === null || _h === void 0 ? void 0 : _h._cdata) !== null && _j !== void 0 ? _j : (_k = res.props) === null || _k === void 0 ? void 0 : _k.addressData),
            };
        });
        const localObjects = (_d = collection.objects) !== null && _d !== void 0 ? _d : [];
        // no existing url
        const created = remoteObjects.filter((o) => localObjects.every((lo) => !urlContains(lo.url, o.url)));
        // debug(`created objects: ${created.map((o) => o.url).join('\n')}`);
        // have same url, but etag different
        const updated = localObjects.reduce((prev, curr) => {
            const found = remoteObjects.find((ro) => urlContains(ro.url, curr.url));
            if (found && found.etag && found.etag !== curr.etag) {
                return [...prev, found];
            }
            return prev;
        }, []);
        // debug(`updated objects: ${updated.map((o) => o.url).join('\n')}`);
        const deleted = deletedObjectUrls.map((o) => ({
            url: o,
            etag: '',
        }));
        // debug(`deleted objects: ${deleted.map((o) => o.url).join('\n')}`);
        const unchanged = localObjects.filter((lo) => remoteObjects.some((ro) => urlContains(lo.url, ro.url) && ro.etag === lo.etag));
        return {
            ...collection,
            objects: detailedResult
                ? { created, updated, deleted }
                : [...unchanged, ...created, ...updated],
            // all syncToken in the results are the same so we use the first one here
            syncToken: (_h = (_g = (_f = (_e = result[0]) === null || _e === void 0 ? void 0 : _e.raw) === null || _f === void 0 ? void 0 : _f.multistatus) === null || _g === void 0 ? void 0 : _g.syncToken) !== null && _h !== void 0 ? _h : collection.syncToken,
        };
    }
    if (syncMethod === 'basic') {
        const { isDirty, newCtag } = await isCollectionDirty({
            collection,
            headers: excludeHeaders(headers, headersToExclude),
            fetchOptions
        });
        const localObjects = (_j = collection.objects) !== null && _j !== void 0 ? _j : [];
        const remoteObjects = (_l = (await ((_k = collection.fetchObjects) === null || _k === void 0 ? void 0 : _k.call(collection, {
            collection,
            headers: excludeHeaders(headers, headersToExclude),
            fetchOptions
        })))) !== null && _l !== void 0 ? _l : [];
        // no existing url
        const created = remoteObjects.filter((ro) => localObjects.every((lo) => !urlContains(lo.url, ro.url)));
        // debug(`created objects: ${created.map((o) => o.url).join('\n')}`);
        // have same url, but etag different
        const updated = localObjects.reduce((prev, curr) => {
            const found = remoteObjects.find((ro) => urlContains(ro.url, curr.url));
            if (found && found.etag && found.etag !== curr.etag) {
                return [...prev, found];
            }
            return prev;
        }, []);
        // debug(`updated objects: ${updated.map((o) => o.url).join('\n')}`);
        // does not present in remote
        const deleted = localObjects.filter((cal) => remoteObjects.every((ro) => !urlContains(ro.url, cal.url)));
        // debug(`deleted objects: ${deleted.map((o) => o.url).join('\n')}`);
        const unchanged = localObjects.filter((lo) => remoteObjects.some((ro) => urlContains(lo.url, ro.url) && ro.etag === lo.etag));
        if (isDirty) {
            return {
                ...collection,
                objects: detailedResult
                    ? { created, updated, deleted }
                    : [...unchanged, ...created, ...updated],
                ctag: newCtag,
            };
        }
    }
    return detailedResult
        ? {
            ...collection,
            objects: {
                created: [],
                updated: [],
                deleted: [],
            },
        }
        : collection;
};

var collection = /*#__PURE__*/Object.freeze({
	__proto__: null,
	collectionQuery: collectionQuery,
	isCollectionDirty: isCollectionDirty,
	makeCollection: makeCollection,
	smartCollectionSync: smartCollectionSync,
	supportedReportSet: supportedReportSet,
	syncCollection: syncCollection
});

/* eslint-disable no-underscore-dangle */
const debug$4 = getLogger('tsdav:addressBook');
const addressBookQuery = async (params) => {
    const { url, props, filters, depth, headers, headersToExclude, fetchOptions = {} } = params;
    return collectionQuery({
        url,
        body: {
            'addressbook-query': cleanupFalsy({
                _attributes: getDAVAttribute([DAVNamespace.CARDDAV, DAVNamespace.DAV]),
                [`${DAVNamespaceShort.DAV}:prop`]: props,
                filter: filters !== null && filters !== void 0 ? filters : {
                    'prop-filter': {
                        _attributes: {
                            name: 'FN',
                        },
                    },
                },
            }),
        },
        defaultNamespace: DAVNamespaceShort.CARDDAV,
        depth,
        headers: excludeHeaders(headers, headersToExclude),
        fetchOptions,
    });
};
const addressBookMultiGet = async (params) => {
    const { url, props, objectUrls, depth, headers, headersToExclude, fetchOptions = {} } = params;
    return collectionQuery({
        url,
        body: {
            'addressbook-multiget': cleanupFalsy({
                _attributes: getDAVAttribute([DAVNamespace.DAV, DAVNamespace.CARDDAV]),
                [`${DAVNamespaceShort.DAV}:prop`]: props,
                [`${DAVNamespaceShort.DAV}:href`]: objectUrls,
            }),
        },
        defaultNamespace: DAVNamespaceShort.CARDDAV,
        depth,
        headers: excludeHeaders(headers, headersToExclude),
        fetchOptions,
    });
};
const fetchAddressBooks = async (params) => {
    const { account, headers, props: customProps, headersToExclude, fetchOptions = {}, } = params !== null && params !== void 0 ? params : {};
    const requiredFields = ['homeUrl', 'rootUrl'];
    if (!account || !hasFields(account, requiredFields)) {
        if (!account) {
            throw new Error('no account for fetchAddressBooks');
        }
        throw new Error(`account must have ${findMissingFieldNames(account, requiredFields)} before fetchAddressBooks`);
    }
    const res = await propfind({
        url: account.homeUrl,
        props: customProps !== null && customProps !== void 0 ? customProps : {
            [`${DAVNamespaceShort.DAV}:displayname`]: {},
            [`${DAVNamespaceShort.CALENDAR_SERVER}:getctag`]: {},
            [`${DAVNamespaceShort.DAV}:resourcetype`]: {},
            [`${DAVNamespaceShort.DAV}:sync-token`]: {},
        },
        depth: '1',
        headers: excludeHeaders(headers, headersToExclude),
        fetchOptions,
    });
    return Promise.all(res
        .filter((r) => { var _a, _b; return Object.keys((_b = (_a = r.props) === null || _a === void 0 ? void 0 : _a.resourcetype) !== null && _b !== void 0 ? _b : {}).includes('addressbook'); })
        .map((rs) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        const displayName = (_c = (_b = (_a = rs.props) === null || _a === void 0 ? void 0 : _a.displayname) === null || _b === void 0 ? void 0 : _b._cdata) !== null && _c !== void 0 ? _c : (_d = rs.props) === null || _d === void 0 ? void 0 : _d.displayname;
        debug$4(`Found address book named ${typeof displayName === 'string' ? displayName : ''},
             props: ${JSON.stringify(rs.props)}`);
        return {
            url: new URL((_e = rs.href) !== null && _e !== void 0 ? _e : '', (_f = account.rootUrl) !== null && _f !== void 0 ? _f : '').href,
            ctag: (_g = rs.props) === null || _g === void 0 ? void 0 : _g.getctag,
            displayName: typeof displayName === 'string' ? displayName : '',
            resourcetype: Object.keys((_h = rs.props) === null || _h === void 0 ? void 0 : _h.resourcetype),
            syncToken: (_j = rs.props) === null || _j === void 0 ? void 0 : _j.syncToken,
        };
    })
        .map(async (addr) => ({
        ...addr,
        reports: await supportedReportSet({
            collection: addr,
            headers: excludeHeaders(headers, headersToExclude),
            fetchOptions,
        }),
    })));
};
const fetchVCards = async (params) => {
    const { addressBook, headers, objectUrls, headersToExclude, urlFilter = (url) => url, useMultiGet = true, fetchOptions = {}, } = params;
    debug$4(`Fetching vcards from ${addressBook === null || addressBook === void 0 ? void 0 : addressBook.url}`);
    const requiredFields = ['url'];
    if (!addressBook || !hasFields(addressBook, requiredFields)) {
        if (!addressBook) {
            throw new Error('cannot fetchVCards for undefined addressBook');
        }
        throw new Error(`addressBook must have ${findMissingFieldNames(addressBook, requiredFields)} before fetchVCards`);
    }
    const vcardUrls = (objectUrls !== null && objectUrls !== void 0 ? objectUrls : 
    // fetch all objects of the calendar
    (await addressBookQuery({
        url: addressBook.url,
        props: { [`${DAVNamespaceShort.DAV}:getetag`]: {} },
        depth: '1',
        headers: excludeHeaders(headers, headersToExclude),
        fetchOptions,
    })).map((res) => { var _a; return (res.ok ? ((_a = res.href) !== null && _a !== void 0 ? _a : '') : ''); }))
        .map((url) => (url.startsWith('http') || !url ? url : new URL(url, addressBook.url).href))
        .filter(urlFilter)
        .map((url) => new URL(url).pathname);
    let vCardResults = [];
    if (vcardUrls.length > 0) {
        if (useMultiGet) {
            vCardResults = await addressBookMultiGet({
                url: addressBook.url,
                props: {
                    [`${DAVNamespaceShort.DAV}:getetag`]: {},
                    [`${DAVNamespaceShort.CARDDAV}:address-data`]: {},
                },
                objectUrls: vcardUrls,
                depth: '1',
                headers: excludeHeaders(headers, headersToExclude),
                fetchOptions,
            });
        }
        else {
            vCardResults = await addressBookQuery({
                url: addressBook.url,
                props: {
                    [`${DAVNamespaceShort.DAV}:getetag`]: {},
                    [`${DAVNamespaceShort.CARDDAV}:address-data`]: {},
                },
                depth: '1',
                headers: excludeHeaders(headers, headersToExclude),
                fetchOptions,
            });
        }
    }
    return vCardResults.map((res) => {
        var _a, _b, _c, _d, _e, _f;
        return ({
            url: new URL((_a = res.href) !== null && _a !== void 0 ? _a : '', addressBook.url).href,
            etag: (_b = res.props) === null || _b === void 0 ? void 0 : _b.getetag,
            data: (_e = (_d = (_c = res.props) === null || _c === void 0 ? void 0 : _c.addressData) === null || _d === void 0 ? void 0 : _d._cdata) !== null && _e !== void 0 ? _e : (_f = res.props) === null || _f === void 0 ? void 0 : _f.addressData,
        });
    });
};
const createVCard = async (params) => {
    const { addressBook, vCardString, filename, headers, headersToExclude, fetchOptions = {}, } = params;
    return createObject({
        url: new URL(filename, addressBook.url).href,
        data: vCardString,
        headers: excludeHeaders({
            'content-type': 'text/vcard; charset=utf-8',
            'If-None-Match': '*',
            ...headers,
        }, headersToExclude),
        fetchOptions,
    });
};
const updateVCard = async (params) => {
    const { vCard, headers, headersToExclude, fetchOptions = {} } = params;
    return updateObject({
        url: vCard.url,
        data: vCard.data,
        etag: vCard.etag,
        headers: excludeHeaders({
            'content-type': 'text/vcard; charset=utf-8',
            ...headers,
        }, headersToExclude),
        fetchOptions,
    });
};
const deleteVCard = async (params) => {
    const { vCard, headers, headersToExclude, fetchOptions = {} } = params;
    return deleteObject({
        url: vCard.url,
        etag: vCard.etag,
        headers: excludeHeaders(headers, headersToExclude),
        fetchOptions,
    });
};

var addressBook = /*#__PURE__*/Object.freeze({
	__proto__: null,
	addressBookMultiGet: addressBookMultiGet,
	addressBookQuery: addressBookQuery,
	createVCard: createVCard,
	deleteVCard: deleteVCard,
	fetchAddressBooks: fetchAddressBooks,
	fetchVCards: fetchVCards,
	updateVCard: updateVCard
});

/* eslint-disable no-underscore-dangle */
const debug$3 = getLogger('tsdav:calendar');
const fetchCalendarUserAddresses = async (params) => {
    var _a, _b, _c;
    const { account, headers, headersToExclude, fetchOptions = {} } = params;
    const requiredFields = ['principalUrl', 'rootUrl'];
    if (!hasFields(account, requiredFields)) {
        throw new Error(`account must have ${findMissingFieldNames(account, requiredFields)} before fetchUserAddresses`);
    }
    debug$3(`Fetch user addresses from ${account.principalUrl}`);
    const responses = await propfind({
        url: account.principalUrl,
        props: { [`${DAVNamespaceShort.CALDAV}:calendar-user-address-set`]: {} },
        depth: '0',
        headers: excludeHeaders(headers, headersToExclude),
        fetchOptions,
    });
    const matched = responses.find((r) => urlContains(account.principalUrl, r.href));
    if (!matched || !matched.ok) {
        throw new Error('cannot find calendarUserAddresses');
    }
    const addresses = ((_c = (_b = (_a = matched === null || matched === void 0 ? void 0 : matched.props) === null || _a === void 0 ? void 0 : _a.calendarUserAddressSet) === null || _b === void 0 ? void 0 : _b.href) === null || _c === void 0 ? void 0 : _c.filter(Boolean)) || [];
    debug$3(`Fetched calendar user addresses ${addresses}`);
    return addresses;
};
const calendarQuery = async (params) => {
    const { url, props, filters, timezone, depth, headers, headersToExclude, fetchOptions = {}, } = params;
    return collectionQuery({
        url,
        body: {
            'calendar-query': cleanupFalsy({
                _attributes: getDAVAttribute([
                    DAVNamespace.CALDAV,
                    DAVNamespace.CALENDAR_SERVER,
                    DAVNamespace.CALDAV_APPLE,
                    DAVNamespace.DAV,
                ]),
                [`${DAVNamespaceShort.DAV}:prop`]: props,
                filter: filters,
                timezone,
            }),
        },
        defaultNamespace: DAVNamespaceShort.CALDAV,
        depth,
        headers: excludeHeaders(headers, headersToExclude),
        fetchOptions,
    });
};
const calendarMultiGet = async (params) => {
    const { url, props, objectUrls, filters, timezone, depth, headers, headersToExclude, fetchOptions = {}, } = params;
    return collectionQuery({
        url,
        body: {
            'calendar-multiget': cleanupFalsy({
                _attributes: getDAVAttribute([DAVNamespace.DAV, DAVNamespace.CALDAV]),
                [`${DAVNamespaceShort.DAV}:prop`]: props,
                [`${DAVNamespaceShort.DAV}:href`]: objectUrls,
                filter: filters,
                timezone,
            }),
        },
        defaultNamespace: DAVNamespaceShort.CALDAV,
        depth,
        headers: excludeHeaders(headers, headersToExclude),
        fetchOptions,
    });
};
const makeCalendar = async (params) => {
    const { url, props, depth, headers, headersToExclude, fetchOptions = {} } = params;
    return davRequest({
        url,
        init: {
            method: 'MKCALENDAR',
            headers: excludeHeaders(cleanupFalsy({ depth, ...headers }), headersToExclude),
            namespace: DAVNamespaceShort.DAV,
            body: {
                [`${DAVNamespaceShort.CALDAV}:mkcalendar`]: {
                    _attributes: getDAVAttribute([
                        DAVNamespace.DAV,
                        DAVNamespace.CALDAV,
                        DAVNamespace.CALDAV_APPLE,
                    ]),
                    set: {
                        prop: props,
                    },
                },
            },
        },
        fetchOptions,
    });
};
const fetchCalendars = async (params) => {
    const { headers, account, props: customProps, projectedProps, headersToExclude, fetchOptions = {}, } = params !== null && params !== void 0 ? params : {};
    const requiredFields = ['homeUrl', 'rootUrl'];
    if (!account || !hasFields(account, requiredFields)) {
        if (!account) {
            throw new Error('no account for fetchCalendars');
        }
        throw new Error(`account must have ${findMissingFieldNames(account, requiredFields)} before fetchCalendars`);
    }
    const res = await propfind({
        url: account.homeUrl,
        props: customProps !== null && customProps !== void 0 ? customProps : {
            [`${DAVNamespaceShort.CALDAV}:calendar-description`]: {},
            [`${DAVNamespaceShort.CALDAV}:calendar-timezone`]: {},
            [`${DAVNamespaceShort.DAV}:displayname`]: {},
            [`${DAVNamespaceShort.CALDAV_APPLE}:calendar-color`]: {},
            [`${DAVNamespaceShort.CALENDAR_SERVER}:getctag`]: {},
            [`${DAVNamespaceShort.DAV}:resourcetype`]: {},
            [`${DAVNamespaceShort.CALDAV}:supported-calendar-component-set`]: {},
            [`${DAVNamespaceShort.DAV}:sync-token`]: {},
        },
        depth: '1',
        headers: excludeHeaders(headers, headersToExclude),
        fetchOptions,
    });
    return Promise.all(res
        .filter((r) => { var _a, _b; return Object.keys((_b = (_a = r.props) === null || _a === void 0 ? void 0 : _a.resourcetype) !== null && _b !== void 0 ? _b : {}).includes('calendar'); })
        .filter((rc) => {
        var _a, _b, _c, _d, _e, _f;
        // filter out none iCal format calendars.
        const components = Array.isArray((_b = (_a = rc.props) === null || _a === void 0 ? void 0 : _a.supportedCalendarComponentSet) === null || _b === void 0 ? void 0 : _b.comp)
            ? (_c = rc.props) === null || _c === void 0 ? void 0 : _c.supportedCalendarComponentSet.comp.map((sc) => sc._attributes.name)
            : [(_f = (_e = (_d = rc.props) === null || _d === void 0 ? void 0 : _d.supportedCalendarComponentSet) === null || _e === void 0 ? void 0 : _e.comp) === null || _f === void 0 ? void 0 : _f._attributes.name];
        return components.some((c) => Object.values(ICALObjects).includes(c));
    })
        .map((rs) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
        // debug(`Found calendar ${rs.props?.displayname}`);
        const description = (_a = rs.props) === null || _a === void 0 ? void 0 : _a.calendarDescription;
        const timezone = (_b = rs.props) === null || _b === void 0 ? void 0 : _b.calendarTimezone;
        return {
            description: typeof description === 'string' ? description : '',
            timezone: typeof timezone === 'string' ? timezone : '',
            url: new URL((_c = rs.href) !== null && _c !== void 0 ? _c : '', (_d = account.rootUrl) !== null && _d !== void 0 ? _d : '').href,
            ctag: (_e = rs.props) === null || _e === void 0 ? void 0 : _e.getctag,
            calendarColor: (_f = rs.props) === null || _f === void 0 ? void 0 : _f.calendarColor,
            displayName: (_h = (_g = rs.props) === null || _g === void 0 ? void 0 : _g.displayname._cdata) !== null && _h !== void 0 ? _h : (_j = rs.props) === null || _j === void 0 ? void 0 : _j.displayname,
            components: Array.isArray((_k = rs.props) === null || _k === void 0 ? void 0 : _k.supportedCalendarComponentSet.comp)
                ? (_l = rs.props) === null || _l === void 0 ? void 0 : _l.supportedCalendarComponentSet.comp.map((sc) => sc._attributes.name)
                : [(_o = (_m = rs.props) === null || _m === void 0 ? void 0 : _m.supportedCalendarComponentSet.comp) === null || _o === void 0 ? void 0 : _o._attributes.name],
            resourcetype: Object.keys((_p = rs.props) === null || _p === void 0 ? void 0 : _p.resourcetype),
            syncToken: (_q = rs.props) === null || _q === void 0 ? void 0 : _q.syncToken,
            ...conditionalParam('projectedProps', Object.fromEntries(Object.entries((_r = rs.props) !== null && _r !== void 0 ? _r : {}).filter(([key]) => projectedProps === null || projectedProps === void 0 ? void 0 : projectedProps[key]))),
        };
    })
        .map(async (cal) => ({
        ...cal,
        reports: await supportedReportSet({
            collection: cal,
            headers: excludeHeaders(headers, headersToExclude),
            fetchOptions,
        }),
    })));
};
const fetchCalendarObjects = async (params) => {
    const { calendar, objectUrls, filters: customFilters, timeRange, headers, expand, urlFilter = (url) => Boolean(url === null || url === void 0 ? void 0 : url.includes('.ics')), useMultiGet = true, headersToExclude, fetchOptions = {}, } = params;
    if (timeRange) {
        // validate timeRange
        const ISO_8601 = /^\d{4}(-\d\d(-\d\d(T\d\d:\d\d(:\d\d)?(\.\d+)?(([+-]\d\d:\d\d)|Z)?)?)?)?$/i;
        const ISO_8601_FULL = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?(([+-]\d\d:\d\d)|Z)?$/i;
        if ((!ISO_8601.test(timeRange.start) || !ISO_8601.test(timeRange.end)) &&
            (!ISO_8601_FULL.test(timeRange.start) || !ISO_8601_FULL.test(timeRange.end))) {
            throw new Error('invalid timeRange format, not in ISO8601');
        }
    }
    debug$3(`Fetching calendar objects from ${calendar === null || calendar === void 0 ? void 0 : calendar.url}`);
    const requiredFields = ['url'];
    if (!calendar || !hasFields(calendar, requiredFields)) {
        if (!calendar) {
            throw new Error('cannot fetchCalendarObjects for undefined calendar');
        }
        throw new Error(`calendar must have ${findMissingFieldNames(calendar, requiredFields)} before fetchCalendarObjects`);
    }
    // default to fetch all
    const filters = customFilters !== null && customFilters !== void 0 ? customFilters : [
        {
            'comp-filter': {
                _attributes: {
                    name: 'VCALENDAR',
                },
                'comp-filter': {
                    _attributes: {
                        name: 'VEVENT',
                    },
                    ...(timeRange
                        ? {
                            'time-range': {
                                _attributes: {
                                    start: `${new Date(timeRange.start)
                                        .toISOString()
                                        .slice(0, 19)
                                        .replace(/[-:.]/g, '')}Z`,
                                    end: `${new Date(timeRange.end)
                                        .toISOString()
                                        .slice(0, 19)
                                        .replace(/[-:.]/g, '')}Z`,
                                },
                            },
                        }
                        : {}),
                },
            },
        },
    ];
    const calendarObjectUrls = (objectUrls !== null && objectUrls !== void 0 ? objectUrls : 
    // fetch all objects of the calendar
    (await calendarQuery({
        url: calendar.url,
        props: {
            [`${DAVNamespaceShort.DAV}:getetag`]: {
                ...(expand && timeRange
                    ? {
                        [`${DAVNamespaceShort.CALDAV}:expand`]: {
                            _attributes: {
                                start: `${new Date(timeRange.start)
                                    .toISOString()
                                    .slice(0, 19)
                                    .replace(/[-:.]/g, '')}Z`,
                                end: `${new Date(timeRange.end)
                                    .toISOString()
                                    .slice(0, 19)
                                    .replace(/[-:.]/g, '')}Z`,
                            },
                        },
                    }
                    : {}),
            },
        },
        filters,
        depth: '1',
        headers: excludeHeaders(headers, headersToExclude),
        fetchOptions,
    })).map((res) => { var _a; return (_a = res.href) !== null && _a !== void 0 ? _a : ''; }))
        .map((url) => (url.startsWith('http') || !url ? url : new URL(url, calendar.url).href)) // patch up to full url if url is not full
        .filter(urlFilter) // custom filter function on calendar objects
        .map((url) => new URL(url).pathname); // obtain pathname of the url
    let calendarObjectResults = [];
    if (calendarObjectUrls.length > 0) {
        if (!useMultiGet || expand) {
            calendarObjectResults = await calendarQuery({
                url: calendar.url,
                props: {
                    [`${DAVNamespaceShort.DAV}:getetag`]: {},
                    [`${DAVNamespaceShort.CALDAV}:calendar-data`]: {
                        ...(expand && timeRange
                            ? {
                                [`${DAVNamespaceShort.CALDAV}:expand`]: {
                                    _attributes: {
                                        start: `${new Date(timeRange.start)
                                            .toISOString()
                                            .slice(0, 19)
                                            .replace(/[-:.]/g, '')}Z`,
                                        end: `${new Date(timeRange.end)
                                            .toISOString()
                                            .slice(0, 19)
                                            .replace(/[-:.]/g, '')}Z`,
                                    },
                                },
                            }
                            : {}),
                    },
                },
                filters,
                depth: '1',
                headers: excludeHeaders(headers, headersToExclude),
                fetchOptions,
            });
        }
        else {
            calendarObjectResults = await calendarMultiGet({
                url: calendar.url,
                props: {
                    [`${DAVNamespaceShort.DAV}:getetag`]: {},
                    [`${DAVNamespaceShort.CALDAV}:calendar-data`]: {
                        ...(expand && timeRange
                            ? {
                                [`${DAVNamespaceShort.CALDAV}:expand`]: {
                                    _attributes: {
                                        start: `${new Date(timeRange.start)
                                            .toISOString()
                                            .slice(0, 19)
                                            .replace(/[-:.]/g, '')}Z`,
                                        end: `${new Date(timeRange.end)
                                            .toISOString()
                                            .slice(0, 19)
                                            .replace(/[-:.]/g, '')}Z`,
                                    },
                                },
                            }
                            : {}),
                    },
                },
                objectUrls: calendarObjectUrls,
                depth: '1',
                headers: excludeHeaders(headers, headersToExclude),
                fetchOptions,
            });
        }
    }
    return calendarObjectResults.map((res) => {
        var _a, _b, _c, _d, _e, _f;
        return ({
            url: new URL((_a = res.href) !== null && _a !== void 0 ? _a : '', calendar.url).href,
            etag: `${(_b = res.props) === null || _b === void 0 ? void 0 : _b.getetag}`,
            data: (_e = (_d = (_c = res.props) === null || _c === void 0 ? void 0 : _c.calendarData) === null || _d === void 0 ? void 0 : _d._cdata) !== null && _e !== void 0 ? _e : (_f = res.props) === null || _f === void 0 ? void 0 : _f.calendarData,
        });
    });
};
const createCalendarObject = async (params) => {
    const { calendar, iCalString, filename, headers, headersToExclude, fetchOptions = {} } = params;
    return createObject({
        url: new URL(filename, calendar.url).href,
        data: iCalString,
        headers: excludeHeaders({
            'content-type': 'text/calendar; charset=utf-8',
            'If-None-Match': '*',
            ...headers,
        }, headersToExclude),
        fetchOptions,
    });
};
const updateCalendarObject = async (params) => {
    const { calendarObject, headers, headersToExclude, fetchOptions = {} } = params;
    return updateObject({
        url: calendarObject.url,
        data: calendarObject.data,
        etag: calendarObject.etag,
        headers: excludeHeaders({
            'content-type': 'text/calendar; charset=utf-8',
            ...headers,
        }, headersToExclude),
        fetchOptions,
    });
};
const deleteCalendarObject = async (params) => {
    const { calendarObject, headers, headersToExclude, fetchOptions = {} } = params;
    return deleteObject({
        url: calendarObject.url,
        etag: calendarObject.etag,
        headers: excludeHeaders(headers, headersToExclude),
        fetchOptions,
    });
};
/**
 * Sync remote calendars to local
 */
const syncCalendars = async (params) => {
    var _a;
    const { oldCalendars, account, detailedResult, headers, headersToExclude, fetchOptions = {}, } = params;
    if (!account) {
        throw new Error('Must have account before syncCalendars');
    }
    const localCalendars = (_a = oldCalendars !== null && oldCalendars !== void 0 ? oldCalendars : account.calendars) !== null && _a !== void 0 ? _a : [];
    const remoteCalendars = await fetchCalendars({
        account,
        headers: excludeHeaders(headers, headersToExclude),
        fetchOptions,
    });
    // no existing url
    const created = remoteCalendars.filter((rc) => localCalendars.every((lc) => !urlContains(lc.url, rc.url)));
    debug$3(`new calendars: ${created.map((cc) => cc.displayName)}`);
    // have same url, but syncToken/ctag different
    const updated = localCalendars.reduce((prev, curr) => {
        const found = remoteCalendars.find((rc) => urlContains(rc.url, curr.url));
        if (found &&
            ((found.syncToken && `${found.syncToken}` !== `${curr.syncToken}`) ||
                (found.ctag && `${found.ctag}` !== `${curr.ctag}`))) {
            return [...prev, found];
        }
        return prev;
    }, []);
    debug$3(`updated calendars: ${updated.map((cc) => cc.displayName)}`);
    const updatedWithObjects = await Promise.all(updated.map(async (u) => {
        const result = await smartCollectionSync({
            collection: { ...u, objectMultiGet: calendarMultiGet },
            method: 'webdav',
            headers: excludeHeaders(headers, headersToExclude),
            account,
            fetchOptions,
        });
        return result;
    }));
    // does not present in remote
    const deleted = localCalendars.filter((cal) => remoteCalendars.every((rc) => !urlContains(rc.url, cal.url)));
    debug$3(`deleted calendars: ${deleted.map((cc) => cc.displayName)}`);
    const unchanged = localCalendars.filter((cal) => remoteCalendars.some((rc) => urlContains(rc.url, cal.url) &&
        ((rc.syncToken && `${rc.syncToken}` !== `${cal.syncToken}`) ||
            (rc.ctag && `${rc.ctag}` !== `${cal.ctag}`))));
    // debug(`unchanged calendars: ${unchanged.map((cc) => cc.displayName)}`);
    return detailedResult
        ? {
            created,
            updated,
            deleted,
        }
        : [...unchanged, ...created, ...updatedWithObjects];
};
const freeBusyQuery = async (params) => {
    const { url, timeRange, depth, headers, headersToExclude, fetchOptions = {} } = params;
    if (timeRange) {
        // validate timeRange
        const ISO_8601 = /^\d{4}(-\d\d(-\d\d(T\d\d:\d\d(:\d\d)?(\.\d+)?(([+-]\d\d:\d\d)|Z)?)?)?)?$/i;
        const ISO_8601_FULL = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?(([+-]\d\d:\d\d)|Z)?$/i;
        if ((!ISO_8601.test(timeRange.start) || !ISO_8601.test(timeRange.end)) &&
            (!ISO_8601_FULL.test(timeRange.start) || !ISO_8601_FULL.test(timeRange.end))) {
            throw new Error('invalid timeRange format, not in ISO8601');
        }
    }
    else {
        throw new Error('timeRange is required');
    }
    const result = await collectionQuery({
        url,
        body: {
            'free-busy-query': cleanupFalsy({
                _attributes: getDAVAttribute([DAVNamespace.CALDAV]),
                [`${DAVNamespaceShort.CALDAV}:time-range`]: {
                    _attributes: {
                        start: `${new Date(timeRange.start).toISOString().slice(0, 19).replace(/[-:.]/g, '')}Z`,
                        end: `${new Date(timeRange.end).toISOString().slice(0, 19).replace(/[-:.]/g, '')}Z`,
                    },
                },
            }),
        },
        defaultNamespace: DAVNamespaceShort.CALDAV,
        depth,
        headers: excludeHeaders(headers, headersToExclude),
        fetchOptions,
    });
    return result[0];
};

var calendar = /*#__PURE__*/Object.freeze({
	__proto__: null,
	calendarMultiGet: calendarMultiGet,
	calendarQuery: calendarQuery,
	createCalendarObject: createCalendarObject,
	deleteCalendarObject: deleteCalendarObject,
	fetchCalendarObjects: fetchCalendarObjects,
	fetchCalendarUserAddresses: fetchCalendarUserAddresses,
	fetchCalendars: fetchCalendars,
	freeBusyQuery: freeBusyQuery,
	makeCalendar: makeCalendar,
	syncCalendars: syncCalendars,
	updateCalendarObject: updateCalendarObject
});

const debug$2 = getLogger('tsdav:account');
const serviceDiscovery = async (params) => {
    var _a, _b;
    debug$2('Service discovery...');
    const { account, headers, headersToExclude, fetchOptions = {} } = params;
    const endpoint = new URL(account.serverUrl);
    const uri = new URL(`/.well-known/${account.accountType}`, endpoint);
    uri.protocol = (_a = endpoint.protocol) !== null && _a !== void 0 ? _a : 'http';
    try {
        const response = await browserPonyfillExports.fetch(uri.href, {
            headers: excludeHeaders(headers, headersToExclude),
            method: 'PROPFIND',
            redirect: 'manual',
            ...fetchOptions,
        });
        if (response.status >= 300 && response.status < 400) {
            // http redirect.
            const location = response.headers.get('Location');
            if (typeof location === 'string' && location.length) {
                debug$2(`Service discovery redirected to ${location}`);
                const serviceURL = new URL(location, endpoint);
                if (serviceURL.hostname === uri.hostname && uri.port && !serviceURL.port) {
                    serviceURL.port = uri.port;
                }
                serviceURL.protocol = (_b = endpoint.protocol) !== null && _b !== void 0 ? _b : 'http';
                return serviceURL.href;
            }
        }
    }
    catch (err) {
        debug$2(`Service discovery failed: ${err.stack}`);
    }
    return endpoint.href;
};
const fetchPrincipalUrl = async (params) => {
    var _a, _b, _c, _d, _e;
    const { account, headers, headersToExclude, fetchOptions = {} } = params;
    const requiredFields = ['rootUrl'];
    if (!hasFields(account, requiredFields)) {
        throw new Error(`account must have ${findMissingFieldNames(account, requiredFields)} before fetchPrincipalUrl`);
    }
    debug$2(`Fetching principal url from path ${account.rootUrl}`);
    const [response] = await propfind({
        url: account.rootUrl,
        props: {
            [`${DAVNamespaceShort.DAV}:current-user-principal`]: {},
        },
        depth: '0',
        headers: excludeHeaders(headers, headersToExclude),
        fetchOptions,
    });
    if (!response.ok) {
        debug$2(`Fetch principal url failed: ${response.statusText}`);
        if (response.status === 401) {
            throw new Error('Invalid credentials');
        }
    }
    debug$2(`Fetched principal url ${(_b = (_a = response.props) === null || _a === void 0 ? void 0 : _a.currentUserPrincipal) === null || _b === void 0 ? void 0 : _b.href}`);
    return new URL((_e = (_d = (_c = response.props) === null || _c === void 0 ? void 0 : _c.currentUserPrincipal) === null || _d === void 0 ? void 0 : _d.href) !== null && _e !== void 0 ? _e : '', account.rootUrl).href;
};
const fetchHomeUrl = async (params) => {
    var _a, _b;
    const { account, headers, headersToExclude, fetchOptions = {} } = params;
    const requiredFields = ['principalUrl', 'rootUrl'];
    if (!hasFields(account, requiredFields)) {
        throw new Error(`account must have ${findMissingFieldNames(account, requiredFields)} before fetchHomeUrl`);
    }
    debug$2(`Fetch home url from ${account.principalUrl}`);
    const responses = await propfind({
        url: account.principalUrl,
        props: account.accountType === 'caldav'
            ? { [`${DAVNamespaceShort.CALDAV}:calendar-home-set`]: {} }
            : { [`${DAVNamespaceShort.CARDDAV}:addressbook-home-set`]: {} },
        depth: '0',
        headers: excludeHeaders(headers, headersToExclude),
        fetchOptions,
    });
    const matched = responses.find((r) => urlContains(account.principalUrl, r.href));
    if (!matched || !matched.ok) {
        debug$2(`Fetch home url failed with status ${matched === null || matched === void 0 ? void 0 : matched.statusText} and error ${JSON.stringify(responses.map((r) => r.error))}`);
        throw new Error('cannot find homeUrl');
    }
    const result = new URL(account.accountType === 'caldav'
        ? (_a = matched === null || matched === void 0 ? void 0 : matched.props) === null || _a === void 0 ? void 0 : _a.calendarHomeSet.href
        : (_b = matched === null || matched === void 0 ? void 0 : matched.props) === null || _b === void 0 ? void 0 : _b.addressbookHomeSet.href, account.rootUrl).href;
    debug$2(`Fetched home url ${result}`);
    return result;
};
const createAccount = async (params) => {
    const { account, headers, loadCollections = false, loadObjects = false, headersToExclude, fetchOptions = {}, } = params;
    const newAccount = { ...account };
    newAccount.rootUrl = await serviceDiscovery({
        account,
        headers: excludeHeaders(headers, headersToExclude),
        fetchOptions,
    });
    newAccount.principalUrl = await fetchPrincipalUrl({
        account: newAccount,
        headers: excludeHeaders(headers, headersToExclude),
        fetchOptions,
    });
    newAccount.homeUrl = await fetchHomeUrl({
        account: newAccount,
        headers: excludeHeaders(headers, headersToExclude),
        fetchOptions,
    });
    // to load objects you must first load collections
    if (loadCollections || loadObjects) {
        if (account.accountType === 'caldav') {
            newAccount.calendars = await fetchCalendars({
                headers: excludeHeaders(headers, headersToExclude),
                account: newAccount,
                fetchOptions,
            });
        }
        else if (account.accountType === 'carddav') {
            newAccount.addressBooks = await fetchAddressBooks({
                headers: excludeHeaders(headers, headersToExclude),
                account: newAccount,
                fetchOptions,
            });
        }
    }
    if (loadObjects) {
        if (account.accountType === 'caldav' && newAccount.calendars) {
            newAccount.calendars = await Promise.all(newAccount.calendars.map(async (cal) => ({
                ...cal,
                objects: await fetchCalendarObjects({
                    calendar: cal,
                    headers: excludeHeaders(headers, headersToExclude),
                    fetchOptions,
                }),
            })));
        }
        else if (account.accountType === 'carddav' && newAccount.addressBooks) {
            newAccount.addressBooks = await Promise.all(newAccount.addressBooks.map(async (addr) => ({
                ...addr,
                objects: await fetchVCards({
                    addressBook: addr,
                    headers: excludeHeaders(headers, headersToExclude),
                    fetchOptions,
                }),
            })));
        }
    }
    return newAccount;
};

var account = /*#__PURE__*/Object.freeze({
	__proto__: null,
	createAccount: createAccount,
	fetchHomeUrl: fetchHomeUrl,
	fetchPrincipalUrl: fetchPrincipalUrl,
	serviceDiscovery: serviceDiscovery
});

/* eslint-disable no-underscore-dangle */
const debug$1 = getLogger('tsdav:todo');
/**
 * Helper function to build expand property for calendar-data
 */
const buildExpandProp = (timeRange) => ({
    [`${DAVNamespaceShort.CALDAV}:expand`]: {
        _attributes: {
            start: `${new Date(timeRange.start).toISOString().slice(0, 19).replace(/[-:.]/g, '')}Z`,
            end: `${new Date(timeRange.end).toISOString().slice(0, 19).replace(/[-:.]/g, '')}Z`,
        },
    },
});
/**
 * Query todos using CalDAV REPORT calendar-query
 *
 * @param params.url - Calendar URL to query
 * @param params.props - Properties to request
 * @param params.filters - Optional CalDAV filters
 * @param params.timezone - Optional timezone
 * @param params.depth - Depth header value
 * @param params.headers - Request headers
 * @param params.headersToExclude - Headers to exclude
 * @param params.fetchOptions - Fetch options
 * @returns Array of DAV responses
 */
const todoQuery = async (params) => {
    const { url, props, filters, timezone, depth, headers, headersToExclude, fetchOptions = {}, } = params;
    return collectionQuery({
        url,
        body: {
            'calendar-query': cleanupFalsy({
                _attributes: getDAVAttribute([
                    DAVNamespace.CALDAV,
                    DAVNamespace.CALENDAR_SERVER,
                    DAVNamespace.CALDAV_APPLE,
                    DAVNamespace.DAV,
                ]),
                [`${DAVNamespaceShort.DAV}:prop`]: props,
                filter: filters,
                timezone,
            }),
        },
        defaultNamespace: DAVNamespaceShort.CALDAV,
        depth,
        headers: excludeHeaders(headers, headersToExclude),
        fetchOptions,
    });
};
/**
 * Fetch multiple todos by URL using CalDAV calendar-multiget
 *
 * @param params.url - Calendar URL
 * @param params.props - Properties to request
 * @param params.objectUrls - Array of todo object URLs to fetch
 * @param params.timezone - Optional timezone
 * @param params.depth - Depth header value
 * @param params.filters - Optional CalDAV filters
 * @param params.headers - Request headers
 * @param params.headersToExclude - Headers to exclude
 * @param params.fetchOptions - Fetch options
 * @returns Array of DAV responses
 */
const todoMultiGet = async (params) => {
    const { url, props, objectUrls, filters, timezone, depth, headers, headersToExclude, fetchOptions = {}, } = params;
    return collectionQuery({
        url,
        body: {
            'calendar-multiget': cleanupFalsy({
                _attributes: getDAVAttribute([DAVNamespace.DAV, DAVNamespace.CALDAV]),
                [`${DAVNamespaceShort.DAV}:prop`]: props,
                [`${DAVNamespaceShort.DAV}:href`]: objectUrls,
                filter: filters,
                timezone,
            }),
        },
        defaultNamespace: DAVNamespaceShort.CALDAV,
        depth,
        headers: excludeHeaders(headers, headersToExclude),
        fetchOptions,
    });
};
/**
 * Fetch VTODO objects from a CalDAV calendar with optional filtering
 *
 * @param params.calendar - Calendar to fetch todos from
 * @param params.objectUrls - Optional array of specific todo URLs to fetch
 * @param params.filters - Optional custom CalDAV filters
 * @param params.timeRange - Optional time range filter in ISO8601 format
 * @param params.expand - Whether to expand recurring todos
 * @param params.urlFilter - Custom filter function for todo object URLs
 * @param params.headers - Request headers
 * @param params.headersToExclude - Headers to exclude
 * @param params.useMultiGet - Whether to use multiget (default: true)
 * @param params.fetchOptions - Fetch options
 * @returns Array of todo objects with url, etag, and iCalendar data
 * @throws Error if calendar URL is missing or timeRange format is invalid
 */
const fetchTodos = async (params) => {
    const { calendar, objectUrls, filters: customFilters, timeRange, headers, expand, urlFilter = defaultIcsFilter, useMultiGet = true, headersToExclude, fetchOptions = {}, } = params;
    if (timeRange) {
        validateISO8601TimeRange(timeRange.start, timeRange.end);
    }
    debug$1(`Fetching todo objects from ${calendar === null || calendar === void 0 ? void 0 : calendar.url}`);
    const requiredFields = ['url'];
    if (!calendar || !hasFields(calendar, requiredFields)) {
        if (!calendar) {
            throw new Error('cannot fetchTodos for undefined calendar');
        }
        throw new Error(`calendar must have ${findMissingFieldNames(calendar, requiredFields)} before fetchTodos`);
    }
    // Build CalDAV filter for VTODO components
    // Structure: VCALENDAR -> VTODO -> optional time-range
    const filters = customFilters !== null && customFilters !== void 0 ? customFilters : [
        {
            'comp-filter': {
                _attributes: {
                    name: 'VCALENDAR',
                },
                'comp-filter': {
                    _attributes: {
                        name: 'VTODO',
                    },
                    ...(timeRange
                        ? {
                            'time-range': {
                                _attributes: {
                                    start: `${new Date(timeRange.start)
                                        .toISOString()
                                        .slice(0, 19)
                                        .replace(/[-:.]/g, '')}Z`,
                                    end: `${new Date(timeRange.end)
                                        .toISOString()
                                        .slice(0, 19)
                                        .replace(/[-:.]/g, '')}Z`,
                                },
                            },
                        }
                        : {}),
                },
            },
        },
    ];
    const todoObjectUrls = (objectUrls !== null && objectUrls !== void 0 ? objectUrls : 
    // fetch all todo objects of the calendar
    (await todoQuery({
        url: calendar.url,
        props: {
            [`${DAVNamespaceShort.DAV}:getetag`]: {
                ...(expand && timeRange ? buildExpandProp(timeRange) : {}),
            },
        },
        filters,
        depth: '1',
        headers: excludeHeaders(headers, headersToExclude),
        fetchOptions,
    })).map((res) => { var _a; return (_a = res.href) !== null && _a !== void 0 ? _a : ''; }))
        .map((url) => (url.startsWith('http') || !url ? url : new URL(url, calendar.url).href))
        .filter(urlFilter)
        .map((url) => new URL(url).pathname);
    let todoObjectResults = [];
    if (todoObjectUrls.length > 0) {
        if (!useMultiGet || expand) {
            todoObjectResults = await todoQuery({
                url: calendar.url,
                props: {
                    [`${DAVNamespaceShort.DAV}:getetag`]: {},
                    [`${DAVNamespaceShort.CALDAV}:calendar-data`]: {
                        ...(expand && timeRange ? buildExpandProp(timeRange) : {}),
                    },
                },
                filters,
                depth: '1',
                headers: excludeHeaders(headers, headersToExclude),
                fetchOptions,
            });
        }
        else {
            todoObjectResults = await todoMultiGet({
                url: calendar.url,
                props: {
                    [`${DAVNamespaceShort.DAV}:getetag`]: {},
                    [`${DAVNamespaceShort.CALDAV}:calendar-data`]: {
                        ...(expand && timeRange ? buildExpandProp(timeRange) : {}),
                    },
                },
                objectUrls: todoObjectUrls,
                depth: '1',
                headers: excludeHeaders(headers, headersToExclude),
                fetchOptions,
            });
        }
    }
    return todoObjectResults.map((res) => {
        var _a, _b, _c, _d, _e, _f;
        return ({
            url: new URL((_a = res.href) !== null && _a !== void 0 ? _a : '', calendar.url).href,
            etag: `${(_b = res.props) === null || _b === void 0 ? void 0 : _b.getetag}`,
            data: (_e = (_d = (_c = res.props) === null || _c === void 0 ? void 0 : _c.calendarData) === null || _d === void 0 ? void 0 : _d._cdata) !== null && _e !== void 0 ? _e : (_f = res.props) === null || _f === void 0 ? void 0 : _f.calendarData,
        });
    });
};
/**
 * Create a new VTODO object in a CalDAV calendar
 *
 * @param params.calendar - Calendar to create the todo in
 * @param params.iCalString - iCalendar data string (must contain UID)
 * @param params.filename - Filename for the todo object
 * @param params.headers - Request headers
 * @param params.headersToExclude - Headers to exclude
 * @param params.fetchOptions - Fetch options
 * @returns Response from the server
 * @throws Error if iCalString does not contain a UID
 */
const createTodo = async (params) => {
    const { calendar, iCalString, filename, headers, headersToExclude, fetchOptions = {} } = params;
    if (!iCalString.includes('UID:')) {
        throw new Error('iCalString must contain a UID');
    }
    return createObject({
        url: new URL(filename, calendar.url).href,
        data: iCalString,
        headers: excludeHeaders({
            'content-type': 'text/calendar; charset=utf-8',
            'If-None-Match': '*',
            ...headers,
        }, headersToExclude),
        fetchOptions,
    });
};
/**
 * Update an existing VTODO object in a CalDAV calendar
 *
 * @param params.calendarObject - Todo object to update (must have etag)
 * @param params.headers - Request headers
 * @param params.headersToExclude - Headers to exclude
 * @param params.fetchOptions - Fetch options
 * @returns Response from the server
 * @throws Error if calendarObject does not have an etag
 */
const updateTodo = async (params) => {
    const { calendarObject, headers, headersToExclude, fetchOptions = {} } = params;
    if (!calendarObject.etag) {
        throw new Error('calendarObject must have etag for update - fetch todo first');
    }
    return updateObject({
        url: calendarObject.url,
        data: calendarObject.data,
        etag: calendarObject.etag,
        headers: excludeHeaders({
            'content-type': 'text/calendar; charset=utf-8',
            ...headers,
        }, headersToExclude),
        fetchOptions,
    });
};
/**
 * Delete a VTODO object from a CalDAV calendar
 *
 * @param params.calendarObject - Todo object to delete
 * @param params.headers - Request headers
 * @param params.headersToExclude - Headers to exclude
 * @param params.fetchOptions - Fetch options
 * @returns Response from the server
 */
const deleteTodo = async (params) => {
    const { calendarObject, headers, headersToExclude, fetchOptions = {} } = params;
    return deleteObject({
        url: calendarObject.url,
        etag: calendarObject.etag,
        headers: excludeHeaders(headers, headersToExclude),
        fetchOptions,
    });
};

var todo = /*#__PURE__*/Object.freeze({
	__proto__: null,
	createTodo: createTodo,
	deleteTodo: deleteTodo,
	fetchTodos: fetchTodos,
	todoMultiGet: todoMultiGet,
	todoQuery: todoQuery,
	updateTodo: updateTodo
});

var base64$1 = {exports: {}};

/*! https://mths.be/base64 v1.0.0 by @mathias | MIT license */
var base64 = base64$1.exports;

var hasRequiredBase64;

function requireBase64 () {
	if (hasRequiredBase64) return base64$1.exports;
	hasRequiredBase64 = 1;
	(function (module, exports) {
(function(root) {

			// Detect free variables `exports`.
			var freeExports = exports;

			// Detect free variable `module`.
			var freeModule = module &&
				module.exports == freeExports && module;

			// Detect free variable `global`, from Node.js or Browserified code, and use
			// it as `root`.
			var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal;
			if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
				root = freeGlobal;
			}

			/*--------------------------------------------------------------------------*/

			var InvalidCharacterError = function(message) {
				this.message = message;
			};
			InvalidCharacterError.prototype = new Error;
			InvalidCharacterError.prototype.name = 'InvalidCharacterError';

			var error = function(message) {
				// Note: the error messages used throughout this file match those used by
				// the native `atob`/`btoa` implementation in Chromium.
				throw new InvalidCharacterError(message);
			};

			var TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
			// http://whatwg.org/html/common-microsyntaxes.html#space-character
			var REGEX_SPACE_CHARACTERS = /[\t\n\f\r ]/g;

			// `decode` is designed to be fully compatible with `atob` as described in the
			// HTML Standard. http://whatwg.org/html/webappapis.html#dom-windowbase64-atob
			// The optimized base64-decoding algorithm used is based on @atk’s excellent
			// implementation. https://gist.github.com/atk/1020396
			var decode = function(input) {
				input = String(input)
					.replace(REGEX_SPACE_CHARACTERS, '');
				var length = input.length;
				if (length % 4 == 0) {
					input = input.replace(/==?$/, '');
					length = input.length;
				}
				if (
					length % 4 == 1 ||
					// http://whatwg.org/C#alphanumeric-ascii-characters
					/[^+a-zA-Z0-9/]/.test(input)
				) {
					error(
						'Invalid character: the string to be decoded is not correctly encoded.'
					);
				}
				var bitCounter = 0;
				var bitStorage;
				var buffer;
				var output = '';
				var position = -1;
				while (++position < length) {
					buffer = TABLE.indexOf(input.charAt(position));
					bitStorage = bitCounter % 4 ? bitStorage * 64 + buffer : buffer;
					// Unless this is the first of a group of 4 characters…
					if (bitCounter++ % 4) {
						// …convert the first 8 bits to a single ASCII character.
						output += String.fromCharCode(
							0xFF & bitStorage >> (-2 * bitCounter & 6)
						);
					}
				}
				return output;
			};

			// `encode` is designed to be fully compatible with `btoa` as described in the
			// HTML Standard: http://whatwg.org/html/webappapis.html#dom-windowbase64-btoa
			var encode = function(input) {
				input = String(input);
				if (/[^\0-\xFF]/.test(input)) {
					// Note: no need to special-case astral symbols here, as surrogates are
					// matched, and the input is supposed to only contain ASCII anyway.
					error(
						'The string to be encoded contains characters outside of the ' +
						'Latin1 range.'
					);
				}
				var padding = input.length % 3;
				var output = '';
				var position = -1;
				var a;
				var b;
				var c;
				var buffer;
				// Make sure any padding is handled outside of the loop.
				var length = input.length - padding;

				while (++position < length) {
					// Read three bytes, i.e. 24 bits.
					a = input.charCodeAt(position) << 16;
					b = input.charCodeAt(++position) << 8;
					c = input.charCodeAt(++position);
					buffer = a + b + c;
					// Turn the 24 bits into four chunks of 6 bits each, and append the
					// matching character for each of them to the output.
					output += (
						TABLE.charAt(buffer >> 18 & 0x3F) +
						TABLE.charAt(buffer >> 12 & 0x3F) +
						TABLE.charAt(buffer >> 6 & 0x3F) +
						TABLE.charAt(buffer & 0x3F)
					);
				}

				if (padding == 2) {
					a = input.charCodeAt(position) << 8;
					b = input.charCodeAt(++position);
					buffer = a + b;
					output += (
						TABLE.charAt(buffer >> 10) +
						TABLE.charAt((buffer >> 4) & 0x3F) +
						TABLE.charAt((buffer << 2) & 0x3F) +
						'='
					);
				} else if (padding == 1) {
					buffer = input.charCodeAt(position);
					output += (
						TABLE.charAt(buffer >> 2) +
						TABLE.charAt((buffer << 4) & 0x3F) +
						'=='
					);
				}

				return output;
			};

			var base64 = {
				'encode': encode,
				'decode': decode,
				'version': '1.0.0'
			};

			// Some AMD build optimizers, like r.js, check for specific condition patterns
			// like the following:
			if (freeExports && !freeExports.nodeType) {
				if (freeModule) { // in Node.js or RingoJS v0.8.0+
					freeModule.exports = base64;
				} else { // in Narwhal or RingoJS v0.7.0-
					for (var key in base64) {
						base64.hasOwnProperty(key) && (freeExports[key] = base64[key]);
					}
				}
			} else { // in Rhino or a web browser
				root.base64 = base64;
			}

		}(base64)); 
	} (base64$1, base64$1.exports));
	return base64$1.exports;
}

var base64Exports = requireBase64();

const debug = getLogger('tsdav:authHelper');
/**
 * Provide given params as default params to given function with optional params.
 *
 * suitable only for one param functions
 * params are shallow merged
 */
const defaultParam = (fn, params) => (...args) => {
    return fn({ ...params, ...args[0] });
};
const getBasicAuthHeaders = (credentials) => {
    debug(`Basic auth token generated: ${base64Exports.encode(`${credentials.username}:${credentials.password}`)}`);
    return {
        authorization: `Basic ${base64Exports.encode(`${credentials.username}:${credentials.password}`)}`,
    };
};
const fetchOauthTokens = async (credentials, fetchOptions) => {
    const requireFields = [
        'authorizationCode',
        'redirectUrl',
        'clientId',
        'clientSecret',
        'tokenUrl',
    ];
    if (!hasFields(credentials, requireFields)) {
        throw new Error(`Oauth credentials missing: ${findMissingFieldNames(credentials, requireFields)}`);
    }
    const param = new URLSearchParams({
        grant_type: 'authorization_code',
        code: credentials.authorizationCode,
        redirect_uri: credentials.redirectUrl,
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
    });
    debug(credentials.tokenUrl);
    debug(param.toString());
    const response = await browserPonyfillExports.fetch(credentials.tokenUrl, {
        method: 'POST',
        body: param.toString(),
        headers: {
            'content-length': `${param.toString().length}`,
            'content-type': 'application/x-www-form-urlencoded',
        },
        ...(fetchOptions !== null && fetchOptions !== void 0 ? fetchOptions : {}),
    });
    if (response.ok) {
        const tokens = await response.json();
        return tokens;
    }
    debug(`Fetch Oauth tokens failed: ${await response.text()}`);
    return {};
};
const refreshAccessToken = async (credentials, fetchOptions) => {
    const requireFields = [
        'refreshToken',
        'clientId',
        'clientSecret',
        'tokenUrl',
    ];
    if (!hasFields(credentials, requireFields)) {
        throw new Error(`Oauth credentials missing: ${findMissingFieldNames(credentials, requireFields)}`);
    }
    const param = new URLSearchParams({
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
        refresh_token: credentials.refreshToken,
        grant_type: 'refresh_token',
    });
    const response = await browserPonyfillExports.fetch(credentials.tokenUrl, {
        method: 'POST',
        body: param.toString(),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        ...(fetchOptions !== null && fetchOptions !== void 0 ? fetchOptions : {}),
    });
    if (response.ok) {
        const tokens = await response.json();
        return tokens;
    }
    debug(`Refresh access token failed: ${await response.text()}`);
    return {};
};
const getOauthHeaders = async (credentials, fetchOptions) => {
    var _a;
    debug('Fetching oauth headers');
    let tokens = {};
    if (!credentials.refreshToken) {
        // No refresh token, fetch new tokens
        tokens = await fetchOauthTokens(credentials, fetchOptions);
    }
    else if ((credentials.refreshToken && !credentials.accessToken) ||
        Date.now() > ((_a = credentials.expiration) !== null && _a !== void 0 ? _a : 0)) {
        // have refresh token, but no accessToken, fetch access token only
        // or have both, but accessToken was expired
        tokens = await refreshAccessToken(credentials, fetchOptions);
    }
    // now we should have valid access token
    debug(`Oauth tokens fetched: ${tokens.access_token}`);
    return {
        tokens,
        headers: {
            authorization: `Bearer ${tokens.access_token}`,
        },
    };
};

var authHelpers = /*#__PURE__*/Object.freeze({
	__proto__: null,
	defaultParam: defaultParam,
	fetchOauthTokens: fetchOauthTokens,
	getBasicAuthHeaders: getBasicAuthHeaders,
	getOauthHeaders: getOauthHeaders,
	refreshAccessToken: refreshAccessToken
});

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const createDAVClient = async (params) => {
    var _a;
    const { serverUrl, credentials, authMethod, defaultAccountType, authFunction } = params;
    let authHeaders = {};
    switch (authMethod) {
        case 'Basic':
            authHeaders = getBasicAuthHeaders(credentials);
            break;
        case 'Oauth':
            authHeaders = (await getOauthHeaders(credentials)).headers;
            break;
        case 'Digest':
            authHeaders = {
                Authorization: `Digest ${credentials.digestString}`,
            };
            break;
        case 'Custom':
            authHeaders = (_a = (await (authFunction === null || authFunction === void 0 ? void 0 : authFunction(credentials)))) !== null && _a !== void 0 ? _a : {};
            break;
        default:
            throw new Error('Invalid auth method');
    }
    const defaultAccount = defaultAccountType
        ? await createAccount({
            account: { serverUrl, credentials, accountType: defaultAccountType },
            headers: authHeaders,
        })
        : undefined;
    const davRequest$1 = async (params0) => {
        const { init, ...rest } = params0;
        const { headers, ...restInit } = init;
        return davRequest({
            ...rest,
            init: {
                ...restInit,
                headers: {
                    ...authHeaders,
                    ...headers,
                },
            },
        });
    };
    const createObject$1 = defaultParam(createObject, {
        url: serverUrl,
        headers: authHeaders,
    });
    const updateObject$1 = defaultParam(updateObject, { headers: authHeaders, url: serverUrl });
    const deleteObject$1 = defaultParam(deleteObject, { headers: authHeaders, url: serverUrl });
    const propfind$1 = defaultParam(propfind, { headers: authHeaders });
    // account
    const createAccount$1 = async (params0) => {
        const { account, headers, loadCollections, loadObjects } = params0;
        return createAccount({
            account: { serverUrl, credentials, ...account },
            headers: { ...authHeaders, ...headers },
            loadCollections,
            loadObjects,
        });
    };
    // collection
    const collectionQuery$1 = defaultParam(collectionQuery, { headers: authHeaders });
    const makeCollection$1 = defaultParam(makeCollection, { headers: authHeaders });
    const syncCollection$1 = defaultParam(syncCollection, { headers: authHeaders });
    const supportedReportSet$1 = defaultParam(supportedReportSet, {
        headers: authHeaders,
    });
    const isCollectionDirty$1 = defaultParam(isCollectionDirty, {
        headers: authHeaders,
    });
    const smartCollectionSync$1 = defaultParam(smartCollectionSync, {
        headers: authHeaders,
        account: defaultAccount,
    });
    // calendar
    const calendarQuery$1 = defaultParam(calendarQuery, { headers: authHeaders });
    const calendarMultiGet$1 = defaultParam(calendarMultiGet, { headers: authHeaders });
    const makeCalendar$1 = defaultParam(makeCalendar, { headers: authHeaders });
    const fetchCalendars$1 = defaultParam(fetchCalendars, {
        headers: authHeaders,
        account: defaultAccount,
    });
    const fetchCalendarUserAddresses$1 = defaultParam(fetchCalendarUserAddresses, {
        headers: authHeaders,
        account: defaultAccount,
    });
    const fetchCalendarObjects$1 = defaultParam(fetchCalendarObjects, {
        headers: authHeaders,
    });
    const createCalendarObject$1 = defaultParam(createCalendarObject, {
        headers: authHeaders,
    });
    const updateCalendarObject$1 = defaultParam(updateCalendarObject, {
        headers: authHeaders,
    });
    const deleteCalendarObject$1 = defaultParam(deleteCalendarObject, {
        headers: authHeaders,
    });
    const syncCalendars$1 = defaultParam(syncCalendars, {
        account: defaultAccount,
        headers: authHeaders,
    });
    // addressBook
    const addressBookQuery$1 = defaultParam(addressBookQuery, { headers: authHeaders });
    const addressBookMultiGet$1 = defaultParam(addressBookMultiGet, { headers: authHeaders });
    const fetchAddressBooks$1 = defaultParam(fetchAddressBooks, {
        account: defaultAccount,
        headers: authHeaders,
    });
    const fetchVCards$1 = defaultParam(fetchVCards, { headers: authHeaders });
    const createVCard$1 = defaultParam(createVCard, { headers: authHeaders });
    const updateVCard$1 = defaultParam(updateVCard, { headers: authHeaders });
    const deleteVCard$1 = defaultParam(deleteVCard, { headers: authHeaders });
    // todo
    const todoQuery$1 = defaultParam(todoQuery, { headers: authHeaders });
    const todoMultiGet$1 = defaultParam(todoMultiGet, { headers: authHeaders });
    const fetchTodos$1 = defaultParam(fetchTodos, { headers: authHeaders });
    const createTodo$1 = defaultParam(createTodo, { headers: authHeaders });
    const updateTodo$1 = defaultParam(updateTodo, { headers: authHeaders });
    const deleteTodo$1 = defaultParam(deleteTodo, { headers: authHeaders });
    return {
        davRequest: davRequest$1,
        propfind: propfind$1,
        createAccount: createAccount$1,
        createObject: createObject$1,
        updateObject: updateObject$1,
        deleteObject: deleteObject$1,
        calendarQuery: calendarQuery$1,
        addressBookQuery: addressBookQuery$1,
        collectionQuery: collectionQuery$1,
        makeCollection: makeCollection$1,
        calendarMultiGet: calendarMultiGet$1,
        makeCalendar: makeCalendar$1,
        syncCollection: syncCollection$1,
        supportedReportSet: supportedReportSet$1,
        isCollectionDirty: isCollectionDirty$1,
        smartCollectionSync: smartCollectionSync$1,
        fetchCalendars: fetchCalendars$1,
        fetchCalendarUserAddresses: fetchCalendarUserAddresses$1,
        fetchCalendarObjects: fetchCalendarObjects$1,
        createCalendarObject: createCalendarObject$1,
        updateCalendarObject: updateCalendarObject$1,
        deleteCalendarObject: deleteCalendarObject$1,
        syncCalendars: syncCalendars$1,
        fetchAddressBooks: fetchAddressBooks$1,
        addressBookMultiGet: addressBookMultiGet$1,
        fetchVCards: fetchVCards$1,
        createVCard: createVCard$1,
        updateVCard: updateVCard$1,
        deleteVCard: deleteVCard$1,
        todoQuery: todoQuery$1,
        todoMultiGet: todoMultiGet$1,
        fetchTodos: fetchTodos$1,
        createTodo: createTodo$1,
        updateTodo: updateTodo$1,
        deleteTodo: deleteTodo$1,
    };
};
class DAVClient {
    constructor(params) {
        var _a, _b, _c;
        this.serverUrl = params.serverUrl;
        this.credentials = params.credentials;
        this.authMethod = (_a = params.authMethod) !== null && _a !== void 0 ? _a : 'Basic';
        this.accountType = (_b = params.defaultAccountType) !== null && _b !== void 0 ? _b : 'caldav';
        this.authFunction = params.authFunction;
        this.fetchOptions = (_c = params.fetchOptions) !== null && _c !== void 0 ? _c : {};
    }
    async login() {
        var _a;
        switch (this.authMethod) {
            case 'Basic':
                this.authHeaders = getBasicAuthHeaders(this.credentials);
                break;
            case 'Oauth':
                this.authHeaders = (await getOauthHeaders(this.credentials, this.fetchOptions)).headers;
                break;
            case 'Digest':
                this.authHeaders = {
                    Authorization: `Digest ${this.credentials.digestString}`,
                };
                break;
            case 'Custom':
                this.authHeaders = await ((_a = this.authFunction) === null || _a === void 0 ? void 0 : _a.call(this, this.credentials));
                break;
            default:
                throw new Error('Invalid auth method');
        }
        this.account = this.accountType
            ? await createAccount({
                account: {
                    serverUrl: this.serverUrl,
                    credentials: this.credentials,
                    accountType: this.accountType,
                },
                headers: this.authHeaders,
                fetchOptions: this.fetchOptions,
            })
            : undefined;
    }
    async davRequest(params0) {
        const { init, ...rest } = params0;
        const { headers, ...restInit } = init;
        return davRequest({
            ...rest,
            init: {
                ...restInit,
                headers: {
                    ...this.authHeaders,
                    ...headers,
                },
            },
            fetchOptions: this.fetchOptions,
        });
    }
    async createObject(...params) {
        return defaultParam(createObject, {
            url: this.serverUrl,
            headers: this.authHeaders,
            fetchOptions: this.fetchOptions,
        })(params[0]);
    }
    async updateObject(...params) {
        return defaultParam(updateObject, {
            url: this.serverUrl,
            headers: this.authHeaders,
            fetchOptions: this.fetchOptions,
        })(params[0]);
    }
    async deleteObject(...params) {
        return defaultParam(deleteObject, {
            url: this.serverUrl,
            headers: this.authHeaders,
            fetchOptions: this.fetchOptions,
        })(params[0]);
    }
    async propfind(...params) {
        return defaultParam(propfind, { headers: this.authHeaders, fetchOptions: this.fetchOptions })(params[0]);
    }
    async createAccount(params0) {
        const { account, headers, loadCollections, loadObjects, fetchOptions } = params0;
        return createAccount({
            account: { serverUrl: this.serverUrl, credentials: this.credentials, ...account },
            headers: { ...this.authHeaders, ...headers },
            loadCollections,
            loadObjects,
            fetchOptions: fetchOptions !== null && fetchOptions !== void 0 ? fetchOptions : this.fetchOptions,
        });
    }
    async collectionQuery(...params) {
        return defaultParam(collectionQuery, { headers: this.authHeaders, fetchOptions: this.fetchOptions })(params[0]);
    }
    async makeCollection(...params) {
        return defaultParam(makeCollection, { headers: this.authHeaders, fetchOptions: this.fetchOptions })(params[0]);
    }
    async syncCollection(...params) {
        return defaultParam(syncCollection, { headers: this.authHeaders, fetchOptions: this.fetchOptions })(params[0]);
    }
    async supportedReportSet(...params) {
        return defaultParam(supportedReportSet, { headers: this.authHeaders, fetchOptions: this.fetchOptions })(params[0]);
    }
    async isCollectionDirty(...params) {
        return defaultParam(isCollectionDirty, { headers: this.authHeaders, fetchOptions: this.fetchOptions })(params[0]);
    }
    async smartCollectionSync(...params) {
        return defaultParam(smartCollectionSync, {
            headers: this.authHeaders,
            fetchOptions: this.fetchOptions,
            account: this.account,
        })(params[0]);
    }
    async calendarQuery(...params) {
        return defaultParam(calendarQuery, { headers: this.authHeaders, fetchOptions: this.fetchOptions })(params[0]);
    }
    async makeCalendar(...params) {
        return defaultParam(makeCalendar, { headers: this.authHeaders, fetchOptions: this.fetchOptions })(params[0]);
    }
    async calendarMultiGet(...params) {
        return defaultParam(calendarMultiGet, { headers: this.authHeaders, fetchOptions: this.fetchOptions })(params[0]);
    }
    async fetchCalendars(...params) {
        return defaultParam(fetchCalendars, { headers: this.authHeaders, account: this.account, fetchOptions: this.fetchOptions })(params === null || params === void 0 ? void 0 : params[0]);
    }
    async fetchCalendarUserAddresses(...params) {
        return defaultParam(fetchCalendarUserAddresses, { headers: this.authHeaders, account: this.account, fetchOptions: this.fetchOptions })(params === null || params === void 0 ? void 0 : params[0]);
    }
    async fetchCalendarObjects(...params) {
        return defaultParam(fetchCalendarObjects, { headers: this.authHeaders, fetchOptions: this.fetchOptions })(params[0]);
    }
    async createCalendarObject(...params) {
        return defaultParam(createCalendarObject, { headers: this.authHeaders, fetchOptions: this.fetchOptions })(params[0]);
    }
    async updateCalendarObject(...params) {
        return defaultParam(updateCalendarObject, { headers: this.authHeaders, fetchOptions: this.fetchOptions })(params[0]);
    }
    async deleteCalendarObject(...params) {
        return defaultParam(deleteCalendarObject, { headers: this.authHeaders, fetchOptions: this.fetchOptions })(params[0]);
    }
    async syncCalendars(...params) {
        return defaultParam(syncCalendars, {
            headers: this.authHeaders,
            account: this.account,
            fetchOptions: this.fetchOptions
        })(params[0]);
    }
    async addressBookQuery(...params) {
        return defaultParam(addressBookQuery, { headers: this.authHeaders, fetchOptions: this.fetchOptions })(params[0]);
    }
    async addressBookMultiGet(...params) {
        return defaultParam(addressBookMultiGet, { headers: this.authHeaders, fetchOptions: this.fetchOptions })(params[0]);
    }
    async fetchAddressBooks(...params) {
        return defaultParam(fetchAddressBooks, { headers: this.authHeaders, account: this.account, fetchOptions: this.fetchOptions })(params === null || params === void 0 ? void 0 : params[0]);
    }
    async fetchVCards(...params) {
        return defaultParam(fetchVCards, { headers: this.authHeaders, fetchOptions: this.fetchOptions })(params[0]);
    }
    async createVCard(...params) {
        return defaultParam(createVCard, { headers: this.authHeaders, fetchOptions: this.fetchOptions })(params[0]);
    }
    async updateVCard(...params) {
        return defaultParam(updateVCard, { headers: this.authHeaders, fetchOptions: this.fetchOptions })(params[0]);
    }
    async deleteVCard(...params) {
        return defaultParam(deleteVCard, { headers: this.authHeaders, fetchOptions: this.fetchOptions })(params[0]);
    }
    async todoQuery(...params) {
        return defaultParam(todoQuery, { headers: this.authHeaders, fetchOptions: this.fetchOptions })(params[0]);
    }
    async todoMultiGet(...params) {
        return defaultParam(todoMultiGet, { headers: this.authHeaders, fetchOptions: this.fetchOptions })(params[0]);
    }
    async fetchTodos(...params) {
        return defaultParam(fetchTodos, { headers: this.authHeaders, fetchOptions: this.fetchOptions })(params[0]);
    }
    async createTodo(...params) {
        return defaultParam(createTodo, { headers: this.authHeaders, fetchOptions: this.fetchOptions })(params[0]);
    }
    async updateTodo(...params) {
        return defaultParam(updateTodo, { headers: this.authHeaders, fetchOptions: this.fetchOptions })(params[0]);
    }
    async deleteTodo(...params) {
        return defaultParam(deleteTodo, { headers: this.authHeaders, fetchOptions: this.fetchOptions })(params[0]);
    }
}

var client = /*#__PURE__*/Object.freeze({
	__proto__: null,
	DAVClient: DAVClient,
	createDAVClient: createDAVClient
});

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * Portions Copyright (C) Philipp Kewisch */

/**
 * Represents the BINARY value type, which contains extra methods for encoding and decoding.
 *
 * @memberof ICAL
 */
class Binary {
  /**
   * Creates a binary value from the given string.
   *
   * @param {String} aString        The binary value string
   * @return {Binary}               The binary value instance
   */
  static fromString(aString) {
    return new Binary(aString);
  }

  /**
   * Creates a new ICAL.Binary instance
   *
   * @param {String} aValue     The binary data for this value
   */
  constructor(aValue) {
    this.value = aValue;
  }

  /**
   * The type name, to be used in the jCal object.
   * @default "binary"
   * @constant
   */
  icaltype = "binary";

  /**
   * Base64 decode the current value
   *
   * @return {String}         The base64-decoded value
   */
  decodeValue() {
    return this._b64_decode(this.value);
  }

  /**
   * Encodes the passed parameter with base64 and sets the internal
   * value to the result.
   *
   * @param {String} aValue      The raw binary value to encode
   */
  setEncodedValue(aValue) {
    this.value = this._b64_encode(aValue);
  }

  _b64_encode(data) {
    // http://kevin.vanzonneveld.net
    // +   original by: Tyler Akins (http://rumkin.com)
    // +   improved by: Bayron Guevara
    // +   improved by: Thunder.m
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Pellentesque Malesuada
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Rafał Kukawski (http://kukawski.pl)
    // *     example 1: base64_encode('Kevin van Zonneveld');
    // *     returns 1: 'S2V2aW4gdmFuIFpvbm5ldmVsZA=='
    // mozilla has this native
    // - but breaks in 2.0.0.12!
    //if (typeof this.window['atob'] == 'function') {
    //    return atob(data);
    //}
    let b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
              "abcdefghijklmnopqrstuvwxyz0123456789+/=";
    let o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
      ac = 0,
      enc = "",
      tmp_arr = [];

    if (!data) {
      return data;
    }

    do { // pack three octets into four hexets
      o1 = data.charCodeAt(i++);
      o2 = data.charCodeAt(i++);
      o3 = data.charCodeAt(i++);

      bits = o1 << 16 | o2 << 8 | o3;

      h1 = bits >> 18 & 0x3f;
      h2 = bits >> 12 & 0x3f;
      h3 = bits >> 6 & 0x3f;
      h4 = bits & 0x3f;

      // use hexets to index into b64, and append result to encoded string
      tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
    } while (i < data.length);

    enc = tmp_arr.join('');

    let r = data.length % 3;

    return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);

  }

  _b64_decode(data) {
    // http://kevin.vanzonneveld.net
    // +   original by: Tyler Akins (http://rumkin.com)
    // +   improved by: Thunder.m
    // +      input by: Aman Gupta
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Onno Marsman
    // +   bugfixed by: Pellentesque Malesuada
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: Brett Zamir (http://brett-zamir.me)
    // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // *     example 1: base64_decode('S2V2aW4gdmFuIFpvbm5ldmVsZA==');
    // *     returns 1: 'Kevin van Zonneveld'
    // mozilla has this native
    // - but breaks in 2.0.0.12!
    //if (typeof this.window['btoa'] == 'function') {
    //    return btoa(data);
    //}
    let b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
              "abcdefghijklmnopqrstuvwxyz0123456789+/=";
    let o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
      ac = 0,
      dec = "",
      tmp_arr = [];

    if (!data) {
      return data;
    }

    data += '';

    do { // unpack four hexets into three octets using index points in b64
      h1 = b64.indexOf(data.charAt(i++));
      h2 = b64.indexOf(data.charAt(i++));
      h3 = b64.indexOf(data.charAt(i++));
      h4 = b64.indexOf(data.charAt(i++));

      bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;

      o1 = bits >> 16 & 0xff;
      o2 = bits >> 8 & 0xff;
      o3 = bits & 0xff;

      if (h3 == 64) {
        tmp_arr[ac++] = String.fromCharCode(o1);
      } else if (h4 == 64) {
        tmp_arr[ac++] = String.fromCharCode(o1, o2);
      } else {
        tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
      }
    } while (i < data.length);

    dec = tmp_arr.join('');

    return dec;
  }

  /**
   * The string representation of this value
   * @return {String}
   */
  toString() {
    return this.value;
  }
}

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * Portions Copyright (C) Philipp Kewisch */


const DURATION_LETTERS = /([PDWHMTS]{1,1})/;
const DATA_PROPS_TO_COPY = ["weeks", "days", "hours", "minutes", "seconds", "isNegative"];

/**
 * This class represents the "duration" value type, with various calculation
 * and manipulation methods.
 *
 * @memberof ICAL
 */
class Duration {
  /**
   * Returns a new ICAL.Duration instance from the passed seconds value.
   *
   * @param {Number} aSeconds       The seconds to create the instance from
   * @return {Duration}             The newly created duration instance
   */
  static fromSeconds(aSeconds) {
    return (new Duration()).fromSeconds(aSeconds);
  }

  /**
   * Checks if the given string is an iCalendar duration value.
   *
   * @param {String} value      The raw ical value
   * @return {Boolean}          True, if the given value is of the
   *                              duration ical type
   */
  static isValueString(string) {
    return (string[0] === 'P' || string[1] === 'P');
  }

  /**
   * Creates a new {@link ICAL.Duration} instance from the passed string.
   *
   * @param {String} aStr       The string to parse
   * @return {Duration}         The created duration instance
   */
  static fromString(aStr) {
    let pos = 0;
    let dict = Object.create(null);
    let chunks = 0;

    while ((pos = aStr.search(DURATION_LETTERS)) !== -1) {
      let type = aStr[pos];
      let numeric = aStr.slice(0, Math.max(0, pos));
      aStr = aStr.slice(pos + 1);

      chunks += parseDurationChunk(type, numeric, dict);
    }

    if (chunks < 2) {
      // There must be at least a chunk with "P" and some unit chunk
      throw new Error(
        'invalid duration value: Not enough duration components in "' + aStr + '"'
      );
    }

    return new Duration(dict);
  }

  /**
   * Creates a new ICAL.Duration instance from the given data object.
   *
   * @param {Object} aData                An object with members of the duration
   * @param {Number=} aData.weeks         Duration in weeks
   * @param {Number=} aData.days          Duration in days
   * @param {Number=} aData.hours         Duration in hours
   * @param {Number=} aData.minutes       Duration in minutes
   * @param {Number=} aData.seconds       Duration in seconds
   * @param {Boolean=} aData.isNegative   If true, the duration is negative
   * @return {Duration}                   The createad duration instance
   */
  static fromData(aData) {
    return new Duration(aData);
  }

  /**
   * Creates a new ICAL.Duration instance.
   *
   * @param {Object} data                 An object with members of the duration
   * @param {Number=} data.weeks          Duration in weeks
   * @param {Number=} data.days           Duration in days
   * @param {Number=} data.hours          Duration in hours
   * @param {Number=} data.minutes        Duration in minutes
   * @param {Number=} data.seconds        Duration in seconds
   * @param {Boolean=} data.isNegative    If true, the duration is negative
   */
  constructor(data) {
    this.wrappedJSObject = this;
    this.fromData(data);
  }

  /**
   * The weeks in this duration
   * @type {Number}
   * @default 0
   */
  weeks = 0;

  /**
   * The days in this duration
   * @type {Number}
   * @default 0
   */
  days = 0;

  /**
   * The days in this duration
   * @type {Number}
   * @default 0
   */
  hours = 0;

  /**
   * The minutes in this duration
   * @type {Number}
   * @default 0
   */
  minutes = 0;

  /**
   * The seconds in this duration
   * @type {Number}
   * @default 0
   */
  seconds = 0;

  /**
   * The seconds in this duration
   * @type {Boolean}
   * @default false
   */
  isNegative = false;

  /**
   * The class identifier.
   * @constant
   * @type {String}
   * @default "icalduration"
   */
  icalclass = "icalduration";

  /**
   * The type name, to be used in the jCal object.
   * @constant
   * @type {String}
   * @default "duration"
   */
  icaltype = "duration";

  /**
   * Returns a clone of the duration object.
   *
   * @return {Duration}      The cloned object
   */
  clone() {
    return Duration.fromData(this);
  }

  /**
   * The duration value expressed as a number of seconds.
   *
   * @return {Number}             The duration value in seconds
   */
  toSeconds() {
    let seconds = this.seconds + 60 * this.minutes + 3600 * this.hours +
                  86400 * this.days + 7 * 86400 * this.weeks;
    return (this.isNegative ? -seconds : seconds);
  }

  /**
   * Reads the passed seconds value into this duration object. Afterwards,
   * members like {@link ICAL.Duration#days days} and {@link ICAL.Duration#weeks weeks} will be set up
   * accordingly.
   *
   * @param {Number} aSeconds     The duration value in seconds
   * @return {Duration}           Returns this instance
   */
  fromSeconds(aSeconds) {
    let secs = Math.abs(aSeconds);

    this.isNegative = (aSeconds < 0);
    this.days = trunc(secs / 86400);

    // If we have a flat number of weeks, use them.
    if (this.days % 7 == 0) {
      this.weeks = this.days / 7;
      this.days = 0;
    } else {
      this.weeks = 0;
    }

    secs -= (this.days + 7 * this.weeks) * 86400;

    this.hours = trunc(secs / 3600);
    secs -= this.hours * 3600;

    this.minutes = trunc(secs / 60);
    secs -= this.minutes * 60;

    this.seconds = secs;
    return this;
  }

  /**
   * Sets up the current instance using members from the passed data object.
   *
   * @param {Object} aData                An object with members of the duration
   * @param {Number=} aData.weeks         Duration in weeks
   * @param {Number=} aData.days          Duration in days
   * @param {Number=} aData.hours         Duration in hours
   * @param {Number=} aData.minutes       Duration in minutes
   * @param {Number=} aData.seconds       Duration in seconds
   * @param {Boolean=} aData.isNegative   If true, the duration is negative
   */
  fromData(aData) {
    for (let prop of DATA_PROPS_TO_COPY) {
      if (aData && prop in aData) {
        this[prop] = aData[prop];
      } else {
        this[prop] = 0;
      }
    }
  }

  /**
   * Resets the duration instance to the default values, i.e. PT0S
   */
  reset() {
    this.isNegative = false;
    this.weeks = 0;
    this.days = 0;
    this.hours = 0;
    this.minutes = 0;
    this.seconds = 0;
  }

  /**
   * Compares the duration instance with another one.
   *
   * @param {Duration} aOther             The instance to compare with
   * @return {Number}                     -1, 0 or 1 for less/equal/greater
   */
  compare(aOther) {
    let thisSeconds = this.toSeconds();
    let otherSeconds = aOther.toSeconds();
    return (thisSeconds > otherSeconds) - (thisSeconds < otherSeconds);
  }

  /**
   * Normalizes the duration instance. For example, a duration with a value
   * of 61 seconds will be normalized to 1 minute and 1 second.
   */
  normalize() {
    this.fromSeconds(this.toSeconds());
  }

  /**
   * The string representation of this duration.
   * @return {String}
   */
  toString() {
    if (this.toSeconds() == 0) {
      return "PT0S";
    } else {
      let str = "";
      if (this.isNegative) str += "-";
      str += "P";
      let hasWeeks = false;
      if (this.weeks) {
        if (this.days || this.hours || this.minutes || this.seconds) {
          str += (this.weeks * 7 + this.days) + "D";
        } else {
          str += (this.weeks + "W");
          hasWeeks = true;
        }
      } else if (this.days) {
        str += (this.days + "D");
      }

      if (!hasWeeks) {
        if (this.hours || this.minutes || this.seconds) {
          str += "T";
          if (this.hours) {
            str += this.hours + "H";
          }

          if (this.minutes) {
            str += this.minutes + "M";
          }

          if (this.seconds) {
            str += this.seconds + "S";
          }
        }
      }

      return str;
    }
  }

  /**
   * The iCalendar string representation of this duration.
   * @return {String}
   */
  toICALString() {
    return this.toString();
  }
}

/**
 * Internal helper function to handle a chunk of a duration.
 *
 * @private
 * @param {String} letter type of duration chunk
 * @param {String} number numeric value or -/+
 * @param {Object} dict target to assign values to
 */
function parseDurationChunk(letter, number, object) {
  let type;
  switch (letter) {
    case 'P':
      if (number && number === '-') {
        object.isNegative = true;
      } else {
        object.isNegative = false;
      }
      // period
      break;
    case 'D':
      type = 'days';
      break;
    case 'W':
      type = 'weeks';
      break;
    case 'H':
      type = 'hours';
      break;
    case 'M':
      type = 'minutes';
      break;
    case 'S':
      type = 'seconds';
      break;
    default:
      // Not a valid chunk
      return 0;
  }

  if (type) {
    if (!number && number !== 0) {
      throw new Error(
        'invalid duration value: Missing number before "' + letter + '"'
      );
    }
    let num = parseInt(number, 10);
    if (isStrictlyNaN(num)) {
      throw new Error(
        'invalid duration value: Invalid number "' + number + '" before "' + letter + '"'
      );
    }
    object[type] = num;
  }

  return 1;
}

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * Portions Copyright (C) Philipp Kewisch */


/**
 * This lets typescript resolve our custom types in the
 * generated d.ts files (jsdoc typedefs are converted to typescript types).
 * Ignore prevents the typedefs from being documented more than once.
 * @ignore
 * @typedef {import("./types.js").jCalComponent} jCalComponent
 * Imports the 'occurrenceDetails' type from the "types.js" module
 */

/**
 * This class represents the "period" value type, with various calculation and manipulation methods.
 *
 * @memberof ICAL
 */
class Period {
  /**
   * Creates a new {@link ICAL.Period} instance from the passed string.
   *
   * @param {String} str            The string to parse
   * @param {Property} prop         The property this period will be on
   * @return {Period}               The created period instance
   */
  static fromString(str, prop) {
    let parts = str.split('/');

    if (parts.length !== 2) {
      throw new Error(
        'Invalid string value: "' + str + '" must contain a "/" char.'
      );
    }

    let options = {
      start: Time.fromDateTimeString(parts[0], prop)
    };

    let end = parts[1];

    if (Duration.isValueString(end)) {
      options.duration = Duration.fromString(end);
    } else {
      options.end = Time.fromDateTimeString(end, prop);
    }

    return new Period(options);
  }

  /**
   * Creates a new {@link ICAL.Period} instance from the given data object.
   * The passed data object cannot contain both and end date and a duration.
   *
   * @param {Object} aData                  An object with members of the period
   * @param {Time=} aData.start             The start of the period
   * @param {Time=} aData.end               The end of the period
   * @param {Duration=} aData.duration      The duration of the period
   * @return {Period}                       The period instance
   */
  static fromData(aData) {
    return new Period(aData);
  }

  /**
   * Returns a new period instance from the given jCal data array. The first
   * member is always the start date string, the second member is either a
   * duration or end date string.
   *
   * @param {jCalComponent} aData           The jCal data array
   * @param {Property} aProp                The property this jCal data is on
   * @param {Boolean} aLenient              If true, data value can be both date and date-time
   * @return {Period}                       The period instance
   */
  static fromJSON(aData, aProp, aLenient) {
    function fromDateOrDateTimeString(aValue, dateProp) {
      if (aLenient) {
        return Time.fromString(aValue, dateProp);
      } else {
        return Time.fromDateTimeString(aValue, dateProp);
      }
    }

    if (Duration.isValueString(aData[1])) {
      return Period.fromData({
        start: fromDateOrDateTimeString(aData[0], aProp),
        duration: Duration.fromString(aData[1])
      });
    } else {
      return Period.fromData({
        start: fromDateOrDateTimeString(aData[0], aProp),
        end: fromDateOrDateTimeString(aData[1], aProp)
      });
    }
  }

  /**
   * Creates a new ICAL.Period instance. The passed data object cannot contain both and end date and
   * a duration.
   *
   * @param {Object} aData                  An object with members of the period
   * @param {Time=} aData.start             The start of the period
   * @param {Time=} aData.end               The end of the period
   * @param {Duration=} aData.duration      The duration of the period
   */
  constructor(aData) {
    this.wrappedJSObject = this;

    if (aData && 'start' in aData) {
      if (aData.start && !(aData.start instanceof Time)) {
        throw new TypeError('.start must be an instance of ICAL.Time');
      }
      this.start = aData.start;
    }

    if (aData && aData.end && aData.duration) {
      throw new Error('cannot accept both end and duration');
    }

    if (aData && 'end' in aData) {
      if (aData.end && !(aData.end instanceof Time)) {
        throw new TypeError('.end must be an instance of ICAL.Time');
      }
      this.end = aData.end;
    }

    if (aData && 'duration' in aData) {
      if (aData.duration && !(aData.duration instanceof Duration)) {
        throw new TypeError('.duration must be an instance of ICAL.Duration');
      }
      this.duration = aData.duration;
    }
  }


  /**
   * The start of the period
   * @type {Time}
   */
  start = null;

  /**
   * The end of the period
   * @type {Time}
   */
  end = null;

  /**
   * The duration of the period
   * @type {Duration}
   */
  duration = null;

  /**
   * The class identifier.
   * @constant
   * @type {String}
   * @default "icalperiod"
   */
  icalclass = "icalperiod";

  /**
   * The type name, to be used in the jCal object.
   * @constant
   * @type {String}
   * @default "period"
   */
  icaltype = "period";

  /**
   * Returns a clone of the duration object.
   *
   * @return {Period}      The cloned object
   */
  clone() {
    return Period.fromData({
      start: this.start ? this.start.clone() : null,
      end: this.end ? this.end.clone() : null,
      duration: this.duration ? this.duration.clone() : null
    });
  }

  /**
   * Calculates the duration of the period, either directly or by subtracting
   * start from end date.
   *
   * @return {Duration}      The calculated duration
   */
  getDuration() {
    if (this.duration) {
      return this.duration;
    } else {
      return this.end.subtractDate(this.start);
    }
  }

  /**
   * Calculates the end date of the period, either directly or by adding
   * duration to start date.
   *
   * @return {Time}          The calculated end date
   */
  getEnd() {
    if (this.end) {
      return this.end;
    } else {
      let end = this.start.clone();
      end.addDuration(this.duration);
      return end;
    }
  }

  /**
   * Compare this period with a date or other period. To maintain the logic where a.compare(b)
   * returns 1 when a > b, this function will return 1 when the period is after the date, 0 when the
   * date is within the period, and -1 when the period is before the date. When comparing two
   * periods, as soon as they overlap in any way this will return 0.
   *
   * @param {Time|Period} dt    The date or other period to compare with
   */
  compare(dt) {
    if (dt.compare(this.start) < 0) {
      return 1;
    } else if (dt.compare(this.getEnd()) > 0) {
      return -1;
    } else {
      return 0;
    }
  }

  /**
   * The string representation of this period.
   * @return {String}
   */
  toString() {
    return this.start + "/" + (this.end || this.duration);
  }

  /**
   * The jCal representation of this period type.
   * @return {Object}
   */
  toJSON() {
    return [this.start.toString(), (this.end || this.duration).toString()];
  }

  /**
   * The iCalendar string representation of this period.
   * @return {String}
   */
  toICALString() {
    return this.start.toICALString() + "/" +
           (this.end || this.duration).toICALString();
  }
}

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * Portions Copyright (C) Philipp Kewisch */


/**
 * This lets typescript resolve our custom types in the
 * generated d.ts files (jsdoc typedefs are converted to typescript types).
 * Ignore prevents the typedefs from being documented more than once.
 *
 * @ignore
 * @typedef {import("./types.js").weekDay} weekDay
 * Imports the 'weekDay' type from the "types.js" module
 *
 * @ignore
 * @typedef {import("./types.js").timeInit} timeInit
 * Imports the 'timeInit' type from the "types.js" module
 */

/**
 * @classdesc
 * iCalendar Time representation (similar to JS Date object).  Fully
 * independent of system (OS) timezone / time.  Unlike JS Date, the month
 * January is 1, not zero.
 *
 * @example
 * var time = new ICAL.Time({
 *   year: 2012,
 *   month: 10,
 *   day: 11
 *   minute: 0,
 *   second: 0,
 *   isDate: false
 * });
 *
 *
 * @memberof ICAL
*/
class Time {
  static _dowCache = {};
  static _wnCache = {};

  /**
   * Returns the days in the given month
   *
   * @param {Number} month      The month to check
   * @param {Number} year       The year to check
   * @return {Number}           The number of days in the month
   */
  static daysInMonth(month, year) {
    let _daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let days = 30;

    if (month < 1 || month > 12) return days;

    days = _daysInMonth[month];

    if (month == 2) {
      days += Time.isLeapYear(year);
    }

    return days;
  }

  /**
   * Checks if the year is a leap year
   *
   * @param {Number} year       The year to check
   * @return {Boolean}          True, if the year is a leap year
   */
  static isLeapYear(year) {
    if (year <= 1752) {
      return ((year % 4) == 0);
    } else {
      return (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0));
    }
  }

  /**
   * Create a new ICAL.Time from the day of year and year. The date is returned
   * in floating timezone.
   *
   * @param {Number} aDayOfYear     The day of year
   * @param {Number} aYear          The year to create the instance in
   * @return {Time}                 The created instance with the calculated date
   */
  static fromDayOfYear(aDayOfYear, aYear) {
    let year = aYear;
    let doy = aDayOfYear;
    let tt = new Time();
    tt.auto_normalize = false;
    let is_leap = (Time.isLeapYear(year) ? 1 : 0);

    if (doy < 1) {
      year--;
      is_leap = (Time.isLeapYear(year) ? 1 : 0);
      doy += Time.daysInYearPassedMonth[is_leap][12];
      return Time.fromDayOfYear(doy, year);
    } else if (doy > Time.daysInYearPassedMonth[is_leap][12]) {
      is_leap = (Time.isLeapYear(year) ? 1 : 0);
      doy -= Time.daysInYearPassedMonth[is_leap][12];
      year++;
      return Time.fromDayOfYear(doy, year);
    }

    tt.year = year;
    tt.isDate = true;

    for (let month = 11; month >= 0; month--) {
      if (doy > Time.daysInYearPassedMonth[is_leap][month]) {
        tt.month = month + 1;
        tt.day = doy - Time.daysInYearPassedMonth[is_leap][month];
        break;
      }
    }

    tt.auto_normalize = true;
    return tt;
  }

  /**
   * Returns a new ICAL.Time instance from a date string, e.g 2015-01-02.
   *
   * @deprecated                Use {@link ICAL.Time.fromDateString} instead
   * @param {String} str        The string to create from
   * @return {Time}             The date/time instance
   */
  static fromStringv2(str) {
    return new Time({
      year: parseInt(str.slice(0, 4), 10),
      month: parseInt(str.slice(5, 7), 10),
      day: parseInt(str.slice(8, 10), 10),
      isDate: true
    });
  }

  /**
   * Returns a new ICAL.Time instance from a date string, e.g 2015-01-02.
   *
   * @param {String} aValue     The string to create from
   * @return {Time}             The date/time instance
   */
  static fromDateString(aValue) {
    // Dates should have no timezone.
    // Google likes to sometimes specify Z on dates
    // we specifically ignore that to avoid issues.

    // YYYY-MM-DD
    // 2012-10-10
    return new Time({
      year: strictParseInt(aValue.slice(0, 4)),
      month: strictParseInt(aValue.slice(5, 7)),
      day: strictParseInt(aValue.slice(8, 10)),
      isDate: true
    });
  }

  /**
   * Returns a new ICAL.Time instance from a date-time string, e.g
   * 2015-01-02T03:04:05. If a property is specified, the timezone is set up
   * from the property's TZID parameter.
   *
   * @param {String} aValue         The string to create from
   * @param {Property=} prop        The property the date belongs to
   * @return {Time}                 The date/time instance
   */
  static fromDateTimeString(aValue, prop) {
    if (aValue.length < 19) {
      throw new Error(
        'invalid date-time value: "' + aValue + '"'
      );
    }

    let zone;
    let zoneId;

    if (aValue.slice(-1) === 'Z') {
      zone = Timezone.utcTimezone;
    } else if (prop) {
      zoneId = prop.getParameter('tzid');

      if (prop.parent) {
        if (prop.parent.name === 'standard' || prop.parent.name === 'daylight') {
          // Per RFC 5545 3.8.2.4 and 3.8.2.2, start/end date-times within
          // these components MUST be specified in local time.
          zone = Timezone.localTimezone;
        } else if (zoneId) {
          // If the desired time zone is defined within the component tree,
          // fetch its definition and prefer that.
          zone = prop.parent.getTimeZoneByID(zoneId);
        }
      }
    }

    const timeData = {
      year: strictParseInt(aValue.slice(0, 4)),
      month: strictParseInt(aValue.slice(5, 7)),
      day: strictParseInt(aValue.slice(8, 10)),
      hour: strictParseInt(aValue.slice(11, 13)),
      minute: strictParseInt(aValue.slice(14, 16)),
      second: strictParseInt(aValue.slice(17, 19)),
    };

    // Although RFC 5545 requires that all TZIDs used within a file have a
    // corresponding time zone definition, we may not be parsing the full file
    // or we may be dealing with a non-compliant file; in either case, we can
    // check our own time zone service for the TZID in a last-ditch effort.
    if (zoneId && !zone) {
      timeData.timezone = zoneId;
    }

    // 2012-10-10T10:10:10(Z)?
    return new Time(timeData, zone);
  }

  /**
   * Returns a new ICAL.Time instance from a date or date-time string,
   *
   * @param {String} aValue         The string to create from
   * @param {Property=} prop        The property the date belongs to
   * @return {Time}                 The date/time instance
   */
  static fromString(aValue, aProperty) {
    if (aValue.length > 10) {
      return Time.fromDateTimeString(aValue, aProperty);
    } else {
      return Time.fromDateString(aValue);
    }
  }

  /**
   * Creates a new ICAL.Time instance from the given Javascript Date.
   *
   * @param {?Date} aDate             The Javascript Date to read, or null to reset
   * @param {Boolean} [useUTC=false]  If true, the UTC values of the date will be used
   */
  static fromJSDate(aDate, useUTC) {
    let tt = new Time();
    return tt.fromJSDate(aDate, useUTC);
  }

  /**
   * Creates a new ICAL.Time instance from the the passed data object.
   *
   * @param {timeInit} aData          Time initialization
   * @param {Timezone=} aZone         Timezone this position occurs in
   */
  static fromData = function fromData(aData, aZone) {
    let t = new Time();
    return t.fromData(aData, aZone);
  };

  /**
   * Creates a new ICAL.Time instance from the current moment.
   * The instance is “floating” - has no timezone relation.
   * To create an instance considering the time zone, call
   * ICAL.Time.fromJSDate(new Date(), true)
   * @return {Time}
   */
  static now() {
    return Time.fromJSDate(new Date(), false);
  }

  /**
   * Returns the date on which ISO week number 1 starts.
   *
   * @see Time#weekNumber
   * @param {Number} aYear                  The year to search in
   * @param {weekDay=} aWeekStart           The week start weekday, used for calculation.
   * @return {Time}                         The date on which week number 1 starts
   */
  static weekOneStarts(aYear, aWeekStart) {
    let t = Time.fromData({
      year: aYear,
      month: 1,
      day: 1,
      isDate: true
    });

    let dow = t.dayOfWeek();
    let wkst = aWeekStart || Time.DEFAULT_WEEK_START;
    if (dow > Time.THURSDAY) {
      t.day += 7;
    }
    if (wkst > Time.THURSDAY) {
      t.day -= 7;
    }

    t.day -= dow - wkst;

    return t;
  }

  /**
   * Get the dominical letter for the given year. Letters range from A - G for
   * common years, and AG to GF for leap years.
   *
   * @param {Number} yr           The year to retrieve the letter for
   * @return {String}             The dominical letter.
   */
  static getDominicalLetter(yr) {
    let LTRS = "GFEDCBA";
    let dom = (yr + (yr / 4 | 0) + (yr / 400 | 0) - (yr / 100 | 0) - 1) % 7;
    let isLeap = Time.isLeapYear(yr);
    if (isLeap) {
      return LTRS[(dom + 6) % 7] + LTRS[dom];
    } else {
      return LTRS[dom];
    }
  }

  static #epochTime = null;
  /**
   * January 1st, 1970 as an ICAL.Time.
   * @type {Time}
   * @constant
   * @instance
   */
  static get epochTime() {
    if (!this.#epochTime) {
      this.#epochTime = Time.fromData({
        year: 1970,
        month: 1,
        day: 1,
        hour: 0,
        minute: 0,
        second: 0,
        isDate: false,
        timezone: "Z"
      });
    }
    return this.#epochTime;
  }

  static _cmp_attr(a, b, attr) {
    if (a[attr] > b[attr]) return 1;
    if (a[attr] < b[attr]) return -1;
    return 0;
  }

  /**
   * The days that have passed in the year after a given month. The array has
   * two members, one being an array of passed days for non-leap years, the
   * other analog for leap years.
   * @example
   * var isLeapYear = ICAL.Time.isLeapYear(year);
   * var passedDays = ICAL.Time.daysInYearPassedMonth[isLeapYear][month];
   * @type {Array.<Array.<Number>>}
   */
  static daysInYearPassedMonth = [
    [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365],
    [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335, 366]
  ];

  static SUNDAY = 1;
  static MONDAY = 2;
  static TUESDAY = 3;
  static WEDNESDAY = 4;
  static THURSDAY = 5;
  static FRIDAY = 6;
  static SATURDAY = 7;

  /**
   * The default weekday for the WKST part.
   * @constant
   * @default ICAL.Time.MONDAY
   */
  static DEFAULT_WEEK_START = 2; // MONDAY

  /**
   * Creates a new ICAL.Time instance.
   *
   * @param {timeInit} data           Time initialization
   * @param {Timezone} zone           timezone this position occurs in
   */
  constructor(data, zone) {
    this.wrappedJSObject = this;

    /**
     * @type {timeInit}
     * @private
     */
    this._time = Object.create(null);

    /* time defaults */
    this._time.year = 0;
    this._time.month = 1;
    this._time.day = 1;
    this._time.hour = 0;
    this._time.minute = 0;
    this._time.second = 0;
    this._time.isDate = false;

    this.fromData(data, zone);
  }

  /**
   * The class identifier.
   * @constant
   * @type {String}
   * @default "icaltime"
   */
  icalclass = "icaltime";
  _cachedUnixTime = null;

  /**
   * The type name, to be used in the jCal object. This value may change and
   * is strictly defined by the {@link ICAL.Time#isDate isDate} member.
   * @type {String}
   * @default "date-time"
   */
  get icaltype() {
    return this.isDate ? 'date' : 'date-time';
  }

  /**
   * The timezone for this time.
   * @type {Timezone}
   */
  zone = null;

  /**
   * Internal uses to indicate that a change has been made and the next read
   * operation must attempt to normalize the value (for example changing the
   * day to 33).
   *
   * @type {Boolean}
   * @private
   */
  _pendingNormalization = false;

  /**
   * The year of this date.
   * @type {Number}
   */
  get year() {
    return this._getTimeAttr('year');
  }

  set year(val) {
    this._setTimeAttr('year', val);
  }

  /**
   * The month of this date.
   * @type {Number}
   */
  get month() {
    return this._getTimeAttr('month');
  }

  set month(val) {
    this._setTimeAttr('month', val);
  }

  /**
   * The day of this date.
   * @type {Number}
   */
  get day() {
    return this._getTimeAttr('day');
  }

  set day(val) {
    this._setTimeAttr('day', val);
  }

  /**
   * The hour of this date-time.
   * @type {Number}
   */
  get hour() {
    return this._getTimeAttr('hour');
  }

  set hour(val) {
    this._setTimeAttr('hour', val);
  }

  /**
   * The minute of this date-time.
   * @type {Number}
   */
  get minute() {
    return this._getTimeAttr('minute');
  }

  set minute(val) {
    this._setTimeAttr('minute', val);
  }

  /**
   * The second of this date-time.
   * @type {Number}
   */
  get second() {
    return this._getTimeAttr('second');
  }

  set second(val) {
    this._setTimeAttr('second', val);
  }

  /**
   * If true, the instance represents a date (as opposed to a date-time)
   * @type {Boolean}
   */
  get isDate() {
    return this._getTimeAttr('isDate');
  }

  set isDate(val) {
    this._setTimeAttr('isDate', val);
  }

  /**
   * @private
   * @param {String} attr             Attribute to get (one of: year, month,
   *                                  day, hour, minute, second, isDate)
   * @return {Number|Boolean}         Current value for the attribute
   */
  _getTimeAttr(attr) {
    if (this._pendingNormalization) {
      this._normalize();
      this._pendingNormalization = false;
    }

    return this._time[attr];
  }

  /**
   * @private
   * @param {String} attr             Attribute to set (one of: year, month,
   *                                  day, hour, minute, second, isDate)
   * @param {Number|Boolean} val      New value for the attribute
   */
  _setTimeAttr(attr, val) {
    // Check if isDate will be set and if was not set to normalize date.
    // This avoids losing days when seconds, minutes and hours are zeroed
    // what normalize will do when time is a date.
    if (attr === "isDate" && val && !this._time.isDate) {
      this.adjust(0, 0, 0, 0);
    }
    this._cachedUnixTime = null;
    this._pendingNormalization = true;
    this._time[attr] = val;
  }

  /**
   * Returns a clone of the time object.
   *
   * @return {Time}              The cloned object
   */
  clone() {
    return new Time(this._time, this.zone);
  }

  /**
   * Reset the time instance to epoch time
   */
  reset() {
    this.fromData(Time.epochTime);
    this.zone = Timezone.utcTimezone;
  }

  /**
   * Reset the time instance to the given date/time values.
   *
   * @param {Number} year             The year to set
   * @param {Number} month            The month to set
   * @param {Number} day              The day to set
   * @param {Number} hour             The hour to set
   * @param {Number} minute           The minute to set
   * @param {Number} second           The second to set
   * @param {Timezone} timezone       The timezone to set
   */
  resetTo(year, month, day, hour, minute, second, timezone) {
    this.fromData({
      year: year,
      month: month,
      day: day,
      hour: hour,
      minute: minute,
      second: second,
      zone: timezone
    });
  }

  /**
   * Set up the current instance from the Javascript date value.
   *
   * @param {?Date} aDate             The Javascript Date to read, or null to reset
   * @param {Boolean} [useUTC=false]  If true, the UTC values of the date will be used
   */
  fromJSDate(aDate, useUTC) {
    if (!aDate) {
      this.reset();
    } else {
      if (useUTC) {
        this.zone = Timezone.utcTimezone;
        this.year = aDate.getUTCFullYear();
        this.month = aDate.getUTCMonth() + 1;
        this.day = aDate.getUTCDate();
        this.hour = aDate.getUTCHours();
        this.minute = aDate.getUTCMinutes();
        this.second = aDate.getUTCSeconds();
      } else {
        this.zone = Timezone.localTimezone;
        this.year = aDate.getFullYear();
        this.month = aDate.getMonth() + 1;
        this.day = aDate.getDate();
        this.hour = aDate.getHours();
        this.minute = aDate.getMinutes();
        this.second = aDate.getSeconds();
      }
    }
    this._cachedUnixTime = null;
    return this;
  }

  /**
   * Sets up the current instance using members from the passed data object.
   *
   * @param {timeInit} aData          Time initialization
   * @param {Timezone=} aZone         Timezone this position occurs in
   */
  fromData(aData, aZone) {
    if (aData) {
      for (let [key, value] of Object.entries(aData)) {
          // ical type cannot be set
          if (key === 'icaltype') continue;
        this[key] = value;
      }
    }

    if (aZone) {
      this.zone = aZone;
    }

    if (aData && !("isDate" in aData)) {
      this.isDate = !("hour" in aData);
    } else if (aData && ("isDate" in aData)) {
      this.isDate = aData.isDate;
    }

    if (aData && "timezone" in aData) {
      let zone = TimezoneService.get(
        aData.timezone
      );

      this.zone = zone || Timezone.localTimezone;
    }

    if (aData && "zone" in aData) {
      this.zone = aData.zone;
    }

    if (!this.zone) {
      this.zone = Timezone.localTimezone;
    }

    this._cachedUnixTime = null;
    return this;
  }

  /**
   * Calculate the day of week.
   * @param {weekDay=} aWeekStart
   *        The week start weekday, defaults to SUNDAY
   * @return {weekDay}
   */
  dayOfWeek(aWeekStart) {
    let firstDow = aWeekStart || Time.SUNDAY;
    let dowCacheKey = (this.year << 12) + (this.month << 8) + (this.day << 3) + firstDow;
    if (dowCacheKey in Time._dowCache) {
      return Time._dowCache[dowCacheKey];
    }

    // Using Zeller's algorithm
    let q = this.day;
    let m = this.month + (this.month < 3 ? 12 : 0);
    let Y = this.year - (this.month < 3 ? 1 : 0);

    let h = (q + Y + trunc(((m + 1) * 26) / 10) + trunc(Y / 4));
    { // eslint-disable-line no-constant-condition
      h += trunc(Y / 100) * 6 + trunc(Y / 400);
    }

    // Normalize to 1 = wkst
    h = ((h + 7 - firstDow) % 7) + 1;
    Time._dowCache[dowCacheKey] = h;
    return h;
  }

  /**
   * Calculate the day of year.
   * @return {Number}
   */
  dayOfYear() {
    let is_leap = (Time.isLeapYear(this.year) ? 1 : 0);
    let diypm = Time.daysInYearPassedMonth;
    return diypm[is_leap][this.month - 1] + this.day;
  }

  /**
   * Returns a copy of the current date/time, rewound to the start of the
   * week. The resulting ICAL.Time instance is of icaltype date, even if this
   * is a date-time.
   *
   * @param {weekDay=} aWeekStart
   *        The week start weekday, defaults to SUNDAY
   * @return {Time}      The start of the week (cloned)
   */
  startOfWeek(aWeekStart) {
    let firstDow = aWeekStart || Time.SUNDAY;
    let result = this.clone();
    result.day -= ((this.dayOfWeek() + 7 - firstDow) % 7);
    result.isDate = true;
    result.hour = 0;
    result.minute = 0;
    result.second = 0;
    return result;
  }

  /**
   * Returns a copy of the current date/time, shifted to the end of the week.
   * The resulting ICAL.Time instance is of icaltype date, even if this is a
   * date-time.
   *
   * @param {weekDay=} aWeekStart
   *        The week start weekday, defaults to SUNDAY
   * @return {Time}      The end of the week (cloned)
   */
  endOfWeek(aWeekStart) {
    let firstDow = aWeekStart || Time.SUNDAY;
    let result = this.clone();
    result.day += (7 - this.dayOfWeek() + firstDow - Time.SUNDAY) % 7;
    result.isDate = true;
    result.hour = 0;
    result.minute = 0;
    result.second = 0;
    return result;
  }

  /**
   * Returns a copy of the current date/time, rewound to the start of the
   * month. The resulting ICAL.Time instance is of icaltype date, even if
   * this is a date-time.
   *
   * @return {Time}      The start of the month (cloned)
   */
  startOfMonth() {
    let result = this.clone();
    result.day = 1;
    result.isDate = true;
    result.hour = 0;
    result.minute = 0;
    result.second = 0;
    return result;
  }

  /**
   * Returns a copy of the current date/time, shifted to the end of the
   * month.  The resulting ICAL.Time instance is of icaltype date, even if
   * this is a date-time.
   *
   * @return {Time}      The end of the month (cloned)
   */
  endOfMonth() {
    let result = this.clone();
    result.day = Time.daysInMonth(result.month, result.year);
    result.isDate = true;
    result.hour = 0;
    result.minute = 0;
    result.second = 0;
    return result;
  }

  /**
   * Returns a copy of the current date/time, rewound to the start of the
   * year. The resulting ICAL.Time instance is of icaltype date, even if
   * this is a date-time.
   *
   * @return {Time}      The start of the year (cloned)
   */
  startOfYear() {
    let result = this.clone();
    result.day = 1;
    result.month = 1;
    result.isDate = true;
    result.hour = 0;
    result.minute = 0;
    result.second = 0;
    return result;
  }

  /**
   * Returns a copy of the current date/time, shifted to the end of the
   * year.  The resulting ICAL.Time instance is of icaltype date, even if
   * this is a date-time.
   *
   * @return {Time}      The end of the year (cloned)
   */
  endOfYear() {
    let result = this.clone();
    result.day = 31;
    result.month = 12;
    result.isDate = true;
    result.hour = 0;
    result.minute = 0;
    result.second = 0;
    return result;
  }

  /**
   * First calculates the start of the week, then returns the day of year for
   * this date. If the day falls into the previous year, the day is zero or negative.
   *
   * @param {weekDay=} aFirstDayOfWeek
   *        The week start weekday, defaults to SUNDAY
   * @return {Number}     The calculated day of year
   */
  startDoyWeek(aFirstDayOfWeek) {
    let firstDow = aFirstDayOfWeek || Time.SUNDAY;
    let delta = this.dayOfWeek() - firstDow;
    if (delta < 0) delta += 7;
    return this.dayOfYear() - delta;
  }

  /**
   * Get the dominical letter for the current year. Letters range from A - G
   * for common years, and AG to GF for leap years.
   *
   * @param {Number} yr           The year to retrieve the letter for
   * @return {String}             The dominical letter.
   */
  getDominicalLetter() {
    return Time.getDominicalLetter(this.year);
  }

  /**
   * Finds the nthWeekDay relative to the current month (not day).  The
   * returned value is a day relative the month that this month belongs to so
   * 1 would indicate the first of the month and 40 would indicate a day in
   * the following month.
   *
   * @param {Number} aDayOfWeek   Day of the week see the day name constants
   * @param {Number} aPos         Nth occurrence of a given week day values
   *        of 1 and 0 both indicate the first weekday of that type. aPos may
   *        be either positive or negative
   *
   * @return {Number} numeric value indicating a day relative
   *                   to the current month of this time object
   */
  nthWeekDay(aDayOfWeek, aPos) {
    let daysInMonth = Time.daysInMonth(this.month, this.year);
    let weekday;
    let pos = aPos;

    let start = 0;

    let otherDay = this.clone();

    if (pos >= 0) {
      otherDay.day = 1;

      // because 0 means no position has been given
      // 1 and 0 indicate the same day.
      if (pos != 0) {
        // remove the extra numeric value
        pos--;
      }

      // set current start offset to current day.
      start = otherDay.day;

      // find the current day of week
      let startDow = otherDay.dayOfWeek();

      // calculate the difference between current
      // day of the week and desired day of the week
      let offset = aDayOfWeek - startDow;


      // if the offset goes into the past
      // week we add 7 so it goes into the next
      // week. We only want to go forward in time here.
      if (offset < 0)
        // this is really important otherwise we would
        // end up with dates from in the past.
        offset += 7;

      // add offset to start so start is the same
      // day of the week as the desired day of week.
      start += offset;

      // because we are going to add (and multiply)
      // the numeric value of the day we subtract it
      // from the start position so not to add it twice.
      start -= aDayOfWeek;

      // set week day
      weekday = aDayOfWeek;
    } else {

      // then we set it to the last day in the current month
      otherDay.day = daysInMonth;

      // find the ends weekday
      let endDow = otherDay.dayOfWeek();

      pos++;

      weekday = (endDow - aDayOfWeek);

      if (weekday < 0) {
        weekday += 7;
      }

      weekday = daysInMonth - weekday;
    }

    weekday += pos * 7;

    return start + weekday;
  }

  /**
   * Checks if current time is the nth weekday, relative to the current
   * month.  Will always return false when rule resolves outside of current
   * month.
   *
   * @param {weekDay} aDayOfWeek                 Day of week to check
   * @param {Number} aPos                        Relative position
   * @return {Boolean}                           True, if it is the nth weekday
   */
  isNthWeekDay(aDayOfWeek, aPos) {
    let dow = this.dayOfWeek();

    if (aPos === 0 && dow === aDayOfWeek) {
      return true;
    }

    // get pos
    let day = this.nthWeekDay(aDayOfWeek, aPos);

    if (day === this.day) {
      return true;
    }

    return false;
  }

  /**
   * Calculates the ISO 8601 week number. The first week of a year is the
   * week that contains the first Thursday. The year can have 53 weeks, if
   * January 1st is a Friday.
   *
   * Note there are regions where the first week of the year is the one that
   * starts on January 1st, which may offset the week number. Also, if a
   * different week start is specified, this will also affect the week
   * number.
   *
   * @see Time.weekOneStarts
   * @param {weekDay} aWeekStart                  The weekday the week starts with
   * @return {Number}                             The ISO week number
   */
  weekNumber(aWeekStart) {
    let wnCacheKey = (this.year << 12) + (this.month << 8) + (this.day << 3) + aWeekStart;
    if (wnCacheKey in Time._wnCache) {
      return Time._wnCache[wnCacheKey];
    }
    // This function courtesty of Julian Bucknall, published under the MIT license
    // http://www.boyet.com/articles/publishedarticles/calculatingtheisoweeknumb.html
    // plus some fixes to be able to use different week starts.
    let week1;

    let dt = this.clone();
    dt.isDate = true;
    let isoyear = this.year;

    if (dt.month == 12 && dt.day > 25) {
      week1 = Time.weekOneStarts(isoyear + 1, aWeekStart);
      if (dt.compare(week1) < 0) {
        week1 = Time.weekOneStarts(isoyear, aWeekStart);
      } else {
        isoyear++;
      }
    } else {
      week1 = Time.weekOneStarts(isoyear, aWeekStart);
      if (dt.compare(week1) < 0) {
        week1 = Time.weekOneStarts(--isoyear, aWeekStart);
      }
    }

    let daysBetween = (dt.subtractDate(week1).toSeconds() / 86400);
    let answer = trunc(daysBetween / 7) + 1;
    Time._wnCache[wnCacheKey] = answer;
    return answer;
  }

  /**
   * Adds the duration to the current time. The instance is modified in
   * place.
   *
   * @param {Duration} aDuration         The duration to add
   */
  addDuration(aDuration) {
    let mult = (aDuration.isNegative ? -1 : 1);

    // because of the duration optimizations it is much
    // more efficient to grab all the values up front
    // then set them directly (which will avoid a normalization call).
    // So we don't actually normalize until we need it.
    let second = this.second;
    let minute = this.minute;
    let hour = this.hour;
    let day = this.day;

    second += mult * aDuration.seconds;
    minute += mult * aDuration.minutes;
    hour += mult * aDuration.hours;
    day += mult * aDuration.days;
    day += mult * 7 * aDuration.weeks;

    this.second = second;
    this.minute = minute;
    this.hour = hour;
    this.day = day;

    this._cachedUnixTime = null;
  }

  /**
   * Subtract the date details (_excluding_ timezone).  Useful for finding
   * the relative difference between two time objects excluding their
   * timezone differences.
   *
   * @param {Time} aDate     The date to subtract
   * @return {Duration}      The difference as a duration
   */
  subtractDate(aDate) {
    let unixTime = this.toUnixTime() + this.utcOffset();
    let other = aDate.toUnixTime() + aDate.utcOffset();
    return Duration.fromSeconds(unixTime - other);
  }

  /**
   * Subtract the date details, taking timezones into account.
   *
   * @param {Time} aDate  The date to subtract
   * @return {Duration}   The difference in duration
   */
  subtractDateTz(aDate) {
    let unixTime = this.toUnixTime();
    let other = aDate.toUnixTime();
    return Duration.fromSeconds(unixTime - other);
  }

  /**
   * Compares the ICAL.Time instance with another one, or a period.
   *
   * @param {Time|Period} aOther                  The instance to compare with
   * @return {Number}                             -1, 0 or 1 for less/equal/greater
   */
  compare(other) {
    if (other instanceof Period) {
      return -1 * other.compare(this);
    } else {
      let a = this.toUnixTime();
      let b = other.toUnixTime();

      if (a > b) return 1;
      if (b > a) return -1;
      return 0;
    }
  }

  /**
   * Compares only the date part of this instance with another one.
   *
   * @param {Time} other                  The instance to compare with
   * @param {Timezone} tz                 The timezone to compare in
   * @return {Number}                     -1, 0 or 1 for less/equal/greater
   */
  compareDateOnlyTz(other, tz) {
    let a = this.convertToZone(tz);
    let b = other.convertToZone(tz);
    let rc = 0;

    if ((rc = Time._cmp_attr(a, b, "year")) != 0) return rc;
    if ((rc = Time._cmp_attr(a, b, "month")) != 0) return rc;
    if ((rc = Time._cmp_attr(a, b, "day")) != 0) return rc;

    return rc;
  }

  /**
   * Convert the instance into another timezone. The returned ICAL.Time
   * instance is always a copy.
   *
   * @param {Timezone} zone      The zone to convert to
   * @return {Time}              The copy, converted to the zone
   */
  convertToZone(zone) {
    let copy = this.clone();
    let zone_equals = (this.zone.tzid == zone.tzid);

    if (!this.isDate && !zone_equals) {
      Timezone.convert_time(copy, this.zone, zone);
    }

    copy.zone = zone;
    return copy;
  }

  /**
   * Calculates the UTC offset of the current date/time in the timezone it is
   * in.
   *
   * @return {Number}     UTC offset in seconds
   */
  utcOffset() {
    if (this.zone == Timezone.localTimezone ||
        this.zone == Timezone.utcTimezone) {
      return 0;
    } else {
      return this.zone.utcOffset(this);
    }
  }

  /**
   * Returns an RFC 5545 compliant ical representation of this object.
   *
   * @return {String} ical date/date-time
   */
  toICALString() {
    let string = this.toString();

    if (string.length > 10) {
      return design.icalendar.value['date-time'].toICAL(string);
    } else {
      return design.icalendar.value.date.toICAL(string);
    }
  }

  /**
   * The string representation of this date/time, in jCal form
   * (including : and - separators).
   * @return {String}
   */
  toString() {
    let result = this.year + '-' +
                 pad2(this.month) + '-' +
                 pad2(this.day);

    if (!this.isDate) {
        result += 'T' + pad2(this.hour) + ':' +
                  pad2(this.minute) + ':' +
                  pad2(this.second);

      if (this.zone === Timezone.utcTimezone) {
        result += 'Z';
      }
    }

    return result;
  }

  /**
   * Converts the current instance to a Javascript date
   * @return {Date}
   */
  toJSDate() {
    if (this.zone == Timezone.localTimezone) {
      if (this.isDate) {
        return new Date(this.year, this.month - 1, this.day);
      } else {
        return new Date(this.year, this.month - 1, this.day,
                        this.hour, this.minute, this.second, 0);
      }
    } else {
      return new Date(this.toUnixTime() * 1000);
    }
  }

  _normalize() {
    if (this._time.isDate) {
      this._time.hour = 0;
      this._time.minute = 0;
      this._time.second = 0;
    }
    this.adjust(0, 0, 0, 0);

    return this;
  }

  /**
   * Adjust the date/time by the given offset
   *
   * @param {Number} aExtraDays       The extra amount of days
   * @param {Number} aExtraHours      The extra amount of hours
   * @param {Number} aExtraMinutes    The extra amount of minutes
   * @param {Number} aExtraSeconds    The extra amount of seconds
   * @param {Number=} aTime           The time to adjust, defaults to the
   *                                    current instance.
   */
  adjust(aExtraDays, aExtraHours, aExtraMinutes, aExtraSeconds, aTime) {

    let minutesOverflow, hoursOverflow,
        daysOverflow = 0, yearsOverflow = 0;

    let second, minute, hour, day;
    let daysInMonth;

    let time = aTime || this._time;

    if (!time.isDate) {
      second = time.second + aExtraSeconds;
      time.second = second % 60;
      minutesOverflow = trunc(second / 60);
      if (time.second < 0) {
        time.second += 60;
        minutesOverflow--;
      }

      minute = time.minute + aExtraMinutes + minutesOverflow;
      time.minute = minute % 60;
      hoursOverflow = trunc(minute / 60);
      if (time.minute < 0) {
        time.minute += 60;
        hoursOverflow--;
      }

      hour = time.hour + aExtraHours + hoursOverflow;

      time.hour = hour % 24;
      daysOverflow = trunc(hour / 24);
      if (time.hour < 0) {
        time.hour += 24;
        daysOverflow--;
      }
    }


    // Adjust month and year first, because we need to know what month the day
    // is in before adjusting it.
    if (time.month > 12) {
      yearsOverflow = trunc((time.month - 1) / 12);
    } else if (time.month < 1) {
      yearsOverflow = trunc(time.month / 12) - 1;
    }

    time.year += yearsOverflow;
    time.month -= 12 * yearsOverflow;

    // Now take care of the days (and adjust month if needed)
    day = time.day + aExtraDays + daysOverflow;

    if (day > 0) {
      for (;;) {
        daysInMonth = Time.daysInMonth(time.month, time.year);
        if (day <= daysInMonth) {
          break;
        }

        time.month++;
        if (time.month > 12) {
          time.year++;
          time.month = 1;
        }

        day -= daysInMonth;
      }
    } else {
      while (day <= 0) {
        if (time.month == 1) {
          time.year--;
          time.month = 12;
        } else {
          time.month--;
        }

        day += Time.daysInMonth(time.month, time.year);
      }
    }

    time.day = day;

    this._cachedUnixTime = null;
    return this;
  }

  /**
   * Sets up the current instance from unix time, the number of seconds since
   * January 1st, 1970.
   *
   * @param {Number} seconds      The seconds to set up with
   */
  fromUnixTime(seconds) {
    this.zone = Timezone.utcTimezone;
    // We could use `fromJSDate` here, but this is about twice as fast.
    // We could also clone `epochTime` and use `adjust` for a more
    // ical.js-centric approach, but this is about 100 times as fast.
    let date = new Date(seconds * 1000);
    this.year = date.getUTCFullYear();
    this.month = date.getUTCMonth() + 1;
    this.day = date.getUTCDate();
    if (this._time.isDate) {
      this.hour = 0;
      this.minute = 0;
      this.second = 0;
    } else {
      this.hour = date.getUTCHours();
      this.minute = date.getUTCMinutes();
      this.second = date.getUTCSeconds();
    }

    this._cachedUnixTime = null;
  }

  /**
   * Converts the current instance to seconds since January 1st 1970.
   *
   * @return {Number}         Seconds since 1970
   */
  toUnixTime() {
    if (this._cachedUnixTime !== null) {
      return this._cachedUnixTime;
    }
    let offset = this.utcOffset();

    // we use the offset trick to ensure
    // that we are getting the actual UTC time
    let ms = Date.UTC(
      this.year,
      this.month - 1,
      this.day,
      this.hour,
      this.minute,
      this.second - offset
    );

    // seconds
    this._cachedUnixTime = ms / 1000;
    return this._cachedUnixTime;
  }

  /**
   * Converts time to into Object which can be serialized then re-created
   * using the constructor.
   *
   * @example
   * // toJSON will automatically be called
   * var json = JSON.stringify(mytime);
   *
   * var deserialized = JSON.parse(json);
   *
   * var time = new ICAL.Time(deserialized);
   *
   * @return {Object}
   */
  toJSON() {
    let copy = [
      'year',
      'month',
      'day',
      'hour',
      'minute',
      'second',
      'isDate'
    ];

    let result = Object.create(null);

    let i = 0;
    let len = copy.length;
    let prop;

    for (; i < len; i++) {
      prop = copy[i];
      result[prop] = this[prop];
    }

    if (this.zone) {
      result.timezone = this.zone.tzid;
    }

    return result;
  }
}

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * Portions Copyright (C) Philipp Kewisch */


/**
 * This lets typescript resolve our custom types in the
 * generated d.ts files (jsdoc typedefs are converted to typescript types).
 * Ignore prevents the typedefs from being documented more than once.
 *
 * @ignore
 * @typedef {import("./types.js").parserState} parserState
 * Imports the 'parserState' type from the "types.js" module
 * @typedef {import("./types.js").designSet} designSet
 * Imports the 'designSet' type from the "types.js" module
 */

const CHAR = /[^ \t]/;
const VALUE_DELIMITER = ':';
const PARAM_DELIMITER = ';';
const PARAM_NAME_DELIMITER = '=';
const DEFAULT_VALUE_TYPE$1 = 'unknown';
const DEFAULT_PARAM_TYPE = 'text';
const RFC6868_REPLACE_MAP$1 = { "^'": '"', "^n": "\n", "^^": "^" };

/**
 * Parses iCalendar or vCard data into a raw jCal object. Consult
 * documentation on the {@tutorial layers|layers of parsing} for more
 * details.
 *
 * @function ICAL.parse
 * @memberof ICAL
 * @variation function
 * @todo Fix the API to be more clear on the return type
 * @param {String} input      The string data to parse
 * @return {Object|Object[]}  A single jCal object, or an array thereof
 */
function parse(input) {
  let state = {};
  let root = state.component = [];

  state.stack = [root];

  parse._eachLine(input, function(err, line) {
    parse._handleContentLine(line, state);
  });


  // when there are still items on the stack
  // throw a fatal error, a component was not closed
  // correctly in that case.
  if (state.stack.length > 1) {
    throw new ParserError(
      'invalid ical body. component began but did not end'
    );
  }

  state = null;

  return (root.length == 1 ? root[0] : root);
}

/**
 * Parse an iCalendar property value into the jCal for a single property
 *
 * @function ICAL.parse.property
 * @param {String} str
 *   The iCalendar property string to parse
 * @param {designSet=} designSet
 *   The design data to use for this property
 * @return {Object}
 *   The jCal Object containing the property
 */
parse.property = function(str, designSet) {
  let state = {
    component: [[], []],
    designSet: designSet || design.defaultSet
  };
  parse._handleContentLine(str, state);
  return state.component[1][0];
};

/**
 * Convenience method to parse a component. You can use ICAL.parse() directly
 * instead.
 *
 * @function ICAL.parse.component
 * @see ICAL.parse(function)
 * @param {String} str    The iCalendar component string to parse
 * @return {Object}       The jCal Object containing the component
 */
parse.component = function(str) {
  return parse(str);
};


/**
 * An error that occurred during parsing.
 *
 * @param {String} message        The error message
 * @memberof ICAL.parse
 * @extends {Error}
 */
class ParserError extends Error {
  name = this.constructor.name;
}

// classes & constants
parse.ParserError = ParserError;


/**
 * Handles a single line of iCalendar/vCard, updating the state.
 *
 * @private
 * @function ICAL.parse._handleContentLine
 * @param {String} line          The content line to process
 * @param {parserState} state    The current state of the line parsing
 */
parse._handleContentLine = function(line, state) {
  // break up the parts of the line
  let valuePos = line.indexOf(VALUE_DELIMITER);
  let paramPos = line.indexOf(PARAM_DELIMITER);

  let lastParamIndex;
  let lastValuePos;

  // name of property or begin/end
  let name;
  let value;
  // params is only overridden if paramPos !== -1.
  // we can't do params = params || {} later on
  // because it sacrifices ops.
  let params = {};

  /**
   * Different property cases
   *
   *
   * 1. RRULE:FREQ=foo
   *    // FREQ= is not a param but the value
   *
   * 2. ATTENDEE;ROLE=REQ-PARTICIPANT;
   *    // ROLE= is a param because : has not happened yet
   */
    // when the parameter delimiter is after the
    // value delimiter then it is not a parameter.

  if ((paramPos !== -1 && valuePos !== -1)) {
    // when the parameter delimiter is after the
    // value delimiter then it is not a parameter.
    if (paramPos > valuePos) {
      paramPos = -1;
    }
  }

  let parsedParams;
  if (paramPos !== -1) {
    name = line.slice(0, Math.max(0, paramPos)).toLowerCase();
    parsedParams = parse._parseParameters(line.slice(Math.max(0, paramPos)), 0, state.designSet);
    if (parsedParams[2] == -1) {
      throw new ParserError("Invalid parameters in '" + line + "'");
    }
    params = parsedParams[0];
    // Handle parameter values with multiple entries
    let parsedParamLength;
    if (typeof parsedParams[1] === 'string') {
      parsedParamLength = parsedParams[1].length;
    } else {
      parsedParamLength = parsedParams[1].reduce((accumulator, currentValue) => {
        return accumulator + currentValue.length;
      }, 0);
    }
    lastParamIndex = parsedParamLength + parsedParams[2] + paramPos;
    if ((lastValuePos =
      line.slice(Math.max(0, lastParamIndex)).indexOf(VALUE_DELIMITER)) !== -1) {
      value = line.slice(Math.max(0, lastParamIndex + lastValuePos + 1));
    } else {
      throw new ParserError("Missing parameter value in '" + line + "'");
    }
  } else if (valuePos !== -1) {
    // without parmeters (BEGIN:VCAENDAR, CLASS:PUBLIC)
    name = line.slice(0, Math.max(0, valuePos)).toLowerCase();
    value = line.slice(Math.max(0, valuePos + 1));

    if (name === 'begin') {
      let newComponent = [value.toLowerCase(), [], []];
      if (state.stack.length === 1) {
        state.component.push(newComponent);
      } else {
        state.component[2].push(newComponent);
      }
      state.stack.push(state.component);
      state.component = newComponent;
      if (!state.designSet) {
        state.designSet = design.getDesignSet(state.component[0]);
      }
      return;
    } else if (name === 'end') {
      state.component = state.stack.pop();
      return;
    }
    // If it is not begin/end, then this is a property with an empty value,
    // which should be considered valid.
  } else {
    /**
     * Invalid line.
     * The rational to throw an error is we will
     * never be certain that the rest of the file
     * is sane and it is unlikely that we can serialize
     * the result correctly either.
     */
    throw new ParserError(
      'invalid line (no token ";" or ":") "' + line + '"'
    );
  }

  let valueType;
  let multiValue = false;
  let structuredValue = false;
  let propertyDetails;
  let splitName;
  let ungroupedName;

  // fetch the ungrouped part of the name
  if (state.designSet.propertyGroups && name.indexOf('.') !== -1) {
    splitName = name.split('.');
    params.group = splitName[0];
    ungroupedName = splitName[1];
  } else {
    ungroupedName = name;
  }

  if (ungroupedName in state.designSet.property) {
    propertyDetails = state.designSet.property[ungroupedName];

    if ('multiValue' in propertyDetails) {
      multiValue = propertyDetails.multiValue;
    }

    if ('structuredValue' in propertyDetails) {
      structuredValue = propertyDetails.structuredValue;
    }

    if (value && 'detectType' in propertyDetails) {
      valueType = propertyDetails.detectType(value);
    }
  }

  // attempt to determine value
  if (!valueType) {
    if (!('value' in params)) {
      if (propertyDetails) {
        valueType = propertyDetails.defaultType;
      } else {
        valueType = DEFAULT_VALUE_TYPE$1;
      }
    } else {
      // possible to avoid this?
      valueType = params.value.toLowerCase();
    }
  }

  delete params.value;

  /**
   * Note on `var result` juggling:
   *
   * I observed that building the array in pieces has adverse
   * effects on performance, so where possible we inline the creation.
   * It is a little ugly but resulted in ~2000 additional ops/sec.
   */

  let result;
  if (multiValue && structuredValue) {
    value = parse._parseMultiValue(value, structuredValue, valueType, [], multiValue, state.designSet, structuredValue);
    result = [ungroupedName, params, valueType, value];
  } else if (multiValue) {
    result = [ungroupedName, params, valueType];
    parse._parseMultiValue(value, multiValue, valueType, result, null, state.designSet, false);
  } else if (structuredValue) {
    value = parse._parseMultiValue(value, structuredValue, valueType, [], null, state.designSet, structuredValue);
    result = [ungroupedName, params, valueType, value];
  } else {
    value = parse._parseValue(value, valueType, state.designSet, false);
    result = [ungroupedName, params, valueType, value];
  }
  // rfc6350 requires that in vCard 4.0 the first component is the VERSION
  // component with as value 4.0, note that 3.0 does not have this requirement.
  if (state.component[0] === 'vcard' && state.component[1].length === 0 &&
          !(name === 'version' && value === '4.0')) {
    state.designSet = design.getDesignSet("vcard3");
  }
  state.component[1].push(result);
};

/**
 * Parse a value from the raw value into the jCard/jCal value.
 *
 * @private
 * @function ICAL.parse._parseValue
 * @param {String} value          Original value
 * @param {String} type           Type of value
 * @param {Object} designSet      The design data to use for this value
 * @return {Object} varies on type
 */
parse._parseValue = function(value, type, designSet, structuredValue) {
  if (type in designSet.value && 'fromICAL' in designSet.value[type]) {
    return designSet.value[type].fromICAL(value, structuredValue);
  }
  return value;
};

/**
 * Parse parameters from a string to object.
 *
 * @function ICAL.parse._parseParameters
 * @private
 * @param {String} line               A single unfolded line
 * @param {Number} start              Position to start looking for properties
 * @param {Object} designSet          The design data to use for this property
 * @return {Array}                    Array containing key/valye pairs of parsed parameters, the
 *                                      parsed value, and the position of the last parameter found
 */
parse._parseParameters = function(line, start, designSet) {
  let lastParam = start;
  let pos = 0;
  let delim = PARAM_NAME_DELIMITER;
  let result = {};
  let name, lcname;
  let value, valuePos = -1;
  let type, multiValue, mvdelim;

  // find the next '=' sign
  // use lastParam and pos to find name
  // check if " is used if so get value from "->"
  // then increment pos to find next ;

  while ((pos !== false) &&
         (pos = line.indexOf(delim, pos + 1)) !== -1) {

    name = line.slice(lastParam + 1, pos);
    if (name.length == 0) {
      throw new ParserError("Empty parameter name in '" + line + "'");
    }
    lcname = name.toLowerCase();
    mvdelim = false;
    multiValue = false;

    if (lcname in designSet.param && designSet.param[lcname].valueType) {
      type = designSet.param[lcname].valueType;
    } else {
      type = DEFAULT_PARAM_TYPE;
    }

    if (lcname in designSet.param) {
      multiValue = designSet.param[lcname].multiValue;
      if (designSet.param[lcname].multiValueSeparateDQuote) {
        mvdelim = parse._rfc6868Escape('"' + multiValue + '"');
      }
    }

    let nextChar = line[pos + 1];
    if (nextChar === '"') {
      valuePos = pos + 2;
      pos = line.indexOf('"', valuePos);
      if (multiValue && pos != -1) {
          let extendedValue = true;
          while (extendedValue) {
            if (line[pos + 1] == multiValue && line[pos + 2] == '"') {
              pos = line.indexOf('"', pos + 3);
            } else {
              extendedValue = false;
            }
          }
        }
      if (pos === -1) {
        throw new ParserError(
          'invalid line (no matching double quote) "' + line + '"'
        );
      }
      value = line.slice(valuePos, pos);
      lastParam = line.indexOf(PARAM_DELIMITER, pos);
      let propValuePos = line.indexOf(VALUE_DELIMITER, pos);
      // if either no next parameter or delimeter in property value, let's stop here
      if (lastParam === -1 || (propValuePos !== -1 && lastParam > propValuePos)) {
        pos = false;
      }
    } else {
      valuePos = pos + 1;

      // move to next ";"
      let nextPos = line.indexOf(PARAM_DELIMITER, valuePos);
      let propValuePos = line.indexOf(VALUE_DELIMITER, valuePos);
      if (propValuePos !== -1 && nextPos > propValuePos) {
        // this is a delimiter in the property value, let's stop here
        nextPos = propValuePos;
        pos = false;
      } else if (nextPos === -1) {
        // no ";"
        if (propValuePos === -1) {
          nextPos = line.length;
        } else {
          nextPos = propValuePos;
        }
        pos = false;
      } else {
        lastParam = nextPos;
        pos = nextPos;
      }

      value = line.slice(valuePos, nextPos);
    }

    const length_before = value.length;
    value = parse._rfc6868Escape(value);
    valuePos += length_before - value.length;
    if (multiValue) {
      let delimiter = mvdelim || multiValue;
      value = parse._parseMultiValue(value, delimiter, type, [], null, designSet);
    } else {
      value = parse._parseValue(value, type, designSet);
    }

    if (multiValue && (lcname in result)) {
      if (Array.isArray(result[lcname])) {
        result[lcname].push(value);
      } else {
        result[lcname] = [
          result[lcname],
          value
        ];
      }
    } else {
      result[lcname] = value;
    }
  }
  return [result, value, valuePos];
};

/**
 * Internal helper for rfc6868. Exposing this on ICAL.parse so that
 * hackers can disable the rfc6868 parsing if the really need to.
 *
 * @function ICAL.parse._rfc6868Escape
 * @param {String} val        The value to escape
 * @return {String}           The escaped value
 */
parse._rfc6868Escape = function(val) {
  return val.replace(/\^['n^]/g, function(x) {
    return RFC6868_REPLACE_MAP$1[x];
  });
};

/**
 * Parse a multi value string. This function is used either for parsing
 * actual multi-value property's values, or for handling parameter values. It
 * can be used for both multi-value properties and structured value properties.
 *
 * @private
 * @function ICAL.parse._parseMultiValue
 * @param {String} buffer           The buffer containing the full value
 * @param {String} delim            The multi-value delimiter
 * @param {String} type             The value type to be parsed
 * @param {Array.<?>} result        The array to append results to, varies on value type
 * @param {String} innerMulti       The inner delimiter to split each value with
 * @param {designSet} designSet     The design data for this value
 * @return {?|Array.<?>}            Either an array of results, or the first result
 */
parse._parseMultiValue = function(buffer, delim, type, result, innerMulti, designSet, structuredValue) {
  let pos = 0;
  let lastPos = 0;
  let value;
  if (delim.length === 0) {
    return buffer;
  }

  // split each piece
  while ((pos = unescapedIndexOf(buffer, delim, lastPos)) !== -1) {
    value = buffer.slice(lastPos, pos);
    if (innerMulti) {
      value = parse._parseMultiValue(value, innerMulti, type, [], null, designSet, structuredValue);
    } else {
      value = parse._parseValue(value, type, designSet, structuredValue);
    }
    result.push(value);
    lastPos = pos + delim.length;
  }

  // on the last piece take the rest of string
  value = buffer.slice(lastPos);
  if (innerMulti) {
    value = parse._parseMultiValue(value, innerMulti, type, [], null, designSet, structuredValue);
  } else {
    value = parse._parseValue(value, type, designSet, structuredValue);
  }
  result.push(value);

  return result.length == 1 ? result[0] : result;
};

/**
 * Process a complete buffer of iCalendar/vCard data line by line, correctly
 * unfolding content. Each line will be processed with the given callback
 *
 * @private
 * @function ICAL.parse._eachLine
 * @param {String} buffer                         The buffer to process
 * @param {function(?String, String)} callback    The callback for each line
 */
parse._eachLine = function(buffer, callback) {
  let len = buffer.length;
  let lastPos = buffer.search(CHAR);
  let pos = lastPos;
  let line;
  let firstChar;

  let newlineOffset;

  do {
    pos = buffer.indexOf('\n', lastPos) + 1;

    if (pos > 1 && buffer[pos - 2] === '\r') {
      newlineOffset = 2;
    } else {
      newlineOffset = 1;
    }

    if (pos === 0) {
      pos = len;
      newlineOffset = 0;
    }

    firstChar = buffer[lastPos];

    if (firstChar === ' ' || firstChar === '\t') {
      // add to line
      line += buffer.slice(lastPos + 1, pos - newlineOffset);
    } else {
      if (line)
        callback(null, line);
      // push line
      line = buffer.slice(lastPos, pos - newlineOffset);
    }

    lastPos = pos;
  } while (pos !== len);

  // extra ending line
  line = line.trim();

  if (line.length)
    callback(null, line);
};

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * Portions Copyright (C) Philipp Kewisch */


const OPTIONS = ["tzid", "location", "tznames", "latitude", "longitude"];

/**
 * Timezone representation.
 *
 * @example
 * var vcalendar;
 * var timezoneComp = vcalendar.getFirstSubcomponent('vtimezone');
 * var tzid = timezoneComp.getFirstPropertyValue('tzid');
 *
 * var timezone = new ICAL.Timezone({
 *   component: timezoneComp,
 *   tzid
 * });
 *
 * @memberof ICAL
 */
class Timezone {
  static _compare_change_fn(a, b) {
    if (a.year < b.year) return -1;
    else if (a.year > b.year) return 1;

    if (a.month < b.month) return -1;
    else if (a.month > b.month) return 1;

    if (a.day < b.day) return -1;
    else if (a.day > b.day) return 1;

    if (a.hour < b.hour) return -1;
    else if (a.hour > b.hour) return 1;

    if (a.minute < b.minute) return -1;
    else if (a.minute > b.minute) return 1;

    if (a.second < b.second) return -1;
    else if (a.second > b.second) return 1;

    return 0;
  }

  /**
   * Convert the date/time from one zone to the next.
   *
   * @param {Time} tt                  The time to convert
   * @param {Timezone} from_zone       The source zone to convert from
   * @param {Timezone} to_zone         The target zone to convert to
   * @return {Time}                    The converted date/time object
   */
  static convert_time(tt, from_zone, to_zone) {
    if (tt.isDate ||
        from_zone.tzid == to_zone.tzid ||
        from_zone == Timezone.localTimezone ||
        to_zone == Timezone.localTimezone) {
      tt.zone = to_zone;
      return tt;
    }

    let utcOffset = from_zone.utcOffset(tt);
    tt.adjust(0, 0, 0, - utcOffset);

    utcOffset = to_zone.utcOffset(tt);
    tt.adjust(0, 0, 0, utcOffset);

    return null;
  }

  /**
   * Creates a new ICAL.Timezone instance from the passed data object.
   *
   * @param {Component|Object} aData options for class
   * @param {String|Component} aData.component
   *        If aData is a simple object, then this member can be set to either a
   *        string containing the component data, or an already parsed
   *        ICAL.Component
   * @param {String} aData.tzid      The timezone identifier
   * @param {String} aData.location  The timezone locationw
   * @param {String} aData.tznames   An alternative string representation of the
   *                                  timezone
   * @param {Number} aData.latitude  The latitude of the timezone
   * @param {Number} aData.longitude The longitude of the timezone
   */
  static fromData(aData) {
    let tt = new Timezone();
    return tt.fromData(aData);
  }

  /**
   * The instance describing the UTC timezone
   * @type {Timezone}
   * @constant
   * @instance
   */
  static #utcTimezone = null;
  static get utcTimezone() {
    if (!this.#utcTimezone) {
      this.#utcTimezone = Timezone.fromData({
        tzid: "UTC"
      });
    }
    return this.#utcTimezone;
  }

  /**
   * The instance describing the local timezone
   * @type {Timezone}
   * @constant
   * @instance
   */
  static #localTimezone = null;
  static get localTimezone() {
    if (!this.#localTimezone) {
      this.#localTimezone = Timezone.fromData({
        tzid: "floating"
      });
    }
    return this.#localTimezone;
  }

  /**
   * Adjust a timezone change object.
   * @private
   * @param {Object} change     The timezone change object
   * @param {Number} days       The extra amount of days
   * @param {Number} hours      The extra amount of hours
   * @param {Number} minutes    The extra amount of minutes
   * @param {Number} seconds    The extra amount of seconds
   */
  static adjust_change(change, days, hours, minutes, seconds) {
    return Time.prototype.adjust.call(
      change,
      days,
      hours,
      minutes,
      seconds,
      change
    );
  }

  static _minimumExpansionYear = -1;
  static EXTRA_COVERAGE = 5;

  /**
   * Creates a new ICAL.Timezone instance, by passing in a tzid and component.
   *
   * @param {Component|Object} data options for class
   * @param {String|Component} data.component
   *        If data is a simple object, then this member can be set to either a
   *        string containing the component data, or an already parsed
   *        ICAL.Component
   * @param {String} data.tzid      The timezone identifier
   * @param {String} data.location  The timezone locationw
   * @param {String} data.tznames   An alternative string representation of the
   *                                  timezone
   * @param {Number} data.latitude  The latitude of the timezone
   * @param {Number} data.longitude The longitude of the timezone
   */
  constructor(data) {
    this.wrappedJSObject = this;
    this.fromData(data);
  }


  /**
   * Timezone identifier
   * @type {String}
   */
  tzid = "";

  /**
   * Timezone location
   * @type {String}
   */
  location = "";

  /**
   * Alternative timezone name, for the string representation
   * @type {String}
   */
  tznames = "";

  /**
   * The primary latitude for the timezone.
   * @type {Number}
   */
  latitude = 0.0;

  /**
   * The primary longitude for the timezone.
   * @type {Number}
   */
  longitude = 0.0;

  /**
   * The vtimezone component for this timezone.
   * @type {Component}
   */
  component = null;

  /**
   * The year this timezone has been expanded to. All timezone transition
   * dates until this year are known and can be used for calculation
   *
   * @private
   * @type {Number}
   */
  expandedUntilYear = 0;

  /**
   * The class identifier.
   * @constant
   * @type {String}
   * @default "icaltimezone"
   */
  icalclass = "icaltimezone";

  /**
   * Sets up the current instance using members from the passed data object.
   *
   * @param {Component|Object} aData options for class
   * @param {String|Component} aData.component
   *        If aData is a simple object, then this member can be set to either a
   *        string containing the component data, or an already parsed
   *        ICAL.Component
   * @param {String} aData.tzid      The timezone identifier
   * @param {String} aData.location  The timezone locationw
   * @param {String} aData.tznames   An alternative string representation of the
   *                                  timezone
   * @param {Number} aData.latitude  The latitude of the timezone
   * @param {Number} aData.longitude The longitude of the timezone
   */
  fromData(aData) {
    this.expandedUntilYear = 0;
    this.changes = [];

    if (aData instanceof Component) {
      // Either a component is passed directly
      this.component = aData;
    } else {
      // Otherwise the component may be in the data object
      if (aData && "component" in aData) {
        if (typeof aData.component == "string") {
          // If a string was passed, parse it as a component
          let jCal = parse(aData.component);
          this.component = new Component(jCal);
        } else if (aData.component instanceof Component) {
          // If it was a component already, then just set it
          this.component = aData.component;
        } else {
          // Otherwise just null out the component
          this.component = null;
        }
      }

      // Copy remaining passed properties
      for (let prop of OPTIONS) {
        if (aData && prop in aData) {
          this[prop] = aData[prop];
        }
      }
    }

    // If we have a component but no TZID, attempt to get it from the
    // component's properties.
    if (this.component instanceof Component && !this.tzid) {
      this.tzid = this.component.getFirstPropertyValue('tzid');
    }

    return this;
  }

  /**
   * Finds the utcOffset the given time would occur in this timezone.
   *
   * @param {Time} tt         The time to check for
   * @return {Number}         utc offset in seconds
   */
  utcOffset(tt) {
    if (this == Timezone.utcTimezone || this == Timezone.localTimezone) {
      return 0;
    }

    this._ensureCoverage(tt.year);

    if (!this.changes.length) {
      return 0;
    }

    let tt_change = {
      year: tt.year,
      month: tt.month,
      day: tt.day,
      hour: tt.hour,
      minute: tt.minute,
      second: tt.second
    };

    let change_num = this._findNearbyChange(tt_change);
    let change_num_to_use = -1;
    let step = 1;

    // TODO: replace with bin search?
    for (;;) {
      let change = clone(this.changes[change_num], true);
      if (change.utcOffset < change.prevUtcOffset) {
        Timezone.adjust_change(change, 0, 0, 0, change.utcOffset);
      } else {
        Timezone.adjust_change(change, 0, 0, 0,
                                        change.prevUtcOffset);
      }

      let cmp = Timezone._compare_change_fn(tt_change, change);

      if (cmp >= 0) {
        change_num_to_use = change_num;
      } else {
        step = -1;
      }

      if (step == -1 && change_num_to_use != -1) {
        break;
      }

      change_num += step;

      if (change_num < 0) {
        return 0;
      }

      if (change_num >= this.changes.length) {
        break;
      }
    }

    let zone_change = this.changes[change_num_to_use];
    let utcOffset_change = zone_change.utcOffset - zone_change.prevUtcOffset;

    if (utcOffset_change < 0 && change_num_to_use > 0) {
      let tmp_change = clone(zone_change, true);
      Timezone.adjust_change(tmp_change, 0, 0, 0, tmp_change.prevUtcOffset);

      if (Timezone._compare_change_fn(tt_change, tmp_change) < 0) {
        let prev_zone_change = this.changes[change_num_to_use - 1];

        let want_daylight = false; // TODO

        if (zone_change.is_daylight != want_daylight &&
            prev_zone_change.is_daylight == want_daylight) {
          zone_change = prev_zone_change;
        }
      }
    }

    // TODO return is_daylight?
    return zone_change.utcOffset;
  }

  _findNearbyChange(change) {
    // find the closest match
    let idx = binsearchInsert(
      this.changes,
      change,
      Timezone._compare_change_fn
    );

    if (idx >= this.changes.length) {
      return this.changes.length - 1;
    }

    return idx;
  }

  _ensureCoverage(aYear) {
    if (Timezone._minimumExpansionYear == -1) {
      let today = Time.now();
      Timezone._minimumExpansionYear = today.year;
    }

    let changesEndYear = aYear;
    if (changesEndYear < Timezone._minimumExpansionYear) {
      changesEndYear = Timezone._minimumExpansionYear;
    }

    changesEndYear += Timezone.EXTRA_COVERAGE;

    if (!this.changes.length || this.expandedUntilYear < aYear) {
      let subcomps = this.component.getAllSubcomponents();
      let compLen = subcomps.length;
      let compIdx = 0;

      for (; compIdx < compLen; compIdx++) {
        this._expandComponent(
          subcomps[compIdx], changesEndYear, this.changes
        );
      }

      this.changes.sort(Timezone._compare_change_fn);
      this.expandedUntilYear = changesEndYear;
    }
  }

  _expandComponent(aComponent, aYear, changes) {
    if (!aComponent.hasProperty("dtstart") ||
        !aComponent.hasProperty("tzoffsetto") ||
        !aComponent.hasProperty("tzoffsetfrom")) {
      return null;
    }

    let dtstart = aComponent.getFirstProperty("dtstart").getFirstValue();
    let change;

    function convert_tzoffset(offset) {
      return offset.factor * (offset.hours * 3600 + offset.minutes * 60);
    }

    function init_changes() {
      let changebase = {};
      changebase.is_daylight = (aComponent.name == "daylight");
      changebase.utcOffset = convert_tzoffset(
        aComponent.getFirstProperty("tzoffsetto").getFirstValue()
      );

      changebase.prevUtcOffset = convert_tzoffset(
        aComponent.getFirstProperty("tzoffsetfrom").getFirstValue()
      );

      return changebase;
    }

    if (!aComponent.hasProperty("rrule") && !aComponent.hasProperty("rdate")) {
      change = init_changes();
      change.year = dtstart.year;
      change.month = dtstart.month;
      change.day = dtstart.day;
      change.hour = dtstart.hour;
      change.minute = dtstart.minute;
      change.second = dtstart.second;

      Timezone.adjust_change(change, 0, 0, 0, -change.prevUtcOffset);
      changes.push(change);
    } else {
      let props = aComponent.getAllProperties("rdate");
      for (let rdate of props) {
        let time = rdate.getFirstValue();
        change = init_changes();

        change.year = time.year;
        change.month = time.month;
        change.day = time.day;

        if (time.isDate) {
          change.hour = dtstart.hour;
          change.minute = dtstart.minute;
          change.second = dtstart.second;

          if (dtstart.zone != Timezone.utcTimezone) {
            Timezone.adjust_change(change, 0, 0, 0, -change.prevUtcOffset);
          }
        } else {
          change.hour = time.hour;
          change.minute = time.minute;
          change.second = time.second;

          if (time.zone != Timezone.utcTimezone) {
            Timezone.adjust_change(change, 0, 0, 0, -change.prevUtcOffset);
          }
        }

        changes.push(change);
      }

      let rrule = aComponent.getFirstProperty("rrule");

      if (rrule) {
        rrule = rrule.getFirstValue();
        change = init_changes();

        if (rrule.until && rrule.until.zone == Timezone.utcTimezone) {
          rrule.until.adjust(0, 0, 0, change.prevUtcOffset);
          rrule.until.zone = Timezone.localTimezone;
        }

        let iterator = rrule.iterator(dtstart);

        let occ;
        while ((occ = iterator.next())) {
          change = init_changes();
          if (occ.year > aYear || !occ) {
            break;
          }

          change.year = occ.year;
          change.month = occ.month;
          change.day = occ.day;
          change.hour = occ.hour;
          change.minute = occ.minute;
          change.second = occ.second;
          change.isDate = occ.isDate;

          Timezone.adjust_change(change, 0, 0, 0, -change.prevUtcOffset);
          changes.push(change);
        }
      }
    }

    return changes;
  }

  /**
   * The string representation of this timezone.
   * @return {String}
   */
  toString() {
    return (this.tznames ? this.tznames : this.tzid);
  }
}

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * Portions Copyright (C) Philipp Kewisch */


let zones = null;

/**
 * @classdesc
 * Singleton class to contain timezones.  Right now it is all manual registry in
 * the future we may use this class to download timezone information or handle
 * loading pre-expanded timezones.
 *
 * @exports module:ICAL.TimezoneService
 * @memberof ICAL
 */
const TimezoneService = {
  get count() {
    if (zones === null) {
      return 0;
    }

    return Object.keys(zones).length;
  },

  reset: function() {
    zones = Object.create(null);
    let utc = Timezone.utcTimezone;

    zones.Z = utc;
    zones.UTC = utc;
    zones.GMT = utc;
  },
  _hard_reset: function() {
    zones = null;
  },

  /**
   * Checks if timezone id has been registered.
   *
   * @param {String} tzid     Timezone identifier (e.g. America/Los_Angeles)
   * @return {Boolean}        False, when not present
   */
  has: function(tzid) {
    if (zones === null) {
      return false;
    }

    return !!zones[tzid];
  },

  /**
   * Returns a timezone by its tzid if present.
   *
   * @param {String} tzid               Timezone identifier (e.g. America/Los_Angeles)
   * @return {Timezone | undefined}     The timezone, or undefined if not found
   */
  get: function(tzid) {
    if (zones === null) {
      this.reset();
    }

    return zones[tzid];
  },

  /**
   * Registers a timezone object or component.
   *
   * @param {Component|Timezone} timezone
   *        The initialized zone or vtimezone.
   *
   * @param {String=} name
   *        The name of the timezone. Defaults to the component's TZID if not
   *        passed.
   */
  register: function(timezone, name) {
    if (zones === null) {
      this.reset();
    }

    // This avoids a breaking change by the change of argument order
    // TODO remove in v3
    if (typeof timezone === "string" && name instanceof Timezone) {
      [timezone, name] = [name, timezone];
    }

    if (!name) {
      if (timezone instanceof Timezone) {
        name = timezone.tzid;
      } else {
        if (timezone.name === 'vtimezone') {
          timezone = new Timezone(timezone);
          name = timezone.tzid;
        }
      }
    }

    if (!name) {
      throw new TypeError("Neither a timezone nor a name was passed");
    }

    if (timezone instanceof Timezone) {
      zones[name] = timezone;
    } else {
      throw new TypeError('timezone must be ICAL.Timezone or ICAL.Component');
    }
  },

  /**
   * Removes a timezone by its tzid from the list.
   *
   * @param {String} tzid     Timezone identifier (e.g. America/Los_Angeles)
   * @return {?Timezone}      The removed timezone, or null if not registered
   */
  remove: function(tzid) {
    if (zones === null) {
      return null;
    }

    return (delete zones[tzid]);
  }
};

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * Portions Copyright (C) Philipp Kewisch */


/**
 * Helper functions used in various places within ical.js
 * @module ICAL.helpers
 */

/**
 * Compiles a list of all referenced TZIDs in all subcomponents and
 * removes any extra VTIMEZONE subcomponents. In addition, if any TZIDs
 * are referenced by a component, but a VTIMEZONE does not exist,
 * an attempt will be made to generate a VTIMEZONE using ICAL.TimezoneService.
 *
 * @param {Component} vcal     The top-level VCALENDAR component.
 * @return {Component}         The ICAL.Component that was passed in.
 */
function updateTimezones(vcal) {
  let allsubs, properties, vtimezones, reqTzid, i;

  if (!vcal || vcal.name !== "vcalendar") {
    //not a top-level vcalendar component
    return vcal;
  }

  //Store vtimezone subcomponents in an object reference by tzid.
  //Store properties from everything else in another array
  allsubs = vcal.getAllSubcomponents();
  properties = [];
  vtimezones = {};
  for (i = 0; i < allsubs.length; i++) {
    if (allsubs[i].name === "vtimezone") {
      let tzid = allsubs[i].getFirstProperty("tzid").getFirstValue();
      vtimezones[tzid] = allsubs[i];
    } else {
      properties = properties.concat(allsubs[i].getAllProperties());
    }
  }

  //create an object with one entry for each required tz
  reqTzid = {};
  for (i = 0; i < properties.length; i++) {
    let tzid = properties[i].getParameter("tzid");
    if (tzid) {
      reqTzid[tzid] = true;
    }
  }

  //delete any vtimezones that are not on the reqTzid list.
  for (let [tzid, comp] of Object.entries(vtimezones)) {
    if (!reqTzid[tzid]) {
      vcal.removeSubcomponent(comp);
    }
  }

  //create any missing, but registered timezones
  for (let tzid of Object.keys(reqTzid)) {
    if (!vtimezones[tzid] && TimezoneService.has(tzid)) {
      vcal.addSubcomponent(TimezoneService.get(tzid).component);
    }
  }

  return vcal;
}

/**
 * Checks if the given type is of the number type and also NaN.
 *
 * @param {Number} number     The number to check
 * @return {Boolean}          True, if the number is strictly NaN
 */
function isStrictlyNaN(number) {
  return typeof(number) === 'number' && isNaN(number);
}

/**
 * Parses a string value that is expected to be an integer, when the valid is
 * not an integer throws a decoration error.
 *
 * @param {String} string     Raw string input
 * @return {Number}           Parsed integer
 */
function strictParseInt(string) {
  let result = parseInt(string, 10);

  if (isStrictlyNaN(result)) {
    throw new Error(
      'Could not extract integer from "' + string + '"'
    );
  }

  return result;
}

/**
 * Creates or returns a class instance of a given type with the initialization
 * data if the data is not already an instance of the given type.
 *
 * @example
 * var time = new ICAL.Time(...);
 * var result = ICAL.helpers.formatClassType(time, ICAL.Time);
 *
 * (result instanceof ICAL.Time)
 * // => true
 *
 * result = ICAL.helpers.formatClassType({}, ICAL.Time);
 * (result isntanceof ICAL.Time)
 * // => true
 *
 *
 * @param {Object} data       object initialization data
 * @param {Object} type       object type (like ICAL.Time)
 * @return {?}                An instance of the found type.
 */
function formatClassType(data, type) {
  if (typeof(data) === 'undefined') {
    return undefined;
  }

  if (data instanceof type) {
    return data;
  }
  return new type(data);
}

/**
 * Identical to indexOf but will only match values when they are not preceded
 * by a backslash character.
 *
 * @param {String} buffer         String to search
 * @param {String} search         Value to look for
 * @param {Number} pos            Start position
 * @return {Number}               The position, or -1 if not found
 */
function unescapedIndexOf(buffer, search, pos) {
  while ((pos = buffer.indexOf(search, pos)) !== -1) {
    if (pos > 0 && buffer[pos - 1] === '\\') {
      pos += 1;
    } else {
      return pos;
    }
  }
  return -1;
}

/**
 * Find the index for insertion using binary search.
 *
 * @param {Array} list            The list to search
 * @param {?} seekVal             The value to insert
 * @param {function(?,?)} cmpfunc The comparison func, that can
 *                                  compare two seekVals
 * @return {Number}               The insert position
 */
function binsearchInsert(list, seekVal, cmpfunc) {
  if (!list.length)
    return 0;

  let low = 0, high = list.length - 1,
      mid, cmpval;

  while (low <= high) {
    mid = low + Math.floor((high - low) / 2);
    cmpval = cmpfunc(seekVal, list[mid]);

    if (cmpval < 0)
      high = mid - 1;
    else if (cmpval > 0)
      low = mid + 1;
    else
      break;
  }

  if (cmpval < 0)
    return mid; // insertion is displacing, so use mid outright.
  else if (cmpval > 0)
    return mid + 1;
  else
    return mid;
}

/**
 * Clone the passed object or primitive. By default a shallow clone will be
 * executed.
 *
 * @param {*} aSrc            The thing to clone
 * @param {Boolean=} aDeep    If true, a deep clone will be performed
 * @return {*}                The copy of the thing
 */
function clone(aSrc, aDeep) {
  if (!aSrc || typeof aSrc != "object") {
    return aSrc;
  } else if (aSrc instanceof Date) {
    return new Date(aSrc.getTime());
  } else if ("clone" in aSrc) {
    return aSrc.clone();
  } else if (Array.isArray(aSrc)) {
    let arr = [];
    for (let i = 0; i < aSrc.length; i++) {
      arr.push(aDeep ? clone(aSrc[i], true) : aSrc[i]);
    }
    return arr;
  } else {
    let obj = {};
    for (let [name, value] of Object.entries(aSrc)) {
      if (aDeep) {
        obj[name] = clone(value, true);
      } else {
        obj[name] = value;
      }
    }
    return obj;
  }
}

/**
 * Performs iCalendar line folding. A line ending character is inserted and
 * the next line begins with a whitespace.
 *
 * @example
 * SUMMARY:This line will be fold
 *  ed right in the middle of a word.
 *
 * @param {String} aLine      The line to fold
 * @return {String}           The folded line
 */
function foldline(aLine) {
  let result = "";
  let line = aLine || "", pos = 0, line_length = 0;
  //pos counts position in line for the UTF-16 presentation
  //line_length counts the bytes for the UTF-8 presentation
  while (line.length) {
    let cp = line.codePointAt(pos);
    if (cp < 128) ++line_length;
    else if (cp < 2048) line_length += 2;//needs 2 UTF-8 bytes
    else if (cp < 65536) line_length += 3;
    else line_length += 4; //cp is less than 1114112
    if (line_length < ICALmodule.foldLength + 1)
      pos += cp > 65535 ? 2 : 1;
    else {
      result += ICALmodule.newLineChar + " " + line.slice(0, Math.max(0, pos));
      line = line.slice(Math.max(0, pos));
      pos = line_length = 0;
    }
  }
  return result.slice(ICALmodule.newLineChar.length + 1);
}

/**
 * Pads the given string or number with zeros so it will have at least two
 * characters.
 *
 * @param {String|Number} data    The string or number to pad
 * @return {String}               The number padded as a string
 */
function pad2(data) {
  if (typeof(data) !== 'string') {
    // handle fractions.
    if (typeof(data) === 'number') {
      data = parseInt(data);
    }
    data = String(data);
  }

  let len = data.length;

  switch (len) {
    case 0:
      return '00';
    case 1:
      return '0' + data;
    default:
      return data;
  }
}

/**
 * Truncates the given number, correctly handling negative numbers.
 *
 * @param {Number} number     The number to truncate
 * @return {Number}           The truncated number
 */
function trunc(number) {
  return (number < 0 ? Math.ceil(number) : Math.floor(number));
}

/**
 * Poor-man's cross-browser object extension. Doesn't support all the
 * features, but enough for our usage. Note that the target's properties are
 * not overwritten with the source properties.
 *
 * @example
 * var child = ICAL.helpers.extend(parent, {
 *   "bar": 123
 * });
 *
 * @param {Object} source     The object to extend
 * @param {Object} target     The object to extend with
 * @return {Object}           Returns the target.
 */
function extend(source, target) {
  for (let key in source) {
    let descr = Object.getOwnPropertyDescriptor(source, key);
    if (descr && !Object.getOwnPropertyDescriptor(target, key)) {
      Object.defineProperty(target, key, descr);
    }
  }
  return target;
}

var helpers = /*#__PURE__*/Object.freeze({
  __proto__: null,
  binsearchInsert: binsearchInsert,
  clone: clone,
  extend: extend,
  foldline: foldline,
  formatClassType: formatClassType,
  isStrictlyNaN: isStrictlyNaN,
  pad2: pad2,
  strictParseInt: strictParseInt,
  trunc: trunc,
  unescapedIndexOf: unescapedIndexOf,
  updateTimezones: updateTimezones
});

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * Portions Copyright (C) Philipp Kewisch */


/**
 * This class represents the "utc-offset" value type, with various calculation and manipulation
 * methods.
 *
 * @memberof ICAL
 */
class UtcOffset {
  /**
   * Creates a new {@link ICAL.UtcOffset} instance from the passed string.
   *
   * @param {String} aString    The string to parse
   * @return {Duration}         The created utc-offset instance
   */
  static fromString(aString) {
    // -05:00
    let options = {};
    //TODO: support seconds per rfc5545 ?
    options.factor = (aString[0] === '+') ? 1 : -1;
    options.hours = strictParseInt(aString.slice(1, 3));
    options.minutes = strictParseInt(aString.slice(4, 6));

    return new UtcOffset(options);
  }

  /**
   * Creates a new {@link ICAL.UtcOffset} instance from the passed seconds
   * value.
   *
   * @param {Number} aSeconds       The number of seconds to convert
   */
  static fromSeconds(aSeconds) {
    let instance = new UtcOffset();
    instance.fromSeconds(aSeconds);
    return instance;
  }

  /**
   * Creates a new ICAL.UtcOffset instance.
   *
   * @param {Object} aData          An object with members of the utc offset
   * @param {Number=} aData.hours   The hours for the utc offset
   * @param {Number=} aData.minutes The minutes in the utc offset
   * @param {Number=} aData.factor  The factor for the utc-offset, either -1 or 1
   */
  constructor(aData) {
    this.fromData(aData);
  }

  /**
   * The hours in the utc-offset
   * @type {Number}
   */
  hours = 0;

  /**
   * The minutes in the utc-offset
   * @type {Number}
   */
  minutes = 0;

  /**
   * The sign of the utc offset, 1 for positive offset, -1 for negative
   * offsets.
   * @type {Number}
   */
  factor = 1;

  /**
   * The type name, to be used in the jCal object.
   * @constant
   * @type {String}
   * @default "utc-offset"
   */
  icaltype = "utc-offset";

  /**
   * Returns a clone of the utc offset object.
   *
   * @return {UtcOffset}     The cloned object
   */
  clone() {
    return UtcOffset.fromSeconds(this.toSeconds());
  }

  /**
   * Sets up the current instance using members from the passed data object.
   *
   * @param {Object} aData          An object with members of the utc offset
   * @param {Number=} aData.hours   The hours for the utc offset
   * @param {Number=} aData.minutes The minutes in the utc offset
   * @param {Number=} aData.factor  The factor for the utc-offset, either -1 or 1
   */
  fromData(aData) {
    if (aData) {
      for (let [key, value] of Object.entries(aData)) {
        this[key] = value;
      }
    }
    this._normalize();
  }

  /**
   * Sets up the current instance from the given seconds value. The seconds
   * value is truncated to the minute. Offsets are wrapped when the world
   * ends, the hour after UTC+14:00 is UTC-12:00.
   *
   * @param {Number} aSeconds         The seconds to convert into an offset
   */
  fromSeconds(aSeconds) {
    let secs = Math.abs(aSeconds);

    this.factor = aSeconds < 0 ? -1 : 1;
    this.hours = trunc(secs / 3600);

    secs -= (this.hours * 3600);
    this.minutes = trunc(secs / 60);
    return this;
  }

  /**
   * Convert the current offset to a value in seconds
   *
   * @return {Number}                 The offset in seconds
   */
  toSeconds() {
    return this.factor * (60 * this.minutes + 3600 * this.hours);
  }

  /**
   * Compare this utc offset with another one.
   *
   * @param {UtcOffset} other             The other offset to compare with
   * @return {Number}                     -1, 0 or 1 for less/equal/greater
   */
  compare(other) {
    let a = this.toSeconds();
    let b = other.toSeconds();
    return (a > b) - (b > a);
  }

  _normalize() {
    // Range: 97200 seconds (with 1 hour inbetween)
    let secs = this.toSeconds();
    let factor = this.factor;
    while (secs < -43200) { // = UTC-12:00
      secs += 97200;
    }
    while (secs > 50400) { // = UTC+14:00
      secs -= 97200;
    }

    this.fromSeconds(secs);

    // Avoid changing the factor when on zero seconds
    if (secs == 0) {
      this.factor = factor;
    }
  }

  /**
   * The iCalendar string representation of this utc-offset.
   * @return {String}
   */
  toICALString() {
    return design.icalendar.value['utc-offset'].toICAL(this.toString());
  }

  /**
   * The string representation of this utc-offset.
   * @return {String}
   */
  toString() {
    return (this.factor == 1 ? "+" : "-") + pad2(this.hours) + ':' + pad2(this.minutes);
  }
}

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * Portions Copyright (C) Philipp Kewisch */


/**
 * Describes a vCard time, which has slight differences to the ICAL.Time.
 * Properties can be null if not specified, for example for dates with
 * reduced accuracy or truncation.
 *
 * Note that currently not all methods are correctly re-implemented for
 * VCardTime. For example, comparison will have undefined results when some
 * members are null.
 *
 * Also, normalization is not yet implemented for this class!
 *
 * @memberof ICAL
 * @extends {Time}
 */
class VCardTime extends Time {
  /**
   * Returns a new ICAL.VCardTime instance from a date and/or time string.
   *
   * @param {String} aValue     The string to create from
   * @param {String} aIcalType  The type for this instance, e.g. date-and-or-time
   * @return {VCardTime}        The date/time instance
   */
  static fromDateAndOrTimeString(aValue, aIcalType) {
    function part(v, s, e) {
      return v ? strictParseInt(v.slice(s, s + e)) : null;
    }
    let parts = aValue.split('T');
    let dt = parts[0], tmz = parts[1];
    let splitzone = tmz ? design.vcard.value.time._splitZone(tmz) : [];
    let zone = splitzone[0], tm = splitzone[1];

    let dtlen = dt ? dt.length : 0;
    let tmlen = tm ? tm.length : 0;

    let hasDashDate = dt && dt[0] == '-' && dt[1] == '-';
    let hasDashTime = tm && tm[0] == '-';

    let o = {
      year: hasDashDate ? null : part(dt, 0, 4),
      month: hasDashDate && (dtlen == 4 || dtlen == 7) ? part(dt, 2, 2) : dtlen == 7 ? part(dt, 5, 2) : dtlen == 10 ? part(dt, 5, 2) : null,
      day: dtlen == 5 ? part(dt, 3, 2) : dtlen == 7 && hasDashDate ? part(dt, 5, 2) : dtlen == 10 ? part(dt, 8, 2) : null,

      hour: hasDashTime ? null : part(tm, 0, 2),
      minute: hasDashTime && tmlen == 3 ? part(tm, 1, 2) : tmlen > 4 ? hasDashTime ? part(tm, 1, 2) : part(tm, 3, 2) : null,
      second: tmlen == 4 ? part(tm, 2, 2) : tmlen == 6 ? part(tm, 4, 2) : tmlen == 8 ? part(tm, 6, 2) : null
    };

    if (zone == 'Z') {
      zone = Timezone.utcTimezone;
    } else if (zone && zone[3] == ':') {
      zone = UtcOffset.fromString(zone);
    } else {
      zone = null;
    }

    return new VCardTime(o, zone, aIcalType);
  }


  /**
   * Creates a new ICAL.VCardTime instance.
   *
   * @param {Object} data                           The data for the time instance
   * @param {Number=} data.year                     The year for this date
   * @param {Number=} data.month                    The month for this date
   * @param {Number=} data.day                      The day for this date
   * @param {Number=} data.hour                     The hour for this date
   * @param {Number=} data.minute                   The minute for this date
   * @param {Number=} data.second                   The second for this date
   * @param {Timezone|UtcOffset} zone               The timezone to use
   * @param {String} icaltype                       The type for this date/time object
   */
  constructor(data, zone, icaltype) {
    super(data, zone);
    this.icaltype = icaltype || "date-and-or-time";
  }

  /**
   * The class identifier.
   * @constant
   * @type {String}
   * @default "vcardtime"
   */
  icalclass = "vcardtime";

  /**
   * The type name, to be used in the jCal object.
   * @type {String}
   * @default "date-and-or-time"
   */
  icaltype = "date-and-or-time";

  /**
   * Returns a clone of the vcard date/time object.
   *
   * @return {VCardTime}     The cloned object
   */
  clone() {
    return new VCardTime(this._time, this.zone, this.icaltype);
  }

  _normalize() {
    return this;
  }

  /**
   * @inheritdoc
   */
  utcOffset() {
    if (this.zone instanceof UtcOffset) {
      return this.zone.toSeconds();
    } else {
      return Time.prototype.utcOffset.apply(this, arguments);
    }
  }

  /**
   * Returns an RFC 6350 compliant representation of this object.
   *
   * @return {String}         vcard date/time string
   */
  toICALString() {
    return design.vcard.value[this.icaltype].toICAL(this.toString());
  }

  /**
   * The string representation of this date/time, in jCard form
   * (including : and - separators).
   * @return {String}
   */
  toString() {
    let y = this.year, m = this.month, d = this.day;
    let h = this.hour, mm = this.minute, s = this.second;

    let hasYear = y !== null, hasMonth = m !== null, hasDay = d !== null;
    let hasHour = h !== null, hasMinute = mm !== null, hasSecond = s !== null;

    let datepart = (hasYear ? pad2(y) + (hasMonth || hasDay ? '-' : '') : (hasMonth || hasDay ? '--' : '')) +
                   (hasMonth ? pad2(m) : '') +
                   (hasDay ? '-' + pad2(d) : '');
    let timepart = (hasHour ? pad2(h) : '-') + (hasHour && hasMinute ? ':' : '') +
                   (hasMinute ? pad2(mm) : '') + (!hasHour && !hasMinute ? '-' : '') +
                   (hasMinute && hasSecond ? ':' : '') +
                   (hasSecond ? pad2(s) : '');

    let zone;
    if (this.zone === Timezone.utcTimezone) {
      zone = 'Z';
    } else if (this.zone instanceof UtcOffset) {
      zone = this.zone.toString();
    } else if (this.zone === Timezone.localTimezone) {
      zone = '';
    } else if (this.zone instanceof Timezone) {
      let offset = UtcOffset.fromSeconds(this.zone.utcOffset(this));
      zone = offset.toString();
    } else {
      zone = '';
    }

    switch (this.icaltype) {
      case "time":
        return timepart + zone;
      case "date-and-or-time":
      case "date-time":
        return datepart + (timepart == '--' ? '' : 'T' + timepart + zone);
      case "date":
        return datepart;
    }
    return null;
  }
}

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * Portions Copyright (C) Philipp Kewisch */


/**
 * This lets typescript resolve our custom types in the
 * generated d.ts files (jsdoc typedefs are converted to typescript types).
 * Ignore prevents the typedefs from being documented more than once.
 *
 * @ignore
 * @typedef {import("./types.js").weekDay} weekDay
 * Imports the 'weekDay' type from the "types.js" module
 */

/**
 * An iterator for a single recurrence rule. This class usually doesn't have to be instanciated
 * directly, the convenience method {@link ICAL.Recur#iterator} can be used.
 *
 * @memberof ICAL
 */
class RecurIterator {
  static _indexMap = {
    "BYSECOND": 0,
    "BYMINUTE": 1,
    "BYHOUR": 2,
    "BYDAY": 3,
    "BYMONTHDAY": 4,
    "BYYEARDAY": 5,
    "BYWEEKNO": 6,
    "BYMONTH": 7,
    "BYSETPOS": 8
  };

  static _expandMap = {
    "SECONDLY": [1, 1, 1, 1, 1, 1, 1, 1],
    "MINUTELY": [2, 1, 1, 1, 1, 1, 1, 1],
    "HOURLY": [2, 2, 1, 1, 1, 1, 1, 1],
    "DAILY": [2, 2, 2, 1, 1, 1, 1, 1],
    "WEEKLY": [2, 2, 2, 2, 3, 3, 1, 1],
    "MONTHLY": [2, 2, 2, 2, 2, 3, 3, 1],
    "YEARLY": [2, 2, 2, 2, 2, 2, 2, 2]
  };

  static UNKNOWN = 0;
  static CONTRACT = 1;
  static EXPAND = 2;
  static ILLEGAL = 3;

  /**
   * Creates a new ICAL.RecurIterator instance. The options object may contain additional members
   * when resuming iteration from a previous run.
   *
   * @param {Object} options                The iterator options
   * @param {Recur} options.rule            The rule to iterate.
   * @param {Time} options.dtstart          The start date of the event.
   * @param {Boolean=} options.initialized  When true, assume that options are
   *        from a previously constructed iterator. Initialization will not be
   *        repeated.
   */
  constructor(options) {
    this.fromData(options);
  }

  /**
   * True when iteration is finished.
   * @type {Boolean}
   */
  completed = false;

  /**
   * The rule that is being iterated
   * @type {Recur}
   */
  rule = null;

  /**
   * The start date of the event being iterated.
   * @type {Time}
   */
  dtstart = null;

  /**
   * The last occurrence that was returned from the
   * {@link RecurIterator#next} method.
   * @type {Time}
   */
  last = null;

  /**
   * The sequence number from the occurrence
   * @type {Number}
   */
  occurrence_number = 0;

  /**
   * The indices used for the {@link ICAL.RecurIterator#by_data} object.
   * @type {Object}
   * @private
   */
  by_indices = null;

  /**
   * If true, the iterator has already been initialized
   * @type {Boolean}
   * @private
   */
  initialized = false;

  /**
   * The initializd by-data.
   * @type {Object}
   * @private
   */
  by_data = null;

  /**
   * The expanded yeardays
   * @type {Array}
   * @private
   */
  days = null;

  /**
   * The index in the {@link ICAL.RecurIterator#days} array.
   * @type {Number}
   * @private
   */
  days_index = 0;

  /**
   * Initialize the recurrence iterator from the passed data object. This
   * method is usually not called directly, you can initialize the iterator
   * through the constructor.
   *
   * @param {Object} options                The iterator options
   * @param {Recur} options.rule            The rule to iterate.
   * @param {Time} options.dtstart          The start date of the event.
   * @param {Boolean=} options.initialized  When true, assume that options are
   *        from a previously constructed iterator. Initialization will not be
   *        repeated.
   */
  fromData(options) {
    this.rule = formatClassType(options.rule, Recur);

    if (!this.rule) {
      throw new Error('iterator requires a (ICAL.Recur) rule');
    }

    this.dtstart = formatClassType(options.dtstart, Time);

    if (!this.dtstart) {
      throw new Error('iterator requires a (ICAL.Time) dtstart');
    }

    if (options.by_data) {
      this.by_data = options.by_data;
    } else {
      this.by_data = clone(this.rule.parts, true);
    }

    if (options.occurrence_number)
      this.occurrence_number = options.occurrence_number;

    this.days = options.days || [];
    if (options.last) {
      this.last = formatClassType(options.last, Time);
    }

    this.by_indices = options.by_indices;

    if (!this.by_indices) {
      this.by_indices = {
        "BYSECOND": 0,
        "BYMINUTE": 0,
        "BYHOUR": 0,
        "BYDAY": 0,
        "BYMONTH": 0,
        "BYWEEKNO": 0,
        "BYMONTHDAY": 0
      };
    }

    this.initialized = options.initialized || false;

    if (!this.initialized) {
      try {
        this.init();
      } catch (e) {
        if (e instanceof InvalidRecurrenceRuleError) {
          // Init may error if there are no possible recurrence instances from
          // the rule, but we don't want to bubble this error up. Instead, we
          // create an empty iterator.
          this.completed = true;
        } else {
          // Propagate other errors to consumers.
          throw e;
        }
      }
    }
  }

  /**
   * Initialize the iterator
   * @private
   */
  init() {
    this.initialized = true;
    this.last = this.dtstart.clone();
    let parts = this.by_data;

    if ("BYDAY" in parts) {
      // libical does this earlier when the rule is loaded, but we postpone to
      // now so we can preserve the original order.
      this.sort_byday_rules(parts.BYDAY);
    }

    // The BYYEARDAY may only appear with BYDAY
    if ("BYYEARDAY" in parts) {
      if ("BYMONTH" in parts || "BYWEEKNO" in parts ||
          "BYMONTHDAY" in parts) {
        throw new Error("Invalid BYYEARDAY rule");
      }
    }

    // BYWEEKNO and BYMONTHDAY rule parts may not both appear
    if ("BYWEEKNO" in parts && "BYMONTHDAY" in parts) {
      throw new Error("BYWEEKNO does not fit to BYMONTHDAY");
    }

    // For MONTHLY recurrences (FREQ=MONTHLY) neither BYYEARDAY nor
    // BYWEEKNO may appear.
    if (this.rule.freq == "MONTHLY" &&
        ("BYYEARDAY" in parts || "BYWEEKNO" in parts)) {
      throw new Error("For MONTHLY recurrences neither BYYEARDAY nor BYWEEKNO may appear");
    }

    // For WEEKLY recurrences (FREQ=WEEKLY) neither BYMONTHDAY nor
    // BYYEARDAY may appear.
    if (this.rule.freq == "WEEKLY" &&
        ("BYYEARDAY" in parts || "BYMONTHDAY" in parts)) {
      throw new Error("For WEEKLY recurrences neither BYMONTHDAY nor BYYEARDAY may appear");
    }

    // BYYEARDAY may only appear in YEARLY rules
    if (this.rule.freq != "YEARLY" && "BYYEARDAY" in parts) {
      throw new Error("BYYEARDAY may only appear in YEARLY rules");
    }

    this.last.second = this.setup_defaults("BYSECOND", "SECONDLY", this.dtstart.second);
    this.last.minute = this.setup_defaults("BYMINUTE", "MINUTELY", this.dtstart.minute);
    this.last.hour = this.setup_defaults("BYHOUR", "HOURLY", this.dtstart.hour);
    this.last.day = this.setup_defaults("BYMONTHDAY", "DAILY", this.dtstart.day);
    this.last.month = this.setup_defaults("BYMONTH", "MONTHLY", this.dtstart.month);

    if (this.rule.freq == "WEEKLY") {
      if ("BYDAY" in parts) {
        let [, dow] = this.ruleDayOfWeek(parts.BYDAY[0], this.rule.wkst);
        let wkdy = dow - this.last.dayOfWeek(this.rule.wkst);
        if ((this.last.dayOfWeek(this.rule.wkst) < dow && wkdy >= 0) || wkdy < 0) {
          // Initial time is after first day of BYDAY data
          this.last.day += wkdy;
        }
      } else {
        let dayName = Recur.numericDayToIcalDay(this.dtstart.dayOfWeek());
        parts.BYDAY = [dayName];
      }
    }

    if (this.rule.freq == "YEARLY") {
      // Some yearly recurrence rules may be specific enough to not actually
      // occur on a yearly basis, e.g. the 29th day of February or the fifth
      // Monday of a given month. The standard isn't clear on the intended
      // behavior in these cases, but `libical` at least will iterate until it
      // finds a matching year.
      // CAREFUL: Some rules may specify an occurrence that can never happen,
      // e.g. the first Monday of April so long as it falls on the 15th
      // through the 21st. Detecting these is non-trivial, so ensure that we
      // stop iterating at some point.
      const untilYear = this.rule.until ? this.rule.until.year : 20000;
      while (this.last.year <= untilYear) {
        this.expand_year_days(this.last.year);
        if (this.days.length > 0) {
          break;
        }
        this.increment_year(this.rule.interval);
      }

      if (this.days.length == 0) {
        throw new InvalidRecurrenceRuleError();
      }

      // If there's no occurrence in this year, try the following years. This
      // would only happen looking for day 366 or -366.
      if (!this._nextByYearDay() && !this.next_year() && !this.next_year() && !this.next_year()) {
        // This should not be possible, but just in case it is, stop.
        throw new InvalidRecurrenceRuleError();
      }
    }

    if (this.rule.freq == "MONTHLY") {
      if (this.has_by_data("BYDAY")) {
        let tempLast = null;
        let initLast = this.last.clone();
        let daysInMonth = Time.daysInMonth(this.last.month, this.last.year);

        // Check every weekday in BYDAY with relative dow and pos.
        for (let bydow of this.by_data.BYDAY) {
          this.last = initLast.clone();
          let [pos, dow] = this.ruleDayOfWeek(bydow);
          let dayOfMonth = this.last.nthWeekDay(dow, pos);

          // If |pos| >= 6, the byday is invalid for a monthly rule.
          if (pos >= 6 || pos <= -6) {
            throw new Error("Malformed values in BYDAY part");
          }

          // If a Byday with pos=+/-5 is not in the current month it
          // must be searched in the next months.
          if (dayOfMonth > daysInMonth || dayOfMonth <= 0) {
            // Skip if we have already found a "last" in this month.
            if (tempLast && tempLast.month == initLast.month) {
              continue;
            }
            while (dayOfMonth > daysInMonth || dayOfMonth <= 0) {
              this.increment_month();
              daysInMonth = Time.daysInMonth(this.last.month, this.last.year);
              dayOfMonth = this.last.nthWeekDay(dow, pos);
            }
          }

          this.last.day = dayOfMonth;
          if (!tempLast || this.last.compare(tempLast) < 0) {
            tempLast = this.last.clone();
          }
        }
        this.last = tempLast.clone();

        //XXX: This feels like a hack, but we need to initialize
        //     the BYMONTHDAY case correctly and byDayAndMonthDay handles
        //     this case. It accepts a special flag which will avoid incrementing
        //     the initial value without the flag days that match the start time
        //     would be missed.
        if (this.has_by_data('BYMONTHDAY')) {
          this._byDayAndMonthDay(true);
        }

        if (this.last.day > daysInMonth || this.last.day == 0) {
          throw new Error("Malformed values in BYDAY part");
        }
      } else if (this.has_by_data("BYMONTHDAY")) {
        // Change the day value so that normalisation won't change the month.
        this.last.day = 1;

        // Get a sorted list of days in the starting month that match the rule.
        let normalized = this.normalizeByMonthDayRules(
          this.last.year,
          this.last.month,
          this.rule.parts.BYMONTHDAY
        ).filter(d => d >= this.last.day);

        if (normalized.length) {
          // There's at least one valid day, use it.
          this.last.day = normalized[0];
          this.by_data.BYMONTHDAY = normalized;
        } else {
          // There's no occurrence in this month, find the next valid month.
          // The longest possible sequence of skipped months is February-April-June,
          // so we might need to call next_month up to three times.
          if (!this.next_month() && !this.next_month() && !this.next_month()) {
            throw new InvalidRecurrenceRuleError();
          }
        }
      }
    }
  }

  /**
   * Retrieve the next occurrence from the iterator.
   * @return {Time}
   */
  next(again = false) {
    let before = (this.last ? this.last.clone() : null);

    if ((this.rule.count && this.occurrence_number >= this.rule.count) ||
        (this.rule.until && this.last.compare(this.rule.until) > 0)) {
      this.completed = true;
    }

    if (this.completed) {
      return null;
    }

    if (this.occurrence_number == 0 && this.last.compare(this.dtstart) >= 0) {
      // First of all, give the instance that was initialized
      this.occurrence_number++;
      return this.last;
    }

    let valid;
    let invalid_count = 0;
    do {
      valid = 1;

      switch (this.rule.freq) {
      case "SECONDLY":
        this.next_second();
        break;
      case "MINUTELY":
        this.next_minute();
        break;
      case "HOURLY":
        this.next_hour();
        break;
      case "DAILY":
        this.next_day();
        break;
      case "WEEKLY":
        this.next_week();
        break;
      case "MONTHLY":
        valid = this.next_month();
        if (valid) {
          invalid_count = 0;
        } else if (++invalid_count == 336) {
          // We've been through all 91 month variations and not found a recurrence. Stop.
          // (12 months and 29-day February × 7 starting days.)
          this.completed = true;
          return null;
        }
        break;
      case "YEARLY":
        valid = this.next_year();
        if (valid) {
          invalid_count = 0;
        } else if (++invalid_count == 28) {
          // We've been through all 14 year variations and not found a recurrence. Stop.
          // (365-day and 366-day years × 7 starting days.)
          this.completed = true;
          return null;
        }
        break;

      default:
        return null;
      }
    } while (!this.check_contracting_rules() ||
             this.last.compare(this.dtstart) < 0 ||
             !valid);

    if (this.last.compare(before) == 0) {
      if (again) {
        throw new Error("Same occurrence found twice, protecting you from death by recursion");
      }
      this.next(true);
    }

    if (this.rule.until && this.last.compare(this.rule.until) > 0) {
      this.completed = true;
      return null;
    } else {
      this.occurrence_number++;
      return this.last;
    }
  }

  next_second() {
    return this.next_generic("BYSECOND", "SECONDLY", "second", "minute");
  }

  increment_second(inc) {
    return this.increment_generic(inc, "second", 60, "minute");
  }

  next_minute() {
    return this.next_generic("BYMINUTE", "MINUTELY",
                             "minute", "hour", "next_second");
  }

  increment_minute(inc) {
    return this.increment_generic(inc, "minute", 60, "hour");
  }

  next_hour() {
    return this.next_generic("BYHOUR", "HOURLY", "hour",
                             "monthday", "next_minute");
  }

  increment_hour(inc) {
    this.increment_generic(inc, "hour", 24, "monthday");
  }

  next_day() {
    let this_freq = (this.rule.freq == "DAILY");

    if (this.next_hour() == 0) {
      return 0;
    }

    if (this_freq) {
      this.increment_monthday(this.rule.interval);
    } else {
      this.increment_monthday(1);
    }

    return 0;
  }

  next_week() {
    let end_of_data = 0;

    if (this.next_weekday_by_week() == 0) {
      return end_of_data;
    }

    if (this.has_by_data("BYWEEKNO")) {
      this.by_indices.BYWEEKNO++;

      if (this.by_indices.BYWEEKNO == this.by_data.BYWEEKNO.length) {
        this.by_indices.BYWEEKNO = 0;
        end_of_data = 1;
      }

      // HACK should be first month of the year
      this.last.month = 1;
      this.last.day = 1;

      let week_no = this.by_data.BYWEEKNO[this.by_indices.BYWEEKNO];

      this.last.day += 7 * week_no;

      if (end_of_data) {
        this.increment_year(1);
      }
    } else {
      // Jump to the next week
      this.increment_monthday(7 * this.rule.interval);
    }

    return end_of_data;
  }

  /**
   * Normalize each by day rule for a given year/month.
   * Takes into account ordering and negative rules
   *
   * @private
   * @param {Number} year         Current year.
   * @param {Number} month        Current month.
   * @param {Array}  rules        Array of rules.
   *
   * @return {Array} sorted and normalized rules.
   *                 Negative rules will be expanded to their
   *                 correct positive values for easier processing.
   */
  normalizeByMonthDayRules(year, month, rules) {
    let daysInMonth = Time.daysInMonth(month, year);

    // XXX: This is probably bad for performance to allocate
    //      a new array for each month we scan, if possible
    //      we should try to optimize this...
    let newRules = [];

    let ruleIdx = 0;
    let len = rules.length;
    let rule;

    for (; ruleIdx < len; ruleIdx++) {
      rule = parseInt(rules[ruleIdx], 10);
      if (isNaN(rule)) {
        throw new Error('Invalid BYMONTHDAY value');
      }

      // if this rule falls outside of given
      // month discard it.
      if (Math.abs(rule) > daysInMonth) {
        continue;
      }

      // negative case
      if (rule < 0) {
        // we add (not subtract it is a negative number)
        // one from the rule because 1 === last day of month
        rule = daysInMonth + (rule + 1);
      } else if (rule === 0) {
        // skip zero: it is invalid.
        continue;
      }

      // only add unique items...
      if (newRules.indexOf(rule) === -1) {
        newRules.push(rule);
      }

    }

    // unique and sort
    return newRules.sort(function(a, b) { return a - b; });
  }

  /**
   * NOTES:
   * We are given a list of dates in the month (BYMONTHDAY) (23, etc..)
   * Also we are given a list of days (BYDAY) (MO, 2SU, etc..) when
   * both conditions match a given date (this.last.day) iteration stops.
   *
   * @private
   * @param {Boolean=} isInit     When given true will not increment the
   *                                current day (this.last).
   */
  _byDayAndMonthDay(isInit) {
    let byMonthDay; // setup in initMonth
    let byDay = this.by_data.BYDAY;

    let date;
    let dateIdx = 0;
    let dateLen; // setup in initMonth
    let dayLen = byDay.length;

    // we are not valid by default
    let dataIsValid = 0;

    let daysInMonth;
    let self = this;
    // we need a copy of this, because a DateTime gets normalized
    // automatically if the day is out of range. At some points we
    // set the last day to 0 to start counting.
    let lastDay = this.last.day;

    function initMonth() {
      daysInMonth = Time.daysInMonth(
        self.last.month, self.last.year
      );

      byMonthDay = self.normalizeByMonthDayRules(
        self.last.year,
        self.last.month,
        self.by_data.BYMONTHDAY
      );

      dateLen = byMonthDay.length;

      // For the case of more than one occurrence in one month
      // we have to be sure to start searching after the last
      // found date or at the last BYMONTHDAY, unless we are
      // initializing the iterator because in this case we have
      // to consider the last found date too.
      while (byMonthDay[dateIdx] <= lastDay &&
             !(isInit && byMonthDay[dateIdx] == lastDay) &&
             dateIdx < dateLen - 1) {
        dateIdx++;
      }
    }

    function nextMonth() {
      // since the day is incremented at the start
      // of the loop below, we need to start at 0
      lastDay = 0;
      self.increment_month();
      dateIdx = 0;
      initMonth();
    }

    initMonth();

    // should come after initMonth
    if (isInit) {
      lastDay -= 1;
    }

    // Use a counter to avoid an infinite loop with malformed rules.
    // Stop checking after 4 years so we consider also a leap year.
    let monthsCounter = 48;

    while (!dataIsValid && monthsCounter) {
      monthsCounter--;
      // increment the current date. This is really
      // important otherwise we may fall into the infinite
      // loop trap. The initial date takes care of the case
      // where the current date is the date we are looking
      // for.
      date = lastDay + 1;

      if (date > daysInMonth) {
        nextMonth();
        continue;
      }

      // find next date
      let next = byMonthDay[dateIdx++];

      // this logic is dependent on the BYMONTHDAYS
      // being in order (which is done by #normalizeByMonthDayRules)
      if (next >= date) {
        // if the next month day is in the future jump to it.
        lastDay = next;
      } else {
        // in this case the 'next' monthday has past
        // we must move to the month.
        nextMonth();
        continue;
      }

      // Now we can loop through the day rules to see
      // if one matches the current month date.
      for (let dayIdx = 0; dayIdx < dayLen; dayIdx++) {
        let parts = this.ruleDayOfWeek(byDay[dayIdx]);
        let pos = parts[0];
        let dow = parts[1];

        this.last.day = lastDay;
        if (this.last.isNthWeekDay(dow, pos)) {
          // when we find the valid one we can mark
          // the conditions as met and break the loop.
          // (Because we have this condition above
          //  it will also break the parent loop).
          dataIsValid = 1;
          break;
        }
      }

      // It is completely possible that the combination
      // cannot be matched in the current month.
      // When we reach the end of possible combinations
      // in the current month we iterate to the next one.
      // since dateIdx is incremented right after getting
      // "next", we don't need dateLen -1 here.
      if (!dataIsValid && dateIdx === dateLen) {
        nextMonth();
        continue;
      }
    }

    if (monthsCounter <= 0) {
      // Checked 4 years without finding a Byday that matches
      // a Bymonthday. Maybe the rule is not correct.
      throw new Error("Malformed values in BYDAY combined with BYMONTHDAY parts");
    }


    return dataIsValid;
  }

  next_month() {
    let data_valid = 1;

    if (this.next_hour() == 0) {
      return data_valid;
    }

    if (this.has_by_data("BYDAY") && this.has_by_data("BYMONTHDAY")) {
      data_valid = this._byDayAndMonthDay();
    } else if (this.has_by_data("BYDAY")) {
      let daysInMonth = Time.daysInMonth(this.last.month, this.last.year);
      let setpos = 0;
      let setpos_total = 0;

      if (this.has_by_data("BYSETPOS")) {
        let last_day = this.last.day;
        for (let day = 1; day <= daysInMonth; day++) {
          this.last.day = day;
          if (this.is_day_in_byday(this.last)) {
            setpos_total++;
            if (day <= last_day) {
              setpos++;
            }
          }
        }
        this.last.day = last_day;
      }

      data_valid = 0;
      let day;
      for (day = this.last.day + 1; day <= daysInMonth; day++) {
        this.last.day = day;

        if (this.is_day_in_byday(this.last)) {
          if (!this.has_by_data("BYSETPOS") ||
              this.check_set_position(++setpos) ||
              this.check_set_position(setpos - setpos_total - 1)) {

            data_valid = 1;
            break;
          }
        }
      }

      if (day > daysInMonth) {
        this.last.day = 1;
        this.increment_month();

        if (this.is_day_in_byday(this.last)) {
          if (!this.has_by_data("BYSETPOS") || this.check_set_position(1)) {
            data_valid = 1;
          }
        } else {
          data_valid = 0;
        }
      }
    } else if (this.has_by_data("BYMONTHDAY")) {
      this.by_indices.BYMONTHDAY++;

      if (this.by_indices.BYMONTHDAY >= this.by_data.BYMONTHDAY.length) {
        this.by_indices.BYMONTHDAY = 0;
        this.increment_month();
        if (this.by_indices.BYMONTHDAY >= this.by_data.BYMONTHDAY.length) {
          return 0;
        }
      }

      let daysInMonth = Time.daysInMonth(this.last.month, this.last.year);
      let day = this.by_data.BYMONTHDAY[this.by_indices.BYMONTHDAY];

      if (day < 0) {
        day = daysInMonth + day + 1;
      }

      if (day > daysInMonth) {
        this.last.day = 1;
        data_valid = this.is_day_in_byday(this.last);
      } else {
        this.last.day = day;
      }
    } else {
      this.increment_month();
      let daysInMonth = Time.daysInMonth(this.last.month, this.last.year);
      if (this.by_data.BYMONTHDAY[0] > daysInMonth) {
        data_valid = 0;
      } else {
        this.last.day = this.by_data.BYMONTHDAY[0];
      }
    }

    return data_valid;
  }

  next_weekday_by_week() {
    let end_of_data = 0;

    if (this.next_hour() == 0) {
      return end_of_data;
    }

    if (!this.has_by_data("BYDAY")) {
      return 1;
    }

    for (;;) {
      let tt = new Time();
      this.by_indices.BYDAY++;

      if (this.by_indices.BYDAY == Object.keys(this.by_data.BYDAY).length) {
        this.by_indices.BYDAY = 0;
        end_of_data = 1;
      }

      let coded_day = this.by_data.BYDAY[this.by_indices.BYDAY];
      let parts = this.ruleDayOfWeek(coded_day);
      let dow = parts[1];

      dow -= this.rule.wkst;

      if (dow < 0) {
        dow += 7;
      }

      tt.year = this.last.year;
      tt.month = this.last.month;
      tt.day = this.last.day;

      let startOfWeek = tt.startDoyWeek(this.rule.wkst);

      if (dow + startOfWeek < 1) {
        // The selected date is in the previous year
        if (!end_of_data) {
          continue;
        }
      }

      let next = Time.fromDayOfYear(startOfWeek + dow, this.last.year);

      /**
       * The normalization horrors below are due to
       * the fact that when the year/month/day changes
       * it can effect the other operations that come after.
       */
      this.last.year = next.year;
      this.last.month = next.month;
      this.last.day = next.day;

      return end_of_data;
    }
  }

  next_year() {
    if (this.next_hour() == 0) {
      return 0;
    }

    if (this.days.length == 0 || ++this.days_index == this.days.length) {
      this.days_index = 0;
      this.increment_year(this.rule.interval);
      if (this.has_by_data("BYMONTHDAY")) {
        this.by_data.BYMONTHDAY = this.normalizeByMonthDayRules(
          this.last.year,
          this.last.month,
          this.rule.parts.BYMONTHDAY
        );
      }
      this.expand_year_days(this.last.year);
      if (this.days.length == 0) {
        return 0;
      }
    }

    return this._nextByYearDay();
  }

  _nextByYearDay() {
    let doy = this.days[this.days_index];
    let year = this.last.year;

    if (Math.abs(doy) == 366 && !Time.isLeapYear(this.last.year)) {
      return 0;
    }

    if (doy < 1) {
        // Time.fromDayOfYear(doy, year) indexes relative to the
        // start of the given year. That is different from the
        // semantics of BYYEARDAY where negative indexes are an
        // offset from the end of the given year.
        doy += 1;
        year += 1;
    }
    let next = Time.fromDayOfYear(doy, year);
    this.last.day = next.day;
    this.last.month = next.month;

    return 1;
  }

  /**
   * @param dow (eg: '1TU', '-1MO')
   * @param {weekDay=} aWeekStart The week start weekday
   * @return [pos, numericDow] (eg: [1, 3]) numericDow is relative to aWeekStart
   */
  ruleDayOfWeek(dow, aWeekStart) {
    let matches = dow.match(/([+-]?[0-9])?(MO|TU|WE|TH|FR|SA|SU)/);
    if (matches) {
      let pos = parseInt(matches[1] || 0, 10);
      dow = Recur.icalDayToNumericDay(matches[2], aWeekStart);
      return [pos, dow];
    } else {
      return [0, 0];
    }
  }

  next_generic(aRuleType, aInterval, aDateAttr, aFollowingAttr, aPreviousIncr) {
    let has_by_rule = (aRuleType in this.by_data);
    let this_freq = (this.rule.freq == aInterval);
    let end_of_data = 0;

    if (aPreviousIncr && this[aPreviousIncr]() == 0) {
      return end_of_data;
    }

    if (has_by_rule) {
      this.by_indices[aRuleType]++;
      let dta = this.by_data[aRuleType];

      if (this.by_indices[aRuleType] == dta.length) {
        this.by_indices[aRuleType] = 0;
        end_of_data = 1;
      }
      this.last[aDateAttr] = dta[this.by_indices[aRuleType]];
    } else if (this_freq) {
      this["increment_" + aDateAttr](this.rule.interval);
    }

    if (has_by_rule && end_of_data && this_freq) {
      this["increment_" + aFollowingAttr](1);
    }

    return end_of_data;
  }

  increment_monthday(inc) {
    for (let i = 0; i < inc; i++) {
      let daysInMonth = Time.daysInMonth(this.last.month, this.last.year);
      this.last.day++;

      if (this.last.day > daysInMonth) {
        this.last.day -= daysInMonth;
        this.increment_month();
      }
    }
  }

  increment_month() {
    this.last.day = 1;
    if (this.has_by_data("BYMONTH")) {
      this.by_indices.BYMONTH++;

      if (this.by_indices.BYMONTH == this.by_data.BYMONTH.length) {
        this.by_indices.BYMONTH = 0;
        this.increment_year(1);
      }

      this.last.month = this.by_data.BYMONTH[this.by_indices.BYMONTH];
    } else {
      if (this.rule.freq == "MONTHLY") {
        this.last.month += this.rule.interval;
      } else {
        this.last.month++;
      }

      this.last.month--;
      let years = trunc(this.last.month / 12);
      this.last.month %= 12;
      this.last.month++;

      if (years != 0) {
        this.increment_year(years);
      }
    }

    if (this.has_by_data("BYMONTHDAY")) {
      this.by_data.BYMONTHDAY = this.normalizeByMonthDayRules(
        this.last.year,
        this.last.month,
        this.rule.parts.BYMONTHDAY
      );
    }
  }

  increment_year(inc) {
    // Don't jump into the next month if this.last is Feb 29.
    this.last.day = 1;
    this.last.year += inc;
  }

  increment_generic(inc, aDateAttr, aFactor, aNextIncrement) {
    this.last[aDateAttr] += inc;
    let nextunit = trunc(this.last[aDateAttr] / aFactor);
    this.last[aDateAttr] %= aFactor;
    if (nextunit != 0) {
      this["increment_" + aNextIncrement](nextunit);
    }
  }

  has_by_data(aRuleType) {
    return (aRuleType in this.rule.parts);
  }

  expand_year_days(aYear) {
    let t = new Time();
    this.days = [];

    // We need our own copy with a few keys set
    let parts = {};
    let rules = ["BYDAY", "BYWEEKNO", "BYMONTHDAY", "BYMONTH", "BYYEARDAY"];
    for (let part of rules) {
      if (part in this.rule.parts) {
        parts[part] = this.rule.parts[part];
      }
    }

    if ("BYMONTH" in parts && "BYWEEKNO" in parts) {
      let valid = 1;
      let validWeeks = {};
      t.year = aYear;
      t.isDate = true;

      for (let monthIdx = 0; monthIdx < this.by_data.BYMONTH.length; monthIdx++) {
        let month = this.by_data.BYMONTH[monthIdx];
        t.month = month;
        t.day = 1;
        let first_week = t.weekNumber(this.rule.wkst);
        t.day = Time.daysInMonth(month, aYear);
        let last_week = t.weekNumber(this.rule.wkst);
        for (monthIdx = first_week; monthIdx < last_week; monthIdx++) {
          validWeeks[monthIdx] = 1;
        }
      }

      for (let weekIdx = 0; weekIdx < this.by_data.BYWEEKNO.length && valid; weekIdx++) {
        let weekno = this.by_data.BYWEEKNO[weekIdx];
        if (weekno < 52) {
          valid &= validWeeks[weekIdx];
        } else {
          valid = 0;
        }
      }

      if (valid) {
        delete parts.BYMONTH;
      } else {
        delete parts.BYWEEKNO;
      }
    }

    let partCount = Object.keys(parts).length;

    if (partCount == 0) {
      let t1 = this.dtstart.clone();
      t1.year = this.last.year;
      this.days.push(t1.dayOfYear());
    } else if (partCount == 1 && "BYMONTH" in parts) {
      for (let month of this.by_data.BYMONTH) {
        let t2 = this.dtstart.clone();
        t2.year = aYear;
        t2.month = month;
        t2.isDate = true;
        this.days.push(t2.dayOfYear());
      }
    } else if (partCount == 1 && "BYMONTHDAY" in parts) {
      for (let monthday of this.by_data.BYMONTHDAY) {
        let t3 = this.dtstart.clone();
        if (monthday < 0) {
          let daysInMonth = Time.daysInMonth(t3.month, aYear);
          monthday = monthday + daysInMonth + 1;
        }
        t3.day = monthday;
        t3.year = aYear;
        t3.isDate = true;
        this.days.push(t3.dayOfYear());
      }
    } else if (partCount == 2 &&
               "BYMONTHDAY" in parts &&
               "BYMONTH" in parts) {
      for (let month of this.by_data.BYMONTH) {
        let daysInMonth = Time.daysInMonth(month, aYear);
        for (let monthday of this.by_data.BYMONTHDAY) {
          if (monthday < 0) {
            monthday = monthday + daysInMonth + 1;
          }
          t.day = monthday;
          t.month = month;
          t.year = aYear;
          t.isDate = true;

          this.days.push(t.dayOfYear());
        }
      }
    } else if (partCount == 1 && "BYWEEKNO" in parts) ; else if (partCount == 2 &&
               "BYWEEKNO" in parts &&
               "BYMONTHDAY" in parts) ; else if (partCount == 1 && "BYDAY" in parts) {
      this.days = this.days.concat(this.expand_by_day(aYear));
    } else if (partCount == 2 && "BYDAY" in parts && "BYMONTH" in parts) {
      for (let month of this.by_data.BYMONTH) {
        let daysInMonth = Time.daysInMonth(month, aYear);

        t.year = aYear;
        t.month = month;
        t.day = 1;
        t.isDate = true;

        let first_dow = t.dayOfWeek();
        let doy_offset = t.dayOfYear() - 1;

        t.day = daysInMonth;
        let last_dow = t.dayOfWeek();

        if (this.has_by_data("BYSETPOS")) {
          let by_month_day = [];
          for (let day = 1; day <= daysInMonth; day++) {
            t.day = day;
            if (this.is_day_in_byday(t)) {
              by_month_day.push(day);
            }
          }

          for (let spIndex = 0; spIndex < by_month_day.length; spIndex++) {
            if (this.check_set_position(spIndex + 1) ||
                this.check_set_position(spIndex - by_month_day.length)) {
              this.days.push(doy_offset + by_month_day[spIndex]);
            }
          }
        } else {
          for (let coded_day of this.by_data.BYDAY) {
            let bydayParts = this.ruleDayOfWeek(coded_day);
            let pos = bydayParts[0];
            let dow = bydayParts[1];
            let month_day;

            let first_matching_day = ((dow + 7 - first_dow) % 7) + 1;
            let last_matching_day = daysInMonth - ((last_dow + 7 - dow) % 7);

            if (pos == 0) {
              for (let day = first_matching_day; day <= daysInMonth; day += 7) {
                this.days.push(doy_offset + day);
              }
            } else if (pos > 0) {
              month_day = first_matching_day + (pos - 1) * 7;

              if (month_day <= daysInMonth) {
                this.days.push(doy_offset + month_day);
              }
            } else {
              month_day = last_matching_day + (pos + 1) * 7;

              if (month_day > 0) {
                this.days.push(doy_offset + month_day);
              }
            }
          }
        }
      }
      // Return dates in order of occurrence (1,2,3,...) instead
      // of by groups of weekdays (1,8,15,...,2,9,16,...).
      this.days.sort(function(a, b) { return a - b; }); // Comparator function allows to sort numbers.
    } else if (partCount == 2 && "BYDAY" in parts && "BYMONTHDAY" in parts) {
      let expandedDays = this.expand_by_day(aYear);

      for (let day of expandedDays) {
        let tt = Time.fromDayOfYear(day, aYear);
        if (this.by_data.BYMONTHDAY.indexOf(tt.day) >= 0) {
          this.days.push(day);
        }
      }
    } else if (partCount == 3 &&
               "BYDAY" in parts &&
               "BYMONTHDAY" in parts &&
               "BYMONTH" in parts) {
      let expandedDays = this.expand_by_day(aYear);

      for (let day of expandedDays) {
        let tt = Time.fromDayOfYear(day, aYear);

        if (this.by_data.BYMONTH.indexOf(tt.month) >= 0 &&
            this.by_data.BYMONTHDAY.indexOf(tt.day) >= 0) {
          this.days.push(day);
        }
      }
    } else if (partCount == 2 && "BYDAY" in parts && "BYWEEKNO" in parts) {
      let expandedDays = this.expand_by_day(aYear);

      for (let day of expandedDays) {
        let tt = Time.fromDayOfYear(day, aYear);
        let weekno = tt.weekNumber(this.rule.wkst);

        if (this.by_data.BYWEEKNO.indexOf(weekno)) {
          this.days.push(day);
        }
      }
    } else if (partCount == 3 &&
               "BYDAY" in parts &&
               "BYWEEKNO" in parts &&
               "BYMONTHDAY" in parts) ; else if (partCount == 1 && "BYYEARDAY" in parts) {
      this.days = this.days.concat(this.by_data.BYYEARDAY);
    } else if (partCount == 2 && "BYYEARDAY" in parts && "BYDAY" in parts) {
      let daysInYear = Time.isLeapYear(aYear) ? 366 : 365;
      let expandedDays = new Set(this.expand_by_day(aYear));

      for (let doy of this.by_data.BYYEARDAY) {
        if (doy < 0) {
          doy += daysInYear + 1;
        }

        if (expandedDays.has(doy)) {
          this.days.push(doy);
        }
      }
    } else {
      this.days = [];
    }

    let daysInYear = Time.isLeapYear(aYear) ? 366 : 365;
    this.days.sort((a, b) => {
      if (a < 0) a += daysInYear + 1;
      if (b < 0) b += daysInYear + 1;
      return a - b;
    });

    return 0;
  }

  expand_by_day(aYear) {

    let days_list = [];
    let tmp = this.last.clone();

    tmp.year = aYear;
    tmp.month = 1;
    tmp.day = 1;
    tmp.isDate = true;

    let start_dow = tmp.dayOfWeek();

    tmp.month = 12;
    tmp.day = 31;
    tmp.isDate = true;

    let end_dow = tmp.dayOfWeek();
    let end_year_day = tmp.dayOfYear();

    for (let day of this.by_data.BYDAY) {
      let parts = this.ruleDayOfWeek(day);
      let pos = parts[0];
      let dow = parts[1];

      if (pos == 0) {
        let tmp_start_doy = ((dow + 7 - start_dow) % 7) + 1;

        for (let doy = tmp_start_doy; doy <= end_year_day; doy += 7) {
          days_list.push(doy);
        }

      } else if (pos > 0) {
        let first;
        if (dow >= start_dow) {
          first = dow - start_dow + 1;
        } else {
          first = dow - start_dow + 8;
        }

        days_list.push(first + (pos - 1) * 7);
      } else {
        let last;
        pos = -pos;

        if (dow <= end_dow) {
          last = end_year_day - end_dow + dow;
        } else {
          last = end_year_day - end_dow + dow - 7;
        }

        days_list.push(last - (pos - 1) * 7);
      }
    }
    return days_list;
  }

  is_day_in_byday(tt) {
    if (this.by_data.BYDAY) {
      for (let day of this.by_data.BYDAY) {
        let parts = this.ruleDayOfWeek(day);
        let pos = parts[0];
        let dow = parts[1];
        let this_dow = tt.dayOfWeek();

        if ((pos == 0 && dow == this_dow) ||
            (tt.nthWeekDay(dow, pos) == tt.day)) {
          return 1;
        }
      }
    }

    return 0;
  }

  /**
   * Checks if given value is in BYSETPOS.
   *
   * @private
   * @param {Numeric} aPos position to check for.
   * @return {Boolean} false unless BYSETPOS rules exist
   *                   and the given value is present in rules.
   */
  check_set_position(aPos) {
    if (this.has_by_data('BYSETPOS')) {
      let idx = this.by_data.BYSETPOS.indexOf(aPos);
      // negative numbers are not false-y
      return idx !== -1;
    }
    return false;
  }

  sort_byday_rules(aRules) {
    for (let i = 0; i < aRules.length; i++) {
      for (let j = 0; j < i; j++) {
        let one = this.ruleDayOfWeek(aRules[j], this.rule.wkst)[1];
        let two = this.ruleDayOfWeek(aRules[i], this.rule.wkst)[1];

        if (one > two) {
          let tmp = aRules[i];
          aRules[i] = aRules[j];
          aRules[j] = tmp;
        }
      }
    }
  }

  check_contract_restriction(aRuleType, v) {
    let indexMapValue = RecurIterator._indexMap[aRuleType];
    let ruleMapValue = RecurIterator._expandMap[this.rule.freq][indexMapValue];
    let pass = false;

    if (aRuleType in this.by_data &&
        ruleMapValue == RecurIterator.CONTRACT) {

      let ruleType = this.by_data[aRuleType];

      for (let bydata of ruleType) {
        if (bydata == v) {
          pass = true;
          break;
        }
      }
    } else {
      // Not a contracting byrule or has no data, test passes
      pass = true;
    }
    return pass;
  }

  check_contracting_rules() {
    let dow = this.last.dayOfWeek();
    let weekNo = this.last.weekNumber(this.rule.wkst);
    let doy = this.last.dayOfYear();

    return (this.check_contract_restriction("BYSECOND", this.last.second) &&
            this.check_contract_restriction("BYMINUTE", this.last.minute) &&
            this.check_contract_restriction("BYHOUR", this.last.hour) &&
            this.check_contract_restriction("BYDAY", Recur.numericDayToIcalDay(dow)) &&
            this.check_contract_restriction("BYWEEKNO", weekNo) &&
            this.check_contract_restriction("BYMONTHDAY", this.last.day) &&
            this.check_contract_restriction("BYMONTH", this.last.month) &&
            this.check_contract_restriction("BYYEARDAY", doy));
  }

  setup_defaults(aRuleType, req, deftime) {
    let indexMapValue = RecurIterator._indexMap[aRuleType];
    let ruleMapValue = RecurIterator._expandMap[this.rule.freq][indexMapValue];

    if (ruleMapValue != RecurIterator.CONTRACT) {
      if (!(aRuleType in this.by_data)) {
        this.by_data[aRuleType] = [deftime];
      }
      if (this.rule.freq != req) {
        return this.by_data[aRuleType][0];
      }
    }
    return deftime;
  }

  /**
   * Convert iterator into a serialize-able object.  Will preserve current
   * iteration sequence to ensure the seamless continuation of the recurrence
   * rule.
   * @return {Object}
   */
  toJSON() {
    let result = Object.create(null);

    result.initialized = this.initialized;
    result.rule = this.rule.toJSON();
    result.dtstart = this.dtstart.toJSON();
    result.by_data = this.by_data;
    result.days = this.days;
    result.last = this.last.toJSON();
    result.by_indices = this.by_indices;
    result.occurrence_number = this.occurrence_number;

    return result;
  }
}

/**
 * An error indicating that a recurrence rule is invalid and produces no
 * occurrences.
 *
 * @extends {Error}
 * @class
 */
class InvalidRecurrenceRuleError extends Error {
  constructor() {
    super("Recurrence rule has no valid occurrences");
  }
}

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * Portions Copyright (C) Philipp Kewisch */


/**
 * This lets typescript resolve our custom types in the
 * generated d.ts files (jsdoc typedefs are converted to typescript types).
 * Ignore prevents the typedefs from being documented more than once.
 *
 * @ignore
 * @typedef {import("./types.js").weekDay} weekDay
 * Imports the 'weekDay' type from the "types.js" module
 * @typedef {import("./types.js").frequencyValues} frequencyValues
 * Imports the 'frequencyValues' type from the "types.js" module
 */

const VALID_DAY_NAMES = /^(SU|MO|TU|WE|TH|FR|SA)$/;
const VALID_BYDAY_PART = /^([+-])?(5[0-3]|[1-4][0-9]|[1-9])?(SU|MO|TU|WE|TH|FR|SA)$/;
const DOW_MAP = {
  SU: Time.SUNDAY,
  MO: Time.MONDAY,
  TU: Time.TUESDAY,
  WE: Time.WEDNESDAY,
  TH: Time.THURSDAY,
  FR: Time.FRIDAY,
  SA: Time.SATURDAY
};

const REVERSE_DOW_MAP = Object.fromEntries(Object.entries(DOW_MAP).map(entry => entry.reverse()));

const ALLOWED_FREQ = ['SECONDLY', 'MINUTELY', 'HOURLY',
                      'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'];

/**
 * This class represents the "recur" value type, used for example by RRULE. It provides methods to
 * calculate occurrences among others.
 *
 * @memberof ICAL
 */
class Recur {
  /**
   * Creates a new {@link ICAL.Recur} instance from the passed string.
   *
   * @param {String} string         The string to parse
   * @return {Recur}                The created recurrence instance
   */
  static fromString(string) {
    let data = this._stringToData(string, false);
    return new Recur(data);
  }

  /**
   * Creates a new {@link ICAL.Recur} instance using members from the passed
   * data object.
   *
   * @param {Object} aData                              An object with members of the recurrence
   * @param {frequencyValues=} aData.freq               The frequency value
   * @param {Number=} aData.interval                    The INTERVAL value
   * @param {weekDay=} aData.wkst                       The week start value
   * @param {Time=} aData.until                         The end of the recurrence set
   * @param {Number=} aData.count                       The number of occurrences
   * @param {Array.<Number>=} aData.bysecond            The seconds for the BYSECOND part
   * @param {Array.<Number>=} aData.byminute            The minutes for the BYMINUTE part
   * @param {Array.<Number>=} aData.byhour              The hours for the BYHOUR part
   * @param {Array.<String>=} aData.byday               The BYDAY values
   * @param {Array.<Number>=} aData.bymonthday          The days for the BYMONTHDAY part
   * @param {Array.<Number>=} aData.byyearday           The days for the BYYEARDAY part
   * @param {Array.<Number>=} aData.byweekno            The weeks for the BYWEEKNO part
   * @param {Array.<Number>=} aData.bymonth             The month for the BYMONTH part
   * @param {Array.<Number>=} aData.bysetpos            The positionals for the BYSETPOS part
   */
  static fromData(aData) {
    return new Recur(aData);
  }

  /**
   * Converts a recurrence string to a data object, suitable for the fromData
   * method.
   *
   * @private
   * @param {String} string     The string to parse
   * @param {Boolean} fmtIcal   If true, the string is considered to be an
   *                              iCalendar string
   * @return {Recur}            The recurrence instance
   */
  static _stringToData(string, fmtIcal) {
    let dict = Object.create(null);

    // split is slower in FF but fast enough.
    // v8 however this is faster then manual split?
    let values = string.split(';');
    let len = values.length;

    for (let i = 0; i < len; i++) {
      let parts = values[i].split('=');
      let ucname = parts[0].toUpperCase();
      let lcname = parts[0].toLowerCase();
      let name = (fmtIcal ? lcname : ucname);
      let value = parts[1];

      if (ucname in partDesign) {
        let partArr = value.split(',');
        let partSet = new Set();

        for (let part of partArr) {
          partSet.add(partDesign[ucname](part));
        }
        partArr = [...partSet];

        dict[name] = (partArr.length == 1 ? partArr[0] : partArr);
      } else if (ucname in optionDesign) {
        optionDesign[ucname](value, dict, fmtIcal);
      } else {
        // Don't swallow unknown values. Just set them as they are.
        dict[lcname] = value;
      }
    }

    return dict;
  }

  /**
   * Convert an ical representation of a day (SU, MO, etc..)
   * into a numeric value of that day.
   *
   * @param {String} string     The iCalendar day name
   * @param {weekDay=} aWeekStart
   *        The week start weekday, defaults to SUNDAY
   * @return {Number}           Numeric value of given day
   */
  static icalDayToNumericDay(string, aWeekStart) {
    //XXX: this is here so we can deal
    //     with possibly invalid string values.
    let firstDow = aWeekStart || Time.SUNDAY;
    return ((DOW_MAP[string] - firstDow + 7) % 7) + 1;
  }

  /**
   * Convert a numeric day value into its ical representation (SU, MO, etc..)
   *
   * @param {Number} num        Numeric value of given day
   * @param {weekDay=} aWeekStart
   *        The week start weekday, defaults to SUNDAY
   * @return {String}           The ICAL day value, e.g SU,MO,...
   */
  static numericDayToIcalDay(num, aWeekStart) {
    //XXX: this is here so we can deal with possibly invalid number values.
    //     Also, this allows consistent mapping between day numbers and day
    //     names for external users.
    let firstDow = aWeekStart || Time.SUNDAY;
    let dow = (num + firstDow - Time.SUNDAY);
    if (dow > 7) {
      dow -= 7;
    }
    return REVERSE_DOW_MAP[dow];
  }

  /**
   * Create a new instance of the Recur class.
   *
   * @param {Object} data                               An object with members of the recurrence
   * @param {frequencyValues=} data.freq                The frequency value
   * @param {Number=} data.interval                     The INTERVAL value
   * @param {weekDay=} data.wkst                        The week start value
   * @param {Time=} data.until                          The end of the recurrence set
   * @param {Number=} data.count                        The number of occurrences
   * @param {Array.<Number>=} data.bysecond             The seconds for the BYSECOND part
   * @param {Array.<Number>=} data.byminute             The minutes for the BYMINUTE part
   * @param {Array.<Number>=} data.byhour               The hours for the BYHOUR part
   * @param {Array.<String>=} data.byday                The BYDAY values
   * @param {Array.<Number>=} data.bymonthday           The days for the BYMONTHDAY part
   * @param {Array.<Number>=} data.byyearday            The days for the BYYEARDAY part
   * @param {Array.<Number>=} data.byweekno             The weeks for the BYWEEKNO part
   * @param {Array.<Number>=} data.bymonth              The month for the BYMONTH part
   * @param {Array.<Number>=} data.bysetpos             The positionals for the BYSETPOS part
   */
  constructor(data) {
    this.wrappedJSObject = this;
    this.parts = {};

    if (data && typeof(data) === 'object') {
      this.fromData(data);
    }
  }

  /**
   * An object holding the BY-parts of the recurrence rule
   * @memberof ICAL.Recur
   * @typedef {Object} byParts
   * @property {Array.<Number>=} BYSECOND            The seconds for the BYSECOND part
   * @property {Array.<Number>=} BYMINUTE            The minutes for the BYMINUTE part
   * @property {Array.<Number>=} BYHOUR              The hours for the BYHOUR part
   * @property {Array.<String>=} BYDAY               The BYDAY values
   * @property {Array.<Number>=} BYMONTHDAY          The days for the BYMONTHDAY part
   * @property {Array.<Number>=} BYYEARDAY           The days for the BYYEARDAY part
   * @property {Array.<Number>=} BYWEEKNO            The weeks for the BYWEEKNO part
   * @property {Array.<Number>=} BYMONTH             The month for the BYMONTH part
   * @property {Array.<Number>=} BYSETPOS            The positionals for the BYSETPOS part
   */

  /**
   * An object holding the BY-parts of the recurrence rule
   * @type {byParts}
   */
  parts = null;

  /**
   * The interval value for the recurrence rule.
   * @type {Number}
   */
  interval = 1;

  /**
   * The week start day
   *
   * @type {weekDay}
   * @default ICAL.Time.MONDAY
   */
  wkst = Time.MONDAY;

  /**
   * The end of the recurrence
   * @type {?Time}
   */
  until = null;

  /**
   * The maximum number of occurrences
   * @type {?Number}
   */
  count = null;

  /**
   * The frequency value.
   * @type {frequencyValues}
   */
  freq = null;

  /**
   * The class identifier.
   * @constant
   * @type {String}
   * @default "icalrecur"
   */
  icalclass = "icalrecur";

  /**
   * The type name, to be used in the jCal object.
   * @constant
   * @type {String}
   * @default "recur"
   */
  icaltype = "recur";

  /**
   * Create a new iterator for this recurrence rule. The passed start date
   * must be the start date of the event, not the start of the range to
   * search in.
   *
   * @example
   * let recur = comp.getFirstPropertyValue('rrule');
   * let dtstart = comp.getFirstPropertyValue('dtstart');
   * let iter = recur.iterator(dtstart);
   * for (let next = iter.next(); next; next = iter.next()) {
   *   if (next.compare(rangeStart) < 0) {
   *     continue;
   *   }
   *   console.log(next.toString());
   * }
   *
   * @param {Time} aStart        The item's start date
   * @return {RecurIterator}     The recurrence iterator
   */
  iterator(aStart) {
    return new RecurIterator({
      rule: this,
      dtstart: aStart
    });
  }

  /**
   * Returns a clone of the recurrence object.
   *
   * @return {Recur}      The cloned object
   */
  clone() {
    return new Recur(this.toJSON());
  }

  /**
   * Checks if the current rule is finite, i.e. has a count or until part.
   *
   * @return {Boolean}        True, if the rule is finite
   */
  isFinite() {
    return !!(this.count || this.until);
  }

  /**
   * Checks if the current rule has a count part, and not limited by an until
   * part.
   *
   * @return {Boolean}        True, if the rule is by count
   */
  isByCount() {
    return !!(this.count && !this.until);
  }

  /**
   * Adds a component (part) to the recurrence rule. This is not a component
   * in the sense of {@link ICAL.Component}, but a part of the recurrence
   * rule, i.e. BYMONTH.
   *
   * @param {String} aType            The name of the component part
   * @param {Array|String} aValue     The component value
   */
  addComponent(aType, aValue) {
    let ucname = aType.toUpperCase();
    if (ucname in this.parts) {
      this.parts[ucname].push(aValue);
    } else {
      this.parts[ucname] = [aValue];
    }
  }

  /**
   * Sets the component value for the given by-part.
   *
   * @param {String} aType        The component part name
   * @param {Array} aValues       The component values
   */
  setComponent(aType, aValues) {
    this.parts[aType.toUpperCase()] = aValues.slice();
  }

  /**
   * Gets (a copy) of the requested component value.
   *
   * @param {String} aType        The component part name
   * @return {Array}              The component part value
   */
  getComponent(aType) {
    let ucname = aType.toUpperCase();
    return (ucname in this.parts ? this.parts[ucname].slice() : []);
  }

  /**
   * Retrieves the next occurrence after the given recurrence id. See the
   * guide on {@tutorial terminology} for more details.
   *
   * NOTE: Currently, this method iterates all occurrences from the start
   * date. It should not be called in a loop for performance reasons. If you
   * would like to get more than one occurrence, you can iterate the
   * occurrences manually, see the example on the
   * {@link ICAL.Recur#iterator iterator} method.
   *
   * @param {Time} aStartTime        The start of the event series
   * @param {Time} aRecurrenceId     The date of the last occurrence
   * @return {Time}                  The next occurrence after
   */
  getNextOccurrence(aStartTime, aRecurrenceId) {
    let iter = this.iterator(aStartTime);
    let next;

    do {
      next = iter.next();
    } while (next && next.compare(aRecurrenceId) <= 0);

    if (next && aRecurrenceId.zone) {
      next.zone = aRecurrenceId.zone;
    }

    return next;
  }

  /**
   * Sets up the current instance using members from the passed data object.
   *
   * @param {Object} data                               An object with members of the recurrence
   * @param {frequencyValues=} data.freq                The frequency value
   * @param {Number=} data.interval                     The INTERVAL value
   * @param {weekDay=} data.wkst                        The week start value
   * @param {Time=} data.until                          The end of the recurrence set
   * @param {Number=} data.count                        The number of occurrences
   * @param {Array.<Number>=} data.bysecond             The seconds for the BYSECOND part
   * @param {Array.<Number>=} data.byminute             The minutes for the BYMINUTE part
   * @param {Array.<Number>=} data.byhour               The hours for the BYHOUR part
   * @param {Array.<String>=} data.byday                The BYDAY values
   * @param {Array.<Number>=} data.bymonthday           The days for the BYMONTHDAY part
   * @param {Array.<Number>=} data.byyearday            The days for the BYYEARDAY part
   * @param {Array.<Number>=} data.byweekno             The weeks for the BYWEEKNO part
   * @param {Array.<Number>=} data.bymonth              The month for the BYMONTH part
   * @param {Array.<Number>=} data.bysetpos             The positionals for the BYSETPOS part
   */
  fromData(data) {
    for (let key in data) {
      let uckey = key.toUpperCase();

      if (uckey in partDesign) {
        if (Array.isArray(data[key])) {
          this.parts[uckey] = data[key];
        } else {
          this.parts[uckey] = [data[key]];
        }
      } else {
        this[key] = data[key];
      }
    }

    if (this.interval && typeof this.interval != "number") {
      optionDesign.INTERVAL(this.interval, this);
    }

    if (this.wkst && typeof this.wkst != "number") {
      this.wkst = Recur.icalDayToNumericDay(this.wkst);
    }

    if (this.until && !(this.until instanceof Time)) {
      this.until = Time.fromString(this.until);
    }
  }

  /**
   * The jCal representation of this recurrence type.
   * @return {Object}
   */
  toJSON() {
    let res = Object.create(null);
    res.freq = this.freq;

    if (this.count) {
      res.count = this.count;
    }

    if (this.interval > 1) {
      res.interval = this.interval;
    }

    for (let [k, kparts] of Object.entries(this.parts)) {
      if (Array.isArray(kparts) && kparts.length == 1) {
        res[k.toLowerCase()] = kparts[0];
      } else {
        res[k.toLowerCase()] = clone(kparts);
      }
    }

    if (this.until) {
      res.until = this.until.toString();
    }
    if ('wkst' in this && this.wkst !== Time.DEFAULT_WEEK_START) {
      res.wkst = Recur.numericDayToIcalDay(this.wkst);
    }
    return res;
  }

  /**
   * The string representation of this recurrence rule.
   * @return {String}
   */
  toString() {
    // TODO retain order
    let str = "FREQ=" + this.freq;
    if (this.count) {
      str += ";COUNT=" + this.count;
    }
    if (this.interval > 1) {
      str += ";INTERVAL=" + this.interval;
    }
    for (let [k, v] of Object.entries(this.parts)) {
      str += ";" + k + "=" + v;
    }
    if (this.until) {
      str += ';UNTIL=' + this.until.toICALString();
    }
    if ('wkst' in this && this.wkst !== Time.DEFAULT_WEEK_START) {
      str += ';WKST=' + Recur.numericDayToIcalDay(this.wkst);
    }
    return str;
  }
}

function parseNumericValue(type, min, max, value) {
  let result = value;

  if (value[0] === '+') {
    result = value.slice(1);
  }

  result = strictParseInt(result);

  if (min !== undefined && value < min) {
    throw new Error(
      type + ': invalid value "' + value + '" must be > ' + min
    );
  }

  if (max !== undefined && value > max) {
    throw new Error(
      type + ': invalid value "' + value + '" must be < ' + min
    );
  }

  return result;
}

const optionDesign = {
  FREQ: function(value, dict, fmtIcal) {
    // yes this is actually equal or faster then regex.
    // upside here is we can enumerate the valid values.
    if (ALLOWED_FREQ.indexOf(value) !== -1) {
      dict.freq = value;
    } else {
      throw new Error(
        'invalid frequency "' + value + '" expected: "' +
        ALLOWED_FREQ.join(', ') + '"'
      );
    }
  },

  COUNT: function(value, dict, fmtIcal) {
    dict.count = strictParseInt(value);
  },

  INTERVAL: function(value, dict, fmtIcal) {
    dict.interval = strictParseInt(value);
    if (dict.interval < 1) {
      // 0 or negative values are not allowed, some engines seem to generate
      // it though. Assume 1 instead.
      dict.interval = 1;
    }
  },

  UNTIL: function(value, dict, fmtIcal) {
    if (value.length > 10) {
      dict.until = design.icalendar.value['date-time'].fromICAL(value);
    } else {
      dict.until = design.icalendar.value.date.fromICAL(value);
    }
    if (!fmtIcal) {
      dict.until = Time.fromString(dict.until);
    }
  },

  WKST: function(value, dict, fmtIcal) {
    if (VALID_DAY_NAMES.test(value)) {
      dict.wkst = Recur.icalDayToNumericDay(value);
    } else {
      throw new Error('invalid WKST value "' + value + '"');
    }
  }
};

const partDesign = {
  BYSECOND: parseNumericValue.bind(undefined, 'BYSECOND', 0, 60),
  BYMINUTE: parseNumericValue.bind(undefined, 'BYMINUTE', 0, 59),
  BYHOUR: parseNumericValue.bind(undefined, 'BYHOUR', 0, 23),
  BYDAY: function(value) {
    if (VALID_BYDAY_PART.test(value)) {
      return value;
    } else {
      throw new Error('invalid BYDAY value "' + value + '"');
    }
  },
  BYMONTHDAY: parseNumericValue.bind(undefined, 'BYMONTHDAY', -31, 31),
  BYYEARDAY: parseNumericValue.bind(undefined, 'BYYEARDAY', -366, 366),
  BYWEEKNO: parseNumericValue.bind(undefined, 'BYWEEKNO', -53, 53),
  BYMONTH: parseNumericValue.bind(undefined, 'BYMONTH', 1, 12),
  BYSETPOS: parseNumericValue.bind(undefined, 'BYSETPOS', -366, 366)
};

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * Portions Copyright (C) Philipp Kewisch */


/**
 * This lets typescript resolve our custom types in the
 * generated d.ts files (jsdoc typedefs are converted to typescript types).
 * Ignore prevents the typedefs from being documented more than once.
 * @ignore
 * @typedef {import("./types.js").designSet} designSet
 * Imports the 'designSet' type from the "types.js" module
 */

/** @module ICAL.design */

const FROM_ICAL_NEWLINE = /\\\\|\\;|\\,|\\[Nn]/g;
const TO_ICAL_NEWLINE = /\\|;|,|\n/g;
const FROM_VCARD_NEWLINE = /\\\\|\\,|\\[Nn]/g;
const TO_VCARD_NEWLINE = /\\|,|\n/g;

function createTextType(fromNewline, toNewline) {
  let result = {
    matches: /.*/,

    fromICAL: function(aValue, structuredEscape) {
      return replaceNewline(aValue, fromNewline, structuredEscape);
    },

    toICAL: function(aValue, structuredEscape) {
      let regEx = toNewline;
      if (structuredEscape)
         regEx = new RegExp(regEx.source + '|' + structuredEscape, regEx.flags);
      return aValue.replace(regEx, function(str) {
        switch (str) {
        case "\\":
          return "\\\\";
        case ";":
          return "\\;";
        case ",":
          return "\\,";
        case "\n":
          return "\\n";
        /* c8 ignore next 2 */
        default:
          return str;
        }
      });
    }
  };
  return result;
}

// default types used multiple times
const DEFAULT_TYPE_TEXT = { defaultType: "text" };
const DEFAULT_TYPE_TEXT_MULTI = { defaultType: "text", multiValue: "," };
const DEFAULT_TYPE_TEXT_STRUCTURED = { defaultType: "text", structuredValue: ";" };
const DEFAULT_TYPE_INTEGER = { defaultType: "integer" };
const DEFAULT_TYPE_DATETIME_DATE = { defaultType: "date-time", allowedTypes: ["date-time", "date"] };
const DEFAULT_TYPE_DATETIME = { defaultType: "date-time" };
const DEFAULT_TYPE_URI = { defaultType: "uri" };
const DEFAULT_TYPE_UTCOFFSET = { defaultType: "utc-offset" };
const DEFAULT_TYPE_RECUR = { defaultType: "recur" };
const DEFAULT_TYPE_DATE_ANDOR_TIME = { defaultType: "date-and-or-time", allowedTypes: ["date-time", "date", "text"] };

function replaceNewlineReplace(string) {
  switch (string) {
    case "\\\\":
      return "\\";
    case "\\;":
      return ";";
    case "\\,":
      return ",";
    case "\\n":
    case "\\N":
      return "\n";
    /* c8 ignore next 2 */
    default:
      return string;
  }
}

function replaceNewline(value, newline, structuredEscape) {
  // avoid regex when possible.
  if (value.indexOf('\\') === -1) {
    return value;
  }
  if (structuredEscape)
     newline = new RegExp(newline.source + '|\\\\' + structuredEscape, newline.flags);
  return value.replace(newline, replaceNewlineReplace);
}

let commonProperties = {
  "categories": DEFAULT_TYPE_TEXT_MULTI,
  "url": DEFAULT_TYPE_URI,
  "version": DEFAULT_TYPE_TEXT,
  "uid": DEFAULT_TYPE_TEXT
};

let commonValues = {
  "boolean": {
    values: ["TRUE", "FALSE"],

    fromICAL: function(aValue) {
      switch (aValue) {
        case 'TRUE':
          return true;
        case 'FALSE':
          return false;
        default:
          //TODO: parser warning
          return false;
      }
    },

    toICAL: function(aValue) {
      if (aValue) {
        return 'TRUE';
      }
      return 'FALSE';
    }

  },
  float: {
    matches: /^[+-]?\d+\.\d+$/,

    fromICAL: function(aValue) {
      let parsed = parseFloat(aValue);
      if (isStrictlyNaN(parsed)) {
        // TODO: parser warning
        return 0.0;
      }
      return parsed;
    },

    toICAL: function(aValue) {
      return String(aValue);
    }
  },
  integer: {
    fromICAL: function(aValue) {
      let parsed = parseInt(aValue);
      if (isStrictlyNaN(parsed)) {
        return 0;
      }
      return parsed;
    },

    toICAL: function(aValue) {
      return String(aValue);
    }
  },
  "utc-offset": {
    toICAL: function(aValue) {
      if (aValue.length < 7) {
        // no seconds
        // -0500
        return aValue.slice(0, 3) +
               aValue.slice(4, 6);
      } else {
        // seconds
        // -050000
        return aValue.slice(0, 3) +
               aValue.slice(4, 6) +
               aValue.slice(7, 9);
      }
    },

    fromICAL: function(aValue) {
      if (aValue.length < 6) {
        // no seconds
        // -05:00
        return aValue.slice(0, 3) + ':' +
               aValue.slice(3, 5);
      } else {
        // seconds
        // -05:00:00
        return aValue.slice(0, 3) + ':' +
               aValue.slice(3, 5) + ':' +
               aValue.slice(5, 7);
      }
    },

    decorate: function(aValue) {
      return UtcOffset.fromString(aValue);
    },

    undecorate: function(aValue) {
      return aValue.toString();
    }
  }
};

let icalParams = {
  // Although the syntax is DQUOTE uri DQUOTE, I don't think we should
  // enforce anything aside from it being a valid content line.
  //
  // At least some params require - if multi values are used - DQUOTEs
  // for each of its values - e.g. delegated-from="uri1","uri2"
  // To indicate this, I introduced the new k/v pair
  // multiValueSeparateDQuote: true
  //
  // "ALTREP": { ... },

  // CN just wants a param-value
  // "CN": { ... }

  "cutype": {
    values: ["INDIVIDUAL", "GROUP", "RESOURCE", "ROOM", "UNKNOWN"],
    allowXName: true,
    allowIanaToken: true
  },

  "delegated-from": {
    valueType: "cal-address",
    multiValue: ",",
    multiValueSeparateDQuote: true
  },
  "delegated-to": {
    valueType: "cal-address",
    multiValue: ",",
    multiValueSeparateDQuote: true
  },
  // "DIR": { ... }, // See ALTREP
  "encoding": {
    values: ["8BIT", "BASE64"]
  },
  // "FMTTYPE": { ... }, // See ALTREP
  "fbtype": {
    values: ["FREE", "BUSY", "BUSY-UNAVAILABLE", "BUSY-TENTATIVE"],
    allowXName: true,
    allowIanaToken: true
  },
  // "LANGUAGE": { ... }, // See ALTREP
  "member": {
    valueType: "cal-address",
    multiValue: ",",
    multiValueSeparateDQuote: true
  },
  "partstat": {
    // TODO These values are actually different per-component
    values: ["NEEDS-ACTION", "ACCEPTED", "DECLINED", "TENTATIVE",
             "DELEGATED", "COMPLETED", "IN-PROCESS"],
    allowXName: true,
    allowIanaToken: true
  },
  "range": {
    values: ["THISANDFUTURE"]
  },
  "related": {
    values: ["START", "END"]
  },
  "reltype": {
    values: ["PARENT", "CHILD", "SIBLING"],
    allowXName: true,
    allowIanaToken: true
  },
  "role": {
    values: ["REQ-PARTICIPANT", "CHAIR",
             "OPT-PARTICIPANT", "NON-PARTICIPANT"],
    allowXName: true,
    allowIanaToken: true
  },
  "rsvp": {
    values: ["TRUE", "FALSE"]
  },
  "sent-by": {
    valueType: "cal-address"
  },
  "tzid": {
    matches: /^\//
  },
  "value": {
    // since the value here is a 'type' lowercase is used.
    values: ["binary", "boolean", "cal-address", "date", "date-time",
             "duration", "float", "integer", "period", "recur", "text",
             "time", "uri", "utc-offset"],
    allowXName: true,
    allowIanaToken: true
  }
};

// When adding a value here, be sure to add it to the parameter types!
const icalValues = extend(commonValues, {
  text: createTextType(FROM_ICAL_NEWLINE, TO_ICAL_NEWLINE),

  uri: {
    // TODO
    /* ... */
  },

  "binary": {
    decorate: function(aString) {
      return Binary.fromString(aString);
    },

    undecorate: function(aBinary) {
      return aBinary.toString();
    }
  },
  "cal-address": {
    // needs to be an uri
  },
  "date": {
    decorate: function(aValue, aProp) {
      {
        return Time.fromDateString(aValue, aProp);
      }
    },

    /**
     * undecorates a time object.
     */
    undecorate: function(aValue) {
      return aValue.toString();
    },

    fromICAL: function(aValue) {
      // from: 20120901
      // to: 2012-09-01
      {
        return aValue.slice(0, 4) + '-' +
               aValue.slice(4, 6) + '-' +
               aValue.slice(6, 8);
      }
    },

    toICAL: function(aValue) {
      // from: 2012-09-01
      // to: 20120901
      let len = aValue.length;

      if (len == 10) {
        return aValue.slice(0, 4) +
               aValue.slice(5, 7) +
               aValue.slice(8, 10);
      } else if (len >= 19) {
        return icalValues["date-time"].toICAL(aValue);
      } else {
        //TODO: serialize warning?
        return aValue;
      }

    }
  },
  "date-time": {
    fromICAL: function(aValue) {
      // from: 20120901T130000
      // to: 2012-09-01T13:00:00
      {
        let result = aValue.slice(0, 4) + '-' +
                     aValue.slice(4, 6) + '-' +
                     aValue.slice(6, 8) + 'T' +
                     aValue.slice(9, 11) + ':' +
                     aValue.slice(11, 13) + ':' +
                     aValue.slice(13, 15);

        if (aValue[15] && aValue[15] === 'Z') {
          result += 'Z';
        }

        return result;
      }
    },

    toICAL: function(aValue) {
      // from: 2012-09-01T13:00:00
      // to: 20120901T130000
      let len = aValue.length;

      if (len >= 19) {
        let result = aValue.slice(0, 4) +
                     aValue.slice(5, 7) +
                     // grab the (DDTHH) segment
                     aValue.slice(8, 13) +
                     // MM
                     aValue.slice(14, 16) +
                     // SS
                     aValue.slice(17, 19);

        if (aValue[19] && aValue[19] === 'Z') {
          result += 'Z';
        }
        return result;
      } else {
        // TODO: error
        return aValue;
      }
    },

    decorate: function(aValue, aProp) {
      {
        return Time.fromDateTimeString(aValue, aProp);
      }
    },

    undecorate: function(aValue) {
      return aValue.toString();
    }
  },
  duration: {
    decorate: function(aValue) {
      return Duration.fromString(aValue);
    },
    undecorate: function(aValue) {
      return aValue.toString();
    }
  },
  period: {
    fromICAL: function(string) {
      let parts = string.split('/');
      parts[0] = icalValues['date-time'].fromICAL(parts[0]);

      if (!Duration.isValueString(parts[1])) {
        parts[1] = icalValues['date-time'].fromICAL(parts[1]);
      }

      return parts;
    },

    toICAL: function(parts) {
      parts = parts.slice();
      {
        parts[0] = icalValues['date-time'].toICAL(parts[0]);
      }

      if (!Duration.isValueString(parts[1])) {
        {
          parts[1] = icalValues['date-time'].toICAL(parts[1]);
        }
      }

      return parts.join("/");
    },

    decorate: function(aValue, aProp) {
      return Period.fromJSON(aValue, aProp, false);
    },

    undecorate: function(aValue) {
      return aValue.toJSON();
    }
  },
  recur: {
    fromICAL: function(string) {
      return Recur._stringToData(string, true);
    },

    toICAL: function(data) {
      let str = "";
      for (let [k, val] of Object.entries(data)) {
        if (k == "until") {
          if (val.length > 10) {
            val = icalValues['date-time'].toICAL(val);
          } else {
            val = icalValues.date.toICAL(val);
          }
        } else if (k == "wkst") {
          if (typeof val === 'number') {
            val = Recur.numericDayToIcalDay(val);
          }
        } else if (Array.isArray(val)) {
          val = val.join(",");
        }
        str += k.toUpperCase() + "=" + val + ";";
      }
      return str.slice(0, Math.max(0, str.length - 1));
    },

    decorate: function decorate(aValue) {
      return Recur.fromData(aValue);
    },

    undecorate: function(aRecur) {
      return aRecur.toJSON();
    }
  },

  time: {
    fromICAL: function(aValue) {
      // from: MMHHSS(Z)?
      // to: HH:MM:SS(Z)?
      if (aValue.length < 6) {
        // TODO: parser exception?
        return aValue;
      }

      // HH::MM::SSZ?
      let result = aValue.slice(0, 2) + ':' +
                   aValue.slice(2, 4) + ':' +
                   aValue.slice(4, 6);

      if (aValue[6] === 'Z') {
        result += 'Z';
      }

      return result;
    },

    toICAL: function(aValue) {
      // from: HH:MM:SS(Z)?
      // to: MMHHSS(Z)?
      if (aValue.length < 8) {
        //TODO: error
        return aValue;
      }

      let result = aValue.slice(0, 2) +
                   aValue.slice(3, 5) +
                   aValue.slice(6, 8);

      if (aValue[8] === 'Z') {
        result += 'Z';
      }

      return result;
    }
  }
});

let icalProperties = extend(commonProperties, {

  "action": DEFAULT_TYPE_TEXT,
  "attach": { defaultType: "uri" },
  "attendee": { defaultType: "cal-address" },
  "calscale": DEFAULT_TYPE_TEXT,
  "class": DEFAULT_TYPE_TEXT,
  "comment": DEFAULT_TYPE_TEXT,
  "completed": DEFAULT_TYPE_DATETIME,
  "contact": DEFAULT_TYPE_TEXT,
  "created": DEFAULT_TYPE_DATETIME,
  "description": DEFAULT_TYPE_TEXT,
  "dtend": DEFAULT_TYPE_DATETIME_DATE,
  "dtstamp": DEFAULT_TYPE_DATETIME,
  "dtstart": DEFAULT_TYPE_DATETIME_DATE,
  "due": DEFAULT_TYPE_DATETIME_DATE,
  "duration": { defaultType: "duration" },
  "exdate": {
    defaultType: "date-time",
    allowedTypes: ["date-time", "date"],
    multiValue: ','
  },
  "exrule": DEFAULT_TYPE_RECUR,
  "freebusy": { defaultType: "period", multiValue: "," },
  "geo": { defaultType: "float", structuredValue: ";" },
  "last-modified": DEFAULT_TYPE_DATETIME,
  "location": DEFAULT_TYPE_TEXT,
  "method": DEFAULT_TYPE_TEXT,
  "organizer": { defaultType: "cal-address" },
  "percent-complete": DEFAULT_TYPE_INTEGER,
  "priority": DEFAULT_TYPE_INTEGER,
  "prodid": DEFAULT_TYPE_TEXT,
  "related-to": DEFAULT_TYPE_TEXT,
  "repeat": DEFAULT_TYPE_INTEGER,
  "rdate": {
    defaultType: "date-time",
    allowedTypes: ["date-time", "date", "period"],
    multiValue: ',',
    detectType: function(string) {
      if (string.indexOf('/') !== -1) {
        return 'period';
      }
      return (string.indexOf('T') === -1) ? 'date' : 'date-time';
    }
  },
  "recurrence-id": DEFAULT_TYPE_DATETIME_DATE,
  "resources": DEFAULT_TYPE_TEXT_MULTI,
  "request-status": DEFAULT_TYPE_TEXT_STRUCTURED,
  "rrule": DEFAULT_TYPE_RECUR,
  "sequence": DEFAULT_TYPE_INTEGER,
  "status": DEFAULT_TYPE_TEXT,
  "summary": DEFAULT_TYPE_TEXT,
  "transp": DEFAULT_TYPE_TEXT,
  "trigger": { defaultType: "duration", allowedTypes: ["duration", "date-time"] },
  "tzoffsetfrom": DEFAULT_TYPE_UTCOFFSET,
  "tzoffsetto": DEFAULT_TYPE_UTCOFFSET,
  "tzurl": DEFAULT_TYPE_URI,
  "tzid": DEFAULT_TYPE_TEXT,
  "tzname": DEFAULT_TYPE_TEXT
});

// When adding a value here, be sure to add it to the parameter types!
const vcardValues = extend(commonValues, {
  text: createTextType(FROM_VCARD_NEWLINE, TO_VCARD_NEWLINE),
  uri: createTextType(FROM_VCARD_NEWLINE, TO_VCARD_NEWLINE),

  date: {
    decorate: function(aValue) {
      return VCardTime.fromDateAndOrTimeString(aValue, "date");
    },
    undecorate: function(aValue) {
      return aValue.toString();
    },
    fromICAL: function(aValue) {
      if (aValue.length == 8) {
        return icalValues.date.fromICAL(aValue);
      } else if (aValue[0] == '-' && aValue.length == 6) {
        return aValue.slice(0, 4) + '-' + aValue.slice(4);
      } else {
        return aValue;
      }
    },
    toICAL: function(aValue) {
      if (aValue.length == 10) {
        return icalValues.date.toICAL(aValue);
      } else if (aValue[0] == '-' && aValue.length == 7) {
        return aValue.slice(0, 4) + aValue.slice(5);
      } else {
        return aValue;
      }
    }
  },

  time: {
    decorate: function(aValue) {
      return VCardTime.fromDateAndOrTimeString("T" + aValue, "time");
    },
    undecorate: function(aValue) {
      return aValue.toString();
    },
    fromICAL: function(aValue) {
      let splitzone = vcardValues.time._splitZone(aValue, true);
      let zone = splitzone[0], value = splitzone[1];

      //console.log("SPLIT: ",splitzone);

      if (value.length == 6) {
        value = value.slice(0, 2) + ':' +
                value.slice(2, 4) + ':' +
                value.slice(4, 6);
      } else if (value.length == 4 && value[0] != '-') {
        value = value.slice(0, 2) + ':' + value.slice(2, 4);
      } else if (value.length == 5) {
        value = value.slice(0, 3) + ':' + value.slice(3, 5);
      }

      if (zone.length == 5 && (zone[0] == '-' || zone[0] == '+')) {
        zone = zone.slice(0, 3) + ':' + zone.slice(3);
      }

      return value + zone;
    },

    toICAL: function(aValue) {
      let splitzone = vcardValues.time._splitZone(aValue);
      let zone = splitzone[0], value = splitzone[1];

      if (value.length == 8) {
        value = value.slice(0, 2) +
                value.slice(3, 5) +
                value.slice(6, 8);
      } else if (value.length == 5 && value[0] != '-') {
        value = value.slice(0, 2) + value.slice(3, 5);
      } else if (value.length == 6) {
        value = value.slice(0, 3) + value.slice(4, 6);
      }

      if (zone.length == 6 && (zone[0] == '-' || zone[0] == '+')) {
        zone = zone.slice(0, 3) + zone.slice(4);
      }

      return value + zone;
    },

    _splitZone: function(aValue, isFromIcal) {
      let lastChar = aValue.length - 1;
      let signChar = aValue.length - (isFromIcal ? 5 : 6);
      let sign = aValue[signChar];
      let zone, value;

      if (aValue[lastChar] == 'Z') {
        zone = aValue[lastChar];
        value = aValue.slice(0, Math.max(0, lastChar));
      } else if (aValue.length > 6 && (sign == '-' || sign == '+')) {
        zone = aValue.slice(signChar);
        value = aValue.slice(0, Math.max(0, signChar));
      } else {
        zone = "";
        value = aValue;
      }

      return [zone, value];
    }
  },

  "date-time": {
    decorate: function(aValue) {
      return VCardTime.fromDateAndOrTimeString(aValue, "date-time");
    },

    undecorate: function(aValue) {
      return aValue.toString();
    },

    fromICAL: function(aValue) {
      return vcardValues['date-and-or-time'].fromICAL(aValue);
    },

    toICAL: function(aValue) {
      return vcardValues['date-and-or-time'].toICAL(aValue);
    }
  },

  "date-and-or-time": {
    decorate: function(aValue) {
      return VCardTime.fromDateAndOrTimeString(aValue, "date-and-or-time");
    },

    undecorate: function(aValue) {
      return aValue.toString();
    },

    fromICAL: function(aValue) {
      let parts = aValue.split('T');
      return (parts[0] ? vcardValues.date.fromICAL(parts[0]) : '') +
             (parts[1] ? 'T' + vcardValues.time.fromICAL(parts[1]) : '');
    },

    toICAL: function(aValue) {
      let parts = aValue.split('T');
      return vcardValues.date.toICAL(parts[0]) +
             (parts[1] ? 'T' + vcardValues.time.toICAL(parts[1]) : '');

    }
  },
  timestamp: icalValues['date-time'],
  "language-tag": {
    matches: /^[a-zA-Z0-9-]+$/ // Could go with a more strict regex here
  },
  "phone-number": {
    fromICAL: function(aValue) {
      return Array.from(aValue).filter(function(c) {
          return c === '\\' ? undefined : c;
        }).join('');
    },
    toICAL: function(aValue) {
      return Array.from(aValue).map(function(c) {
        return c === ',' || c === ";" ? '\\' + c : c;
      }).join('');
    }
  }
});

let vcardParams = {
  "type": {
    valueType: "text",
    multiValue: ","
  },
  "value": {
    // since the value here is a 'type' lowercase is used.
    values: ["text", "uri", "date", "time", "date-time", "date-and-or-time",
             "timestamp", "boolean", "integer", "float", "utc-offset",
             "language-tag"],
    allowXName: true,
    allowIanaToken: true
  }
};

let vcardProperties = extend(commonProperties, {
  "adr": { defaultType: "text", structuredValue: ";", multiValue: "," },
  "anniversary": DEFAULT_TYPE_DATE_ANDOR_TIME,
  "bday": DEFAULT_TYPE_DATE_ANDOR_TIME,
  "caladruri": DEFAULT_TYPE_URI,
  "caluri": DEFAULT_TYPE_URI,
  "clientpidmap": DEFAULT_TYPE_TEXT_STRUCTURED,
  "email": DEFAULT_TYPE_TEXT,
  "fburl": DEFAULT_TYPE_URI,
  "fn": DEFAULT_TYPE_TEXT,
  "gender": DEFAULT_TYPE_TEXT_STRUCTURED,
  "geo": DEFAULT_TYPE_URI,
  "impp": DEFAULT_TYPE_URI,
  "key": DEFAULT_TYPE_URI,
  "kind": DEFAULT_TYPE_TEXT,
  "lang": { defaultType: "language-tag" },
  "logo": DEFAULT_TYPE_URI,
  "member": DEFAULT_TYPE_URI,
  "n": { defaultType: "text", structuredValue: ";", multiValue: "," },
  "nickname": DEFAULT_TYPE_TEXT_MULTI,
  "note": DEFAULT_TYPE_TEXT,
  "org": { defaultType: "text", structuredValue: ";" },
  "photo": DEFAULT_TYPE_URI,
  "related": DEFAULT_TYPE_URI,
  "rev": { defaultType: "timestamp" },
  "role": DEFAULT_TYPE_TEXT,
  "sound": DEFAULT_TYPE_URI,
  "source": DEFAULT_TYPE_URI,
  "tel": { defaultType: "uri", allowedTypes: ["uri", "text"] },
  "title": DEFAULT_TYPE_TEXT,
  "tz": { defaultType: "text", allowedTypes: ["text", "utc-offset", "uri"] },
  "xml": DEFAULT_TYPE_TEXT
});

let vcard3Values = extend(commonValues, {
  binary: icalValues.binary,
  date: vcardValues.date,
  "date-time": vcardValues["date-time"],
  "phone-number": vcardValues["phone-number"],
  uri: icalValues.uri,
  text: vcardValues.text,
  time: icalValues.time,
  vcard: icalValues.text,
  "utc-offset": {
    toICAL: function(aValue) {
      return aValue.slice(0, 7);
    },

    fromICAL: function(aValue) {
      return aValue.slice(0, 7);
    },

    decorate: function(aValue) {
      return UtcOffset.fromString(aValue);
    },

    undecorate: function(aValue) {
      return aValue.toString();
    }
  }
});

let vcard3Params = {
  "type": {
    valueType: "text",
    multiValue: ","
  },
  "value": {
    // since the value here is a 'type' lowercase is used.
    values: ["text", "uri", "date", "date-time", "phone-number", "time",
             "boolean", "integer", "float", "utc-offset", "vcard", "binary"],
    allowXName: true,
    allowIanaToken: true
  }
};

let vcard3Properties = extend(commonProperties, {
  fn: DEFAULT_TYPE_TEXT,
  n: { defaultType: "text", structuredValue: ";", multiValue: "," },
  nickname: DEFAULT_TYPE_TEXT_MULTI,
  photo: { defaultType: "binary", allowedTypes: ["binary", "uri"] },
  bday: {
    defaultType: "date-time",
    allowedTypes: ["date-time", "date"],
    detectType: function(string) {
      return (string.indexOf('T') === -1) ? 'date' : 'date-time';
    }
  },

  adr: { defaultType: "text", structuredValue: ";", multiValue: "," },
  label: DEFAULT_TYPE_TEXT,

  tel: { defaultType: "phone-number" },
  email: DEFAULT_TYPE_TEXT,
  mailer: DEFAULT_TYPE_TEXT,

  tz: { defaultType: "utc-offset", allowedTypes: ["utc-offset", "text"] },
  geo: { defaultType: "float", structuredValue: ";" },

  title: DEFAULT_TYPE_TEXT,
  role: DEFAULT_TYPE_TEXT,
  logo: { defaultType: "binary", allowedTypes: ["binary", "uri"] },
  agent: { defaultType: "vcard", allowedTypes: ["vcard", "text", "uri"] },
  org: DEFAULT_TYPE_TEXT_STRUCTURED,

  note: DEFAULT_TYPE_TEXT_MULTI,
  prodid: DEFAULT_TYPE_TEXT,
  rev: {
    defaultType: "date-time",
    allowedTypes: ["date-time", "date"],
    detectType: function(string) {
      return (string.indexOf('T') === -1) ? 'date' : 'date-time';
    }
  },
  "sort-string": DEFAULT_TYPE_TEXT,
  sound: { defaultType: "binary", allowedTypes: ["binary", "uri"] },

  class: DEFAULT_TYPE_TEXT,
  key: { defaultType: "binary", allowedTypes: ["binary", "text"] }
});

/**
 * iCalendar design set
 * @type {designSet}
 */
let icalSet = {
  name: "ical",
  value: icalValues,
  param: icalParams,
  property: icalProperties,
  propertyGroups: false
};

/**
 * vCard 4.0 design set
 * @type {designSet}
 */
let vcardSet = {
  name: "vcard4",
  value: vcardValues,
  param: vcardParams,
  property: vcardProperties,
  propertyGroups: true
};

/**
 * vCard 3.0 design set
 * @type {designSet}
 */
let vcard3Set = {
  name: "vcard3",
  value: vcard3Values,
  param: vcard3Params,
  property: vcard3Properties,
  propertyGroups: true
};

/**
 * The design data, used by the parser to determine types for properties and
 * other metadata needed to produce correct jCard/jCal data.
 *
 * @alias ICAL.design
 * @exports module:ICAL.design
 */
const design = {
  /**
   * Can be set to false to make the parser more lenient.
   */
  strict: true,

  /**
   * The default set for new properties and components if none is specified.
   * @type {designSet}
   */
  defaultSet: icalSet,

  /**
   * The default type for unknown properties
   * @type {String}
   */
  defaultType: 'unknown',

  /**
   * Holds the design set for known top-level components
   *
   * @type {Object}
   * @property {designSet} vcard       vCard VCARD
   * @property {designSet} vevent      iCalendar VEVENT
   * @property {designSet} vtodo       iCalendar VTODO
   * @property {designSet} vjournal    iCalendar VJOURNAL
   * @property {designSet} valarm      iCalendar VALARM
   * @property {designSet} vtimezone   iCalendar VTIMEZONE
   * @property {designSet} daylight    iCalendar DAYLIGHT
   * @property {designSet} standard    iCalendar STANDARD
   *
   * @example
   * let propertyName = 'fn';
   * let componentDesign = ICAL.design.components.vcard;
   * let propertyDetails = componentDesign.property[propertyName];
   * if (propertyDetails.defaultType == 'text') {
   *   // Yep, sure is...
   * }
   */
  components: {
    vcard: vcardSet,
    vcard3: vcard3Set,
    vevent: icalSet,
    vtodo: icalSet,
    vjournal: icalSet,
    valarm: icalSet,
    vtimezone: icalSet,
    daylight: icalSet,
    standard: icalSet
  },


  /**
   * The design set for iCalendar (rfc5545/rfc7265) components.
   * @type {designSet}
   */
  icalendar: icalSet,

  /**
   * The design set for vCard (rfc6350/rfc7095) components.
   * @type {designSet}
   */
  vcard: vcardSet,

  /**
   * The design set for vCard (rfc2425/rfc2426/rfc7095) components.
   * @type {designSet}
   */
  vcard3: vcard3Set,

  /**
   * Gets the design set for the given component name.
   *
   * @param {String} componentName        The name of the component
   * @return {designSet}      The design set for the component
   */
  getDesignSet: function(componentName) {
    let isInDesign = componentName && componentName in design.components;
    return isInDesign ? design.components[componentName] : design.defaultSet;
  }
};

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * Portions Copyright (C) Philipp Kewisch */


/**
 * This lets typescript resolve our custom types in the
 * generated d.ts files (jsdoc typedefs are converted to typescript types).
 * Ignore prevents the typedefs from being documented more than once.
 *
 * @ignore
 * @typedef {import("./types.js").designSet} designSet
 * Imports the 'designSet' type from the "types.js" module
 */

const LINE_ENDING = '\r\n';
const DEFAULT_VALUE_TYPE = 'unknown';
const RFC6868_REPLACE_MAP = { '"': "^'", "\n": "^n", "^": "^^" };

/**
 * Convert a full jCal/jCard array into a iCalendar/vCard string.
 *
 * @function ICAL.stringify
 * @variation function
 * @param {Array} jCal    The jCal/jCard document
 * @return {String}       The stringified iCalendar/vCard document
 */
function stringify(jCal) {
  if (typeof jCal[0] == "string") {
    // This is a single component
    jCal = [jCal];
  }

  let i = 0;
  let len = jCal.length;
  let result = '';

  for (; i < len; i++) {
    result += stringify.component(jCal[i]) + LINE_ENDING;
  }

  return result;
}

/**
 * Converts an jCal component array into a ICAL string.
 * Recursive will resolve sub-components.
 *
 * Exact component/property order is not saved all
 * properties will come before subcomponents.
 *
 * @function ICAL.stringify.component
 * @param {Array} component
 *        jCal/jCard fragment of a component
 * @param {designSet} designSet
 *        The design data to use for this component
 * @return {String}       The iCalendar/vCard string
 */
stringify.component = function(component, designSet) {
  let name = component[0].toUpperCase();
  let result = 'BEGIN:' + name + LINE_ENDING;

  let props = component[1];
  let propIdx = 0;
  let propLen = props.length;

  let designSetName = component[0];
  // rfc6350 requires that in vCard 4.0 the first component is the VERSION
  // component with as value 4.0, note that 3.0 does not have this requirement.
  if (designSetName === 'vcard' && component[1].length > 0 &&
          !(component[1][0][0] === "version" && component[1][0][3] === "4.0")) {
    designSetName = "vcard3";
  }
  designSet = designSet || design.getDesignSet(designSetName);

  for (; propIdx < propLen; propIdx++) {
    result += stringify.property(props[propIdx], designSet) + LINE_ENDING;
  }

  // Ignore subcomponents if none exist, e.g. in vCard.
  let comps = component[2] || [];
  let compIdx = 0;
  let compLen = comps.length;

  for (; compIdx < compLen; compIdx++) {
    result += stringify.component(comps[compIdx], designSet) + LINE_ENDING;
  }

  result += 'END:' + name;
  return result;
};

/**
 * Converts a single jCal/jCard property to a iCalendar/vCard string.
 *
 * @function ICAL.stringify.property
 * @param {Array} property
 *        jCal/jCard property array
 * @param {designSet} designSet
 *        The design data to use for this property
 * @param {Boolean} noFold
 *        If true, the line is not folded
 * @return {String}       The iCalendar/vCard string
 */
stringify.property = function(property, designSet, noFold) {
  let name = property[0].toUpperCase();
  let jsName = property[0];
  let params = property[1];

  if (!designSet) {
    designSet = design.defaultSet;
  }

  let groupName = params.group;
  let line;
  if (designSet.propertyGroups && groupName) {
    line = groupName.toUpperCase() + "." + name;
  } else {
    line = name;
  }

  for (let [paramName, value] of Object.entries(params)) {
    if (designSet.propertyGroups && paramName == 'group') {
      continue;
    }

    let paramDesign = designSet.param[paramName];
    let multiValue = paramDesign && paramDesign.multiValue;
    if (multiValue && Array.isArray(value)) {
      value = value.map(function(val) {
        val = stringify._rfc6868Unescape(val);
        val = stringify.paramPropertyValue(val, paramDesign.multiValueSeparateDQuote);
        return val;
      });
      value = stringify.multiValue(value, multiValue, "unknown", null, designSet);
    } else {
      value = stringify._rfc6868Unescape(value);
      value = stringify.paramPropertyValue(value);
    }

    line += ';' + paramName.toUpperCase() + '=' + value;
  }

  if (property.length === 3) {
    // If there are no values, we must assume a blank value
    return line + ':';
  }

  let valueType = property[2];

  let propDetails;
  let multiValue = false;
  let structuredValue = false;
  let isDefault = false;

  if (jsName in designSet.property) {
    propDetails = designSet.property[jsName];

    if ('multiValue' in propDetails) {
      multiValue = propDetails.multiValue;
    }

    if (('structuredValue' in propDetails) && Array.isArray(property[3])) {
      structuredValue = propDetails.structuredValue;
    }

    if ('defaultType' in propDetails) {
      if (valueType === propDetails.defaultType) {
        isDefault = true;
      }
    } else {
      if (valueType === DEFAULT_VALUE_TYPE) {
        isDefault = true;
      }
    }
  } else {
    if (valueType === DEFAULT_VALUE_TYPE) {
      isDefault = true;
    }
  }

  // push the VALUE property if type is not the default
  // for the current property.
  if (!isDefault) {
    // value will never contain ;/:/, so we don't escape it here.
    line += ';VALUE=' + valueType.toUpperCase();
  }

  line += ':';

  if (multiValue && structuredValue) {
    line += stringify.multiValue(
      property[3], structuredValue, valueType, multiValue, designSet, structuredValue
    );
  } else if (multiValue) {
    line += stringify.multiValue(
      property.slice(3), multiValue, valueType, null, designSet, false
    );
  } else if (structuredValue) {
    line += stringify.multiValue(
      property[3], structuredValue, valueType, null, designSet, structuredValue
    );
  } else {
    line += stringify.value(property[3], valueType, designSet, false);
  }

  return noFold ? line : foldline(line);
};

/**
 * Handles escaping of property values that may contain:
 *
 *    COLON (:), SEMICOLON (;), or COMMA (,)
 *
 * If any of the above are present the result is wrapped
 * in double quotes.
 *
 * @function ICAL.stringify.paramPropertyValue
 * @param {String} value      Raw property value
 * @param {boolean} force     If value should be escaped even when unnecessary
 * @return {String}           Given or escaped value when needed
 */
stringify.paramPropertyValue = function(value, force) {
  if (!force &&
      (value.indexOf(',') === -1) &&
      (value.indexOf(':') === -1) &&
      (value.indexOf(';') === -1)) {

    return value;
  }

  return '"' + value + '"';
};

/**
 * Converts an array of ical values into a single
 * string based on a type and a delimiter value (like ",").
 *
 * @function ICAL.stringify.multiValue
 * @param {Array} values      List of values to convert
 * @param {String} delim      Used to join the values (",", ";", ":")
 * @param {String} type       Lowecase ical value type
 *        (like boolean, date-time, etc..)
 * @param {?String} innerMulti If set, each value will again be processed
 *        Used for structured values
 * @param {designSet} designSet
 *        The design data to use for this property
 *
 * @return {String}           iCalendar/vCard string for value
 */
stringify.multiValue = function(values, delim, type, innerMulti, designSet, structuredValue) {
  let result = '';
  let len = values.length;
  let i = 0;

  for (; i < len; i++) {
    if (innerMulti && Array.isArray(values[i])) {
      result += stringify.multiValue(values[i], innerMulti, type, null, designSet, structuredValue);
    } else {
      result += stringify.value(values[i], type, designSet, structuredValue);
    }

    if (i !== (len - 1)) {
      result += delim;
    }
  }

  return result;
};

/**
 * Processes a single ical value runs the associated "toICAL" method from the
 * design value type if available to convert the value.
 *
 * @function ICAL.stringify.value
 * @param {String|Number} value       A formatted value
 * @param {String} type               Lowercase iCalendar/vCard value type
 *  (like boolean, date-time, etc..)
 * @return {String}                   iCalendar/vCard value for single value
 */
stringify.value = function(value, type, designSet, structuredValue) {
  if (type in designSet.value && 'toICAL' in designSet.value[type]) {
    return designSet.value[type].toICAL(value, structuredValue);
  }
  return value;
};

/**
 * Internal helper for rfc6868. Exposing this on ICAL.stringify so that
 * hackers can disable the rfc6868 parsing if the really need to.
 *
 * @param {String} val        The value to unescape
 * @return {String}           The escaped value
 */
stringify._rfc6868Unescape = function(val) {
  return val.replace(/[\n^"]/g, function(x) {
    return RFC6868_REPLACE_MAP[x];
  });
};

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * Portions Copyright (C) Philipp Kewisch */

const NAME_INDEX$1 = 0;
const PROP_INDEX = 1;
const TYPE_INDEX = 2;
const VALUE_INDEX = 3;

/**
 * This lets typescript resolve our custom types in the
 * generated d.ts files (jsdoc typedefs are converted to typescript types).
 * Ignore prevents the typedefs from being documented more than once.
 * @ignore
 * @typedef {import("./types.js").designSet} designSet
 * Imports the 'designSet' type from the "types.js" module
 * @typedef {import("./types.js").Geo} Geo
 * Imports the 'Geo' type from the "types.js" module
 */

/**
 * Provides a layer on top of the raw jCal object for manipulating a single property, with its
 * parameters and value.
 *
 * @memberof ICAL
 */
class Property {
  /**
   * Create an {@link ICAL.Property} by parsing the passed iCalendar string.
   *
   * @param {String} str            The iCalendar string to parse
   * @param {designSet=} designSet  The design data to use for this property
   * @return {Property}             The created iCalendar property
   */
  static fromString(str, designSet) {
    return new Property(parse.property(str, designSet));
  }

  /**
   * Creates a new ICAL.Property instance.
   *
   * It is important to note that mutations done in the wrapper directly mutate the jCal object used
   * to initialize.
   *
   * Can also be used to create new properties by passing the name of the property (as a String).
   *
   * @param {Array|String} jCal         Raw jCal representation OR the new name of the property
   * @param {Component=} parent         Parent component
   */
  constructor(jCal, parent) {
    this._parent = parent || null;

    if (typeof(jCal) === 'string') {
      // We are creating the property by name and need to detect the type
      this.jCal = [jCal, {}, design.defaultType];
      this.jCal[TYPE_INDEX] = this.getDefaultType();
    } else {
      this.jCal = jCal;
    }
    this._updateType();
  }

  /**
   * The value type for this property
   * @type {String}
   */
  get type() {
    return this.jCal[TYPE_INDEX];
  }

  /**
   * The name of this property, in lowercase.
   * @type {String}
   */
  get name() {
    return this.jCal[NAME_INDEX$1];
  }

  /**
   * The parent component for this property.
   * @type {Component}
   */
  get parent() {
    return this._parent;
  }

  set parent(p) {
    // Before setting the parent, check if the design set has changed. If it
    // has, we later need to update the type if it was unknown before.
    let designSetChanged = !this._parent || (p && p._designSet != this._parent._designSet);

    this._parent = p;

    if (this.type == design.defaultType && designSetChanged) {
      this.jCal[TYPE_INDEX] = this.getDefaultType();
      this._updateType();
    }
  }

  /**
   * The design set for this property, e.g. icalendar vs vcard
   *
   * @type {designSet}
   * @private
   */
  get _designSet() {
    return this.parent ? this.parent._designSet : design.defaultSet;
  }

  /**
   * Updates the type metadata from the current jCal type and design set.
   *
   * @private
   */
  _updateType() {
    let designSet = this._designSet;

    if (this.type in designSet.value) {
      if ('decorate' in designSet.value[this.type]) {
        this.isDecorated = true;
      } else {
        this.isDecorated = false;
      }

      if (this.name in designSet.property) {
        this.isMultiValue = ('multiValue' in designSet.property[this.name]);
        this.isStructuredValue = ('structuredValue' in designSet.property[this.name]);
      }
    }
  }

  /**
   * Hydrate a single value. The act of hydrating means turning the raw jCal
   * value into a potentially wrapped object, for example {@link ICAL.Time}.
   *
   * @private
   * @param {Number} index        The index of the value to hydrate
   * @return {?Object}             The decorated value.
   */
  _hydrateValue(index) {
    if (this._values && this._values[index]) {
      return this._values[index];
    }

    // for the case where there is no value.
    if (this.jCal.length <= (VALUE_INDEX + index)) {
      return null;
    }

    if (this.isDecorated) {
      if (!this._values) {
        this._values = [];
      }
      return (this._values[index] = this._decorate(
        this.jCal[VALUE_INDEX + index]
      ));
    } else {
      return this.jCal[VALUE_INDEX + index];
    }
  }

  /**
   * Decorate a single value, returning its wrapped object. This is used by
   * the hydrate function to actually wrap the value.
   *
   * @private
   * @param {?} value         The value to decorate
   * @return {Object}         The decorated value
   */
  _decorate(value) {
    return this._designSet.value[this.type].decorate(value, this);
  }

  /**
   * Undecorate a single value, returning its raw jCal data.
   *
   * @private
   * @param {Object} value         The value to undecorate
   * @return {?}                   The undecorated value
   */
  _undecorate(value) {
    return this._designSet.value[this.type].undecorate(value, this);
  }

  /**
   * Sets the value at the given index while also hydrating it. The passed
   * value can either be a decorated or undecorated value.
   *
   * @private
   * @param {?} value             The value to set
   * @param {Number} index        The index to set it at
   */
  _setDecoratedValue(value, index) {
    if (!this._values) {
      this._values = [];
    }

    if (typeof(value) === 'object' && 'icaltype' in value) {
      // decorated value
      this.jCal[VALUE_INDEX + index] = this._undecorate(value);
      this._values[index] = value;
    } else {
      // undecorated value
      this.jCal[VALUE_INDEX + index] = value;
      this._values[index] = this._decorate(value);
    }
  }

  /**
   * Gets a parameter on the property.
   *
   * @param {String}        name   Parameter name (lowercase)
   * @return {Array|String}        Parameter value
   */
  getParameter(name) {
    if (name in this.jCal[PROP_INDEX]) {
      return this.jCal[PROP_INDEX][name];
    } else {
      return undefined;
    }
  }

  /**
   * Gets first parameter on the property.
   *
   * @param {String}        name   Parameter name (lowercase)
   * @return {String}        Parameter value
   */
  getFirstParameter(name) {
    let parameters = this.getParameter(name);

    if (Array.isArray(parameters)) {
      return parameters[0];
    }

    return parameters;
  }

  /**
   * Sets a parameter on the property.
   *
   * @param {String}       name     The parameter name
   * @param {Array|String} value    The parameter value
   */
  setParameter(name, value) {
    let lcname = name.toLowerCase();
    if (typeof value === "string" &&
        lcname in this._designSet.param &&
        'multiValue' in this._designSet.param[lcname]) {
        value = [value];
    }
    this.jCal[PROP_INDEX][name] = value;
  }

  /**
   * Removes a parameter
   *
   * @param {String} name     The parameter name
   */
  removeParameter(name) {
    delete this.jCal[PROP_INDEX][name];
  }

  /**
   * Get the default type based on this property's name.
   *
   * @return {String}     The default type for this property
   */
  getDefaultType() {
    let name = this.jCal[NAME_INDEX$1];
    let designSet = this._designSet;

    if (name in designSet.property) {
      let details = designSet.property[name];
      if ('defaultType' in details) {
        return details.defaultType;
      }
    }
    return design.defaultType;
  }

  /**
   * Sets type of property and clears out any existing values of the current
   * type.
   *
   * @param {String} type     New iCAL type (see design.*.values)
   */
  resetType(type) {
    this.removeAllValues();
    this.jCal[TYPE_INDEX] = type;
    this._updateType();
  }

  /**
   * Finds the first property value.
   *
   * @return {Binary | Duration | Period |
   * Recur | Time | UtcOffset | Geo | string | null}         First property value
   */
  getFirstValue() {
    return this._hydrateValue(0);
  }

  /**
   * Gets all values on the property.
   *
   * NOTE: this creates an array during each call.
   *
   * @return {Array}          List of values
   */
  getValues() {
    let len = this.jCal.length - VALUE_INDEX;

    if (len < 1) {
      // it is possible for a property to have no value.
      return [];
    }

    let i = 0;
    let result = [];

    for (; i < len; i++) {
      result[i] = this._hydrateValue(i);
    }

    return result;
  }

  /**
   * Removes all values from this property
   */
  removeAllValues() {
    if (this._values) {
      this._values.length = 0;
    }
    this.jCal.length = 3;
  }

  /**
   * Sets the values of the property.  Will overwrite the existing values.
   * This can only be used for multi-value properties.
   *
   * @param {Array} values    An array of values
   */
  setValues(values) {
    if (!this.isMultiValue) {
      throw new Error(
        this.name + ': does not not support mulitValue.\n' +
        'override isMultiValue'
      );
    }

    let len = values.length;
    let i = 0;
    this.removeAllValues();

    if (len > 0 &&
        typeof(values[0]) === 'object' &&
        'icaltype' in values[0]) {
      this.resetType(values[0].icaltype);
    }

    if (this.isDecorated) {
      for (; i < len; i++) {
        this._setDecoratedValue(values[i], i);
      }
    } else {
      for (; i < len; i++) {
        this.jCal[VALUE_INDEX + i] = values[i];
      }
    }
  }

  /**
   * Sets the current value of the property. If this is a multi-value
   * property, all other values will be removed.
   *
   * @param {String|Object} value     New property value.
   */
  setValue(value) {
    this.removeAllValues();
    if (typeof(value) === 'object' && 'icaltype' in value) {
      this.resetType(value.icaltype);
    }

    if (this.isDecorated) {
      this._setDecoratedValue(value, 0);
    } else {
      this.jCal[VALUE_INDEX] = value;
    }
  }

  /**
   * Returns the Object representation of this component. The returned object
   * is a live jCal object and should be cloned if modified.
   * @return {Object}
   */
  toJSON() {
    return this.jCal;
  }

  /**
   * The string representation of this component.
   * @return {String}
   */
  toICALString() {
    return stringify.property(
      this.jCal, this._designSet, true
    );
  }
}

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * Portions Copyright (C) Philipp Kewisch */


/**
 * This lets typescript resolve our custom types in the
 * generated d.ts files (jsdoc typedefs are converted to typescript types).
 * Ignore prevents the typedefs from being documented more than once.
 * @ignore
 * @typedef {import("./types.js").designSet} designSet
 * Imports the 'designSet' type from the "types.js" module
 * @typedef {import("./types.js").Geo} Geo
 * Imports the 'Geo' type from the "types.js" module
 */

const NAME_INDEX = 0;
const PROPERTY_INDEX = 1;
const COMPONENT_INDEX = 2;

const PROPERTY_NAME_INDEX = 0;
const PROPERTY_VALUE_INDEX = 3;

/**
 * Wraps a jCal component, adding convenience methods to add, remove and update subcomponents and
 * properties.
 *
 * @memberof ICAL
 */
class Component {
  /**
   * Create an {@link ICAL.Component} by parsing the passed iCalendar string.
   *
   * @param {String} str        The iCalendar string to parse
   */
  static fromString(str) {
    return new Component(parse.component(str));
  }

  /**
   * Creates a new Component instance.
   *
   * @param {Array|String} jCal         Raw jCal component data OR name of new
   *                                      component
   * @param {Component=} parent     Parent component to associate
   */
  constructor(jCal, parent) {
    if (typeof(jCal) === 'string') {
      // jCal spec (name, properties, components)
      jCal = [jCal, [], []];
    }

    // mostly for legacy reasons.
    this.jCal = jCal;

    this.parent = parent || null;

    if (!this.parent && this.name === 'vcalendar') {
      this._timezoneCache = new Map();
    }
  }

  /**
   * Hydrated properties are inserted into the _properties array at the same
   * position as in the jCal array, so it is possible that the array contains
   * undefined values for unhydrdated properties. To avoid iterating the
   * array when checking if all properties have been hydrated, we save the
   * count here.
   *
   * @type {Number}
   * @private
   */
  _hydratedPropertyCount = 0;

  /**
   * The same count as for _hydratedPropertyCount, but for subcomponents
   *
   * @type {Number}
   * @private
   */
  _hydratedComponentCount = 0;

  /**
   * A cache of hydrated time zone objects which may be used by consumers, keyed
   * by time zone ID.
   *
   * @type {Map}
   * @private
   */
  _timezoneCache = null;

  /**
   * @private
   */
  _components = null;

  /**
   * @private
   */
  _properties = null;

  /**
   * The name of this component
   *
   * @type {String}
   */
  get name() {
    return this.jCal[NAME_INDEX];
  }

  /**
   * The design set for this component, e.g. icalendar vs vcard
   *
   * @type {designSet}
   * @private
   */
  get _designSet() {
    let parentDesign = this.parent && this.parent._designSet;
    if (!parentDesign && this.name == "vcard") {
      // We can't decide on vcard3 vs vcard4 just based on the component name, the version number is
      // in the version property. We also can't use hydrated properties here because it would lead
      // to recursion, but the spec says that the version property needs to be the very first one.
      let versionProp = this.jCal[PROPERTY_INDEX]?.[0];

      if (versionProp && versionProp[PROPERTY_NAME_INDEX] == "version" && versionProp[PROPERTY_VALUE_INDEX] == "3.0") {
        return design.getDesignSet("vcard3");
      }
    }

    return parentDesign || design.getDesignSet(this.name);
  }

  /**
   * @private
   */
  _hydrateComponent(index) {
    if (!this._components) {
      this._components = [];
      this._hydratedComponentCount = 0;
    }

    if (this._components[index]) {
      return this._components[index];
    }

    let comp = new Component(
      this.jCal[COMPONENT_INDEX][index],
      this
    );

    this._hydratedComponentCount++;
    return (this._components[index] = comp);
  }

  /**
   * @private
   */
  _hydrateProperty(index) {
    if (!this._properties) {
      this._properties = [];
      this._hydratedPropertyCount = 0;
    }

    if (this._properties[index]) {
      return this._properties[index];
    }

    let prop = new Property(
      this.jCal[PROPERTY_INDEX][index],
      this
    );

    this._hydratedPropertyCount++;
    return (this._properties[index] = prop);
  }

  /**
   * Finds first sub component, optionally filtered by name.
   *
   * @param {String=} name        Optional name to filter by
   * @return {?Component}     The found subcomponent
   */
  getFirstSubcomponent(name) {
    if (name) {
      let i = 0;
      let comps = this.jCal[COMPONENT_INDEX];
      let len = comps.length;

      for (; i < len; i++) {
        if (comps[i][NAME_INDEX] === name) {
          let result = this._hydrateComponent(i);
          return result;
        }
      }
    } else {
      if (this.jCal[COMPONENT_INDEX].length) {
        return this._hydrateComponent(0);
      }
    }

    // ensure we return a value (strict mode)
    return null;
  }

  /**
   * Finds all sub components, optionally filtering by name.
   *
   * @param {String=} name            Optional name to filter by
   * @return {Component[]}       The found sub components
   */
  getAllSubcomponents(name) {
    let jCalLen = this.jCal[COMPONENT_INDEX].length;
    let i = 0;

    if (name) {
      let comps = this.jCal[COMPONENT_INDEX];
      let result = [];

      for (; i < jCalLen; i++) {
        if (name === comps[i][NAME_INDEX]) {
          result.push(
            this._hydrateComponent(i)
          );
        }
      }
      return result;
    } else {
      if (!this._components ||
          (this._hydratedComponentCount !== jCalLen)) {
        for (; i < jCalLen; i++) {
          this._hydrateComponent(i);
        }
      }

      return this._components || [];
    }
  }

  /**
   * Returns true when a named property exists.
   *
   * @param {String} name     The property name
   * @return {Boolean}        True, when property is found
   */
  hasProperty(name) {
    let props = this.jCal[PROPERTY_INDEX];
    let len = props.length;

    let i = 0;
    for (; i < len; i++) {
      // 0 is property name
      if (props[i][NAME_INDEX] === name) {
        return true;
      }
    }

    return false;
  }

  /**
   * Finds the first property, optionally with the given name.
   *
   * @param {String=} name        Lowercase property name
   * @return {?Property}     The found property
   */
  getFirstProperty(name) {
    if (name) {
      let i = 0;
      let props = this.jCal[PROPERTY_INDEX];
      let len = props.length;

      for (; i < len; i++) {
        if (props[i][NAME_INDEX] === name) {
          let result = this._hydrateProperty(i);
          return result;
        }
      }
    } else {
      if (this.jCal[PROPERTY_INDEX].length) {
        return this._hydrateProperty(0);
      }
    }

    return null;
  }

  /**
   * Returns first property's value, if available.
   *
   * @param {String=} name                    Lowercase property name
   * @return {Binary | Duration | Period |
   * Recur | Time | UtcOffset | Geo | string | null}         The found property value.
   */
  getFirstPropertyValue(name) {
    let prop = this.getFirstProperty(name);
    if (prop) {
      return prop.getFirstValue();
    }

    return null;
  }

  /**
   * Get all properties in the component, optionally filtered by name.
   *
   * @param {String=} name        Lowercase property name
   * @return {Property[]}    List of properties
   */
  getAllProperties(name) {
    let jCalLen = this.jCal[PROPERTY_INDEX].length;
    let i = 0;

    if (name) {
      let props = this.jCal[PROPERTY_INDEX];
      let result = [];

      for (; i < jCalLen; i++) {
        if (name === props[i][NAME_INDEX]) {
          result.push(
            this._hydrateProperty(i)
          );
        }
      }
      return result;
    } else {
      if (!this._properties ||
          (this._hydratedPropertyCount !== jCalLen)) {
        for (; i < jCalLen; i++) {
          this._hydrateProperty(i);
        }
      }

      return this._properties || [];
    }
  }

  /**
   * @private
   */
  _removeObjectByIndex(jCalIndex, cache, index) {
    cache = cache || [];
    // remove cached version
    if (cache[index]) {
      let obj = cache[index];
      if ("parent" in obj) {
          obj.parent = null;
      }
    }

    cache.splice(index, 1);

    // remove it from the jCal
    this.jCal[jCalIndex].splice(index, 1);
  }

  /**
   * @private
   */
  _removeObject(jCalIndex, cache, nameOrObject) {
    let i = 0;
    let objects = this.jCal[jCalIndex];
    let len = objects.length;
    let cached = this[cache];

    if (typeof(nameOrObject) === 'string') {
      for (; i < len; i++) {
        if (objects[i][NAME_INDEX] === nameOrObject) {
          this._removeObjectByIndex(jCalIndex, cached, i);
          return true;
        }
      }
    } else if (cached) {
      for (; i < len; i++) {
        if (cached[i] && cached[i] === nameOrObject) {
          this._removeObjectByIndex(jCalIndex, cached, i);
          return true;
        }
      }
    }

    return false;
  }

  /**
   * @private
   */
  _removeAllObjects(jCalIndex, cache, name) {
    let cached = this[cache];

    // Unfortunately we have to run through all children to reset their
    // parent property.
    let objects = this.jCal[jCalIndex];
    let i = objects.length - 1;

    // descending search required because splice
    // is used and will effect the indices.
    for (; i >= 0; i--) {
      if (!name || objects[i][NAME_INDEX] === name) {
        this._removeObjectByIndex(jCalIndex, cached, i);
      }
    }
  }

  /**
   * Adds a single sub component.
   *
   * @param {Component} component        The component to add
   * @return {Component}                 The passed in component
   */
  addSubcomponent(component) {
    if (!this._components) {
      this._components = [];
      this._hydratedComponentCount = 0;
    }

    if (component.parent) {
      component.parent.removeSubcomponent(component);
    }

    let idx = this.jCal[COMPONENT_INDEX].push(component.jCal);
    this._components[idx - 1] = component;
    this._hydratedComponentCount++;
    component.parent = this;
    return component;
  }

  /**
   * Removes a single component by name or the instance of a specific
   * component.
   *
   * @param {Component|String} nameOrComp    Name of component, or component
   * @return {Boolean}                            True when comp is removed
   */
  removeSubcomponent(nameOrComp) {
    let removed = this._removeObject(COMPONENT_INDEX, '_components', nameOrComp);
    if (removed) {
      this._hydratedComponentCount--;
    }
    return removed;
  }

  /**
   * Removes all components or (if given) all components by a particular
   * name.
   *
   * @param {String=} name            Lowercase component name
   */
  removeAllSubcomponents(name) {
    let removed = this._removeAllObjects(COMPONENT_INDEX, '_components', name);
    this._hydratedComponentCount = 0;
    return removed;
  }

  /**
   * Adds an {@link ICAL.Property} to the component.
   *
   * @param {Property} property      The property to add
   * @return {Property}              The passed in property
   */
  addProperty(property) {
    if (!(property instanceof Property)) {
      throw new TypeError('must be instance of ICAL.Property');
    }

    if (!this._properties) {
      this._properties = [];
      this._hydratedPropertyCount = 0;
    }

    if (property.parent) {
      property.parent.removeProperty(property);
    }

    let idx = this.jCal[PROPERTY_INDEX].push(property.jCal);
    this._properties[idx - 1] = property;
    this._hydratedPropertyCount++;
    property.parent = this;
    return property;
  }

  /**
   * Helper method to add a property with a value to the component.
   *
   * @param {String}               name         Property name to add
   * @param {String|Number|Object} value        Property value
   * @return {Property}                    The created property
   */
  addPropertyWithValue(name, value) {
    let prop = new Property(name);
    prop.setValue(value);

    this.addProperty(prop);

    return prop;
  }

  /**
   * Helper method that will update or create a property of the given name
   * and sets its value. If multiple properties with the given name exist,
   * only the first is updated.
   *
   * @param {String}               name         Property name to update
   * @param {String|Number|Object} value        Property value
   * @return {Property}                    The created property
   */
  updatePropertyWithValue(name, value) {
    let prop = this.getFirstProperty(name);

    if (prop) {
      prop.setValue(value);
    } else {
      prop = this.addPropertyWithValue(name, value);
    }

    return prop;
  }

  /**
   * Removes a single property by name or the instance of the specific
   * property.
   *
   * @param {String|Property} nameOrProp     Property name or instance to remove
   * @return {Boolean}                            True, when deleted
   */
  removeProperty(nameOrProp) {
    let removed = this._removeObject(PROPERTY_INDEX, '_properties', nameOrProp);
    if (removed) {
      this._hydratedPropertyCount--;
    }
    return removed;
  }

  /**
   * Removes all properties associated with this component, optionally
   * filtered by name.
   *
   * @param {String=} name        Lowercase property name
   * @return {Boolean}            True, when deleted
   */
  removeAllProperties(name) {
    let removed = this._removeAllObjects(PROPERTY_INDEX, '_properties', name);
    this._hydratedPropertyCount = 0;
    return removed;
  }

  /**
   * Returns the Object representation of this component. The returned object
   * is a live jCal object and should be cloned if modified.
   * @return {Object}
   */
  toJSON() {
    return this.jCal;
  }

  /**
   * The string representation of this component.
   * @return {String}
   */
  toString() {
    return stringify.component(
      this.jCal, this._designSet
    );
  }

  /**
   * Retrieve a time zone definition from the component tree, if any is present.
   * If the tree contains no time zone definitions or the TZID cannot be
   * matched, returns null.
   *
   * @param {String} tzid     The ID of the time zone to retrieve
   * @return {Timezone}  The time zone corresponding to the ID, or null
   */
  getTimeZoneByID(tzid) {
    // VTIMEZONE components can only appear as a child of the VCALENDAR
    // component; walk the tree if we're not the root.
    if (this.parent) {
      return this.parent.getTimeZoneByID(tzid);
    }

    // If there is no time zone cache, we are probably parsing an incomplete
    // file and will have no time zone definitions.
    if (!this._timezoneCache) {
      return null;
    }

    if (this._timezoneCache.has(tzid)) {
      return this._timezoneCache.get(tzid);
    }

    // If the time zone is not already cached, hydrate it from the
    // subcomponents.
    const zones = this.getAllSubcomponents('vtimezone');
    for (const zone of zones) {
      if (zone.getFirstProperty('tzid').getFirstValue() === tzid) {
        const hydratedZone = new Timezone({
          component: zone,
          tzid: tzid,
        });

        this._timezoneCache.set(tzid, hydratedZone);

        return hydratedZone;
      }
    }

    // Per the standard, we should always have a time zone defined in a file
    // for any referenced TZID, but don't blow up if the file is invalid.
    return null;
  }
}

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * Portions Copyright (C) Philipp Kewisch */


/**
 * Primary class for expanding recurring rules.  Can take multiple rrules, rdates, exdate(s) and
 * iterate (in order) over each next occurrence.
 *
 * Once initialized this class can also be serialized saved and continue iteration from the last
 * point.
 *
 * NOTE: it is intended that this class is to be used with {@link ICAL.Event} which handles recurrence
 * exceptions.
 *
 * @example
 * // assuming event is a parsed ical component
 * var event;
 *
 * var expand = new ICAL.RecurExpansion({
 *   component: event,
 *   dtstart: event.getFirstPropertyValue('dtstart')
 * });
 *
 * // remember there are infinite rules so it is a good idea to limit the scope of the iterations
 * // then resume later on.
 *
 * // next is always an ICAL.Time or null
 * var next;
 *
 * while (someCondition && (next = expand.next())) {
 *   // do something with next
 * }
 *
 * // save instance for later
 * var json = JSON.stringify(expand);
 *
 * //...
 *
 * // NOTE: if the component's properties have changed you will need to rebuild the class and start
 * // over. This only works when the component's recurrence info is the same.
 * var expand = new ICAL.RecurExpansion(JSON.parse(json));
 *
 * @memberof ICAL
 */
class RecurExpansion {
  /**
   * Creates a new ICAL.RecurExpansion instance.
   *
   * The options object can be filled with the specified initial values. It can also contain
   * additional members, as a result of serializing a previous expansion state, as shown in the
   * example.
   *
   * @param {Object} options
   *        Recurrence expansion options
   * @param {Time} options.dtstart
   *        Start time of the event
   * @param {Component=} options.component
   *        Component for expansion, required if not resuming.
   */
  constructor(options) {
    this.ruleDates = [];
    this.exDates = [];
    this.fromData(options);
  }

  /**
   * True when iteration is fully completed.
   * @type {Boolean}
   */
  complete = false;

  /**
   * Array of rrule iterators.
   *
   * @type {RecurIterator[]}
   * @private
   */
  ruleIterators = null;

  /**
   * Array of rdate instances.
   *
   * @type {Time[]}
   * @private
   */
  ruleDates = null;

  /**
   * Array of exdate instances.
   *
   * @type {Time[]}
   * @private
   */
  exDates = null;

  /**
   * Current position in ruleDates array.
   * @type {Number}
   * @private
   */
  ruleDateInc = 0;

  /**
   * Current position in exDates array
   * @type {Number}
   * @private
   */
  exDateInc = 0;

  /**
   * Current negative date.
   *
   * @type {Time}
   * @private
   */
  exDate = null;

  /**
   * Current additional date.
   *
   * @type {Time}
   * @private
   */
  ruleDate = null;

  /**
   * Start date of recurring rules.
   *
   * @type {Time}
   */
  dtstart = null;

  /**
   * Last expanded time
   *
   * @type {Time}
   */
  last = null;

  /**
   * Initialize the recurrence expansion from the data object. The options
   * object may also contain additional members, see the
   * {@link ICAL.RecurExpansion constructor} for more details.
   *
   * @param {Object} options
   *        Recurrence expansion options
   * @param {Time} options.dtstart
   *        Start time of the event
   * @param {Component=} options.component
   *        Component for expansion, required if not resuming.
   */
  fromData(options) {
    let start = formatClassType(options.dtstart, Time);

    if (!start) {
      throw new Error('.dtstart (ICAL.Time) must be given');
    } else {
      this.dtstart = start;
    }

    if (options.component) {
      this._init(options.component);
    } else {
      this.last = formatClassType(options.last, Time) || start.clone();

      if (!options.ruleIterators) {
        throw new Error('.ruleIterators or .component must be given');
      }

      this.ruleIterators = options.ruleIterators.map(function(item) {
        return formatClassType(item, RecurIterator);
      });

      this.ruleDateInc = options.ruleDateInc;
      this.exDateInc = options.exDateInc;

      if (options.ruleDates) {
        this.ruleDates = options.ruleDates.map(item => formatClassType(item, Time));
        this.ruleDate = this.ruleDates[this.ruleDateInc];
      }

      if (options.exDates) {
        this.exDates = options.exDates.map(item => formatClassType(item, Time));
        this.exDate = this.exDates[this.exDateInc];
      }

      if (typeof(options.complete) !== 'undefined') {
        this.complete = options.complete;
      }
    }
  }

  /**
   * Compare two ICAL.Time objects.  When the second parameter is a DATE and the first parameter is
   * DATE-TIME, strip the time and compare only the days.
   *
   * @private
   * @param {Time} a   The one object to compare
   * @param {Time} b   The other object to compare
   */
  _compare_special(a, b) {
    if (!a.isDate && b.isDate)
      return new Time({ year: a.year, month: a.month, day: a.day }).compare(b);
    return a.compare(b);
  }

  /**
   * Retrieve the next occurrence in the series.
   * @return {Time}
   */
  next() {
    let iter;
    let next;
    let compare;

    let maxTries = 500;
    let currentTry = 0;

    while (true) {
      if (currentTry++ > maxTries) {
        throw new Error(
          'max tries have occurred, rule may be impossible to fulfill.'
        );
      }

      next = this.ruleDate;
      iter = this._nextRecurrenceIter(this.last);

      // no more matches
      // because we increment the rule day or rule
      // _after_ we choose a value this should be
      // the only spot where we need to worry about the
      // end of events.
      if (!next && !iter) {
        // there are no more iterators or rdates
        this.complete = true;
        break;
      }

      // no next rule day or recurrence rule is first.
      if (!next || (iter && next.compare(iter.last) > 0)) {
        // must be cloned, recur will reuse the time element.
        next = iter.last.clone();
        // move to next so we can continue
        iter.next();
      }

      // if the ruleDate is still next increment it.
      if (this.ruleDate === next) {
        this._nextRuleDay();
      }

      this.last = next;

      // check the negative rules
      if (this.exDate) {
        // EXDATE can be in DATE format, but DTSTART is in DATE-TIME format
        compare = this._compare_special(this.last, this.exDate);

        if (compare > 0) {
          this._nextExDay();
        }

        // if the current rule is excluded skip it.
        if (compare === 0) {
          this._nextExDay();
          continue;
        }
      }

      //XXX: The spec states that after we resolve the final
      //     list of dates we execute exdate this seems somewhat counter
      //     intuitive to what I have seen most servers do so for now
      //     I exclude based on the original date not the one that may
      //     have been modified by the exception.
      return this.last;
    }
  }

  /**
   * Converts object into a serialize-able format. This format can be passed
   * back into the expansion to resume iteration.
   * @return {Object}
   */
  toJSON() {
    function toJSON(item) {
      return item.toJSON();
    }

    let result = Object.create(null);
    result.ruleIterators = this.ruleIterators.map(toJSON);

    if (this.ruleDates) {
      result.ruleDates = this.ruleDates.map(toJSON);
    }

    if (this.exDates) {
      result.exDates = this.exDates.map(toJSON);
    }

    result.ruleDateInc = this.ruleDateInc;
    result.exDateInc = this.exDateInc;
    result.last = this.last.toJSON();
    result.dtstart = this.dtstart.toJSON();
    result.complete = this.complete;

    return result;
  }

  /**
   * Extract all dates from the properties in the given component. The
   * properties will be filtered by the property name.
   *
   * @private
   * @param {Component} component             The component to search in
   * @param {String} propertyName             The property name to search for
   * @return {Time[]}                         The extracted dates.
   */
  _extractDates(component, propertyName) {
    let result = [];
    let props = component.getAllProperties(propertyName);

    for (let i = 0, len = props.length; i < len; i++) {
      for (let prop of props[i].getValues()) {
        let idx = binsearchInsert(
          result,
          prop,
          (a, b) => a.compare(b)
        );

        // ordered insert
        result.splice(idx, 0, prop);
      }
    }

    return result;
  }

  /**
   * Initialize the recurrence expansion.
   *
   * @private
   * @param {Component} component    The component to initialize from.
   */
  _init(component) {
    this.ruleIterators = [];

    this.last = this.dtstart.clone();

    // to provide api consistency non-recurring
    // events can also use the iterator though it will
    // only return a single time.
    if (!component.hasProperty('rdate') &&
        !component.hasProperty('rrule') &&
        !component.hasProperty('recurrence-id')) {
      this.ruleDate = this.last.clone();
      this.complete = true;
      return;
    }

    if (component.hasProperty('rdate')) {
      this.ruleDates = this._extractDates(component, 'rdate');

      // special hack for cases where first rdate is prior
      // to the start date. We only check for the first rdate.
      // This is mostly for google's crazy recurring date logic
      // (contacts birthdays).
      if ((this.ruleDates[0]) &&
          (this.ruleDates[0].compare(this.dtstart) < 0)) {

        this.ruleDateInc = 0;
        this.last = this.ruleDates[0].clone();
      } else {
        this.ruleDateInc = binsearchInsert(
          this.ruleDates,
          this.last,
          (a, b) => a.compare(b)
        );
      }

      this.ruleDate = this.ruleDates[this.ruleDateInc];
    }

    if (component.hasProperty('rrule')) {
      let rules = component.getAllProperties('rrule');
      let i = 0;
      let len = rules.length;

      let rule;
      let iter;

      for (; i < len; i++) {
        rule = rules[i].getFirstValue();
        iter = rule.iterator(this.dtstart);
        this.ruleIterators.push(iter);

        // increment to the next occurrence so future
        // calls to next return times beyond the initial iteration.
        // XXX: I find this suspicious might be a bug?
        iter.next();
      }
    }

    if (component.hasProperty('exdate')) {
      this.exDates = this._extractDates(component, 'exdate');
      // if we have a .last day we increment the index to beyond it.
      // When DTSTART is in DATE-TIME format, EXDATE is in DATE format and EXDATE is
      // the date of DTSTART, _compare_special finds this out and compareTime fails.
      this.exDateInc = binsearchInsert(
        this.exDates,
        this.last,
        this._compare_special
      );

      this.exDate = this.exDates[this.exDateInc];
    }
  }

  /**
   * Advance to the next exdate
   * @private
   */
  _nextExDay() {
    this.exDate = this.exDates[++this.exDateInc];
  }

  /**
   * Advance to the next rule date
   * @private
   */
  _nextRuleDay() {
    this.ruleDate = this.ruleDates[++this.ruleDateInc];
  }

  /**
   * Find and return the recurrence rule with the most recent event and
   * return it.
   *
   * @private
   * @return {?RecurIterator}    Found iterator.
   */
  _nextRecurrenceIter() {
    let iters = this.ruleIterators;

    if (iters.length === 0) {
      return null;
    }

    let len = iters.length;
    let iter;
    let iterTime;
    let iterIdx = 0;
    let chosenIter;

    // loop through each iterator
    for (; iterIdx < len; iterIdx++) {
      iter = iters[iterIdx];
      iterTime = iter.last;

      // if iteration is complete
      // then we must exclude it from
      // the search and remove it.
      if (iter.completed) {
        len--;
        if (iterIdx !== 0) {
          iterIdx--;
        }
        iters.splice(iterIdx, 1);
        continue;
      }

      // find the most recent possible choice
      if (!chosenIter || chosenIter.last.compare(iterTime) > 0) {
        // that iterator is saved
        chosenIter = iter;
      }
    }

    // the chosen iterator is returned but not mutated
    // this iterator contains the most recent event.
    return chosenIter;
  }
}

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * Portions Copyright (C) Philipp Kewisch */


/**
 * This lets typescript resolve our custom types in the
 * generated d.ts files (jsdoc typedefs are converted to typescript types).
 * Ignore prevents the typedefs from being documented more than once.
 * @ignore
 * @typedef {import("./types.js").frequencyValues} frequencyValues
 * Imports the 'frequencyValues' type from the "types.js" module
 * @typedef {import("./types.js").occurrenceDetails} occurrenceDetails
 * Imports the 'occurrenceDetails' type from the "types.js" module
 */

/**
 * ICAL.js is organized into multiple layers. The bottom layer is a raw jCal
 * object, followed by the component/property layer. The highest level is the
 * event representation, which this class is part of. See the
 * {@tutorial layers} guide for more details.
 *
 * @memberof ICAL
 */
class Event {
  /**
   * Creates a new ICAL.Event instance.
   *
   * @param {Component=} component              The ICAL.Component to base this event on
   * @param {Object} [options]                  Options for this event
   * @param {Boolean=} options.strictExceptions  When true, will verify exceptions are related by
   *                                              their UUID
   * @param {Array<Component|Event>=} options.exceptions
   *          Exceptions to this event, either as components or events. If not
   *            specified exceptions will automatically be set in relation of
   *            component's parent
   */
  constructor(component, options) {
    if (!(component instanceof Component)) {
      options = component;
      component = null;
    }

    if (component) {
      this.component = component;
    } else {
      this.component = new Component('vevent');
    }

    this._rangeExceptionCache = Object.create(null);
    this.exceptions = Object.create(null);
    this.rangeExceptions = [];

    if (options && options.strictExceptions) {
      this.strictExceptions = options.strictExceptions;
    }

    if (options && options.exceptions) {
      options.exceptions.forEach(this.relateException, this);
    } else if (this.component.parent && !this.isRecurrenceException()) {
      this.component.parent.getAllSubcomponents('vevent').forEach(function(event) {
        if (event.hasProperty('recurrence-id')) {
          this.relateException(event);
        }
      }, this);
    }
  }


  static THISANDFUTURE = 'THISANDFUTURE';

  /**
   * List of related event exceptions.
   *
   * @type {Event[]}
   */
  exceptions = null;

  /**
   * When true, will verify exceptions are related by their UUID.
   *
   * @type {Boolean}
   */
  strictExceptions = false;

  /**
   * Relates a given event exception to this object.  If the given component
   * does not share the UID of this event it cannot be related and will throw
   * an exception.
   *
   * If this component is an exception it cannot have other exceptions
   * related to it.
   *
   * @param {Component|Event} obj       Component or event
   */
  relateException(obj) {
    if (this.isRecurrenceException()) {
      throw new Error('cannot relate exception to exceptions');
    }

    if (obj instanceof Component) {
      obj = new Event(obj);
    }

    if (this.strictExceptions && obj.uid !== this.uid) {
      throw new Error('attempted to relate unrelated exception');
    }

    let id = obj.recurrenceId.toString();

    // we don't sort or manage exceptions directly
    // here the recurrence expander handles that.
    this.exceptions[id] = obj;

    // index RANGE=THISANDFUTURE exceptions so we can
    // look them up later in getOccurrenceDetails.
    if (obj.modifiesFuture()) {
      let item = [
        obj.recurrenceId.toUnixTime(), id
      ];

      // we keep them sorted so we can find the nearest
      // value later on...
      let idx = binsearchInsert(
        this.rangeExceptions,
        item,
        compareRangeException
      );

      this.rangeExceptions.splice(idx, 0, item);
    }
  }

  /**
   * Checks if this record is an exception and has the RANGE=THISANDFUTURE
   * value.
   *
   * @return {Boolean}        True, when exception is within range
   */
  modifiesFuture() {
    if (!this.component.hasProperty('recurrence-id')) {
      return false;
    }

    let range = this.component.getFirstProperty('recurrence-id').getParameter('range');
    return range === Event.THISANDFUTURE;
  }

  /**
   * Finds the range exception nearest to the given date.
   *
   * @param {Time} time   usually an occurrence time of an event
   * @return {?Event}     the related event/exception or null
   */
  findRangeException(time) {
    if (!this.rangeExceptions.length) {
      return null;
    }

    let utc = time.toUnixTime();
    let idx = binsearchInsert(
      this.rangeExceptions,
      [utc],
      compareRangeException
    );

    idx -= 1;

    // occurs before
    if (idx < 0) {
      return null;
    }

    let rangeItem = this.rangeExceptions[idx];

    /* c8 ignore next 4 */
    if (utc < rangeItem[0]) {
      // sanity check only
      return null;
    }

    return rangeItem[1];
  }

  /**
   * Returns the occurrence details based on its start time.  If the
   * occurrence has an exception will return the details for that exception.
   *
   * NOTE: this method is intend to be used in conjunction
   *       with the {@link ICAL.Event#iterator iterator} method.
   *
   * @param {Time} occurrence               time occurrence
   * @return {occurrenceDetails}            Information about the occurrence
   */
  getOccurrenceDetails(occurrence) {
    let id = occurrence.toString();
    let utcId = occurrence.convertToZone(Timezone.utcTimezone).toString();
    let item;
    let result = {
      //XXX: Clone?
      recurrenceId: occurrence
    };

    if (id in this.exceptions) {
      item = result.item = this.exceptions[id];
      result.startDate = item.startDate;
      result.endDate = item.endDate;
      result.item = item;
    } else if (utcId in this.exceptions) {
      item = this.exceptions[utcId];
      result.startDate = item.startDate;
      result.endDate = item.endDate;
      result.item = item;
    } else {
      // range exceptions (RANGE=THISANDFUTURE) have a
      // lower priority then direct exceptions but
      // must be accounted for first. Their item is
      // always the first exception with the range prop.
      let rangeExceptionId = this.findRangeException(
        occurrence
      );
      let end;

      if (rangeExceptionId) {
        let exception = this.exceptions[rangeExceptionId];

        // range exception must modify standard time
        // by the difference (if any) in start/end times.
        result.item = exception;

        let startDiff = this._rangeExceptionCache[rangeExceptionId];

        if (!startDiff) {
          let original = exception.recurrenceId.clone();
          let newStart = exception.startDate.clone();

          // zones must be same otherwise subtract may be incorrect.
          original.zone = newStart.zone;
          startDiff = newStart.subtractDate(original);

          this._rangeExceptionCache[rangeExceptionId] = startDiff;
        }

        let start = occurrence.clone();
        start.zone = exception.startDate.zone;
        start.addDuration(startDiff);

        end = start.clone();
        end.addDuration(exception.duration);

        result.startDate = start;
        result.endDate = end;
      } else {
        // no range exception standard expansion
        end = occurrence.clone();
        end.addDuration(this.duration);

        result.endDate = end;
        result.startDate = occurrence;
        result.item = this;
      }
    }

    return result;
  }

  /**
   * Builds a recur expansion instance for a specific point in time (defaults
   * to startDate).
   *
   * @param {Time=} startTime     Starting point for expansion
   * @return {RecurExpansion}    Expansion object
   */
  iterator(startTime) {
    return new RecurExpansion({
      component: this.component,
      dtstart: startTime || this.startDate
    });
  }

  /**
   * Checks if the event is recurring
   *
   * @return {Boolean}        True, if event is recurring
   */
  isRecurring() {
    let comp = this.component;
    return comp.hasProperty('rrule') || comp.hasProperty('rdate');
  }

  /**
   * Checks if the event describes a recurrence exception. See
   * {@tutorial terminology} for details.
   *
   * @return {Boolean}    True, if the event describes a recurrence exception
   */
  isRecurrenceException() {
    return this.component.hasProperty('recurrence-id');
  }

  /**
   * Returns the types of recurrences this event may have.
   *
   * Returned as an object with the following possible keys:
   *
   *    - YEARLY
   *    - MONTHLY
   *    - WEEKLY
   *    - DAILY
   *    - MINUTELY
   *    - SECONDLY
   *
   * @return {Object.<frequencyValues, Boolean>}
   *          Object of recurrence flags
   */
  getRecurrenceTypes() {
    let rules = this.component.getAllProperties('rrule');
    let i = 0;
    let len = rules.length;
    let result = Object.create(null);

    for (; i < len; i++) {
      let value = rules[i].getFirstValue();
      result[value.freq] = true;
    }

    return result;
  }

  /**
   * The uid of this event
   * @type {String}
   */
  get uid() {
    return this._firstProp('uid');
  }

  set uid(value) {
    this._setProp('uid', value);
  }

  /**
   * The start date
   * @type {Time}
   */
  get startDate() {
    return this._firstProp('dtstart');
  }

  set startDate(value) {
    this._setTime('dtstart', value);
  }

  /**
   * The end date. This can be the result directly from the property, or the
   * end date calculated from start date and duration. Setting the property
   * will remove any duration properties.
   * @type {Time}
   */
  get endDate() {
    let endDate = this._firstProp('dtend');
    if (!endDate) {
        let duration = this._firstProp('duration');
        endDate = this.startDate.clone();
        if (duration) {
            endDate.addDuration(duration);
        } else if (endDate.isDate) {
            endDate.day += 1;
        }
    }
    return endDate;
  }

  set endDate(value) {
    if (this.component.hasProperty('duration')) {
      this.component.removeProperty('duration');
    }
    this._setTime('dtend', value);
  }

  /**
   * The duration. This can be the result directly from the property, or the
   * duration calculated from start date and end date. Setting the property
   * will remove any `dtend` properties.
   * @type {Duration}
   */
  get duration() {
    let duration = this._firstProp('duration');
    if (!duration) {
      return this.endDate.subtractDateTz(this.startDate);
    }
    return duration;
  }

  set duration(value) {
    if (this.component.hasProperty('dtend')) {
      this.component.removeProperty('dtend');
    }

    this._setProp('duration', value);
  }

  /**
   * The location of the event.
   * @type {String}
   */
  get location() {
    return this._firstProp('location');
  }

  set location(value) {
    this._setProp('location', value);
  }

  /**
   * The attendees in the event
   * @type {Property[]}
   */
  get attendees() {
    //XXX: This is way lame we should have a better
    //     data structure for this later.
    return this.component.getAllProperties('attendee');
  }

  /**
   * The event summary
   * @type {String}
   */
  get summary() {
    return this._firstProp('summary');
  }

  set summary(value) {
    this._setProp('summary', value);
  }

  /**
   * The event description.
   * @type {String}
   */
  get description() {
    return this._firstProp('description');
  }

  set description(value) {
    this._setProp('description', value);
  }

  /**
   * The event color from [rfc7986](https://datatracker.ietf.org/doc/html/rfc7986)
   * @type {String}
   */
  get color() {
    return this._firstProp('color');
  }

  set color(value) {
    this._setProp('color', value);
  }

  /**
   * The organizer value as an uri. In most cases this is a mailto: uri, but
   * it can also be something else, like urn:uuid:...
   * @type {String}
   */
  get organizer() {
    return this._firstProp('organizer');
  }

  set organizer(value) {
    this._setProp('organizer', value);
  }

  /**
   * The sequence value for this event. Used for scheduling
   * see {@tutorial terminology}.
   * @type {Number}
   */
  get sequence() {
    return this._firstProp('sequence');
  }

  set sequence(value) {
    this._setProp('sequence', value);
  }

  /**
   * The recurrence id for this event. See {@tutorial terminology} for details.
   * @type {Time}
   */
  get recurrenceId() {
    return this._firstProp('recurrence-id');
  }

  set recurrenceId(value) {
    this._setTime('recurrence-id', value);
  }

  /**
   * Set/update a time property's value.
   * This will also update the TZID of the property.
   *
   * TODO: this method handles the case where we are switching
   * from a known timezone to an implied timezone (one without TZID).
   * This does _not_ handle the case of moving between a known
   *  (by TimezoneService) timezone to an unknown timezone...
   *
   * We will not add/remove/update the VTIMEZONE subcomponents
   *  leading to invalid ICAL data...
   * @private
   * @param {String} propName     The property name
   * @param {Time} time           The time to set
   */
  _setTime(propName, time) {
    let prop = this.component.getFirstProperty(propName);

    if (!prop) {
      prop = new Property(propName);
      this.component.addProperty(prop);
    }

    // utc and local don't get a tzid
    if (
      time.zone === Timezone.localTimezone ||
      time.zone === Timezone.utcTimezone
    ) {
      // remove the tzid
      prop.removeParameter('tzid');
    } else {
      prop.setParameter('tzid', time.zone.tzid);
    }

    prop.setValue(time);
  }

  _setProp(name, value) {
    this.component.updatePropertyWithValue(name, value);
  }

  _firstProp(name) {
    return this.component.getFirstPropertyValue(name);
  }

  /**
   * The string representation of this event.
   * @return {String}
   */
  toString() {
    return this.component.toString();
  }
}

function compareRangeException(a, b) {
  if (a[0] > b[0]) return 1;
  if (b[0] > a[0]) return -1;
  return 0;
}

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * Portions Copyright (C) Philipp Kewisch */


/**
 * The ComponentParser is used to process a String or jCal Object,
 * firing callbacks for various found components, as well as completion.
 *
 * @example
 * var options = {
 *   // when false no events will be emitted for type
 *   parseEvent: true,
 *   parseTimezone: true
 * };
 *
 * var parser = new ICAL.ComponentParser(options);
 *
 * parser.onevent(eventComponent) {
 *   //...
 * }
 *
 * // ontimezone, etc...
 *
 * parser.oncomplete = function() {
 *
 * };
 *
 * parser.process(stringOrComponent);
 *
 * @memberof ICAL
 */
class ComponentParser {
  /**
   * Creates a new ICAL.ComponentParser instance.
   *
   * @param {Object=} options                   Component parser options
   * @param {Boolean} options.parseEvent        Whether events should be parsed
   * @param {Boolean} options.parseTimezeone    Whether timezones should be parsed
   */
  constructor(options) {
    if (typeof(options) === 'undefined') {
      options = {};
    }

    for (let [key, value] of Object.entries(options)) {
      this[key] = value;
    }
  }

  /**
   * When true, parse events
   *
   * @type {Boolean}
   */
  parseEvent = true;

  /**
   * When true, parse timezones
   *
   * @type {Boolean}
   */
  parseTimezone = true;


  /* SAX like events here for reference */

  /**
   * Fired when parsing is complete
   * @callback
   */
  oncomplete = /* c8 ignore next */ function() {};

  /**
   * Fired if an error occurs during parsing.
   *
   * @callback
   * @param {Error} err details of error
   */
  onerror = /* c8 ignore next */ function(err) {};

  /**
   * Fired when a top level component (VTIMEZONE) is found
   *
   * @callback
   * @param {Timezone} component     Timezone object
   */
  ontimezone = /* c8 ignore next */ function(component) {};

  /**
   * Fired when a top level component (VEVENT) is found.
   *
   * @callback
   * @param {Event} component    Top level component
   */
  onevent = /* c8 ignore next */ function(component) {};

  /**
   * Process a string or parse ical object.  This function itself will return
   * nothing but will start the parsing process.
   *
   * Events must be registered prior to calling this method.
   *
   * @param {Component|String|Object} ical      The component to process,
   *        either in its final form, as a jCal Object, or string representation
   */
  process(ical) {
    //TODO: this is sync now in the future we will have a incremental parser.
    if (typeof(ical) === 'string') {
      ical = parse(ical);
    }

    if (!(ical instanceof Component)) {
      ical = new Component(ical);
    }

    let components = ical.getAllSubcomponents();
    let i = 0;
    let len = components.length;
    let component;

    for (; i < len; i++) {
      component = components[i];

      switch (component.name) {
        case 'vtimezone':
          if (this.parseTimezone) {
            let tzid = component.getFirstPropertyValue('tzid');
            if (tzid) {
              this.ontimezone(new Timezone({
                tzid: tzid,
                component: component
              }));
            }
          }
          break;
        case 'vevent':
          if (this.parseEvent) {
            this.onevent(new Event(component));
          }
          break;
        default:
          continue;
      }
    }

    //XXX: ideally we should do a "nextTick" here
    //     so in all cases this is actually async.
    this.oncomplete();
  }
}

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * Portions Copyright (C) Philipp Kewisch */


/**
 * The main ICAL module. Provides access to everything else.
 *
 * @alias ICAL
 * @namespace ICAL
 * @property {ICAL.design} design
 * @property {ICAL.helpers} helpers
 */
var ICALmodule = {
  /**
   * The number of characters before iCalendar line folding should occur
   * @type {Number}
   * @default 75
   */
  foldLength: 75,

  debug: false,

  /**
   * The character(s) to be used for a newline. The default value is provided by
   * rfc5545.
   * @type {String}
   * @default "\r\n"
   */
  newLineChar: '\r\n',

  Binary,
  Component,
  ComponentParser,
  Duration,
  Event,
  Period,
  Property,
  Recur,
  RecurExpansion,
  RecurIterator,
  Time,
  Timezone,
  TimezoneService,
  UtcOffset,
  VCardTime,

  parse,
  stringify,

  design,
  helpers
};

/**
 * Shared Utilities for Field-Based Updates
 *
 * ⚠️ READ-ONLY DURING PHASE 2 PARALLEL DEVELOPMENT
 * All changes to this file must go through Orchestrator
 *
 * This module provides shared functions for parsing, manipulating, and serializing
 * iCal and vCard formats used by CalDAV and CardDAV.
 *
 * @see https://github.com/kewisch/ical.js
 */
/**
 * Fold a line to meet RFC 5545/6350 line length requirements
 *
 * RFC 5545 Section 3.1: Lines SHOULD NOT be longer than 75 octets.
 * Longer lines are "folded" by inserting CRLF followed by a single space.
 *
 * @param line - Line to fold
 * @param maxLength - Maximum line length before folding (default: 75)
 * @returns Folded line(s)
 *
 * @example
 * ```ts
 * foldLine("DESCRIPTION:This is a very long description that exceeds 75 characters and needs to be folded")
 * // => "DESCRIPTION:This is a very long description that exceeds 75 character\r\n s and needs to be folded"
 * ```
 */
function foldLine(line, maxLength = 75) {
    if (line.length <= maxLength) {
        return line;
    }
    const folded = [];
    let remaining = line;
    // First line can be full length
    folded.push(remaining.substring(0, maxLength));
    remaining = remaining.substring(maxLength);
    // Subsequent lines are maxLength - 1 (accounting for leading space)
    while (remaining.length > 0) {
        const chunk = remaining.substring(0, maxLength - 1);
        folded.push(` ${chunk}`); // Leading space indicates continuation
        remaining = remaining.substring(maxLength - 1);
    }
    return folded.join('\r\n');
}
/**
 * Unfold lines that were folded according to RFC 5545/6350
 *
 * Lines folded with CRLF + SPACE are unfolded by removing the CRLF and space.
 *
 * @param icalString - iCal/vCard string with potentially folded lines
 * @returns String with unfolded lines
 *
 * @example
 * ```ts
 * unfoldLines("DESCRIPTION:Long\r\n  line")
 * // => "DESCRIPTION:Long line"
 * ```
 */
function unfoldLines(icalString) {
    // Replace CRLF + SPACE with nothing (unfold)
    // Also handle LF + SPACE (some servers use LF instead of CRLF)
    return icalString.replace(/\r\n /g, '').replace(/\n /g, '');
}
/**
 * Parse an iCal string into an ICAL.Component
 *
 * Uses ical.js to parse the string into a structured component tree.
 *
 * @param icalString - iCal string (VCALENDAR, VEVENT, VTODO, or standalone VCARD)
 * @returns Parsed ICAL.Component
 * @throws Error if parsing fails
 *
 * @example
 * ```ts
 * const component = parseICalComponent(icalString);
 * const vevent = component.getFirstSubcomponent('vevent');
 * ```
 */
function parseICalComponent(icalString) {
    try {
        // ical.js expects unfolded lines
        const unfolded = unfoldLines(icalString);
        const jcalData = ICALmodule.parse(unfolded);
        return new ICALmodule.Component(jcalData);
    }
    catch (error) {
        throw new Error(`Failed to parse iCal component: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * Serialize an ICAL.Component back to iCal string
 *
 * Converts the component tree back to RFC 5545/6350 format with proper line folding.
 *
 * @param component - ICAL.Component to serialize
 * @returns iCal string with folded lines
 *
 * @example
 * ```ts
 * const icalString = serializeICalComponent(component);
 * ```
 */
function serializeICalComponent(component) {
    try {
        const serialized = component.toString();
        // ical.js may not fold lines, so we need to do it manually
        const lines = serialized.split(/\r\n|\n/);
        const foldedLines = lines.map((line) => foldLine(line));
        return foldedLines.join('\r\n');
    }
    catch (error) {
        throw new Error(`Failed to serialize iCal component: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * Update the SEQUENCE property in a component (auto-increment)
 *
 * RFC 5545 Section 3.8.7.4: SEQUENCE is a non-negative integer that
 * indicates the revision sequence number of the calendar component.
 * It MUST be incremented each time the component is modified.
 *
 * @param component - ICAL.Component (VEVENT or VTODO)
 *
 * @example
 * ```ts
 * updateSequence(vevent);
 * // SEQUENCE:0 => SEQUENCE:1
 * ```
 */
function updateSequence(component) {
    const currentSequence = component.getFirstPropertyValue('sequence');
    const newSequence = typeof currentSequence === 'number' ? currentSequence + 1 : 0;
    if (component.getFirstProperty('sequence')) {
        component.updatePropertyWithValue('sequence', newSequence);
    }
    else {
        component.addPropertyWithValue('sequence', newSequence);
    }
}
/**
 * Update the DTSTAMP property in a component (current timestamp)
 *
 * RFC 5545 Section 3.8.7.2: DTSTAMP indicates the date and time that
 * the instance of the iCalendar object was created.
 * In practice, it SHOULD be updated whenever the component is modified.
 *
 * @param component - ICAL.Component (VEVENT or VTODO)
 *
 * @example
 * ```ts
 * updateDtstamp(vevent);
 * // DTSTAMP:20250101T120000Z => DTSTAMP:20250125T161520Z (current time)
 * ```
 */
function updateDtstamp(component) {
    // Get current timestamp in UTC
    const now = ICALmodule.Time.now();
    if (component.getFirstProperty('dtstamp')) {
        component.updatePropertyWithValue('dtstamp', now);
    }
    else {
        component.addPropertyWithValue('dtstamp', now);
    }
}
/**
 * Preserve vendor-specific properties (X-* properties)
 *
 * Many CalDAV servers add custom properties like:
 * - X-APPLE-SORT-ORDER
 * - X-GOOGLE-CALENDAR-ID
 * - X-MICROSOFT-CDO-*
 *
 * This function copies all X-* properties from the original to the updated component.
 *
 * @param updatedComponent - Component being updated
 * @param originalComponent - Original component with vendor properties
 *
 * @example
 * ```ts
 * preserveVendorProperties(updatedEvent, originalEvent);
 * ```
 */
function preserveVendorProperties(updatedComponent, originalComponent) {
    const originalProps = originalComponent.getAllProperties();
    originalProps.forEach((prop) => {
        const propName = prop.name;
        // Check if it's a vendor extension (starts with X- or x-)
        if (propName.toLowerCase().startsWith('x-')) {
            // Only add if not already present in updated component
            // Check case-insensitively
            const existingProp = updatedComponent.getAllProperties().find((p) => p.name.toLowerCase() === propName.toLowerCase());
            if (!existingProp) {
                updatedComponent.addProperty(prop);
            }
        }
    });
}
/**
 * Get current SEQUENCE value from a component
 *
 * @param component - ICAL.Component
 * @returns Current SEQUENCE value (0 if not present)
 */
function getSequence(component) {
    const sequence = component.getFirstPropertyValue('sequence');
    return typeof sequence === 'number' ? sequence : 0;
}
/**
 * Get current DTSTAMP value from a component
 *
 * @param component - ICAL.Component
 * @returns Current DTSTAMP value (ISO string) or null if not present
 */
function getDtstamp(component) {
    const dtstamp = component.getFirstPropertyValue('dtstamp');
    if (!dtstamp)
        return null;
    // If it's an ICAL.Time object, convert to iCal format
    if (typeof dtstamp === 'object' && 'toICALString' in dtstamp && typeof dtstamp.toICALString === 'function') {
        return dtstamp.toICALString();
    }
    // Fallback to string representation
    return dtstamp.toString();
}
/**
 * Validate that UID is not being modified
 *
 * RFC 5545: UID is a globally unique identifier and MUST NOT change
 * for the same calendar component.
 *
 * @param component - ICAL.Component
 * @throws Error if UID is missing
 */
function validateUid(component) {
    const uid = component.getFirstPropertyValue('uid');
    if (!uid) {
        throw new Error('UID property is required and must not be removed');
    }
}

/**
 * Calendar Event (VEVENT) Field Updater
 *
 * This module provides field-based updates for CalDAV calendar events (VEVENT).
 * It allows updating individual fields like SUMMARY and DESCRIPTION without
 * requiring manual iCal string generation.
 *
 * Features:
 * - Update SUMMARY and DESCRIPTION fields
 * - Auto-increment SEQUENCE on modifications (RFC 5545)
 * - Auto-update DTSTAMP to current timestamp
 * - Preserve VCALENDAR wrapper and VTIMEZONE components
 * - Preserve vendor extensions (X-* properties)
 * - Protect UID from modification
 * - Proper RFC 5545 line folding for long values
 *
 * @see https://datatracker.ietf.org/doc/html/rfc5545#section-3.6.1
 */
/**
 * Default configuration for event field updates
 */
const DEFAULT_CONFIG$2 = {
    autoIncrementSequence: true,
    autoUpdateDtstamp: true,
    preserveUnknownFields: true,
    preserveVendorExtensions: true,
};
/**
 * Update fields in a calendar event (VEVENT)
 *
 * This function updates specified fields in a CalDAV calendar object while
 * preserving the VCALENDAR structure, VTIMEZONE components, and vendor extensions.
 *
 * @param calendarObject - DAVCalendarObject containing iCal data
 * @param fields - Fields to update (SUMMARY, DESCRIPTION)
 * @param config - Optional configuration for update behavior
 * @returns FieldUpdateResult with updated iCal string and metadata
 *
 * @throws Error if UID is missing or invalid iCal format
 *
 * @example
 * ```typescript
 * const updated = updateEventFields(calendarObject, {
 *   SUMMARY: 'Updated Meeting Title',
 *   DESCRIPTION: 'New detailed description'
 * });
 * console.log(updated.data); // Updated iCal string
 * console.log(updated.metadata.sequence); // Incremented sequence number
 * ```
 */
function updateEventFields(calendarObject, fields, config) {
    // Merge config with defaults
    const finalConfig = {
        ...DEFAULT_CONFIG$2,
        ...config,
    };
    // Validate input
    if (!calendarObject.data) {
        throw new Error('calendarObject.data is required');
    }
    if (!fields || Object.keys(fields).length === 0) {
        throw new Error('At least one field must be specified for update');
    }
    const warnings = [];
    let modified = false;
    try {
        // Parse the iCal string into a component tree
        const vcalendar = parseICalComponent(calendarObject.data);
        // Extract VEVENT component from VCALENDAR
        const vevent = vcalendar.getFirstSubcomponent('vevent');
        if (!vevent) {
            throw new Error('VEVENT component not found in VCALENDAR');
        }
        // Validate UID exists and is not being modified
        validateUid(vevent);
        const originalUid = vevent.getFirstPropertyValue('uid');
        // Preserve original VEVENT for comparison
        const originalVevent = new ICALmodule.Component(vevent.toJSON());
        // Update each specified field
        for (const [fieldName, fieldValue] of Object.entries(fields)) {
            const normalizedFieldName = fieldName.toLowerCase();
            // Get current value
            const currentValue = vevent.getFirstPropertyValue(normalizedFieldName);
            // Check if field actually changed
            if (currentValue === fieldValue) {
                continue; // Skip if no change
            }
            modified = true;
            // Update or remove the field
            if (fieldValue === null || fieldValue === undefined || fieldValue === '') {
                // Remove the property if value is empty
                const prop = vevent.getFirstProperty(normalizedFieldName);
                if (prop) {
                    vevent.removeProperty(prop);
                    warnings.push(`${fieldName} removed (empty value provided)`);
                }
            }
            else {
                // Update the property
                if (vevent.getFirstProperty(normalizedFieldName)) {
                    vevent.updatePropertyWithValue(normalizedFieldName, fieldValue);
                }
                else {
                    vevent.addPropertyWithValue(normalizedFieldName, fieldValue);
                }
            }
        }
        // Auto-update SEQUENCE and DTSTAMP if fields were modified
        if (modified) {
            // Auto-increment SEQUENCE
            if (finalConfig.autoIncrementSequence) {
                updateSequence(vevent);
            }
            // Auto-update DTSTAMP
            if (finalConfig.autoUpdateDtstamp) {
                updateDtstamp(vevent);
            }
        }
        // Preserve vendor extensions (X-* properties)
        if (finalConfig.preserveVendorExtensions) {
            preserveVendorProperties(vevent, originalVevent);
        }
        // Validate UID was not modified
        const finalUid = vevent.getFirstPropertyValue('uid');
        if (finalUid !== originalUid) {
            throw new Error('UID must not be modified');
        }
        // Check for VTIMEZONE components (they should be preserved automatically)
        const vtimezones = vcalendar.getAllSubcomponents('vtimezone');
        if (vtimezones.length === 0) {
            // This is not an error, just informational
            // Many simple events don't have VTIMEZONE
        }
        // Serialize back to iCal string
        const updatedIcalString = serializeICalComponent(vcalendar);
        // Get metadata
        const sequence = getSequence(vevent);
        const dtstampValue = getDtstamp(vevent);
        // Count vendor extensions
        const vendorExtensionsCount = vevent
            .getAllProperties()
            .filter((p) => p.name.toLowerCase().startsWith('x-')).length;
        if (vendorExtensionsCount > 0) {
            warnings.push(`Preserved ${vendorExtensionsCount} vendor extension(s)`);
        }
        return {
            data: updatedIcalString,
            modified,
            warnings: warnings.length > 0 ? warnings : undefined,
            metadata: {
                sequence,
                dtstamp: dtstampValue || undefined,
                vendorExtensionsCount: vendorExtensionsCount > 0 ? vendorExtensionsCount : undefined,
            },
        };
    }
    catch (error) {
        // Re-throw with more context
        throw new Error(`Failed to update event fields: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * Check if a calendar object contains a valid VEVENT
 *
 * Utility function to validate that a calendar object has a proper VEVENT component
 *
 * @param calendarObject - DAVCalendarObject to check
 * @returns true if valid VEVENT exists
 */
function hasValidVEvent(calendarObject) {
    try {
        if (!calendarObject.data) {
            return false;
        }
        const vcalendar = parseICalComponent(calendarObject.data);
        const vevent = vcalendar.getFirstSubcomponent('vevent');
        if (!vevent) {
            return false;
        }
        // Check for required UID
        const uid = vevent.getFirstPropertyValue('uid');
        return !!uid;
    }
    catch (_a) {
        return false;
    }
}
/**
 * Extract event fields from a calendar object
 *
 * Utility function to extract current field values from a VEVENT
 *
 * @param calendarObject - DAVCalendarObject to extract from
 * @returns EventFields with current values
 *
 * @example
 * ```typescript
 * const currentFields = extractEventFields(calendarObject);
 * console.log(currentFields.SUMMARY); // "Team Meeting"
 * console.log(currentFields.DESCRIPTION); // "Quarterly review"
 * ```
 */
function extractEventFields(calendarObject) {
    if (!calendarObject.data) {
        throw new Error('calendarObject.data is required');
    }
    try {
        const vcalendar = parseICalComponent(calendarObject.data);
        const vevent = vcalendar.getFirstSubcomponent('vevent');
        if (!vevent) {
            throw new Error('VEVENT component not found in VCALENDAR');
        }
        const fields = {};
        // Extract SUMMARY
        const summary = vevent.getFirstPropertyValue('summary');
        if (summary !== null && summary !== undefined && typeof summary === 'string') {
            fields.SUMMARY = summary;
        }
        // Extract DESCRIPTION
        const description = vevent.getFirstPropertyValue('description');
        if (description !== null && description !== undefined && typeof description === 'string') {
            fields.DESCRIPTION = description;
        }
        return fields;
    }
    catch (error) {
        throw new Error(`Failed to extract event fields: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * vCard Field Updater for tsdav
 *
 * Provides field-level updates for CardDAV vCards without requiring
 * manual vCard string generation.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc6350 - vCard 4.0
 * @see https://datatracker.ietf.org/doc/html/rfc2426 - vCard 3.0
 *
 * ⚠️ READ-ONLY DEPENDENCIES:
 * - src/util/fieldUpdater.ts (shared utilities)
 * - src/types/fieldUpdates.ts (type definitions)
 */
/**
 * Default configuration for vCard field updates
 */
const DEFAULT_CONFIG$1 = {
    autoIncrementSequence: false, // vCards don't use SEQUENCE
    autoUpdateDtstamp: false, // vCards use REV instead
    preserveUnknownFields: true,
    preserveVendorExtensions: true,
};
/**
 * Supported vCard field names for validation
 */
const SUPPORTED_FIELDS = new Set(['FN', 'N', 'EMAIL', 'TEL', 'ORG', 'NOTE', 'TITLE', 'URL']);
/**
 * Update vCard fields
 *
 * Updates specified fields in a vCard while preserving other properties.
 * Automatically handles:
 * - Line folding for long values (>75 chars)
 * - UTF-8 character encoding
 * - REV (revision) timestamp updates
 * - Vendor extension preservation (X-* properties)
 *
 * @param vCard - DAVVCard object containing vCard data
 * @param fields - Fields to update (VCardFields)
 * @param config - Optional configuration
 * @returns FieldUpdateResult with updated vCard data and metadata
 *
 * @throws Error if vCard parsing fails
 * @throws Error if UID is missing or would be removed
 * @throws Error if FN would be removed (required field)
 *
 * @example
 * ```typescript
 * const updated = updateVCardFields(vCard, {
 *   FN: 'Dr. John Q. Public, Esq.',
 *   EMAIL: 'john@example.com',
 *   TEL: '+1-555-555-5555'
 * });
 *
 * console.log(updated.data); // Updated vCard string
 * console.log(updated.modified); // true
 * ```
 *
 * @example
 * ```typescript
 * // Update structured N field
 * const updated = updateVCardFields(vCard, {
 *   N: 'Public;John;Quinlan;Dr.;Esq.',
 *   FN: 'Dr. John Q. Public, Esq.'
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Remove a field by setting it to empty string
 * const updated = updateVCardFields(vCard, {
 *   NOTE: '' // Removes NOTE property
 * });
 * ```
 */
function updateVCardFields(vCard, fields, config) {
    // Merge config with defaults
    const cfg = { ...DEFAULT_CONFIG$1, ...config };
    // Validate input
    if (!vCard.data) {
        throw new Error('vCard data is required');
    }
    if (typeof vCard.data !== 'string') {
        throw new Error('vCard data must be a string');
    }
    // Parse the vCard
    let component;
    try {
        component = parseICalComponent(vCard.data);
    }
    catch (error) {
        throw new Error(`Failed to parse vCard: ${error instanceof Error ? error.message : String(error)}`);
    }
    // Handle standalone VCARD or VCARD within VCALENDAR wrapper
    let vcard = null;
    if (component.name === 'vcard') {
        vcard = component;
    }
    else if (component.name === 'vcalendar') {
        // Some servers wrap VCARDs in VCALENDAR
        vcard = component.getFirstSubcomponent('vcard');
    }
    if (!vcard) {
        throw new Error('No VCARD component found in data');
    }
    // Store original component for comparison and vendor property preservation
    const originalVcard = vcard.toJSON();
    // Track if any changes were made
    let modified = false;
    const warnings = [];
    // Validate UID exists and won't be removed
    const uid = vcard.getFirstPropertyValue('uid');
    if (!uid) {
        throw new Error('vCard must have a UID property');
    }
    // Validate FN won't be removed (required field)
    const currentFN = vcard.getFirstPropertyValue('fn');
    if (fields.FN === '' && currentFN) {
        throw new Error('FN (Formatted Name) is a required field and cannot be removed');
    }
    // Update fields
    for (const [fieldName, fieldValue] of Object.entries(fields)) {
        // Validate field is supported
        if (!SUPPORTED_FIELDS.has(fieldName)) {
            warnings.push(`Unknown field '${fieldName}' - skipping`);
            continue;
        }
        const propertyName = fieldName.toLowerCase();
        const currentValue = vcard.getFirstPropertyValue(propertyName);
        // Handle empty values (remove property)
        if (fieldValue === '') {
            if (currentValue !== null) {
                // Remove the property
                const prop = vcard.getFirstProperty(propertyName);
                if (prop) {
                    vcard.removeProperty(prop);
                    modified = true;
                }
            }
            continue;
        }
        // Check if value is actually different
        if (currentValue === fieldValue) {
            continue; // No change needed
        }
        // Update or add the property
        const existingProperty = vcard.getFirstProperty(propertyName);
        if (existingProperty) {
            vcard.updatePropertyWithValue(propertyName, fieldValue);
        }
        else {
            vcard.addPropertyWithValue(propertyName, fieldValue);
        }
        modified = true;
    }
    // Update REV (revision timestamp) if modified
    // REV is the vCard equivalent of DTSTAMP
    if (modified) {
        const now = ICALmodule.Time.now();
        const existingRev = vcard.getFirstProperty('rev');
        if (existingRev) {
            vcard.updatePropertyWithValue('rev', now);
        }
        else {
            vcard.addPropertyWithValue('rev', now);
        }
    }
    // Preserve vendor extensions if configured
    let vendorExtensionsCount = 0;
    if (cfg.preserveVendorExtensions) {
        const originalComponent = new ICALmodule.Component(originalVcard);
        preserveVendorProperties(vcard, originalComponent);
        // Count vendor extensions
        vendorExtensionsCount = vcard
            .getAllProperties()
            .filter((p) => p.name.toLowerCase().startsWith('x-')).length;
        if (vendorExtensionsCount > 0) {
            warnings.push(`Preserved ${vendorExtensionsCount} vendor extension${vendorExtensionsCount > 1 ? 's' : ''}`);
        }
    }
    // Serialize back to string
    let serialized;
    try {
        // If we had a VCALENDAR wrapper, serialize the whole thing
        // Otherwise serialize just the VCARD
        serialized = serializeICalComponent(component);
    }
    catch (error) {
        throw new Error(`Failed to serialize vCard: ${error instanceof Error ? error.message : String(error)}`);
    }
    // Build result
    const result = {
        data: serialized,
        modified,
    };
    if (warnings.length > 0) {
        result.warnings = warnings;
    }
    if (modified) {
        result.metadata = {};
        // Get REV timestamp if present
        const rev = vcard.getFirstPropertyValue('rev');
        if (rev) {
            // Convert ICAL.Time to string
            if (typeof rev === 'object' && 'toICALString' in rev && typeof rev.toICALString === 'function') {
                result.metadata.dtstamp = rev.toICALString();
            }
            else {
                result.metadata.dtstamp = rev.toString();
            }
        }
        if (cfg.preserveVendorExtensions && vendorExtensionsCount > 0) {
            result.metadata.vendorExtensionsCount = vendorExtensionsCount;
        }
    }
    return result;
}
/**
 * Helper function to validate vCard fields before update
 *
 * Performs validation checks on field values before attempting update.
 * Useful for validating user input before making server requests.
 *
 * @param fields - Fields to validate
 * @returns Array of validation error messages (empty if valid)
 *
 * @example
 * ```typescript
 * const errors = validateVCardFields({
 *   FN: '', // Error: FN is required
 *   EMAIL: 'invalid-email', // Warning: not a valid email format
 * });
 *
 * if (errors.length > 0) {
 *   console.error('Validation errors:', errors);
 * }
 * ```
 */
function validateVCardFields(fields) {
    const errors = [];
    // Check for empty FN
    if ('FN' in fields && fields.FN === '') {
        errors.push('FN (Formatted Name) is required and cannot be empty');
    }
    // Validate N field structure (should have semicolons)
    if (fields.N && fields.N.length > 0) {
        // N format: Family;Given;Additional;Prefix;Suffix
        // At minimum should have at least one semicolon
        if (!fields.N.includes(';')) {
            errors.push('N (Structured Name) should be in format: Family;Given;Additional;Prefix;Suffix');
        }
    }
    // Validate URL format (basic check)
    if (fields.URL && fields.URL.length > 0) {
        try {
            new URL(fields.URL);
        }
        catch (_a) {
            errors.push('URL is not a valid URL format');
        }
    }
    return errors;
}
/**
 * Helper function to extract vCard fields
 *
 * Extracts field values from a vCard for reading/display purposes.
 *
 * @param vCard - DAVVCard object
 * @returns VCardFields object with current field values
 *
 * @example
 * ```typescript
 * const fields = extractVCardFields(vCard);
 * console.log(fields.FN); // "John Doe"
 * console.log(fields.EMAIL); // "john@example.com"
 * ```
 */
function extractVCardFields(vCard) {
    if (!vCard.data || typeof vCard.data !== 'string') {
        throw new Error('Invalid vCard data');
    }
    try {
        const component = parseICalComponent(vCard.data);
        // Find VCARD component
        let vcard = null;
        if (component.name === 'vcard') {
            vcard = component;
        }
        else if (component.name === 'vcalendar') {
            vcard = component.getFirstSubcomponent('vcard');
        }
        if (!vcard) {
            throw new Error('No VCARD component found');
        }
        const fields = {};
        // Extract supported fields
        for (const fieldName of SUPPORTED_FIELDS) {
            const value = vcard.getFirstPropertyValue(fieldName.toLowerCase());
            if (value !== null && value !== undefined) {
                fields[fieldName] = String(value);
            }
        }
        return fields;
    }
    catch (error) {
        throw new Error(`Failed to extract vCard fields: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * VTODO Field-Based Updates
 *
 * This module provides field-level updates for VTODO (todo/task) objects
 * without requiring manual iCal string generation.
 *
 * Similar to eventFieldUpdater.ts but tailored for VTODO components.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc5545#section-3.6.2 - VTODO Component
 */
/**
 * Default configuration for VTODO field updates
 */
const DEFAULT_CONFIG = {
    autoIncrementSequence: true,
    autoUpdateDtstamp: true,
    preserveUnknownFields: true,
    preserveVendorExtensions: true,
};
/**
 * Update fields in a VTODO calendar object
 *
 * This function allows updating specific fields in a VTODO without manually
 * constructing iCal strings. It handles:
 * - Field updates (SUMMARY, DESCRIPTION)
 * - SEQUENCE auto-increment (RFC 5545 Section 3.8.7.4)
 * - DTSTAMP auto-update (RFC 5545 Section 3.8.7.2)
 * - VCALENDAR wrapper preservation
 * - Vendor extension preservation (X-* properties)
 * - Proper line folding (RFC 5545 Section 3.1)
 *
 * @param calendarObject - DAVCalendarObject containing VTODO data
 * @param fields - Fields to update
 * @param config - Optional configuration for auto-update behavior
 * @returns FieldUpdateResult with updated iCal string and metadata
 * @throws Error if parsing fails, UID is missing, or VTODO component not found
 *
 * @example
 * ```ts
 * const updated = updateTodoFields(
 *   calendarObject,
 *   {
 *     SUMMARY: 'Updated Todo Title',
 *     DESCRIPTION: 'Updated detailed description'
 *   },
 *   {
 *     autoIncrementSequence: true,
 *     autoUpdateDtstamp: true
 *   }
 * );
 *
 * console.log(updated.data); // Updated iCal string
 * console.log(updated.modified); // true if any fields changed
 * console.log(updated.metadata.sequence); // New SEQUENCE value
 * ```
 */
function updateTodoFields(calendarObject, fields, config) {
    // Merge config with defaults
    const finalConfig = {
        ...DEFAULT_CONFIG,
        ...config,
    };
    // Validate input
    if (!calendarObject.data) {
        throw new Error('calendarObject.data is required');
    }
    if (typeof calendarObject.data !== 'string') {
        throw new Error('calendarObject.data must be a string (iCal format)');
    }
    // Parse the iCal string
    const vcalendar = parseICalComponent(calendarObject.data);
    // Extract VTODO component (may be nested in VCALENDAR)
    const vtodo = vcalendar.getFirstSubcomponent('vtodo');
    if (!vtodo) {
        throw new Error('VTODO component not found in calendar object');
    }
    // Validate UID exists (MUST NOT be modified)
    validateUid(vtodo);
    // Clone the original vtodo for comparison and vendor property preservation
    const originalVtodo = new ICALmodule.Component(vtodo.toJSON());
    // Track if any fields were actually modified
    let modified = false;
    const warnings = [];
    // Update fields
    if (fields.SUMMARY !== undefined) {
        const currentSummary = vtodo.getFirstPropertyValue('summary');
        if (currentSummary !== fields.SUMMARY) {
            if (fields.SUMMARY === null || fields.SUMMARY === '') {
                // Remove property if value is null/empty
                const prop = vtodo.getFirstProperty('summary');
                if (prop) {
                    vtodo.removeProperty(prop);
                    modified = true;
                }
            }
            else {
                // Update or add property
                if (vtodo.getFirstProperty('summary')) {
                    vtodo.updatePropertyWithValue('summary', fields.SUMMARY);
                }
                else {
                    vtodo.addPropertyWithValue('summary', fields.SUMMARY);
                }
                modified = true;
            }
        }
    }
    if (fields.DESCRIPTION !== undefined) {
        const currentDescription = vtodo.getFirstPropertyValue('description');
        if (currentDescription !== fields.DESCRIPTION) {
            if (fields.DESCRIPTION === null || fields.DESCRIPTION === '') {
                // Remove property if value is null/empty
                const prop = vtodo.getFirstProperty('description');
                if (prop) {
                    vtodo.removeProperty(prop);
                    modified = true;
                }
            }
            else {
                // Update or add property
                if (vtodo.getFirstProperty('description')) {
                    vtodo.updatePropertyWithValue('description', fields.DESCRIPTION);
                }
                else {
                    vtodo.addPropertyWithValue('description', fields.DESCRIPTION);
                }
                modified = true;
            }
        }
    }
    // Auto-update SEQUENCE if configured and modified
    let newSequence;
    if (finalConfig.autoIncrementSequence && modified) {
        const oldSequence = getSequence(vtodo);
        updateSequence(vtodo);
        newSequence = getSequence(vtodo);
        // Warn if sequence didn't change (shouldn't happen)
        if (oldSequence === newSequence) {
            warnings.push(`SEQUENCE already at value ${newSequence}, not incremented`);
        }
    }
    // Auto-update DTSTAMP if configured and modified
    let newDtstamp;
    if (finalConfig.autoUpdateDtstamp && modified) {
        updateDtstamp(vtodo);
        newDtstamp = getDtstamp(vtodo) || undefined;
    }
    // Preserve vendor extensions if configured
    let vendorExtensionsCount = 0;
    if (finalConfig.preserveVendorExtensions) {
        // Count vendor properties before preservation
        const vendorProps = originalVtodo.getAllProperties().filter((prop) => prop.name.toLowerCase().startsWith('x-'));
        vendorExtensionsCount = vendorProps.length;
        preserveVendorProperties(vtodo, originalVtodo);
        if (vendorExtensionsCount > 0) {
            warnings.push(`Preserved ${vendorExtensionsCount} vendor extension(s)`);
        }
    }
    // Validate UID again (ensure it wasn't accidentally modified)
    validateUid(vtodo);
    // Serialize back to iCal string
    const updatedData = serializeICalComponent(vcalendar);
    return {
        data: updatedData,
        modified,
        warnings: warnings.length > 0 ? warnings : undefined,
        metadata: {
            sequence: newSequence,
            dtstamp: newDtstamp,
            vendorExtensionsCount: vendorExtensionsCount > 0 ? vendorExtensionsCount : undefined,
        },
    };
}
/**
 * Batch update multiple VTODO objects with the same fields
 *
 * This is useful for updating multiple todos with the same changes,
 * such as moving todos to a different category or updating status.
 *
 * @param calendarObjects - Array of DAVCalendarObject containing VTODO data
 * @param fields - Fields to update (same for all objects)
 * @param config - Optional configuration for auto-update behavior
 * @returns Array of FieldUpdateResult for each object
 *
 * @example
 * ```ts
 * const results = batchUpdateTodoFields(
 *   [todo1, todo2, todo3],
 *   { SUMMARY: 'Updated Title' }
 * );
 *
 * results.forEach((result, index) => {
 *   console.log(`Todo ${index}: ${result.modified ? 'modified' : 'unchanged'}`);
 * });
 * ```
 */
function batchUpdateTodoFields(calendarObjects, fields, config) {
    return calendarObjects.map((obj) => updateTodoFields(obj, fields, config));
}
/**
 * Helper function to check if a calendar object contains a VTODO component
 *
 * @param calendarObject - DAVCalendarObject to check
 * @returns True if object contains VTODO, false otherwise
 *
 * @example
 * ```ts
 * if (isTodoObject(calendarObject)) {
 *   const result = updateTodoFields(calendarObject, { SUMMARY: 'New title' });
 * }
 * ```
 */
function isTodoObject(calendarObject) {
    try {
        if (!calendarObject.data || typeof calendarObject.data !== 'string') {
            return false;
        }
        const vcalendar = parseICalComponent(calendarObject.data);
        const vtodo = vcalendar.getFirstSubcomponent('vtodo');
        return vtodo !== null;
    }
    catch (_a) {
        return false;
    }
}
/**
 * Extract VTODO fields from a calendar object
 *
 * Useful for reading current values before updating.
 *
 * @param calendarObject - DAVCalendarObject containing VTODO data
 * @returns TodoFields with current values
 * @throws Error if parsing fails or VTODO component not found
 *
 * @example
 * ```ts
 * const currentFields = extractTodoFields(calendarObject);
 * console.log(currentFields.SUMMARY); // "Current Todo Title"
 *
 * // Update only if needed
 * if (currentFields.SUMMARY !== desiredSummary) {
 *   updateTodoFields(calendarObject, { SUMMARY: desiredSummary });
 * }
 * ```
 */
function extractTodoFields(calendarObject) {
    if (!calendarObject.data || typeof calendarObject.data !== 'string') {
        throw new Error('calendarObject.data must be a string (iCal format)');
    }
    const vcalendar = parseICalComponent(calendarObject.data);
    const vtodo = vcalendar.getFirstSubcomponent('vtodo');
    if (!vtodo) {
        throw new Error('VTODO component not found in calendar object');
    }
    const fields = {};
    // Extract SUMMARY
    const summary = vtodo.getFirstPropertyValue('summary');
    if (summary !== null && typeof summary === 'string') {
        fields.SUMMARY = summary;
    }
    // Extract DESCRIPTION
    const description = vtodo.getFirstPropertyValue('description');
    if (description !== null && typeof description === 'string') {
        fields.DESCRIPTION = description;
    }
    return fields;
}

var index = {
    DAVNamespace,
    DAVNamespaceShort,
    DAVAttributeMap,
    ...client,
    ...request,
    ...collection,
    ...account,
    ...addressBook,
    ...calendar,
    ...todo,
    ...authHelpers,
    ...requestHelpers,
};

export { DAVAttributeMap, DAVClient, DAVNamespace, DAVNamespaceShort, addressBookMultiGet, addressBookQuery, batchUpdateTodoFields, calendarMultiGet, calendarQuery, cleanupFalsy, collectionQuery, createAccount, createCalendarObject, createDAVClient, createObject, createTodo, createVCard, davRequest, index as default, deleteCalendarObject, deleteObject, deleteTodo, deleteVCard, extractEventFields, extractTodoFields, extractVCardFields, fetchAddressBooks, fetchCalendarObjects, fetchCalendarUserAddresses, fetchCalendars, fetchOauthTokens, fetchTodos, fetchVCards, freeBusyQuery, getBasicAuthHeaders, getDAVAttribute, getOauthHeaders, hasValidVEvent, isCollectionDirty, isTodoObject, makeCalendar, propfind, refreshAccessToken, smartCollectionSync, supportedReportSet, syncCalendars, syncCollection, todoMultiGet, todoQuery, updateCalendarObject, updateEventFields, updateObject, updateTodo, updateTodoFields, updateVCard, updateVCardFields, urlContains, urlEquals, validateVCardFields };
