import React from "react";
import { Link } from "react-router-dom";

export default function Contact() {
  return (
    <main>
      <h1>Contact NIA Schools</h1>

      <p>
        Contact NIA Schools for admissions,
        programmes and further information.
      </p>

      <Link to="/">
        Back Home
      </Link>
    </main>
  );
}