"use client";

import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [points, setPoints] = useState([[100, 100]]);
  const [num, setNum] = useState(3);

  return (
    <main>
      <img src="/sample.png" alt="" />
      <div className="absolute">
        {points.map(([x, y]) => (
          <></>
        ))}
      </div>

      {[...Array(num)].map((i) => (
        <Item key={i} />
      ))}
      <button className="btn btn-secondary" onClick={() => setNum(num + 1)}>
        Add Region
      </button>
      <button className="btn btn-primary">OK</button>
    </main>
  );
}

function Item() {
  return <div className="flex">Hello</div>;
}
