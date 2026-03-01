import type { SVGProps } from "react";

export function Space(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" {...props}>
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M22 17v1c0 .5-.5 1-1 1H3c-.5 0-1-.5-1-1v-1"
      ></path>
    </svg>
  );
}
