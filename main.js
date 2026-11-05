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

	// ---------- E-Mail ----------
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
