import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpToLine, ArrowUp, ArrowDown, ChevronDown, X } from 'lucide-react';
import Footer from '../components/Footer';
import './Recipes.css';

type Recipe = {
    title: string;
    image: string;
    section: string;
    ingredients?: string[] | string | IngredientSection[];
    instructions?: string[] | string;
    tag?: string;
};

type IngredientSection = {
    title?: string;
    items: string[];
};

type RecipesData = {
    recipes?: Recipe[];
};

const normalizeList = (items?: string[] | string): string[] => {
    if (Array.isArray(items)) {
        return items;
    }

    if (typeof items === 'string') {
        return items
            .split(/\r?\n/)
            .map((item) => item.trim())
            .filter(Boolean);
    }

    return [];
};

const createAnchorId = (title: string, index: number) => {
    const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    return `recipe-${index}-${slug || 'item'}`;
};

const formatIngredientSections = (ingredients?: string[] | string | IngredientSection[]): IngredientSection[] => {
    if (!ingredients) return [];

    if (Array.isArray(ingredients)) {
        const isSectioned = (ingredients as Array<string | IngredientSection>).every(
            (item): item is IngredientSection => typeof item === 'object' && item !== null && 'items' in item
        );

        if (isSectioned) {
            return (ingredients as IngredientSection[]).map((section) => ({
                title: section.title,
                items: Array.isArray(section.items) ? section.items : normalizeList(section.items as string[] | string)
            }));
        }
    }

    const list = normalizeList(ingredients as string[] | string);
    return list.length ? [{ title: undefined, items: list }] : [];
};

const splitIngredientLabel = (text: string) => {
    const match = text.split(':');
    if (match.length > 1) {
        const [label, ...rest] = match;
        return { label: label.trim(), detail: rest.join(':').trim() };
    }
    return { label: undefined, detail: text };
};

const splitDetailNote = (detail: string) => {
    const noteMatch = detail.match(/^(.*?),\s*([a-zA-Z ]+)$/);
    if (noteMatch) {
        return { main: noteMatch[1].trim(), note: noteMatch[2].trim() };
    }
    return { main: detail, note: undefined };
};

const formatFractions = (text: string) => {
    const map: Record<string, string> = {
        '1/2': '½',
        '1/3': '⅓',
        '2/3': '⅔',
        '1/4': '¼',
        '3/4': '¾',
        '1/5': '⅕',
        '2/5': '⅖',
        '3/5': '⅗',
        '4/5': '⅘',
        '1/6': '⅙',
        '5/6': '⅚',
        '1/8': '⅛',
        '3/8': '⅜',
        '5/8': '⅝',
        '7/8': '⅞'
    };

    return text.replace(/\b(?:1\/2|1\/3|2\/3|1\/4|3\/4|1\/5|2\/5|3\/5|4\/5|1\/6|5\/6|1\/8|3\/8|5\/8|7\/8)\b/g, (match) => map[match] || match);
};

const unicodeFractions: Record<string, string> = {
    '½': '1/2',
    '⅓': '1/3',
    '⅔': '2/3',
    '¼': '1/4',
    '¾': '3/4',
    '⅕': '1/5',
    '⅖': '2/5',
    '⅗': '3/5',
    '⅘': '4/5',
    '⅙': '1/6',
    '⅚': '5/6',
    '⅛': '1/8',
    '⅜': '3/8',
    '⅝': '5/8',
    '⅞': '7/8'
};

const normalizeUnicodeFractions = (text: string) =>
    text.replace(/[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]/g, (char) => unicodeFractions[char] || char);

const stripPluses = (text: string) => text.replace(/\+/g, '');

const parseQuantity = (value: string): number | null => {
    const normalized = normalizeUnicodeFractions(stripPluses(value).trim()).replace(/[–—]/g, '-');
    if (!normalized) return null;

    const mixedMatch = normalized.match(/^(\d+)\s+(\d+)\/(\d+)$/);
    if (mixedMatch) {
        const whole = parseFloat(mixedMatch[1]);
        const num = parseFloat(mixedMatch[2]);
        const den = parseFloat(mixedMatch[3]);
        if (den === 0) return null;
        return whole + num / den;
    }

    const fracMatch = normalized.match(/^(\d+)\/(\d+)$/);
    if (fracMatch) {
        const num = parseFloat(fracMatch[1]);
        const den = parseFloat(fracMatch[2]);
        if (den === 0) return null;
        return num / den;
    }

    const simple = normalized.match(/^\d+(?:\.\d+)?$/);
    if (simple) return parseFloat(normalized);

    return null;
};

