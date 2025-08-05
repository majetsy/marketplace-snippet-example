"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import useUtilStore from "@/app/lib/store/utilStore";

export default function SearchedValuesPage() {
  const router = useRouter();
  const { searches, removeSearchedValue, clearSearches } = useUtilStore();
  return (
    <div>
      <div className="flex justify-between items-center gap-4 p-4">
        <button onClick={() => router.back()}>
          <Image src="/arrowback.svg" alt="Back" width={24} height={24} />
        </button>

        <p className=" font-medium">Сүүлд хайсан</p>
        <button onClick={clearSearches}>
          <Image src="/trashcan.svg" alt="remove-all" width={24} height={24} />
        </button>
      </div>
      <div className="p-4 flex flex-col gap-4">
        {searches.map((value, index) => (
          <div className=" flex justify-between items-center " key={index}>
            <div className=" flex gap-4 items-center justify-center">
              <Image
                src={"/historyclock.svg"}
                alt={"history"}
                width={20}
                height={20}
              />
              <p>{value}</p>
            </div>
            <div
              className=" w-[18px] h-[18px] rounded-full flex items-center justify-center bg-secondary-400"
              onClick={() => removeSearchedValue(value)}
            >
              <Image
                src={"/x.svg"}
                alt={"remove"}
                width={5}
                height={5}
                className=" invert"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
