import type { MetaArgs } from "react-router";

export function meta({ }: MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome sssccscto React Router!" },
  ];
}

export default function Test() {
  return (
    <div>
      <h1>Home</h1>
    </div>
  );
}

