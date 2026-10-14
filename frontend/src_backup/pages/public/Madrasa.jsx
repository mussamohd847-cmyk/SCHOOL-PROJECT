import React from "react";
import { Link } from "react-router-dom";

export default function Madrasa() {
  return (
    <main>
      <h1>NIA Madrasa</h1>

      <p>
        Our Madrasa programme supports Islamic
        education, character development and values.
      </p>

      <Link to="/">
        Back Home
      </Link>
    </main>
  );
}