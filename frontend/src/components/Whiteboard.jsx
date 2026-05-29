import React, { useRef, useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';

const Whiteboard = ({ roomId }) => {
  const canvasRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#FFFFFF');
  const [size, setSize] = useState(2);
  const [socket, setSocket] = useState(null);
  const { socketRef } = useSocket();

  useEffect(() => {
    if (socketRef?.current) {
      setSocket(socketRef.current);
    }
  }, [socketRef]);

  useEffect(() => {
    if (!socket || !isOpen) return;

    const handleDraw = (data) => {
      drawLine(data.x0, data.y0, data.x1, data.y1, data.color, data.size);
    };

    const handleClearCanvas = () => {
      clearCanvas();
    };

    socket.on('draw', handleDraw);
    socket.on('clear-canvas', handleClearCanvas);

    return () => {
      socket.off('draw', handleDraw);
      socket.off('clear-canvas', handleClearCanvas);
    };
  }, [socket, isOpen]);

  const getCanvasContext = () => {
    if (canvasRef.current) {
      return canvasRef.current.getContext('2d');
    }
    return null;
  };

  const drawLine = (x0, y0, x1, y1, lineColor, lineSize) => {
    const ctx = getCanvasContext();
    if (!ctx) return;

    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.closePath();
  };

  const clearCanvas = () => {
    const ctx = getCanvasContext();
    if (!ctx || !canvasRef.current) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const handleMouseDown = (e) => {
    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    lastX.current = x;
    lastY.current = y;
  };

  const lastX = useRef(0);
  const lastY = useRef(0);

  const handleMouseMove = (e) => {
    if (!isDrawing) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    drawLine(lastX.current, lastY.current, x, y, color, size);

    if (socket) {
      socket.emit('draw', {
        roomId,
        x0: lastX.current,
        y0: lastY.current,
        x1: x,
        y1: y,
        color,
        size,
      });
    }

    lastX.current = x;
    lastY.current = y;
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    clearCanvas();
    if (socket) {
      socket.emit('clear-canvas', { roomId });
    }
  };

  const handleDownload = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.href = canvasRef.current.toDataURL('image/png');
      link.download = `whiteboard-${Date.now()}.png`;
      link.click();
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-primary"
      >
        🎨 Whiteboard
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-hidden flex flex-col border border-dark-600">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-dark-600">
              <h2 className="text-xl font-bold text-white">Collaborative Whiteboard</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Toolbar */}
            <div className="bg-dark-900 p-4 border-b border-dark-600 flex gap-4 items-center flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-300">Color:</label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-8 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-300">Size:</label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="w-24"
                />
                <span className="text-sm text-gray-400">{size}px</span>
              </div>

              <button
                onClick={handleClear}
                className="px-4 py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 text-sm font-medium"
              >
                Clear Canvas
              </button>

              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded hover:bg-cyan-500/30 text-sm font-medium"
              >
                Download
              </button>
            </div>

            {/* Canvas */}
            <div className="flex-1 bg-dark-800 overflow-auto flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="border border-dark-600 cursor-crosshair bg-black"
                style={{ maxWidth: '100%', maxHeight: '100%' }}
              />
            </div>

            {/* Info */}
            <div className="p-4 border-t border-dark-600 bg-dark-900 text-sm text-gray-400 text-center">
              Draw on the canvas. All changes are shared with room participants in real-time.
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Whiteboard;
