/* ==========================================================================
   Motion across the site (October 2026, version 2)
   Sections rise into view, accent lines draw themselves, key figures count up,
   slow flowing lines run behind the home headline, page headers and navy bands,
   the home headline writes itself, organisation names drift past, photos move
   slightly slower than the page, and long pages show a reading line.
   Visitors who ask for reduced motion see a still page.
   ========================================================================== */
(function () {
    'use strict';
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var canObserve = 'IntersectionObserver' in window;
    var header = document.querySelector('.site-header');

    /* ---------- Small touches ---------- */

    // Menu bar gains a soft shadow once the page scrolls
    if (header) {
        var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    // Arrows at the end of links nudge to the right on hover
    document.querySelectorAll('a').forEach(function (a) {
        var last = a.lastChild;
        while (last && last.nodeType === 3 && !last.nodeValue.trim()) last = last.previousSibling;
        if (!last || last.nodeType !== 3) return;
        var m = last.nodeValue.match(/^(.*?)(\s*)(→)(\s*)$/);
        if (!m) return;
        var span = document.createElement('span');
        span.className = 'nudge-arrow';
        span.textContent = '→';
        last.nodeValue = m[1];
        a.insertBefore(span, last.nextSibling);
    });

    // Organisation names: repeat the list once so the strip can loop without a gap
    document.querySelectorAll('.names-track').forEach(function (track) {
        var list = track.querySelector('.names-list');
        if (!list || reduceMotion) return;
        var copy = list.cloneNode(true);
        copy.setAttribute('aria-hidden', 'true');
        track.appendChild(copy);
        // keep the speed steady whatever the length of the list
        var pxPerSecond = 45;
        var setDuration = function () {
            track.style.setProperty('--names-duration', Math.max(30, list.scrollWidth / pxPerSecond) + 's');
        };
        setDuration();
        window.addEventListener('load', setDuration);
    });

    /* ---------- Slowly flowing lines ---------- */

    function makeFlow(host, style) {
        var canvas = document.createElement('canvas');
        canvas.className = 'flow-canvas';
        canvas.setAttribute('aria-hidden', 'true');
        host.classList.add('has-flow');
        host.insertBefore(canvas, host.firstChild);
        var ctx = canvas.getContext('2d');
        var w = 0, h = 0, running = false, visible = false, raf = 0;

        function size() {
            var dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = host.clientWidth; h = host.clientHeight;
            canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        function draw(t) {
            ctx.clearRect(0, 0, w, h);
            var narrow = w < 768;
            var x0 = w * (narrow ? 0 : style.start);
            var alpha = narrow ? style.alpha * 0.75 : style.alpha;
            var grad = ctx.createLinearGradient(x0, 0, w, 0);
            grad.addColorStop(0, 'rgba(' + style.rgb + ',0)');
            grad.addColorStop(0.3, 'rgba(' + style.rgb + ',' + alpha + ')');
            grad.addColorStop(1, 'rgba(' + style.rgb + ',' + alpha + ')');
            ctx.strokeStyle = grad;
            ctx.lineWidth = style.width;
            var n = style.lines;
            for (var i = 0; i < n; i++) {
                var base = h * (0.08 + 0.84 * i / (n - 1));
                ctx.beginPath();
                for (var x = x0; x <= w + 6; x += 6) {
                    var y = base
                        + Math.sin(x * 0.0052 + i * 0.6 + t * 0.00016) * h * 0.1
                        + Math.sin(x * 0.012 - i * 0.35 - t * 0.0001) * h * 0.04;
                    if (x === x0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                }
                ctx.stroke();
            }
        }

        function loop(t) { draw(t); if (running) raf = requestAnimationFrame(loop); }
        function start() { if (running || reduceMotion) return; running = true; raf = requestAnimationFrame(loop); }
        function stop() { running = false; cancelAnimationFrame(raf); }

        size();
        draw(0);
        window.addEventListener('resize', function () { size(); draw(performance.now()); });
        if (reduceMotion || !canObserve) return;
        new IntersectionObserver(function (entries) {
            entries.forEach(function (e) { visible = e.isIntersecting; if (visible && !document.hidden) start(); else stop(); });
        }).observe(host);
        document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else if (visible) start(); });
    }

    var NAVY_LINES = { rgb: '26,54,93', alpha: 0.2, width: 1.3, lines: 11, start: 0.38 };
    var HERO_LINES = { rgb: '26,54,93', alpha: 0.12, width: 1.2, lines: 12, start: 0 };
    var LIGHT_LINES = { rgb: '255,255,255', alpha: 0.16, width: 1.3, lines: 11, start: 0 };
    document.querySelectorAll('.hero').forEach(function (el) { makeFlow(el, HERO_LINES); });
    document.querySelectorAll('.page-header').forEach(function (el) { makeFlow(el, NAVY_LINES); });
    document.querySelectorAll('.course-callout, .quote-section, .figures-band').forEach(function (el) { makeFlow(el, LIGHT_LINES); });

    if (reduceMotion) return;

    /* ---------- The home headline writes itself ---------- */

    var title = document.querySelector('.hero-title');
    if (title) {
        var i = 0;
        Array.prototype.slice.call(title.childNodes).forEach(function (node) {
            if (node.nodeType === 3) {
                var parts = node.nodeValue.split(/(\s+)/);
                var frag = document.createDocumentFragment();
                parts.forEach(function (part) {
                    if (!part) return;
                    if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
                    var w = document.createElement('span');
                    w.className = 'hero-word';
                    w.style.setProperty('--i', i++);
                    w.textContent = part;
                    frag.appendChild(w);
                });
                title.replaceChild(frag, node);
            } else if (node.nodeType === 1) {
                node.classList.add('hero-word');
                node.style.setProperty('--i', i++);
            }
        });
        title.classList.add('words-ready');
    }

    /* ---------- Reading line on long inner pages ---------- */

    if (header && !document.querySelector('.hero')) {
        var line = document.createElement('div');
        line.className = 'reading-line';
        line.setAttribute('aria-hidden', 'true');
        header.appendChild(line);
        var updateLine = function () {
            var max = document.documentElement.scrollHeight - window.innerHeight;
            var long = document.documentElement.scrollHeight > window.innerHeight * 2.5;
            line.style.display = long ? '' : 'none';
            line.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ')';
        };
        window.addEventListener('scroll', updateLine, { passive: true });
        window.addEventListener('resize', updateLine);
        window.addEventListener('load', updateLine);
        updateLine();
    }

    /* ---------- Photos move slightly slower than the page ---------- */

    var photos = Array.prototype.slice.call(document.querySelectorAll(
        '.research-image img, .research-intro-image img, .thought-leadership-image img, ' +
        '.contact-image img, .speaking-image img, .about-image-wrapper img'));
    if (photos.length) {
        photos.forEach(function (img) { img.classList.add('parallax-img'); });
        var ticking = false;
        var updatePhotos = function () {
            ticking = false;
            var vh = window.innerHeight;
            photos.forEach(function (img) {
                var r = img.parentElement.getBoundingClientRect();
                if (r.bottom < -200 || r.top > vh + 200) return;
                var offset = ((r.top + r.height / 2) - vh / 2) / vh; // about -1 to 1
                var shift = Math.max(-1, Math.min(1, offset)) * -28;
                img.style.setProperty('--parallax', shift.toFixed(1) + 'px');
            });
        };
        var requestPhotos = function () { if (!ticking) { ticking = true; requestAnimationFrame(updatePhotos); } };
        window.addEventListener('scroll', requestPhotos, { passive: true });
        window.addEventListener('resize', requestPhotos);
        updatePhotos();
    }

    if (!canObserve) return;

    /* ---------- Sections rise into view, lines draw, figures count ---------- */

    var SINGLE = [
        '.page-header-content', '.intro-label', '.intro-content', '.section-header',
        '.research-content', '.research-image', '.research-intro-content', '.research-intro-image',
        '.thought-leadership-image', '.course-callout-content', '.course-video-wrapper',
        '.contact-info', '.contact-image', '.speaking-hero-grid > *', '.about-grid > *',
        '.course-section-grid > *', '.featured-quote', '.playbook-feature',
        '.latest-header-full', '.latest-header', '.section-title', '.media-category h2',
        '.advisory-column h3', '.names-strip-label', '.names-viewport'
    ];
    var LISTS = [
        '.expertise-grid', '.news-list', '.advisory-list', '.publications-list', '.press-photos-grid',
        '.opeds-grid', '.cards-grid', '.topics-grid', '.positions-grid', '.position-list',
        '.engagements-list', '.education-grid', '.press-list', '.figures-grid'
    ];
    var LINES = ['.latest-header-full', '.latest-header', '.section-title', '.media-category h2', '.advisory-column h3'];

    function outsideHero(el) { return !el.closest('.hero, .site-header, .site-footer, .nav-menu, .film-lightbox'); }

    var targets = [];
    SINGLE.forEach(function (sel) {
        document.querySelectorAll(sel).forEach(function (el) { if (outsideHero(el) && targets.indexOf(el) < 0) targets.push(el); });
    });
    LISTS.forEach(function (sel) {
        document.querySelectorAll(sel).forEach(function (list) {
            if (!outsideHero(list)) return;
            Array.prototype.forEach.call(list.children, function (child) { if (targets.indexOf(child) < 0) targets.push(child); });
        });
    });

    LINES.forEach(function (sel) {
        document.querySelectorAll(sel).forEach(function (el) {
            var cs = getComputedStyle(el);
            var wdt = parseFloat(cs.borderBottomWidth);
            if (!wdt) return;
            el.style.setProperty('--line-color', cs.borderBottomColor);
            el.style.setProperty('--line-w', wdt + 'px');
            el.classList.add('draw-line');
        });
    });

    targets.forEach(function (el) { el.classList.add('reveal'); });

    var revealer = new IntersectionObserver(function (entries) {
        var n = 0;
        entries.forEach(function (e) {
            if (!e.isIntersecting) return;
            var el = e.target;
            el.style.setProperty('--reveal-delay', (Math.min(n, 6) * 0.1) + 's');
            el.classList.add('is-in');
            n++;
            revealer.unobserve(el);
            setTimeout(function () { el.style.removeProperty('--reveal-delay'); }, 2200);
        });
    }, { threshold: 0.08 });
    targets.forEach(function (el) { revealer.observe(el); });
    window.addEventListener('scroll', function () {
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
            document.querySelectorAll('.reveal:not(.is-in)').forEach(function (el) { el.classList.add('is-in'); revealer.unobserve(el); });
        }
    }, { passive: true });

    var liner = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (!e.isIntersecting) return;
            e.target.classList.add(e.target.classList.contains('figures-grid') ? 'lines-in' : 'is-in');
            liner.unobserve(e.target);
        });
    }, { threshold: 0.5 });
    document.querySelectorAll('.draw-line, .figures-grid').forEach(function (el) { liner.observe(el); });

    // Counting figures
    function countUp(el, minimum) {
        var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        var node, m;
        while ((node = walker.nextNode())) {
            m = node.nodeValue.match(/\d{1,3}(?:,\d{3})+|\d{2,}/);
            if (m) break;
        }
        if (!m) return;
        var target = parseInt(m[0].replace(/,/g, ''), 10);
        if (target < minimum) return;
        var before = node.nodeValue.slice(0, m.index), after = node.nodeValue.slice(m.index + m[0].length);
        var span = document.createElement('span');
        span.className = 'count-up';
        var ghost = document.createElement('span');
        ghost.className = 'count-ghost';
        ghost.textContent = m[0];
        var live = document.createElement('span');
        live.className = 'count-live';
        live.setAttribute('aria-hidden', 'true');
        span.appendChild(ghost);
        span.appendChild(live);
        var parent = node.parentNode;
        parent.insertBefore(document.createTextNode(before), node);
        parent.insertBefore(span, node);
        node.nodeValue = after;
        var fmt = function (v) { return Math.round(v).toLocaleString('en-GB'); };
        live.textContent = fmt(0);
        span.classList.add('is-counting');
        new IntersectionObserver(function (entries, obs) {
            if (!entries[0].isIntersecting) return;
            obs.disconnect();
            var t0 = performance.now(), dur = 1800;
            (function step(t) {
                var p = Math.min(1, (t - t0) / dur);
                var eased = 1 - Math.pow(1 - p, 3);
                live.textContent = fmt(target * eased);
                if (p < 1) requestAnimationFrame(step); else span.classList.remove('is-counting');
            })(t0);
        }, { threshold: 0.6 }).observe(span);
    }
    document.querySelectorAll('.course-stat-number, .page-subtitle').forEach(function (el) { countUp(el, 100); });
    document.querySelectorAll('.figure-number').forEach(function (el) { countUp(el, 10); });
})();
