import * as React from "react";
import AutoComplete from "../../components/autocomplate.tsx";
import SerchUser from "../../components/serchuser.tsx";

const SerchPage = () => {

  return (
    <div className="serch_page">
      <AutoComplete/>
      <React.Suspense fallback={<div>Loading user...</div>}>
        <SerchUser/>
      </React.Suspense>
    </div>
  );
};

export default SerchPage;
