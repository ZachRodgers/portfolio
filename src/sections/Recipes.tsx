import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpToLine, ArrowUp, ArrowDown, ChevronDown } from 'lucide-react';
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

const Recipes: React.FC = () => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [completedSteps, setCompletedSteps] = useState<Record<string, boolean[]>>({});
    const [activeIndex, setActiveIndex] = useState(0);
    const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean[]>>({});
    const [showFloatingNav, setShowFloatingNav] = useState(false);
    const gridRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        document.title = 'Recipes | Zach Rodgers';
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

    const renderInstructionItems = (recipe: Recipe & { anchorId: string }) => {
        let displayCounter = 0;

        return normalizeList(recipe.instructions).map((step, index, arr) => {
            const isDone = completedSteps[recipe.anchorId]?.[index];
            const isHeat = step.trim().toLowerCase().startsWith('preheat');
            const displayNumber = isHeat ? null : ++displayCounter;

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
                    <p>{formatFractions(step)}</p>
                </li>
            );
        });
    };

    return (
        <div className="recipes-page">
            <div className="component-container recipes-header">
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
                        Add your first entry to <code>recipes.json</code> to see it here.
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
                                            <h2>Ingredients</h2>
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
                                                            const { label, detail } = splitIngredientLabel(item);
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
                                                {renderInstructionItems(recipe)}
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
