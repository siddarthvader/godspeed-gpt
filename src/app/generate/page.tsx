"use client";

import Header from "@/components/Header";
import React from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

function Generate() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      return redirect("/login?callbackUrl=/generate");
    },
  });
  return (
    <div className="flex flex-col items-center justify-start h-full p-4 ">
      <Header />
    </div>
  );
}

export default Generate;