const gcd = (a: number, b: number): number => {
    let x = Math.abs(a);
    let y = Math.abs(b);
    while (y) {
        const temp = y;
        y = x % y;
        x = temp;
    }
    return x || 1;
};

const reduceFractionString = (text: string) => {
    let cleaned = text;

    // Collapse chained fractions like "1/2/2" -> 1/(2*2) -> 1/4
    cleaned = cleaned.replace(/(\d+)\s*\/\s*(\d+)\s*\/\s*(\d+)/g, (_, a, b, c) => {
        const num = parseInt(a, 10);
        const den = parseInt(b, 10) * parseInt(c, 10);
        const divisor = gcd(num, den);
        return `${num / divisor}/${den / divisor}`;
    });

    // Reduce simple fractions like 2/8 -> 1/4
    cleaned = cleaned.replace(/(\d+)\s*\/\s*(\d+)/g, (_, a, b) => {
        const num = parseInt(a, 10);
        const den = parseInt(b, 10);
        if (den === 0) return `${num}/${den}`;
        const divisor = gcd(num, den);
        return `${num / divisor}/${den / divisor}`;
    });

    return cleaned;
};

const formatQuantity = (value: number) => {
    const denominators = [2, 3, 4, 8];
    const whole = Math.floor(value + 1e-6);
    const frac = value - whole;

    let best = { diff: Number.POSITIVE_INFINITY, denom: 1, num: 0 };
    denominators.forEach((denom) => {
        const num = Math.round(frac * denom);
        const approx = num / denom;
        const diff = Math.abs(approx - frac);
        if (diff < best.diff) best = { diff, denom, num };
    });

    let fractionPart = '';
    if (best.num !== 0) {
        const divisor = gcd(best.num, best.denom);
        const reducedNum = best.num / divisor;
        const reducedDen = best.denom / divisor;
        const fractionMap: Record<string, string> = {
            '1/2': '1/2',
            '1/3': '1/3',
            '2/3': '2/3',
            '1/4': '1/4',
            '3/4': '3/4',
            '1/8': '1/8',
            '3/8': '3/8',
            '5/8': '5/8',
            '7/8': '7/8'
        };
        const fracString = `${reducedNum}/${reducedDen}`;
        fractionPart = fractionMap[fracString] || fracString;
    }

    if (whole === 0 && fractionPart) return fractionPart;
    if (fractionPart) return `${whole} ${fractionPart}`.trim();

    const rounded = Math.round(value * 100) / 100;
    return `${rounded}`;
};

const scaleValueString = (input: string, multiplier: number) => {
    const value = parseQuantity(input);
    if (value === null) return input;
    return formatQuantity(value * multiplier);
};

const scaleRangeString = (match: string, multiplier: number) => {
    const normalized = stripPluses(match).replace(/[–—]/g, '-');
    const rangeParts = normalized.split('-').map((part) => part.trim()).filter(Boolean);
    if (rangeParts.length === 2) {
        const first = scaleValueString(rangeParts[0], multiplier);
        const second = scaleValueString(rangeParts[1], multiplier);
        return `${first}-${second}`;
    }
    return scaleValueString(match, multiplier);
};

// prioritize fractions/mixed numbers before plain integers so we capture the full quantity
const quantityPattern = '(?:\\d+\\s+\\d+\\/\\d+|\\d+\\/\\d+|\\d+(?:\\.\\d+)?|[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])\\+?';
const rangePattern = `${quantityPattern}(?:\\s*[–—-]\\s*${quantityPattern})?`;
const measurementUnits =
    '(cups?|cup|tbsp\\.?|tablespoons?|tbs\\.?|tsp\\.?|teaspoons?|lbs?\\.?|pounds?|oz\\.?|ounces?|grams?|g\\b|kg\\b|ml\\b|l\\b|liters?|teaspoons?|tablespoons?|cloves?|eggs?|cans?|packages?|pkgs?|pkg|slices?|pieces?|sprigs?|leaves?|fillets?|filets?|breasts?|thighs?|drumsticks?|ribs?|sticks?|heads?|cups?|noodles?|lasagna)';

