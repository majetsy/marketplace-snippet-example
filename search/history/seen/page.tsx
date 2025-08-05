"use client";

import React from "react";
import Image from "next/image";
import useUtilStore from "@/app/lib/store/utilStore";
import { currencyFormat, monthlyPayment } from "@/app/lib/helper";
import { INTEREST_RATE, MAX_LOAN_MONTH } from "@/app/lib/constants";
import { useRouter } from "next/navigation";
import { useStoresStore } from "@/app/lib/store/storesStore";

export default function RecentlySeenProductsPage() {
  const router = useRouter();
  const { seenProducts, removeSeenProduct, clearSeenProducts } = useUtilStore();
  const { stores } = useStoresStore();

  return (
    <div>
      <div className="flex justify-between items-center gap-4 p-4">
        <button onClick={() => router.back()}>
          <Image src="/arrowback.svg" alt="Back" width={24} height={24} />
        </button>

        <p className=" font-medium">Сүүлд үзсэн</p>
        <button onClick={clearSeenProducts}>
          <Image src="/trashcan.svg" alt="remove-all" width={24} height={24} />
        </button>
      </div>
      <div className=" grid grid-cols-2 gap-4 p-4">
        {seenProducts.map(
          ({
            brand,
            productId,
            mainPrice,
            salePrice,
            hasGift,
            displayImageUrl,
            displayName,
            storeId,
          }) => (
            <div key={productId} className=" aspect-square">
              <div className=" relative bg-secondary-100 rounded-xl p-2 aspect-square flex flex-col justify-between">
                <div className=" z-10  relative overflow-hidden w-[32px] h-[32px] rounded-lg bg-transparent">
                  <Image
                    src={`/brand/${brand.toLowerCase()}.png`}
                    alt={"logo"}
                    fill
                    sizes="32px 32px"
                  />
                </div>
                <div className=" absolute right-2 z-[5]">
                  {mainPrice - salePrice !== 0 ? (
                    <p className=" bg-red px-2 py-[2px] rounded-lg text-[10px] text-white">
                      -{currencyFormat(mainPrice - salePrice)}₮
                    </p>
                  ) : null}

                  {hasGift && (
                    <div className=" absolute right-0 mt-2 p-1 bg-[#00000066] rounded-full flex flex-col gap-1 items-center justify-center">
                      <div className=" w-[35px] h-[35px] bg-primary flex items-center justify-center rounded-full">
                        <Image
                          src={"/gift.svg"}
                          alt={"gift"}
                          width={20}
                          height={20}
                        />
                      </div>
                    </div>
                  )}

                  <div
                    className=" absolute right-0 top-0 w-8 h-8 rounded-full bg-[#00000066] flex items-center justify-center"
                    onClick={() => removeSeenProduct(productId)}
                  >
                    <Image
                      src={"/x.svg"}
                      alt={"remove"}
                      width={10}
                      height={10}
                      className=" invert"
                    />
                  </div>
                </div>

                <button onClick={() => router.push(`/product/${productId}`)}>
                  <Image
                    src={displayImageUrl}
                    alt={"product"}
                    priority
                    fill
                    style={{ objectFit: "contain" }}
                    sizes="200px 200px"
                    className=" p-4"
                  />
                </button>
                <div
                  className={` relative w-[24px] h-[24px] border-[1.5px] overflow-hidden border-secondary-100 flex items-center justify-center rounded-[100%] bg-white `}
                >
                  <Image
                    src={`/store/${
                      stores.find((store) => store.storeId === storeId)
                        ?.storeName
                    }.svg`}
                    fill
                    sizes="24px 24px"
                    style={{ objectFit: "contain" }}
                    alt={"store"}
                  />
                </div>
              </div>
              <button
                onClick={() => router.push(`/product/${productId}`)}
                className=" text-start"
              >
                <p className=" text-xs text-primary mt-2">{displayName}</p>
                <p className=" font-medium text-[14px]">
                  {currencyFormat(salePrice)}₮{" "}
                  {mainPrice !== salePrice ? (
                    <span className=" font-normal text-xs  text-secondary-400 line-through">
                      {currencyFormat(mainPrice)}₮
                    </span>
                  ) : null}
                </p>

                <p className=" text-xs text-secondary-400">Урьдчилгаа 0₮</p>
                <p className=" font-medium">
                  {currencyFormat(
                    monthlyPayment(salePrice, INTEREST_RATE, MAX_LOAN_MONTH)
                  )}
                  ₮{" "}
                  <span className="text-secondary-400 text-xs font-normal">
                    (сард)
                  </span>
                </p>
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
