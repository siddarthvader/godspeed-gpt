"use client";

import Image from "next/image";
import Link from "next/link";
import React, { FormEventHandler, useEffect, useState } from "react";
import { useSession, getSession, signIn } from "next-auth/react";

import { redirect, useRouter } from "next/navigation";

import PageLoading from "@/components/PageLoading";
function Login() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      return false;
    },
  });

  console.log({ session, status });

  useEffect(() => {
    if (status === "authenticated") {
      console.log("coming here...");
      redirect("/");
      //   router.push("/");
    }
  }, [session]);

  const [credentials, setCredentials] = useState({ email: "", password: "" });

  const [isError, setIsError] = useState(false);
  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    setIsError(false);
    e.preventDefault();
    const res = await signIn("credentials", {
      email: credentials.email,
      password: credentials.password,
      redirect: false,
    });

    console.log(res);

    if (res?.ok && res.error == null) {
      router.push("/");
    }

    setIsError(true);
  };

  return (
    <div className="bg-gray-50">
      {status === "loading" && session && <PageLoading />}
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <Link
          href="https://www.godspeed.systems"
          target="_blank"
          className="flex flex-col items-center mb-6 text-[10px] font-semibold text-gray-900"
        >
          <Image
            width={200}
            height={40}
            className="mr-2"
            src="/logo.png"
            alt="logo"
          />
          GPT Powered Documentation for Godspeed Framework
        </Link>

        <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0 ">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
              Sign in to your account
            </h1>
            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">
                  Your email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  placeholder="name@company.com"
                  required={true}
                  onChange={(e) => {
                    setCredentials({
                      ...credentials,
                      email: e.target.value,
                    });
                  }}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="••••••••"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  required={true}
                  onChange={(e) => {
                    setCredentials({
                      ...credentials,
                      password: e.target.value,
                    });
                  }}
                />
              </div>

              <button
                type="submit"
                className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center "
              >
                Sign in
              </button>
              <p className="text-sm font-light text-gray-500">
                Don’t have an account yet?{" "}
                <Link
                  href="/contact"
                  className="font-medium text-primary-600 hover:underline"
                >
                  Contact Admin
                </Link>
              </p>
              {isError && (
                <p className="text-sm font-light text-red-700">
                  Invalid Username or Password!
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
