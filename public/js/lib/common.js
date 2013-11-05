define([
	'require',
	'lib/promise',
	'lib/templates'
], function(
	require,
	Promise,
	templates
) {

	var
		ss = window.sessionStorage,
		ls = window.localStorage,
		UA = navigator.userAgent;

	var _req = function(method, url, params) {
		var p = new Promise();
		var r = new XMLHttpRequest();
		r.open(method, url);
		r.onload = function() {
			if (this.status === 200) {
				p.complete(JSON.parse(this.response));
			} else {
				p.reject();
			}
		};
		r.onerror = function() {
			p.reject();
		};
		if (method === 'GET') {
			r.send();
		} else {
			r.setRequestHeader("Content-Type", "application/json");
			r.send(JSON.stringify(params));
		}
		return p;
	};

	return {
		render: (function() {
			var
				domPot = document.createElement('div'),
				firstChild = null,
				render = ECT({ root: templates }).render;
			return function(template, data, forceString) {
				if (forceString) {
					return render(template, data);
				}
				domPot.innerHTML = render(template, data);
				firstChild = domPot.firstChild;
				while(firstChild != null && firstChild.nodeType == 3){
					firstChild = firstChild.nextSibling;
				}
				return firstChild;
			}
		})(),
		forceRepaint: function(element) {
			element.style.display = 'none';
			element.offsetHeight;
			element.style.display = '';
		},
		extend: function(obj, other) {
			for (var k in other) {
				obj[k] = other[k];
			}
		},
		cache: {
			set: function(key, value) {
				ls.setItem(key, value);
			},
			get: function(key) {
				return ls.getItem(key);
			},
			del: function(key) {
				ls.removeItem(key);
			}
		},
		session: {
			set: function(key, value) {
				ss.setItem(key, value);
			},
			get: function(key) {
				return ss.getItem(key);
			},
			del: function(key) {
				ss.removeItem(key);
			}
		},
		data: {
			fetch: function(url, params) {
				if (params) {
					var queryChunks = [];
					for (var k in params) {
						queryChunks.push(k + '=' + params[k]);
					}
					url += '?';
					url += queryChunks.join('&');
				}
				return _req('GET', url, null);
			},
			push: function(url, params) {
				return _req('POST', url, params);
			}
		},
		query: function(node, selector) {
			if (typeof node === 'string') {
				selector = node;
				node = document;
			}
			return node.querySelector(selector);
		},
		queryAll: function(node, selector) {
			if (typeof node === 'string') {
				selector = node;
				node = document;
			}
			return node.querySelectorAll(selector);
		},
		require: require,
		device: {
			isChromeMobile: (UA.indexOf('Android') > -1 && UA.indexOf('Chrome')),
			isIOS: (UA.indexOf('iPhone') > -1 || UA.indexOf('iPad')),
			isMobile: (UA.indexOf('Android') > -1
				|| UA.indexOf('iPhone') > -1
				|| UA.indexOf('iPad') > -1)
		}
	}
});

