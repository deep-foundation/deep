"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Hex } from './hex';
import './map.css';

interface Position {
  x: number;
  y: number;
}

interface HexPosition {
  q: number; // column
  r: number; // row
}

export const Map = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Position | null>(null);
  const [hexSize] = useState(50); // размер гексагона
  const [visibleHexes, setVisibleHexes] = useState<HexPosition[]>([]);

  // Определение видимых гексагонов
  const calculateVisibleHexes = () => {
    // Создаем сетку 5x5 вокруг центра для начала
    const hexes: HexPosition[] = [];
    for (let q = -2; q <= 2; q++) {
      for (let r = -2; r <= 2; r++) {
        hexes.push({ q, r });
      }
    }
    
    console.log('Calculating visible hexes:', {
      hexCount: hexes.length,
      offset,
      hexes,
    });
    
    setVisibleHexes(hexes);
  };

  // Обработчики событий перетаскивания
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const pos = 'touches' in e 
      ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
      : { x: e.clientX, y: e.clientY };
    setDragStart(pos);
  };

  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || !dragStart) return;

    const pos = 'touches' in e 
      ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
      : { x: e.clientX, y: e.clientY };

    const dx = pos.x - dragStart.x;
    const dy = pos.y - dragStart.y;

    setOffset(prev => ({
      x: prev.x + dx,
      y: prev.y + dy
    }));

    setDragStart(pos);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  // Установка обработчиков событий и начальное центрирование
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Центрирование карты при первой отрисовке
    const { width, height } = container.getBoundingClientRect();
    setOffset({ x: width / 2, y: height / 2 });
    calculateVisibleHexes(); // Принудительный первый расчет

    // Обработчики движения и окончания перетаскивания
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleDragMove);
    window.addEventListener('touchend', handleDragEnd);

    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, []);

  // Отображение гексагонов
  const renderHex = (pos: HexPosition) => {
    const x = offset.x + pos.q * hexSize * 1.5;
    const y = offset.y + pos.r * hexSize * 1.732;
    
    return (
      <div
        key={`${pos.q},${pos.r}`}
        className="hex-wrapper"
        style={{
          position: 'absolute',
          left: `${x}px`,
          top: `${y}px`,
          width: hexSize,
          height: hexSize,
        }}
      >
        <Hex />
      </div>
    );
  };

  console.log('Rendering with visible hexes:', visibleHexes.length);

  return (
    <div ref={containerRef} className="map-container">
      <div 
        className={`map-content ${isDragging ? 'dragging' : ''}`}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      >
        {visibleHexes.map(renderHex)}
      </div>
    </div>
  );
};
