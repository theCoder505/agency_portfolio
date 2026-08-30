import { useState, useMemo } from 'react';

interface PaginatedWrapper<T> {
    data: T[];
    [key: string]: any;
}

interface UseClientDataTableOptions<T> {
    items?: T[] | PaginatedWrapper<T> | null;
    data?: T[] | PaginatedWrapper<T> | null;
    pageSize?: number;
    initialPageSize?: number;
    searchFields?: (keyof T | string)[] | ((item: T) => (any[] | any));
    filterFn?: (item: T, search: string) => boolean;
    initialSearch?: string;
}

function getNestedValue(obj: any, path: string): any {
    if (!obj || !path) return undefined;
    return path.split('.').reduce((acc, part) => (acc !== null && acc !== undefined ? acc[part] : undefined), obj);
}

export function useClientDataTable<T extends Record<string, any>>({
    items,
    data,
    pageSize,
    initialPageSize,
    searchFields,
    filterFn,
    initialSearch = '',
}: UseClientDataTableOptions<T>) {
    const [search, setSearch] = useState(initialSearch);
    const [currentPage, setCurrentPage] = useState(1);

    const rawDataSource = data !== undefined ? data : items;
    const effectivePageSize = pageSize ?? initialPageSize ?? 10;

    // Normalize raw items array
    const rawItems: T[] = useMemo(() => {
        if (!rawDataSource) return [];
        if (Array.isArray(rawDataSource)) return rawDataSource;
        if (rawDataSource && Array.isArray((rawDataSource as PaginatedWrapper<T>).data)) {
            return (rawDataSource as PaginatedWrapper<T>).data;
        }
        return [];
    }, [rawDataSource]);

    // Filter items based on search
    const filteredItems = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return rawItems;

        if (filterFn) {
            return rawItems.filter((item) => filterFn(item, query));
        }

        if (typeof searchFields === 'function') {
            return rawItems.filter((item) => {
                const values = searchFields(item);
                const valArray = Array.isArray(values) ? values : [values];
                return valArray.some((val) => {
                    if (val === null || val === undefined) return false;
                    return String(val).toLowerCase().includes(query);
                });
            });
        }

        if (Array.isArray(searchFields) && searchFields.length > 0) {
            return rawItems.filter((item) => {
                return searchFields.some((field) => {
                    const fieldStr = String(field);
                    const val = fieldStr.includes('.') ? getNestedValue(item, fieldStr) : item[field as keyof T];
                    if (val === null || val === undefined) return false;
                    if (Array.isArray(val)) {
                        return val.some((v) => v !== null && v !== undefined && String(v).toLowerCase().includes(query));
                    }
                    return String(val).toLowerCase().includes(query);
                });
            });
        }

        // Default: search all values in object recursively or shallowly
        return rawItems.filter((item) => {
            return Object.values(item).some((val) => {
                if (val === null || val === undefined) return false;
                if (Array.isArray(val)) {
                    return val.some((v) => v !== null && v !== undefined && String(v).toLowerCase().includes(query));
                }
                if (typeof val === 'object') {
                    return Object.values(val).some(
                        (nestedVal) =>
                            nestedVal !== null &&
                            nestedVal !== undefined &&
                            typeof nestedVal !== 'object' &&
                            String(nestedVal).toLowerCase().includes(query)
                    );
                }
                return String(val).toLowerCase().includes(query);
            });
        });
    }, [rawItems, search, searchFields, filterFn]);

    // Reset to page 1 when search changes
    const handleSearchChange = (newSearch: string) => {
        setSearch(newSearch);
        setCurrentPage(1);
    };

    const clearSearch = () => {
        handleSearchChange('');
    };

    const handleImmediateSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
    };

    // Calculate pagination slices
    const totalItems = filteredItems.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / effectivePageSize));
    const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

    const startIndex = (validCurrentPage - 1) * effectivePageSize;
    const endIndex = Math.min(startIndex + effectivePageSize, totalItems);

    const paginatedItems = useMemo(() => {
        return filteredItems.slice(startIndex, endIndex);
    }, [filteredItems, startIndex, endIndex]);

    const from = totalItems > 0 ? startIndex + 1 : 0;
    const to = endIndex;

    return {
        search,
        setSearch: handleSearchChange,
        clearSearch,
        handleClear: clearSearch,
        handleImmediateSearch,
        currentPage: validCurrentPage,
        setCurrentPage,
        totalPages,
        totalItems,
        total: totalItems,
        from,
        to,
        paginatedItems,
        paginatedData: paginatedItems,
        data: paginatedItems,
        filteredItems,
        filteredData: filteredItems,
    };
}
