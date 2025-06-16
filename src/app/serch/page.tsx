import * as React from "react";
import AutoComplete from "../../components/autocomplate.tsx";
import SerchUser from "../../components/serchuser.tsx";

const SerchPage = () => {

  return (
    <div className="serch_page">
      <AutoComplete/>
      <SerchUser/>
    </div>
  );
};

export default SerchPage;
