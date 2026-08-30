import { useState, useEffect, useRef, useCallback } from 'react';
import { router } from '@inertiajs/react';

interface UseDebouncedSearchOptions {
    initialValue?: string;
    delay?: number;
    onSearch: (searchTerm: string) => void;
}

export function useDebouncedSearch({
    initialValue = '',
    delay = 300,
    onSearch,
}: UseDebouncedSearchOptions) {
    const [search, setSearch] = useState(initialValue);
    const isFirstRender = useRef(true);
    const callbackRef = useRef(onSearch);
    callbackRef.current = onSearch;

    // Keep state in sync if initialValue changes externally (e.g. navigation / filter reset)
    useEffect(() => {
        setSearch(initialValue || '');
    }, [initialValue]);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const handler = setTimeout(() => {
            callbackRef.current(search);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [search, delay]);

    const handleClear = useCallback(() => {
        setSearch('');
        callbackRef.current('');
    }, []);

    const handleImmediateSearch = useCallback(
        (e?: React.FormEvent) => {
            if (e) e.preventDefault();
            callbackRef.current(search);
        },
        [search]
    );

    return {
        search,
        setSearch,
        handleClear,
        handleImmediateSearch,
    };
}
