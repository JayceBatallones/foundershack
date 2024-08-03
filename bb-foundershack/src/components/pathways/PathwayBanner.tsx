import React from "react";

type Props = {
  title: String;
  description: String;
};

const PathwayBanner = ({ title, description }: Props) => {
  return (
    <div className="flex justify-center items-center">
      <div
        className="mt-8 w-2/5 rounded-xl p-5 text-black flex
  item-center justify-between border-4"
      >
        <div className="space-y-2.5">
          <h3 className="text-2xl font-bold">{title}</h3>

          <p className="text-lg">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default PathwayBanner;
