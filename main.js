// taflux – Landingpage: Hell/Dunkel-Umschalter, Release-Hinweis und E-Mail-Link.

(function () {
	var root = document.documentElement;

	// ---------- Hell / Dunkel ----------
	function isDark() {
		var set = root.dataset.theme;
		if (set) return set === 'dark';
		return window.matchMedia('(prefers-color-scheme: dark)').matches;
	}
	var toggle = document.querySelector('[data-theme-toggle]');
	if (toggle) {
		toggle.addEventListener('click', function () {
			var next = isDark() ? 'light' : 'dark';
			root.dataset.theme = next;
			try {
				localStorage.setItem('taflux-theme', next);
			} catch (e) {}
		});
	}

	// ---------- Sechs Achsen: dasselbe Mosaik durch sechs Brillen ----------
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
	// Die Adresse steht nirgends im Klartext: Sie wird erst zusammengesetzt, wenn jemand
	// scrollt oder den Link berührt bzw. per Tastatur ansteuert. Einfache Sammel-Bots tun das nicht.
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
			link.querySelector('[data-release-text]').textContent = 'Jetzt auf GitHub';
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
		if (fact) fact.textContent = 'seit 30. November 2026';
		var row = document.querySelector('[data-release-row]');
		if (row) {
			row.innerHTML =
				'Veröffentlicht als Open Source auf GitHub: <a href="' + REPO + '" rel="noopener">' +
				REPO.replace('https://', '') + '</a>.';
		}
	}
})();
