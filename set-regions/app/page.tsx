"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { IoTrashOutline } from "react-icons/io5";

export default function Home() {
  const [points, setPoints] = useState([[0.3, 0.5]]);
  const [lines, setLines] = useState([
    [
      [0.1, 0.1],
      [0.2, 0.2],
    ],
  ]);
  const [num, setNum] = useState(3);

  const canvasRef = useRef<SVGSVGElement>(null);
  const [canvasSize, setCanvasSize] = useState<{ w: number; h: number }>({
    w: 100,
    h: 100,
  });
  const updateCanvasSize = () => {
    if (canvasRef.current) {
      setCanvasSize({
        w: canvasRef.current.clientWidth,
        h: canvasRef.current.clientHeight,
      });
    }
  };
  useEffect(() => {
    updateCanvasSize();

    window.addEventListener("resize", updateCanvasSize);

    () => {
      window.removeEventListener("resize", updateCanvasSize);
    };
  }, []);

  const createItem = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      const point = [e.clientX / canvasSize.w, e.clientY / canvasSize.h];
      setPoints([...points, point]);
    }
  };

  return (
    <main className="max-w-screen-lg mx-auto">
      <div className="relative w-full">
        <img src="/sample.png" alt="" className="w-full" />
        <svg
          ref={canvasRef}
          className="absolute top-0 left-0 right-0 bottom-0 "
          width="100%"
          height="100%"
          preserveAspectRatio="false"
          onMouseDown={createItem}
        >
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="5"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" />
            </marker>
          </defs>
          {points.map(([x, y]) => (
            <circle
              onClick={() => {
                console.log("click");
              }}
              onDrag={() => {}}
              cx={`${x * 100}%`}
              cy={`${y * 100}%`}
              r={4}
              fill="white"
              strokeWidth={2}
              stroke="#f0f"
            ></circle>
          ))}

          {lines.map((vs, i) => {
            const [[x1, y1], [x2, y2]] = vs;
            const [cx, cy] = [(x1 + x2) / 2, (y1 + y2) / 2];
            const [x1p, y1p, x2p, y2p, cxp, cyp] = [x1, y1, x2, y2, cx, cy].map(
              (v) => `${v * 100}%`
            );
            return (
              <>
                <line
                  x1={x1p}
                  y1={y1p}
                  x2={x2p}
                  y2={y2p}
                  strokeWidth={2}
                  stroke="aqua"
                  markerStart="url(#arrow)"
                />
                <text x={cxp} y={cyp} fill="aqua">
                  {i}
                </text>
                <circle
                  cx={x1p}
                  cy={y1p}
                  r={4}
                  fill="white"
                  strokeWidth={2}
                  stroke="aqua"
                />
                <circle
                  cx={x2p}
                  cy={y2p}
                  r={4}
                  fill="white"
                  strokeWidth={2}
                  stroke="aqua"
                />
              </>
            );
          })}
        </svg>
      </div>

      <div className="overflow-auto">
        <table className="table table-xs">
          <thead>
            <tr>
              <th></th>
              <th>Vertex1</th>
              <th>Vertex2</th>
              <th>Flow Out</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {points.map(([x, y], i) => (
              <Item index={i} x={x} y={y} />
            ))}
          </tbody>
        </table>
      </div>

      <button className="btn btn-secondary" onClick={() => setNum(num + 1)}>
        Add Region
      </button>
      <button className="btn btn-primary">OK</button>
    </main>
  );
}

function Item({ index, x, y }: { index: number; x: number; y: number }) {
  return (
    <tr>
      <th>{index}</th>
      <td>{x}</td>
      <td>{y}</td>
      <td>
        <input type="checkbox" className="toggle toggle-info" defaultChecked />
      </td>
      <td>
        <button className="btn btn-ghost btn-circle btn-sm">
          <IoTrashOutline />
        </button>
      </td>
    </tr>
  );
}
