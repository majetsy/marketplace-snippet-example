import React, { Suspense } from "react";
import Loading from "../components/Loading";

export default function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <Suspense fallback={<Loading />}>{children}</Suspense>;
}
