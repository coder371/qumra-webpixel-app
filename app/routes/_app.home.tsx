import type { Route } from "./+types/home";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome sccscto React Router!" },
  ];
}

export default function Home() {
  return (
    <div>
      <h1>Home</h1>
    </div>
  );
}