const scaleIngredientText = (text: string, multiplier: number) => {
    const regex = new RegExp(`(${rangePattern})(\\s*)(?=${measurementUnits}\\b)?`, 'gi');
    const scaled = text.replace(regex, (_, qty: string, space: string) => {
        const value = scaleRangeString(qty, multiplier);
        const spacer = space && space.length > 0 ? space : ' ';
        return `${value}${spacer}`;
    });
    return reduceFractionString(scaled);
};

const scaleInstructionText = (text: string, multiplier: number) => {
    const regex = new RegExp(`\\b(${rangePattern})(\\s*)(?=${measurementUnits}\\b)`, 'gi');
    const scaled = text.replace(regex, (_, qty: string, space: string) => {
        const value = scaleRangeString(qty, multiplier);
        const spacer = space && space.length > 0 ? space : ' ';
        return `${value}${spacer}`;
    });
    return reduceFractionString(scaled);
};

const Recipes: React.FC = () => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [completedSteps, setCompletedSteps] = useState<Record<string, boolean[]>>({});
    const [activeIndex, setActiveIndex] = useState(0);
    const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean[]>>({});
    const [showFloatingNav, setShowFloatingNav] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);
    const [searchHover, setSearchHover] = useState(false);
    const hideResultsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [multipliers, setMultipliers] = useState<Record<string, number>>({});
    const [openMultiplier, setOpenMultiplier] = useState<string | null>(null);
    const [searchResults, setSearchResults] = useState<
        { anchorId: string; title: string; image: string; section?: string; snippet?: string; type: 'title' | 'text' }[]
    >([]);
    const gridRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        document.title = 'Recipes | Zach Rodgers';
    }, []);

    useEffect(() => {
        return () => {
            if (hideResultsTimeout.current) {
                clearTimeout(hideResultsTimeout.current);
            }
        };
    }, []);

    useEffect(() => {
        const loadRecipes = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const basePath = (process.env.PUBLIC_URL || '').replace(/\/$/, '');
                const response = await fetch(`${basePath}/assets/recipes/recipes.json`);

                if (!response.ok) {
                    throw new Error('Request failed');
                }

                const payload = (await response.json()) as RecipesData | Recipe[];
                const parsedRecipes = Array.isArray(payload)
                    ? payload
                    : Array.isArray(payload.recipes)
                    ? payload.recipes
                    : [];

                setRecipes(parsedRecipes);
            } catch (err) {
                setError('Unable to load recipes right now. Please check recipes.json.');
            } finally {
                setIsLoading(false);
            }
        };

        loadRecipes();
    }, []);

    const anchoredRecipes = useMemo(
        () =>
            recipes.map((recipe, index) => ({
                ...recipe,
                anchorId: createAnchorId(recipe.title, index)
            })),
        [recipes]
    );

    const groupedSections = useMemo(() => {
        const sections: { name: string; recipes: (Recipe & { anchorId: string })[] }[] = [];

        anchoredRecipes.forEach((recipe) => {
            const sectionName = recipe.section?.trim() || 'Recipes';
            const existingSection = sections.find((section) => section.name === sectionName);

            if (existingSection) {
                existingSection.recipes.push(recipe);
            } else {
                sections.push({
                    name: sectionName,
                    recipes: [recipe]
                });
            }
        });

        return sections;
    }, [anchoredRecipes]);

    const resolveImagePath = (image: string) => {
        if (!image) return '';
        if (image.startsWith('http')) return image;
        if (image.startsWith('/')) return image;
        return `/assets/recipes/${image}`;
    };

    const handleTileClick = (anchorId: string) => {
        const target = document.getElementById(anchorId);

        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const scrollToIndex = (nextIndex: number) => {
        if (nextIndex < 0 || nextIndex >= anchoredRecipes.length) return;
        const anchorId = anchoredRecipes[nextIndex].anchorId;
        handleTileClick(anchorId);
    };

    useEffect(() => {
        const updateScrollState = () => {
            const scrollPos = window.scrollY + 160;
            let closest = -1;
            let min = Number.POSITIVE_INFINITY;

            anchoredRecipes.forEach((recipe, index) => {
                const el = document.getElementById(recipe.anchorId);
                if (!el) return;
                const offset = el.getBoundingClientRect().top + window.scrollY;
                const dist = Math.abs(offset - scrollPos);
                if (dist < min) {
                    min = dist;
                    closest = index;
                }
            });

            if (closest !== -1) {
                setActiveIndex(closest);
            }

            const gridEl = gridRef.current;
            if (gridEl) {
                const rect = gridEl.getBoundingClientRect();
                const gridBottom = rect.bottom + window.scrollY;
                const scrolledPastGrid = window.scrollY > gridBottom;
                setShowFloatingNav((prev) => (prev !== scrolledPastGrid ? scrolledPastGrid : prev));
            } else {
                setShowFloatingNav(false);
            }
        };

        updateScrollState();
        window.addEventListener('scroll', updateScrollState, { passive: true });
        return () => window.removeEventListener('scroll', updateScrollState);
    }, [anchoredRecipes]);

    const handleScrollTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSearchSelect = (anchorId: string) => {
        handleTileClick(anchorId);
    };

    const toggleStep = (anchorId: string, stepIndex: number, totalSteps: number) => {
        setCompletedSteps((prev) => {
            const existing = prev[anchorId] || Array(totalSteps).fill(false);
            const next = [...existing];
            next[stepIndex] = !next[stepIndex];
            return { ...prev, [anchorId]: next };
        });
    };

    const toggleIngredientSection = (anchorId: string, sectionIndex: number) => {
        setCollapsedSections((prev) => {
            const existing = prev[anchorId] || [];
            const next = [...existing];
            next[sectionIndex] = !next[sectionIndex];
            return { ...prev, [anchorId]: next };
        });
    };

    const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const buildSnippet = (text: string, query: string) => {
        const lower = text.toLowerCase();
        const idx = lower.indexOf(query.toLowerCase());
        if (idx === -1) return text;

        const start = Math.max(0, idx - 25);
        const end = Math.min(text.length, idx + query.length + 40);
        const snippet = (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '');
        return snippet;
    };

    const highlightMatches = (text: string, query: string) => {
        if (!query) return text;
        const regex = new RegExp(`(${escapeRegExp(query)})`, 'ig');
        const parts = text.split(regex);
        return parts.map((part, idx) =>
            idx % 2 === 1 ? (
                <mark key={idx} className="search-highlight">
                    {part}
                </mark>
            ) : (
                <span key={idx}>{part}</span>
            )
        );
    };

    useEffect(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) {
            setSearchResults([]);
            return;
        }

        const titleMatches = anchoredRecipes
            .map((recipe) => {
                const idx = recipe.title.toLowerCase().indexOf(query);
                if (idx === -1) return null;
                const sectionName = (recipe.section || 'Recipes').trim();
                return {
                    anchorId: recipe.anchorId,
                    title: recipe.title,
                    image: recipe.image,
                    section: sectionName,
                    snippet: recipe.title,
                    matchIndex: idx,
                    type: 'title' as const
                };
            })
            .filter(Boolean) as {
            anchorId: string;
            title: string;
            image: string;
            section?: string;
            snippet?: string;
            matchIndex: number;
            type: 'title';
        }[];

        if (titleMatches.length > 0) {
            const sorted = titleMatches
                .sort((a, b) => a.matchIndex - b.matchIndex || a.title.localeCompare(b.title))
                .slice(0, 10)
                .map(({ matchIndex, ...rest }) => rest);
            setSearchResults(sorted);
            return;
        }

        const textMatches: {
            anchorId: string;
            title: string;
            image: string;
            section?: string;
            snippet?: string;
            type: 'text';
        }[] = [];

        anchoredRecipes.forEach((recipe) => {
            const segments: string[] = [];
            segments.push(...normalizeList(recipe.instructions));

            const formattedIngredients = formatIngredientSections(recipe.ingredients).flatMap((section) =>
                section.items.map((item) => {
                    const { label, detail } = splitIngredientLabel(item);
                    const { main, note } = splitDetailNote(detail);
                    const combined = `${label ? `${label}: ` : ''}${main}${note ? ` ${note}` : ''}`;
                    return combined.trim();
                })
            );
            segments.push(...formattedIngredients);

            const matchText = segments.find((text) => text.toLowerCase().includes(query));
            if (matchText) {
                textMatches.push({
                    anchorId: recipe.anchorId,
                    title: recipe.title,
                    image: recipe.image,
                    section: (recipe.section || 'Recipes').trim(),
                    snippet: buildSnippet(matchText, query),
                    type: 'text'
                });
            }
        });

        setSearchResults(textMatches.slice(0, 5));
    }, [searchQuery, anchoredRecipes]);

    const renderInstructionItems = (recipe: Recipe & { anchorId: string }, multiplier: number) => {
        let displayCounter = 0;

        return normalizeList(recipe.instructions).map((step, index, arr) => {
            const isDone = completedSteps[recipe.anchorId]?.[index];
            const isHeat = step.trim().toLowerCase().startsWith('preheat');
            const displayNumber = isHeat ? null : ++displayCounter;
            const scaledStep = scaleInstructionText(step, multiplier);

            return (
                <li key={index} className={`instruction-step ${isDone ? 'step-done' : ''}`}>
                    <button
                        type="button"
                        className={`step-check ${isDone ? 'checked' : ''}`}
                        onClick={() => toggleStep(recipe.anchorId, index, arr.length)}
                        aria-label={
                            displayNumber !== null
                                ? `Mark step ${displayNumber} as ${isDone ? 'not done' : 'done'}`
                                : `Mark heat step as ${isDone ? 'not done' : 'done'}`
                        }
                    >
                        {isHeat ? (
                            <img
                                src="/assets/recipes/icons/heat.svg"
                                alt=""
                                aria-hidden="true"
                                className="heat-icon"
                            />
                        ) : (
                            <span>{displayNumber}</span>
                        )}
                    </button>
                    <p>{formatFractions(scaledStep)}</p>
                </li>
            );
        });
    };

        return (
            <div className="recipes-page">
                <div className="component-container recipes-header">
                </div>

                <div className="component-container recipes-search-bar">
                    <input
                        type="text"
                        className="recipes-search-input"
                        placeholder="Search recipes or ingredients..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => {
                            if (hideResultsTimeout.current) {
                                clearTimeout(hideResultsTimeout.current);
                            }
                            setSearchFocused(true);
                        }}
                        onBlur={() => {
                            hideResultsTimeout.current = setTimeout(() => setSearchFocused(false), 120);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && searchResults[0]) {
                                e.preventDefault();
                                handleSearchSelect(searchResults[0].anchorId);
                            }
                        }}
                        aria-label="Search recipes"
                    />
                    {searchQuery && (
                        <button type="button" className="recipes-search-clear" onClick={() => setSearchQuery('')} aria-label="Clear search">
                            <X size={16} />
                        </button>
                    )}
                    {searchQuery && (searchFocused || searchHover) && (
                        <div
                            className="recipes-search-results"
                            onMouseEnter={() => {
                                if (hideResultsTimeout.current) {
                                    clearTimeout(hideResultsTimeout.current);
                                }
                                setSearchHover(true);
                            }}
                            onMouseLeave={() => {
                                hideResultsTimeout.current = setTimeout(() => setSearchHover(false), 120);
                            }}
                        >
                            <div className="recipes-search-meta">
                                {searchResults.length > 0 ? `${searchResults.length} result${searchResults.length === 1 ? '' : 's'}` : 'No matches yet'}
                            </div>
                            {searchResults.length > 0 && (
                                <ul className="recipes-search-list">
                                    {searchResults.map((result) => (
                                        <li key={result.anchorId}>
                                            <button
                                                type="button"
                                                className="recipes-search-item"
                                                onClick={() => handleSearchSelect(result.anchorId)}
                                            >
                                                <img
                                                    src={resolveImagePath(result.image)}
                                                    alt=""
                                                    aria-hidden="true"
                                                    loading="lazy"
                                                    className="recipes-search-thumb"
                                                />
                                                <div className="recipes-search-text">
                                                    <span className="recipes-search-title">
                                                        {result.type === 'title' ? result.title : result.title}
                                                    </span>
                                                    {result.section && (
                                                        <span className="recipes-search-category">{result.section}</span>
                                                    )}
                                                    {result.type === 'text' && result.snippet && (
                                                        <span className="recipes-search-snippet">
                                                            {highlightMatches(result.snippet, searchQuery)}
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>

                {!isLoading && !error && anchoredRecipes.length > 0 && (
                    <div className={`recipes-floating-nav ${showFloatingNav ? 'visible' : ''}`}>
                        <button
                            type="button"
                            className="floating-btn"
                        onClick={handleScrollTop}
                        aria-label="Back to top"
                    >
                        <ArrowUpToLine size={16} />
                    </button>
                    <button
                        type="button"
                        className="floating-btn"
                        onClick={() => scrollToIndex(activeIndex - 1)}
                        disabled={activeIndex <= 0}
                        aria-label="Previous recipe"
                    >
                        <ArrowUp size={16} />
                    </button>
                    <button
                        type="button"
                        className="floating-btn"
                        onClick={() => scrollToIndex(activeIndex + 1)}
                        disabled={activeIndex >= anchoredRecipes.length - 1}
                        aria-label="Next recipe"
                    >
                        <ArrowDown size={16} />
                    </button>
                </div>
            )}

            <div className="component-container">
                {isLoading && <p className="recipes-status">Loading recipes...</p>}
                {!isLoading && error && <p className="recipes-status">{error}</p>}
                {!isLoading && !error && anchoredRecipes.length === 0 && (
                    <p className="recipes-status">
                        No recipes found.
                    </p>
                )}

                {!isLoading && !error && anchoredRecipes.length > 0 && (
                    <div className="recipes-grid" ref={gridRef}>
                        {anchoredRecipes.map((recipe) => (
                            <button
                                key={recipe.anchorId}
                                type="button"
                                className="recipe-tile"
                                onClick={() => handleTileClick(recipe.anchorId)}
                                onMouseEnter={(event) => {
                                    const rect = event.currentTarget.getBoundingClientRect();
                                    const x = event.clientX - rect.left;
                                    const y = event.clientY - rect.top;
                                    const cornerThreshold = 0.18;
                                    const relX = x / rect.width;
                                    const relY = y / rect.height;

                                    let flip: string = 'left';

                                    if (relX < cornerThreshold && relY < cornerThreshold) {
                                        flip = 'diag-tl';
                                    } else if (relX > 1 - cornerThreshold && relY < cornerThreshold) {
                                        flip = 'diag-tr';
                                    } else if (relX < cornerThreshold && relY > 1 - cornerThreshold) {
                                        flip = 'diag-bl';
                                    } else if (relX > 1 - cornerThreshold && relY > 1 - cornerThreshold) {
                                        flip = 'diag-br';
                                    } else {
                                        const distances = {
                                            left: x,
                                            right: rect.width - x,
                                            top: y,
                                            bottom: rect.height - y
                                        };

                                        const closest = Object.entries(distances).sort((a, b) => a[1] - b[1])[0]?.[0];
                                        flip = closest || 'left';
                                    }

                                    event.currentTarget.dataset.flip = flip;
                                }}
                                onFocus={(event) => {
                                    event.currentTarget.dataset.flip = 'left';
                                }}
                                aria-label={`View ${recipe.title}`}
                            >
                                <div className="tile-inner">
                                    <div className="tile-face tile-front">
                                        <img src={resolveImagePath(recipe.image)} alt={recipe.title} loading="lazy" />
                                    </div>
                                    <div className="tile-face tile-back">
                                        <img src={resolveImagePath(recipe.image)} alt="" aria-hidden="true" loading="lazy" />
                                        <span className="tile-name">{recipe.title}</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {!isLoading && !error && groupedSections.length > 0 && (
                <div className="component-container">
                    {groupedSections.map((section) => (
                        <div key={section.name} className="recipe-section">
                            <h2 className="recipe-section-title">{section.name}</h2>
                            {section.recipes.map((recipe) => (
                                <article key={recipe.anchorId} id={recipe.anchorId} className="recipe-detail">
                                    <h1 className="recipe-title">
                                        {recipe.tag && <span className="unbeatable-badge">{recipe.tag}</span>}
                                        {recipe.title}
                                    </h1>
                                    <div className="recipe-detail-grid">
                                        <div className="recipe-image">
                                            <img src={resolveImagePath(recipe.image)} alt={recipe.title} loading="lazy" />
                                        </div>
                                        <div className="recipe-ingredients">
                                            <div className="ingredients-header">
                                            <h2>Ingredients</h2>
                                            <div className={`ingredient-scale ${openMultiplier === recipe.anchorId ? 'open' : ''}`}>
                                                {([0.5, 1, 2, 3] as const).map((val, idx) => {
                                                    const isOpen = openMultiplier === recipe.anchorId;
                                                    const isActive = (multipliers[recipe.anchorId] || 1) === val;
                                                    const classes = `scale-pill ${isActive ? 'selected primary-pill' : 'option-pill'} ${
                                                        isOpen && isActive ? 'active' : ''
                                                    }`;
                                                    const label = val === 0.5 ? '½' : val;
                                                    return (
                                                        <button
                                                            key={val}
                                                            type="button"
                                                            className={classes}
                                                            style={{ ['--slot' as any]: idx }}
                                                            onClick={() => {
                                                                if (isActive) {
                                                                    setOpenMultiplier((prev) =>
                                                                        prev === recipe.anchorId ? null : recipe.anchorId
                                                                    );
                                                                } else {
                                                                    setMultipliers((prev) => ({ ...prev, [recipe.anchorId]: val }));
                                                                    setOpenMultiplier(null);
                                                                }
                                                            }}
                                                        >
                                                            x{label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        {formatIngredientSections(recipe.ingredients).map((section, secIdx) => (
                                            <div key={secIdx} className="ingredient-section">
                                                    {section.title ? (
                                                        <button
                                                            type="button"
                                                            className="ingredient-section-header"
                                                            onClick={() => toggleIngredientSection(recipe.anchorId, secIdx)}
                                                            aria-expanded={!collapsedSections[recipe.anchorId]?.[secIdx]}
                                                            aria-controls={`${recipe.anchorId}-section-${secIdx}`}
                                                        >
                                                            <ChevronDown
                                                                size={16}
                                                                className={`section-chevron ${collapsedSections[recipe.anchorId]?.[secIdx] ? 'collapsed' : ''}`}
                                                            />
                                                            <span className="ingredient-section-title">{section.title}</span>
                                                        </button>
                                                    ) : null}
                                                    <ul
                                                        id={`${recipe.anchorId}-section-${secIdx}`}
                                                        className={`ingredient-list ${collapsedSections[recipe.anchorId]?.[secIdx] ? 'collapsed' : ''}`}
                                                    >
                                                        {section.items.map((item, index) => {
                                                            const multiplier = multipliers[recipe.anchorId] || 1;
                                                            const scaledItem = scaleIngredientText(item, multiplier);
                                                            const { label, detail } = splitIngredientLabel(scaledItem);
                                                            const { main, note } = splitDetailNote(detail);
                                                            return (
                                                                <li key={index}>
                                                                    {label && <span className="ingredient-label">{label}:</span>}{' '}
                                                                    <span className="ingredient-detail">{formatFractions(main)}</span>
                                                                    {note && <span className="ingredient-note"> {formatFractions(note)}</span>}
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="recipe-instructions">
                                            <h2>Instructions</h2>
                                            <ul className="instruction-list">
                                                {renderInstructionItems(recipe, multipliers[recipe.anchorId] || 1)}
                                            </ul>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ))}
                </div>
            )}
            <Footer variant="light" />
        </div>
    );
};

export default Recipes;
