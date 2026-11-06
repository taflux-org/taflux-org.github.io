// taflux – Landingpage: Sprache, Hell/Dunkel, sechs Dimensionen, E-Mail-Link und Release-Hinweis.
//
// Wird synchron im <head> geladen (ohne defer): Sprache und Theme werden festgelegt, bevor
// etwas gezeichnet wird. Alles, was das fertige DOM braucht, läuft erst nach DOMContentLoaded.

(function () {
	var root = document.documentElement;
	var LANG_KEY = 'taflux-lang';
	var THEME_KEY = 'taflux-theme';
	var SUPPORTED = ['de', 'en'];

	function load(key) {
		try {
			return localStorage.getItem(key);
		} catch (e) {
			return null;
		}
	}
	function save(key, value) {
		try {
			localStorage.setItem(key, value);
		} catch (e) {}
	}

	// ---------- Theme vor dem ersten Zeichnen setzen, damit nichts aufblitzt ----------
	var storedTheme = load(THEME_KEY);
	if (storedTheme === 'light' || storedTheme === 'dark') root.dataset.theme = storedTheme;

	// ---------- Sprache ----------
	// Sprachfassungen stehen als <link rel="alternate" hreflang="…"> im <head> – vor diesem Skript.
	// Seiten ohne solche Links (z. B. das Impressum) werden nie umgeleitet.
	// Reihenfolge: gespeicherte Wahl > Browser-/OS-Sprache (nur beim Einstieg von aussen) > Seite bleibt.
	var current = (root.lang || 'de').slice(0, 2).toLowerCase();

	function alternate(lang) {
		return document.querySelector('link[rel="alternate"][hreflang="' + lang + '"]');
	}
	function browserLang() {
		var list = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ''];
		for (var i = 0; i < list.length; i++) {
			var code = String(list[i]).slice(0, 2).toLowerCase();
			if (SUPPORTED.indexOf(code) !== -1) return code;
		}
		return 'en'; // weder Deutsch noch Englisch eingestellt: international auf Englisch
	}
	function isBot() {
		// Suchmaschinen sollen beide Fassungen sehen, nicht auf eine umgeleitet werden.
		return !!navigator.webdriver || /bot|crawl|spider|slurp|preview|lighthouse|headless/i.test(navigator.userAgent);
	}
	function fromThisSite() {
		try {
			return !!document.referrer && new URL(document.referrer).host === location.host;
		} catch (e) {
			return false;
		}
	}

	var wanted = load(LANG_KEY);
	if (SUPPORTED.indexOf(wanted) === -1) wanted = isBot() || fromThisSite() ? null : browserLang();
	if (wanted && wanted !== current) {
		var target = alternate(wanted);
		if (target) {
			location.replace(target.href + location.hash);
			return;
		}
	}

	// ---------- Texte, die das Skript selbst schreibt ----------
	var TEXT = {
		de: {
			now: 'Jetzt auf GitHub',
			since: 'seit 30. November 2026',
			released: 'Veröffentlicht als Open Source auf GitHub: '
		},
		en: {
			now: 'Now on GitHub',
			since: 'since 30 November 2026',
			released: 'Released as open source on GitHub: '
		}
	};
	var t = TEXT[current] || TEXT.de;

	function init() {
		// ---------- Sprachwahl: die bewusste Wahl merken ----------
		document.querySelectorAll('[data-lang]').forEach(function (a) {
			a.addEventListener('click', function () {
				save(LANG_KEY, a.getAttribute('data-lang'));
			});
		});

		// ---------- Hell / Dunkel ----------
		var isDark = function () {
			var set = root.dataset.theme;
			if (set) return set === 'dark';
			return window.matchMedia('(prefers-color-scheme: dark)').matches;
		};
		var toggle = document.querySelector('[data-theme-toggle]');
		if (toggle) {
			toggle.addEventListener('click', function () {
				var next = isDark() ? 'light' : 'dark';
				root.dataset.theme = next;
				save(THEME_KEY, next);
			});
		}

		// ---------- Sechs Dimensionen: dasselbe Mosaik durch sechs Brillen ----------
		// Jeder Reiter bringt in data-states 24 Zeichen mit, einen Zustand pro Stein:
		// s = gesetzt, c = hervorgehoben, m = halb, f = blass, o = Umriss, g = Lücke.
		var lens = document.querySelector('[data-lens]');
		if (lens) {
			var tablist = lens.querySelector('[role="tablist"]');
			var tabs = Array.prototype.slice.call(lens.querySelectorAll('[role="tab"]'));
			var panels = Array.prototype.slice.call(lens.querySelectorAll('[role="tabpanel"]'));
			var tiles = Array.prototype.slice.call(lens.querySelectorAll('.lt'));

			var show = function (index, focus) {
				tabs.forEach(function (tab, i) {
					var on = i === index;
					tab.setAttribute('aria-selected', on ? 'true' : 'false');
					tab.tabIndex = on ? 0 : -1;
					if (on && focus) tab.focus();
				});
				panels.forEach(function (panel, i) {
					if (i === index) panel.removeAttribute('data-hidden');
					else panel.setAttribute('data-hidden', '');
				});
				var states = panels[index].getAttribute('data-states') || '';
				tiles.forEach(function (tile, i) {
					if (states[i]) tile.setAttribute('data-s', states[i]);
				});
			};

			tabs.forEach(function (tab, i) {
				tab.addEventListener('click', function () {
					show(i, false);
				});
				tab.addEventListener('keydown', function (e) {
					var next = null;
					if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
					if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
					if (e.key === 'Home') next = 0;
					if (e.key === 'End') next = tabs.length - 1;
					if (next !== null) {
						e.preventDefault();
						show(next, true);
					}
				});
			});

			tablist.hidden = false;
			lens.classList.add('is-ready');
			show(0, false);
		}

		// ---------- E-Mail ----------
		// Wird erst zusammengesetzt, wenn jemand
		// scrollt oder den Link berührt bzw. per Tastatur ansteuert (Einfache Bots /KI tun das nicht)
		var mailLinks = document.querySelectorAll('[data-mail]');
		if (mailLinks.length) {
			var CODES = [111, 106, 53, 108, 111, 106, 122, 115, 108, 126, 71, 115, 108, 112, 121, 105, 104, 110];
			var armed = false;
			var arm = function () {
				if (armed) return;
				armed = true;
				var addr = CODES.map(function (c) {
					return String.fromCharCode(c - 7);
				})
					.reverse()
					.join('');
				mailLinks.forEach(function (a) {
					var subject = a.getAttribute('data-mail');
					a.href = 'mailto:' + addr + (subject ? '?subject=' + encodeURIComponent(subject) : '');
				});
				window.removeEventListener('scroll', arm);
			};
			window.addEventListener('scroll', arm, { passive: true });
			mailLinks.forEach(function (a) {
				a.addEventListener('pointerenter', arm);
				a.addEventListener('touchstart', arm, { passive: true });
				a.addEventListener('focus', arm);
			});
		}

		// ---------- Release ----------
		// Ab dem Release-Tag wird aus der Ankündigung ein Link. Danach nur noch REPO anpassen.
		var RELEASE = new Date('2026-11-30T00:00:00+01:00');
		var REPO = 'https://github.com/taflux-org';

		if (new Date() >= RELEASE) {
			var badge = document.querySelector('[data-release-badge]');
			if (badge) {
				var link = document.createElement('a');
				link.className = badge.className;
				link.href = REPO;
				link.rel = 'noopener';
				link.innerHTML = badge.innerHTML;
				badge.replaceWith(link);
				link.querySelector('[data-release-text]').textContent = t.now;
			}
			var cta = document.querySelector('[data-release-cta]');
			if (cta) {
				cta.href = REPO;
				cta.rel = 'noopener';
				cta.removeAttribute('aria-disabled');
				cta.classList.remove('btn-locked');
				var flag = cta.querySelector('[data-release-flag]');
				if (flag) flag.remove();
			}
			var fact = document.querySelector('[data-release-fact]');
			if (fact) fact.textContent = t.since;
			var row = document.querySelector('[data-release-row]');
			if (row) {
				var repoLink = document.createElement('a');
				repoLink.href = REPO;
				repoLink.rel = 'noopener';
				repoLink.textContent = REPO.replace('https://', '');
				row.textContent = t.released;
				row.appendChild(repoLink);
				row.appendChild(document.createTextNode('.'));
			}
		}
	}

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
	else init();
})();