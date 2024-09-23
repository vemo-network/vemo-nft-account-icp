import { ImageComponent } from "@components/images/render-image";
import Card from "antd/es/card/Card";
import Meta from "antd/es/card/Meta";
import React from "react";
import { usePlatforms } from "src/hooks/use-platforms";
import { Project } from "src/types/collection.type";
import { IPlatform } from "src/types/platform.type";
import styled from "styled-components";
import { avalancheFuji } from "viem/chains";

const CustomCard = styled(Card)<{ active: any }>`
  &:hover .highlight {
    background-color: #0047ff;
  }
  .highlight {
    background-color: ${({ active }) => (!!active ? "#0047ff" : "")};
  }
`;

export const Platforms = ({
  project,
  selectProject,
}: {
  project: IPlatform | null;
  selectProject: (project: IPlatform) => void;
}) => {
  const platforms = usePlatforms();
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm">Select platform</p>
      <div className="flex gap-3">
        {platforms?.map((platform) => (
          <CustomCard
            className="border-0 px-[12px] pt-[10px] w-fit bg-grey-200 "
            hoverable
            key={platform.name}
            active={project?.name === platform.name ? 1 : 0}
            onClick={() => selectProject(platform)}
          >
            <ImageComponent
              src={platform.icon}
              width={48}
              height={48}
              alt={platform.name}
              httpLink
              className="px-1"
            />
            <p className="text-center mt-1">{platform.name}</p>
            <div className="pt-[10px] flex justify-center">
              <div className="highlight w-full h-[3px] bg-red rounded-t-[5px]" />
            </div>
          </CustomCard>
        ))}
      </div>
    </div>
  );
};
