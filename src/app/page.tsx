import Link from "next/link";
import "@/style/page.scss";

export default function Home() {
  return (
    <main className="main_page">
      <h1>Create your own resume</h1>
      <h3>
        Flexible customization of blocks,
        <br />
        colors, and fonts will help make your
        <br />
        resume truly one of a kind.
      </h3>
      <div className="buttons">
        <Link href={"/profile"}>Create resume</Link>
        <Link href={"/serch"}>View resume</Link>
      </div>
    </main>
  );
}
