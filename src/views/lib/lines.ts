import LeaderLine from "leader-line";
import _ from "lodash";

let lineCache: { [key: string]: any } = {};

interface Opts {
	key: string;
	[leaderLineOpt: string]: any;
}

const scrollHandler = () => {
	Object.values(lineCache).forEach((l) => {
		l.position();
	});
};

export function showLine(opts: Opts) {
	if (opts.start instanceof HTMLElement && opts.end instanceof HTMLElement) {
		const m = document.querySelector(".v-main");
		const s = document.querySelector(".sidebar-content");
		if (m !== null && s !== null) {
			m.removeEventListener("scroll", scrollHandler);
			m.addEventListener("scroll", scrollHandler);
			s.removeEventListener("scroll", scrollHandler);
			s.addEventListener("scroll", scrollHandler);
		}
		lineCache[opts.key] = new LeaderLine({
			startPlug: "disc",
			endPlug: "disc",
			startSocket: "left",
			endSocket: "right",
			color: "#89dfa3",
			..._.omit(opts, "key"),
		});
	} else {
		console.warn("Non-Element passed to showLine Method.");
	}
}

export function removeLine(key: string) {
	if (lineCache[key] !== undefined) {
		lineCache[key].remove();
		delete lineCache[key];
	}
	console.log("lines is now", Object.values(lineCache));
}

export function hideLine(key: string) {
	if (lineCache[key] !== undefined) {
		lineCache[key].hide("fade");
		setTimeout(() => {
			removeLine(key);
		}, 300);
	}
}

export function hideAllLines(except: string) {
	Object.keys(lineCache).forEach((id) => {
		if (id !== except) {
			lineCache[id].hide("fade");
			setTimeout(() => removeLine(id), 300);
		}
	});
	lineCache = {};
}
