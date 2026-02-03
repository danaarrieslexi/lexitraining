"use client";

import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.log("Error is", error);
  }, [error]);

  const retryRequesthandler = () => {
    reset();
  };

  return (
    <div>
      <h1>Something went wrong!</h1>
      <button onClick={retryRequesthandler}>Retry Request</button>
    </div>
  );
}
