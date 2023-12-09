"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Draggable, {
  DraggableCore,
  DraggableEventHandler,
} from "react-draggable";
import { IoTrashOutline } from "react-icons/io5";

export default function Home() {
  const [point, setPoint] = useState<number[] | null>(null);
  const [lines, setLines] = useState<number[][]>([]);
  const [active, setActive] = useState<number | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const canvasRef = useRef<SVGSVGElement>(null);
  const [canvasSize, setCanvasSize] = useState<{ w: number; h: number }>({
    w: 100,
    h: 100,
  });
  const fileRef = useRef<HTMLInputElement>(null);
  const jsonRef = useRef<HTMLAnchorElement>(null);
  // const imageRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const updateCanvasSize = () => {
    if (canvasRef.current) {
      setCanvasSize({
        w: canvasRef.current.clientWidth,
        h: canvasRef.current.clientHeight,
      });
    }
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      if (point) {
        setPoint(null);
        setActive(null);
      }
    }
    if (e.key === "Backspace") {
      if (active !== null) {
        deleteLine(active);
        setActive(null);
      }
    }
  };
  useEffect(() => {
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    videoRef.current?.addEventListener("loadedmetadata", updateCanvasSize);
    return () => {
      window.removeEventListener("resize", updateCanvasSize);
      videoRef.current?.removeEventListener("loadedmetadata", updateCanvasSize);
    };
  }, []);
  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [active, point]);

  const createItem = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = [
        (e.clientX - rect.x) / canvasSize.w,
        (e.clientY - rect.y) / canvasSize.h,
      ];
      if (point) {
        setActive(lines.length);
        setLines([...lines, [...point, ...pos]]);
        setPoint(null);
      } else {
        setActive(null);
        setPoint(pos);
      }
    }
  };
  const deleteLine = (index: number) => {
    setLines(lines.filter((v, i) => i !== index));
  };

  return (
    <main className="max-w-screen-lg mx-auto">
      <div className="relative w-full">
        <video
          ref={videoRef}
          className="w-full select-none pointer-events-none"
        />
        <svg
          ref={canvasRef}
          className="absolute top-0 left-0 right-0 bottom-0 "
          width="100%"
          height="100%"
          preserveAspectRatio="false"
          onMouseDown={createItem}
        >
          {point && (
            <circle
              onClick={() => {}}
              onDrag={() => {}}
              cx={`${point[0] * 100}%`}
              cy={`${point[1] * 100}%`}
              r={4}
              fill="white"
              strokeWidth={2}
              stroke="cyan"
            ></circle>
          )}

          {lines.map((vs, i) => {
            const [x1, y1, x2, y2] = vs;
            const [cx, cy] = [(x1 + x2) / 2, (y1 + y2) / 2];
            const [x1p, y1p, x2p, y2p, cxp, cyp] = [...vs, cx, cy].map(
              (v) => `${v * 100}%`
            );
            const [dx, dy] = [x2 - x1, y2 - y1];
            const absD = Math.abs(dx) + Math.abs(dy);
            const [nx, ny] = [dy / absD, -dx / absD];
            const dl = 24;
            const [xIn, yIn, xOut, yOut] = [
              cx * canvasSize.w - nx * dl,
              cy * canvasSize.h - ny * dl,
              cx * canvasSize.w + nx * dl,
              cy * canvasSize.h + ny * dl,
            ];
            const color = i == active ? "aqua" : "magenta";
            return (
              <>
                <line
                  x1={x1p}
                  y1={y1p}
                  x2={x2p}
                  y2={y2p}
                  strokeWidth={2}
                  stroke={color}
                />
                <DraggableCore
                  onDrag={(e, data) => {
                    const line = [
                      lines[i][0] + data.deltaX / canvasSize.w,
                      lines[i][1] + data.deltaY / canvasSize.h,
                      lines[i][2] + data.deltaX / canvasSize.w,
                      lines[i][3] + data.deltaY / canvasSize.h,
                    ];
                    lines[i] = line;
                    setLines([...lines]);
                  }}
                  onMouseDown={(e) => setActive(i)}
                >
                  <line
                    x1={x1p}
                    y1={y1p}
                    x2={x2p}
                    y2={y2p}
                    strokeWidth={24}
                    stroke="transparent"
                  />
                </DraggableCore>

                <text x={cxp} y={cyp} fill={color}>
                  {i}
                </text>
                <text x={xIn} y={yIn} className="text-xs" fill={color}>
                  In
                </text>
                <text x={xOut} y={yOut} className="text-xs" fill={color}>
                  Out
                </text>
                <DraggableCore
                  onDrag={(e, data) => {
                    const [x, y] = [
                      lines[i][0] + data.deltaX / canvasSize.w,
                      lines[i][1] + data.deltaY / canvasSize.h,
                    ];
                    lines[i][0] = x;
                    lines[i][1] = y;
                    setLines([...lines]);
                  }}
                  onMouseDown={(e) => setActive(i)}
                >
                  <circle
                    cx={x1p}
                    cy={y1p}
                    r={4}
                    fill="white"
                    strokeWidth={2}
                    stroke={color}
                  />
                </DraggableCore>
                <DraggableCore
                  onDrag={(e, data) => {
                    const [x, y] = [
                      lines[i][2] + data.deltaX / canvasSize.w,
                      lines[i][3] + data.deltaY / canvasSize.h,
                    ];
                    lines[i][2] = x;
                    lines[i][3] = y;
                    setLines([...lines]);
                  }}
                  onMouseDown={(e) => setActive(i)}
                >
                  <circle
                    cx={x2p}
                    cy={y2p}
                    r={4}
                    fill="white"
                    strokeWidth={2}
                    stroke={color}
                  />
                </DraggableCore>
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
              <th>Flip</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {lines.map((vs, i) => {
              const [x1, y1, x2, y2] = vs.map((v) => v.toFixed(3));
              return (
                <tr>
                  <th>{i}</th>
                  <td>{`(${x1},${y1})`}</td>
                  <td>{`(${x2},${y2})`}</td>
                  <td>
                    <button
                      className="btn btn-xs btn-info"
                      onClick={() => {
                        lines[i] = [vs[2], vs[3], vs[0], vs[1]];
                        setLines([...lines]);
                      }}
                    >
                      Flip
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn btn-ghost btn-circle btn-sm"
                      onClick={() => deleteLine(i)}
                    >
                      <IoTrashOutline />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex gap-4">
        <button
          className="btn btn-secondary"
          onClick={() => {
            fileRef.current?.click();
          }}
        >
          Open Video
        </button>
        <button
          className="btn btn-primary"
          onClick={() => {
            const json = JSON.stringify(lines, null, 2);
            const blob = new Blob([json], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = jsonRef.current!;
            a.download = fileName
              ? [...fileName.split(".").slice(0, -1), "json"].join(".")
              : "region.json";
            a.href = url;
            a.click();
          }}
        >
          Export as JSON
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) {
            const file = e.target.files[0];
            const fileName = file.name;
            const reader = new FileReader();
            reader.addEventListener("load", (r) => {
              videoRef.current!.src = reader.result as string;
              setLines([]);
              setPoint(null);
              setActive(null);
              setFileName(fileName);
            });
            reader.readAsDataURL(file);
          } else {
          }
        }}
      />
      <a ref={jsonRef} className="hidden"></a>
    </main>
  );
}
