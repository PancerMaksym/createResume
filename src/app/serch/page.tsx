import * as React from "react";
import AutoComplete from "../../components/autocomplate.tsx";
import SerchUser from "../../components/serchuser.tsx";
import "@/style/serch.scss"

const SerchPage = () => {

  return (
    <main className="serch_page">
      <AutoComplete/>
      <React.Suspense fallback={<div>Loading user...</div>}>
        <SerchUser/>
      </React.Suspense>
    </main>
  );
};

export default SerchPage;
