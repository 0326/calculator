/*
 * FinCalc embed loader (PRD §10.2).
 * Usage on a partner site:
 *   <div data-fincalc="mortgage"></div>
 *   <script async src="https://example.com/embed.js"></script>
 * Each placeholder is replaced by a responsive iframe of the matching calculator.
 */
(function () {
	var ORIGIN = (function () {
		try {
			return new URL(document.currentScript.src).origin;
		} catch (e) {
			return "https://example.com";
		}
	})();

	function mount(el) {
		if (el.getAttribute("data-fincalc-ready")) return;
		var id = el.getAttribute("data-fincalc");
		if (!id) return;
		var iframe = document.createElement("iframe");
		iframe.src = ORIGIN + "/embed/" + encodeURIComponent(id);
		iframe.width = "100%";
		iframe.height = el.getAttribute("data-height") || "640";
		iframe.loading = "lazy";
		iframe.title = "FinCalc calculator";
		iframe.style.cssText = "border:1px solid #e2e8f0;border-radius:12px;max-width:720px";
		el.appendChild(iframe);
		el.setAttribute("data-fincalc-ready", "1");
	}

	function init() {
		var nodes = document.querySelectorAll("[data-fincalc]");
		for (var i = 0; i < nodes.length; i++) mount(nodes[i]);
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
