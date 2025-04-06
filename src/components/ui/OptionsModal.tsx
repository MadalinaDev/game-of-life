"use client";

import React, { useState, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OptionsModalProps {
    children: React.ReactNode;
    onClose: () => void;
}

export function OptionsModal({ children, onClose }: OptionsModalProps) {
    const [position, setPosition] = useState({ x: 100, y: 100 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const modalRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('button, input')) return;
        if (modalRef.current) {
            const rect = modalRef.current.getBoundingClientRect();
            setDragOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            });
            setIsDragging(true);
        }
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragOffset.x,
                y: e.clientY - dragOffset.y,
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    React.useEffect(() => {
        if (isDragging) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        } else {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        }

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDragging, dragOffset]);

    return (
        <div
            ref={modalRef}
            className="fixed z-50 bg-background/90 backdrop-blur-lg border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 w-80 max-w-[90vw]"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                cursor: isDragging ? "grabbing" : "default",
            }}
        >
            <div
                className="flex justify-between items-center mb-3 pb-2 border-b cursor-move"
                onMouseDown={handleMouseDown}
            >
                <h3 className="font-semibold text-sm">Game Options</h3>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="size-6 hover:bg-gray-200"
                >
                    <X className="size-4" />
                </Button>
            </div>
            <div className="space-y-4" onMouseDown={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
}