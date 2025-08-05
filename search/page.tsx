"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import SearchInput from "../components/search/SearchInput";
import { CAT_API } from "../lib/actions";
import HighlightResult from "../components/search/HighlightResult";
import { useRouter } from "next/navigation";
import Transition from "../components/Transition";
import { useSearchStore } from "../lib/store/searchStore";
import cyrillicToTranslit from "cyrillic-to-translit-js";
import useUtilStore from "../lib/store/utilStore";
import { detectScript } from "../lib/helper";
import RecommendedProducts from "../components/search/RecommendedProducts";
import LoadingRive from "../components/LoadingRive";

export default function SearchPage() {
  const router = useRouter();

  const { searchResult, handleSearchResult, searchValue, handleSearchValue } =
    useSearchStore();

  const { seenProducts, searches, removeSearchedValue, addSearchedValue } =
    useUtilStore();

  const [aggResult, setAggResult] = useState<any>();
  const [loading, setLoading] = useState(false);

  const handleSearch = async (value: string) => {
    try {
      setLoading(true);

      if (value.length === 1 && value === " ") return;
      handleSearchValue(value);

      if (value === "") return;

      // Skip empty searches
      const trimmedValue = value.trim();
      if (trimmedValue === "" || trimmedValue.length < 2) return;

      // Detect script and create both versions
      const detectedScript = detectScript(trimmedValue);
      let englishVersion = trimmedValue;
      let cyrillicVersion = trimmedValue;

      if (detectedScript === "Cyrillic") {
        // Original is Cyrillic, generate English transliteration
        englishVersion = cyrillicToTranslit({ preset: "ru" }).transform(
          trimmedValue
        );
      } else if (detectedScript === "English") {
        // Original is English, generate Cyrillic transliteration
        cyrillicVersion = cyrillicToTranslit({ preset: "ru" }).reverse(
          trimmedValue
        );
      }

      console.log("Search values:", {
        original: trimmedValue,
        english: englishVersion,
        cyrillic: cyrillicVersion,
      });

      // Build an improved Elasticsearch query that uses both versions
      const result = await CAT_API.search({
        index: "products",
        _source: true,
        size: 5,
        query: {
          bool: {
            must: [
              // Filter for products with a valid price
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
            should: [
              // Original query value with high boost
              {
                multi_match: {
                  query: trimmedValue,
                  fields: [
                    "brand.prefix^8",
                    "displayName.prefix^8",
                    "keywords.prefix^6",
                  ],
                  type: "bool_prefix",
                },
              },
              // English version query
              {
                multi_match: {
                  query: englishVersion,
                  fields: [
                    "brand.prefix^8",
                    "displayName.prefix^8",
                    "keywords.prefix^6",
                  ],
                  type: "bool_prefix",
                },
              },
              // Cyrillic version query
              {
                multi_match: {
                  query: cyrillicVersion,
                  fields: [
                    "brand.prefix^8",
                    "displayName.prefix^8",
                    "keywords.prefix^6",
                  ],
                  type: "bool_prefix",
                },
              },
              // Prefix matching for autocomplete behavior
              {
                multi_match: {
                  query: trimmedValue,
                  fields: [
                    "brand.prefix^8",
                    "displayName.prefix^8",
                    "keywords.prefix^6",
                  ],
                  type: "phrase_prefix",
                },
              },
            ],
            minimum_should_match: 1,
          },
        },
        // Aggregations for faceting
        aggs: {
          displayName: {
            terms: {
              field: "displayName.keyword",
              size: 2,
            },
          },
          keywords: {
            terms: {
              field: "keywords.keyword",
              size: 2,
            },
          },
          brands: {
            terms: {
              field: "brand.keyword",
              size: 3,
            },
          },
          taxonomies: {
            terms: {
              field: "taxon.label.keyword",
              size: 3,
            },
          },
        },
        // Add highlighting to show why matches happened
        highlight: {
          fields: {
            displayName: {},
            brand: {},
            keywords: {},
            description: {},
          },
          pre_tags: ["<em>"],
          post_tags: ["</em>"],
        },
      });

      // Process the results
      const hits = result.data.result.hits.hits;
      console.log(result.data.result);
      const products = hits.map((hit) => ({
        ...(hit._source || {}),
        score: hit._score,
      }));

      handleSearchResult(products);
      setAggResult(result.data.result.aggregations);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleClearSearchInput = () => {
    handleSearchValue("");
  };

  const handleResultClick = (
    value: string,
    type: "search" | "keywords" | "brand" | "productId"
  ) => {
    let path: string = "";
    switch (type) {
      case "search":
      case "keywords":
      case "brand":
        path = `/search/${type}/${value}`;
        addSearchedValue(value);
        break;
      case "productId":
        path = `/product/${value}`;
      default:
        break;
    }

    router.push(path);
  };

  const onMoreSearchesClicked = () => {
    router.push("/search/history/searched");
  };
  const onMoreSeenProductClick = () => {
    router.push("/search/history/seen");
  };

  return (
    <Transition direction="right">
      <div className="flex flex-col w-full h-full p-4 overflow-hidden">
        <div className=" flex items-center justify-between gap-4">
          <Link href={"/home"}>
            <Image
              src={"/arrowback.svg"}
              alt={"arrowback"}
              width={24}
              height={24}
            />
          </Link>
          <SearchInput
            value={searchValue}
            autoFocus
            onChange={(e) => handleSearch(e.target.value)}
            onClear={handleClearSearchInput}
          />
        </div>

        {!searchValue && searches.length ? (
          <>
            <div className=" flex justify-between items-center mt-4 mb-2">
              <p className=" font-medium">Сүүлд хайсан</p>
              <div
                className=" flex items-center gap-2"
                onClick={onMoreSearchesClicked}
              >
                <p className=" text-blue text-xs">Бүгд</p>
                <Image
                  src={"/arrowrightblue.svg"}
                  alt={""}
                  height={16}
                  width={16}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 max-h-[80px] overflow-hidden">
              {searches.map((value, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center gap-2 p-2 bg-secondary-100 rounded-lg text-sm"
                >
                  <div onClick={() => handleResultClick(value, "search")}>
                    <p>{value}</p>
                  </div>
                  <div onClick={() => removeSearchedValue(value)}>
                    <Image src={"/x.svg"} alt={"remove"} width={8} height={8} />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : null}

        {!searchValue && seenProducts.length ? (
          <>
            <div className=" flex justify-between items-center mt-8 mb-2">
              <p className=" font-medium">Сүүлд үзсэн</p>
              <div
                className=" flex items-center gap-2"
                onClick={onMoreSeenProductClick}
              >
                <p className=" text-blue text-xs">Бүгд</p>
                <Image
                  src={"/arrowrightblue.svg"}
                  alt={"more"}
                  height={16}
                  width={16}
                />
              </div>
            </div>
            <div className=" flex items-center overflow-hidden w-fit">
              {seenProducts.slice(0, 5).map((product) => (
                <div
                  key={product.productId}
                  className="relative w-[80px] h-[80px]"
                  onClick={() =>
                    handleResultClick(product.productId, "productId")
                  }
                >
                  <Image
                    src={product.displayImageUrl}
                    alt={"product"}
                    fill
                    className=" object-contain p-4"
                  />
                </div>
              ))}
            </div>
          </>
        ) : null}
        <div className=" w-full h-full  overflow-hidden overflow-y-scroll ">
          {loading ? (
            <div className=" absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              Хайж байна...
            </div>
          ) : null}

          {searchValue.length > 2 && searchResult.length === 0 && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <p className="text-xl font-medium mb-2">Илэрц олдсонгүй</p>
              <p className="text-sm text-secondary-400">
                Та өөр утгаар хайж үзээрэй.
              </p>
            </div>
          )}

          <div className=" flex flex-col gap-6 mt-6">
            {searchValue !== "" && searchResult.length > 0 ? (
              <div
                className=" flex gap-4 items-center"
                onClick={() => handleResultClick(searchValue, "search")}
              >
                <Image src="search.svg" alt="search" width={20} height={20} />
                <p>{searchValue}</p>
              </div>
            ) : null}
            {searchValue !== "" && aggResult && aggResult.keywords
              ? aggResult.keywords.buckets.map((item: any, i: any) => (
                  <React.Fragment key={i}>
                    <HighlightResult
                      text={item.key}
                      value={searchValue}
                      onClick={() => handleResultClick(item.key, "keywords")}
                    />
                  </React.Fragment>
                ))
              : null}
            {searchValue !== "" && aggResult
              ? aggResult.brands.buckets.map((item: any, i: any) => (
                  <div
                    id={`search-result-brand-${item.key}`}
                    key={i}
                    className=" flex items-center justify-between"
                    onClick={() => handleResultClick(item.key, "brand")}
                  >
                    <div className=" flex gap-4 items-center">
                      <Image
                        src="search.svg"
                        alt="search"
                        width={20}
                        height={20}
                      />
                      <div className=" w-[80%]">
                        <div className=" truncate">{item.key}</div>
                        <p className=" text-[#6F7381] text-xs">Брэнд</p>
                      </div>
                    </div>
                    <div className=" relative w-[40px] h-[40px] rounded-xl bg-primary overflow-hidden">
                      <Image
                        src={`/brand/${item.key.toLowerCase()}.png`}
                        alt={""}
                        fill
                        sizes="40 40"
                      />
                    </div>
                  </div>
                ))
              : null}
            {searchValue !== "" &&
              searchResult.map((item, index) => (
                <React.Fragment key={item.productId}>
                  <div
                    id={`search-result-brand-${item.displayName}`}
                    className=" flex items-center justify-between"
                    onClick={() =>
                      handleResultClick(item.productId, "productId")
                    }
                  >
                    <div className=" flex gap-4 items-center">
                      <Image
                        src="search.svg"
                        alt="search"
                        width={20}
                        height={20}
                      />
                      <div className=" w-[80%]">
                        <div className=" truncate">{item.displayName}</div>
                        <p className=" text-[#6F7381] text-xs">
                          {item.taxonomy?.[item.taxonomy.length - 1]?.label}
                        </p>
                      </div>
                    </div>
                    <div className="relative w-[40px] h-[40px] bg-white overflow-hidden">
                      <Image
                        src={item.displayImageUrl}
                        alt={"product"}
                        fill
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                  </div>
                </React.Fragment>
              ))}
          </div>
        </div>
      </div>
      <div className="">{searchValue === "" && <RecommendedProducts />}</div>
    </Transition>
  );
}
