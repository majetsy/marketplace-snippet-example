"use client";

import React, { useCallback, useEffect, useState, useMemo } from "react";
import { throttle } from "lodash";
import Image from "next/image";
import ProductCard from "@/app/components/product/ProductCard";
import { CAT_API } from "@/app/lib/actions";
import { GroupProductT, SearchResultT } from "@/app/lib/declaration";
import { useParams, useRouter } from "next/navigation";
import { useInView } from "react-intersection-observer";
import { useSearchStore } from "@/app/lib/store/searchStore";
import { detectScript, groupProducts } from "@/app/lib/helper";
import cyrillicToTranslit from "cyrillic-to-translit-js";
import Filter from "@/app/components/filter/Filter";
import { useSocketEvent, useSocketStore } from "@/app/socket";

export default function SingularSearchPage() {
  const router = useRouter();
  const { feild, item } = useParams<{ feild: string; item: string }>();
  const decodedItem = decodeURI(item || "");

  const {
    searchSectoredResult,
    handleSectoredSearchResult,
    lastSearch,
    setLastSearch,
  } = useSearchStore();
  const [realtimeStock, setRealtimeStock] = useState<Record<string, number>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(false);
  const [emptyResult, setEmptyResult] = useState(false);
  const [showScrollToTopButton, setShowScrollToTopButton] = useState(false);
  const [visibleIndices, setVisibleIndices] = useState<number[]>([]);
  const [filterQueries, setFilterQueries] = useState<
    { must: any[]; sort: any[] } | undefined
  >();
  // Memoize grouped data to prevent unnecessary recalculations
  const groupedData = useMemo(
    () => groupProducts(searchSectoredResult.products),
    [searchSectoredResult]
  );

  const handleInViewChange = useCallback((index: number, inView: boolean) => {
    setVisibleIndices((prev) => {
      if (inView && !prev.includes(index)) {
        return [...prev, index];
      } else if (!inView && prev.includes(index)) {
        return prev.filter((i) => i !== index);
      }
      return prev;
    });
  }, []);
  useSocketStore((s) => s.connect)();

  useSocketEvent<{ productId: string; stock: number }>(
    "stock_update",
    ({ productId, stock }) => {
      setRealtimeStock((prev) => ({
        ...prev,
        [productId]: stock,
      }));
    }
  );

  const fetchData = useCallback(
    async (field: string, value: string, filters?: any[], sort?: any[]) => {
      setIsLoading(true);

      const detectedScript = detectScript(value);
      let englishVersion = value;
      let cyrillicVersion = value;

      if (detectedScript === "Cyrillic") {
        englishVersion = cyrillicToTranslit({ preset: "ru" }).transform(value);
      } else if (detectedScript === "English") {
        cyrillicVersion = cyrillicToTranslit({ preset: "ru" }).reverse(value);
      }

      const query = {
        bool: {
          must: [
            {
              bool: {
                filter: {
                  bool: {
                    must: [
                      {
                        range: {
                          salePrice: { gt: 1 },
                        },
                      },
                      {
                        range: {
                          stock: { gte: 1 },
                        },
                      },
                    ],
                  },
                },
              },
            },
            {
              bool: {
                should: [
                  {
                    multi_match: {
                      query: value,
                      fields:
                        field === "search"
                          ? [
                              "brand.prefix^8",
                              "displayName.prefix^8",
                              "keywords.prefix^6",
                            ]
                          : [field],
                      type: "bool_prefix",
                    },
                  },
                  {
                    multi_match: {
                      query: englishVersion,
                      fields:
                        field === "search"
                          ? [
                              "brand.prefix^8",
                              "displayName.prefix^8",
                              "keywords.prefix^6",
                            ]
                          : [field],
                      type: "bool_prefix",
                    },
                  },
                  {
                    multi_match: {
                      query: cyrillicVersion,
                      fields:
                        field === "search"
                          ? [
                              "brand.prefix^8",
                              "displayName.prefix^8",
                              "keywords.prefix^6",
                            ]
                          : [field],
                      type: "bool_prefix",
                    },
                  },
                ],
              },
            },
          ],
        },
      };

      // custom filter
      if (filters && filters.length > 0) {
        query.bool.must = query.bool.must.concat(filters);
      }

      try {
        const result = await CAT_API.search({
          index: "products",
          _source: true,
          size: 100,
          query,
          aggs: {
            brands: {
              terms: {
                field: "brand.keyword",
              },
            },
            minPrice: {
              min: {
                field: "salePrice",
              },
            },
            maxPrice: {
              max: {
                field: "salePrice",
              },
            },
            options: {
              nested: {
                path: "mainOptions",
              },
              aggs: {
                byOptions: {
                  terms: {
                    field: "mainOptions.option",
                    size: 10,
                  },
                  aggs: {
                    byValues: {
                      terms: {
                        field: "mainOptions.value",
                        size: 10,
                      },
                    },
                  },
                },
              },
            },
            stores: {
              terms: {
                field: "storeId",
              },
            },
          },
          sort: sort || [],
        });

        const hits = result.data.result.hits.hits;
        const aggregations = result.data.result.aggregations;
        const products = hits.map(({ _source }) => _source);

        const tempObj: SearchResultT = {
          products,
          brands: [],
          maxPrice: 0,
          minPrice: 0,
          options: [],
          stores: [],
        };

        if (aggregations) {
          const { brands, maxPrice, minPrice, options, stores } = aggregations;
          if ("buckets" in brands) {
            tempObj.brands = brands.buckets.map((item: any) =>
              String(item.key)
            );
          }
          if ("value" in maxPrice) {
            tempObj.maxPrice = maxPrice.value || 0;
          }
          if ("value" in minPrice) {
            tempObj.minPrice = minPrice.value || 0;
          }

          if ("byOptions" in options) {
            tempObj.options = options.byOptions.buckets.map((bucket: any) => ({
              option: bucket.key,
              values: bucket.byValues.buckets.map(
                (valueBucket: any) => valueBucket.key
              ),
            }));
          }

          if (stores && "buckets" in stores) {
            tempObj.stores = stores.buckets.map((item: any) => ({
              storeId: String(item.key),
              count: item.doc_count,
            }));
          }
        }
        setEmptyResult(hits.length === 0);
        handleSectoredSearchResult(tempObj);
      } catch (error) {
        console.error("Search error:", error);
        setEmptyResult(true);
      } finally {
        setIsLoading(false);
      }
    },
    [handleSectoredSearchResult]
  );

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onScroll = useCallback(
    throttle(() => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;
      setShowScrollToTopButton(scrollTop > clientHeight);
    }, 100),
    []
  );

  useEffect(() => {
    window.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [onScroll]);

  useEffect(() => {
    if (!feild || !decodedItem) return;

    const filters = filterQueries?.must || [];
    const sort = filterQueries?.sort || [];

    const isSameFilters =
      JSON.stringify(lastSearch?.filters || []) === JSON.stringify(filters);
    const isSameSort =
      JSON.stringify(lastSearch?.sort || []) === JSON.stringify(sort);

    if (
      lastSearch?.feild === feild &&
      lastSearch?.item === decodedItem &&
      isSameFilters &&
      isSameSort
    ) {
      console.log("Skipping duplicate fetch — already fetched in store");
      return;
    }

    setLastSearch({
      feild,
      item: decodedItem,
      filters,
      sort,
    });
    fetchData(feild, decodedItem, filters, sort);
  }, [feild, decodedItem, fetchData, lastSearch, setLastSearch, filterQueries]);

  return (
    <div className="w-full h-full p-4 flex flex-col gap-4">
      {/* Header with back button and search input */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={router.back}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Go back"
        >
          <Image
            src="/arrowback.svg"
            alt="Back"
            width={24}
            height={24}
            priority
          />
        </button>
        <div
          className=" flex items-center justify-between w-full bg-secondary-100 py-2 px-3 rounded-[8px]"
          onClick={router.back}
        >
          <div className=" flex w-full items-center gap-2">
            <Image src="/search.svg" alt="search" width={20} height={20} />
            <span>{decodedItem}</span>
          </div>
          <div className=" pl-3 border-[#ABAFBD]">
            <Image
              src="/inputclear.svg"
              alt="inputclear"
              width={24}
              height={24}
            />
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-pulse text-center">
            <p>Loading results...</p>
          </div>
        </div>
      )}
      {/* Filter */}
      <Filter
        hidden={isLoading}
        {...searchSectoredResult}
        onChange={(filter) => setFilterQueries(filter)}
      />
      {/* Results grid */}
      {!isLoading && !emptyResult && (
        <div className="h-full overflow-y-auto grid grid-cols-2 gap-4">
          {groupedData.map((item, i) => (
            <Item
              key={item.groupId}
              index={i}
              data={item}
              onViewChange={handleInViewChange}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && emptyResult && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <p className="text-xl font-medium mb-2">Илэрц олдсонгүй</p>
          <p className="text-sm text-secondary-400">
            Та өөр утгаар хайж үзээрэй.
          </p>
        </div>
      )}

      {/* Scroll to top button */}
      {showScrollToTopButton && groupedData.length > 0 && (
        <button
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex items-center justify-center gap-2 h-12 px-4 py-2 rounded-full bg-black/60 text-white z-50 shadow-lg transition-opacity hover:bg-black/80"
          onClick={handleScrollTop}
          aria-label="Scroll to top"
        >
          <Image
            src="/scrolltop.svg"
            alt="Scroll to top"
            width={24}
            height={24}
          />
          <span className="text-sm whitespace-nowrap">
            Дээш буцах{" "}
            {visibleIndices.length > 0 ? Math.max(...visibleIndices) + 1 : 0}/
            {groupedData.length}
          </span>
        </button>
      )}
    </div>
  );
}

const Item = React.memo(
  ({
    index,
    data,
    onViewChange,
  }: {
    index: number;
    data: GroupProductT;
    onViewChange: (index: number, inView: boolean) => void;
  }) => {
    const { ref, inView } = useInView({
      threshold: 0.5,
      triggerOnce: false,
    });

    useEffect(() => {
      onViewChange(index, inView);
    }, [inView, index, onViewChange]);

    return (
      <div ref={ref}>
        <ProductCard
          {...data}
          stock={realtimeStock[data.productId] ?? data.stock}
        />
      </div>
    );
  }
);

Item.displayName = "SearchResultItem";
