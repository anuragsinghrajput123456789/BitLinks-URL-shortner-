"use client";
import React, { Suspense } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { ToastContainer } from "./ToastContainer";

export default function PageWrapper({ children }) {
  return (
    <>
      <Suspense fallback={null}>
        <Navbar />
      </Suspense>
      {children}
      <Footer />
      <ToastContainer />
    </>
  );
}
