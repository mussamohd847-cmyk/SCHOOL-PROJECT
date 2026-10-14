import React from "react";
import { Link } from "react-router-dom";

export default function Academics() {
  return (
    <main>
      <h1>Academics</h1>

      <p>
        Explore the academic journey at NIA Schools
        from Juvenile through Primary education.
      </p>

      <Link to="/">
        Back Home
      </Link>
    </main>
  );
}