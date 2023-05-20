import Image from "next/image";
import { usePathname } from "next/navigation";
import React from "react";
import Link from "next/link";
import { PageList } from "@/helpers/constant";
import { signOut } from "next-auth/react";

function Header() {
  const pathname: string = usePathname();

  return (
    <>
      <div className="flex flex-row items-center justify-between w-full">
        <div>
          <Image src="/logo.png" alt="Godspeed" width={200} height={40} />
          <div className="font-semibold text-[10px] text-s">
            GPT Powered Documentation for Godspeed Framework
          </div>
        </div>
        <div className="text-sm font-medium text-center text-gray-500 ">
          <ul className="flex flex-wrap items-center -mb-px space-x-3">
            <li className="mr-2 ph-2">
              <Link
                href="/"
                className={`inline-block p-4 border-b-2 rounded-t-lg ${
                  PageList["chat"] === pathname
                    ? "text-orange-600 border-orange-600 font-semibold"
                    : "text-gray-600 border-transparent"
                }`}
              >
                Chat
              </Link>
            </li>
            <li className="mr-2 ph-2">
              <Link
                href="/generate"
                className={`inline-block p-4 border-b-2  rounded-t-lg ${
                  PageList["generate"] === pathname
                    ? "text-orange-600 border-orange-600 font-semibold"
                    : "text-gray-600 border-transparent"
                }`}
              >
                Generate
              </Link>
            </li>
            <li className="w-6 h-6 mr-2 text-red-600 cursor-pointer ph-2">
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-6 h-6 mr-2 text-red-600 cursor-pointer ph-2"
              >
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5.636 5.636a9 9 0 1012.728 0M12 3v9"
                  ></path>
                </svg>
              </button>
            </li>
          </ul>
        </div>
      </div>

      <hr className="w-full h-[0.32px] mb-3 border-t-0 opacity-100 bg-orange-600" />
    </>
  );
}

export default Header;
