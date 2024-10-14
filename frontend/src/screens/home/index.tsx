import { useEffect, useRef, useState } from "react";
import { SWATCHES } from "../../constants";
import { ColorSwatch, Group } from "@mantine/core";
import axios from "axios";

interface Response {
    expr: string,
    result: string,
    assign: boolean
}

interface GeneratedResult {
    expression: string,
    answer: string
}

export default function Home() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState(SWATCHES[0]);
    const [reset, setReset] = useState(false);
    const [result, setResult] = useState<GeneratedResult[]>([]);
    const [dictOfvars, setDictOfVars] = useState({});

    // Function to start drawing
    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.strokeStyle = color; // Ensure strokeStyle is set
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
                setIsDrawing(true);
            }
        }
    };

    // Function to stop drawing
    const stopDrawing = () => {
        setIsDrawing(false);
    };

    // Function to handle drawing on canvas
    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
                ctx.stroke(); // Draw as mouse moves
            }
        }
    };

    // Reset canvas function
    const resetCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                // Set the canvas background to black after clearing
                ctx.fillStyle = "black";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        }
    };

    // Send data from canvas to backend
    const sendData = async () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const response = await axios({
                method: "POST",
                url: "http://127.0.0.1:5000/draw",
                data: {
                    image: canvas.toDataURL(),
                    dictOfvars: dictOfvars
                }
            });
            const resp = response.data;
            console.log(resp);
        }
    };

    // Effect to handle resetting canvas
    useEffect(() => {
        if (reset) {
            resetCanvas();
            setReset(false);
        }
    }, [reset]);

    // Initial canvas setup
    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
                // Set canvas size to fit the window
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;

                // Set the initial background to black
                ctx.fillStyle = "black";
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Canvas settings for drawing
                ctx.lineWidth = 5;
                ctx.lineCap = "round";
                ctx.strokeStyle = color; // Set the initial stroke color
            }
        }
    }, []);

    // Reapply stroke color when the color changes
    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.strokeStyle = color; // Update stroke color whenever color state changes
            }
        }
    }, [color]);

    return (
        <>
            <div className="grid grid-cols-3 gap-2">
                <button
                    onClick={() => setReset(true)}
                    className="z-20 bg-black text-white"
                >
                    Reset
                </button>
                <Group className="z-20">
                    {SWATCHES.map((swatch) => (
                        <ColorSwatch key={swatch} color={swatch} onClick={() => setColor(swatch)} />
                    ))}
                </Group>
                <button
                    onClick={sendData}
                    className="z-20 bg-black text-white"
                >
                    Run
                </button>
            </div>

            {/* Canvas setup */}
            <canvas
                ref={canvasRef}
                id="canvas"
                className="absolute top-0 left-0 w-full h-full"
                onMouseDown={startDrawing}
                onMouseUp={stopDrawing}
                onMouseOut={stopDrawing}
                onMouseMove={draw}
            />
        </>
    );
}