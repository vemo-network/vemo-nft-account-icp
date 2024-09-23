import { ImageComponent } from "@components/images/render-image";
import React from "react";
import { BASE_PATH } from "src/configs/constants";
import { Footer } from "./components/footer";
import { Header } from "./components/header";

export const DefaultLayout = ({ children }: any) => {
  return (
    <div className="bg-primary-200 text-white relative font-urbanist text-base min-h-[100vh]">
      {/* <img
        src={`${BASE_PATH}/images/ellipse-440.png`}
        alt="ellipse-440"
        className="absolute top-0 z-0"
      />
      
      <img
        src={`${BASE_PATH}/images/ellipse-441.png`}
        alt="ellipse-441"
        className="absolute bottom-0 z-0"
      />
      <img
        src={`${BASE_PATH}/images/ellipse-443.png`}
        alt="ellipse-443"
        className="absolute bottom-0 z-0"
      />
      <img
        src={`${BASE_PATH}/images/ellipse-442.png`}
        alt="ellipse-442"
        className="absolute bottom-0 right-0 z-0"
      />
      <img
        src={`${BASE_PATH}/images/ellipse-444.png`}
        alt="ellipse-444"
        className="absolute bottom-0 right-0 z-0"
      /> */}
      <div
        className="w-full h-full absolute z-0"
        style={{
          backgroundImage: `url(${BASE_PATH}/images/cover-background.svg)`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      ></div>
      <Header />
      {children}
      <Footer />
    </div>
  );
};
