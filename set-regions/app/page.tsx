"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { IoTrashOutline } from "react-icons/io5";

export default function Home() {
  const [points, setPoints] = useState([[0.3, 0.5]]);
  const [num, setNum] = useState(3);

  const canvasRef = useRef<HTMLDivElement>(null);
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

    window.addEventListener("resize", () => {
      updateCanvasSize();
    });
  }, []);

  const createItem = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      const point = [e.clientX / canvasSize.w, e.clientY / canvasSize.h];
      setPoints([...points, point]);
    }
  };

  return (
    <main className="max-w-screen-lg mx-auto">
      <div className="relative w-full">
        <img src="/sample.png" alt="" className="w-full" />
        <div
          ref={canvasRef}
          className="absolute top-0 left-0 right-0 bottom-0 "
          onMouseDown={createItem}
        >
          {points.map(([x, y]) => (
            <div
              onClick={() => {}}
              onDrag={() => {}}
              className="absolute w-2 h-2 rounded-full bg-white ring-2 ring-primary -translate-x-1/2 -translate-y-1/2"
              style={{
                left: x * canvasSize.w,
                top: y * canvasSize.h,
              }}
            ></div>
          ))}
        </div>
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
