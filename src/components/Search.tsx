import { useId, useMemo, useState } from "react";

/** A calculator pre-localized on the server, ready to render and filter. */
export interface SearchItem {
	id: string;
	href: string;
	title: string;
	description: string;
	/** Localized category label, included in the searchable haystack. */
	category: string;
}

interface Props {
	items: SearchItem[];
	/** Placeholder from ui(locale).searchPlaceholder. */
	placeholder: string;
	/** Empty-state message from ui(locale).searchEmpty. */
	emptyText: string;
	/** Accessible label for the search input. */
	label: string;
}

/**
 * Homepage search island. Filters a pre-localized calculator list instantly as
 * the user types (matching localized title + description + category). It renders
 * its own labelled input and the filtered `.calc-card` grid, reusing the same
 * markup the server emits so the progressive-enhancement swap is seamless.
 *
 * SSR-safe: the initial render (empty query) shows every item, so the full card
 * grid is present in the static HTML for SEO even before JS hydrates.
 */
export default function Search({ items, placeholder, emptyText, label }: Props) {
	const [query, setQuery] = useState("");
	const inputId = useId();

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return items;
		return items.filter((it) =>
			`${it.title} ${it.description} ${it.category}`.toLowerCase().includes(q),
		);
	}, [items, query]);

	return (
		<div className="home-search">
			<label className="search-label" htmlFor={inputId}>
				{label}
			</label>
			<input
				id={inputId}
				className="search-input"
				type="search"
				autoComplete="off"
				placeholder={placeholder}
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				aria-label={label}
			/>

			{filtered.length === 0 ? (
				<p className="search-empty" role="status">
					{emptyText}
				</p>
			) : (
				<div className="card-grid" role="list">
					{filtered.map((it) => (
						<a key={it.id} className="calc-card" href={it.href} role="listitem">
							<h3>{it.title}</h3>
							<p>{it.description}</p>
						</a>
					))}
				</div>
			)}
		</div>
	);
}
