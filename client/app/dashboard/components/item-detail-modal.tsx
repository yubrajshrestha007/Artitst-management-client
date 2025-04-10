// /home/mint/Desktop/ArtistMgntFront/client/app/dashboard/components/item-detail-modal.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { detailViewConfig, DetailItem, ItemType } from "./data-view-modal"; // Adjust path
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area"; // For potentially long details

interface ItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: DetailItem | null;
  itemType: ItemType | null;
  managerMap?: Map<string, string>; // Optional: Needed for artist's manager name
}

// Helper to safely get nested values (can be imported from utils if centralized)
const getNestedValue = (obj: unknown, path: string): unknown => {
  if (typeof obj !== 'object' || obj === null) return undefined;
  return path.split('.').reduce((acc, part) => acc && (acc as Record<string, unknown>)[part], obj);
};

export const ItemDetailModal = ({
  isOpen,
  onClose,
  item,
  itemType,
  managerMap,
}: ItemDetailModalProps) => {

  if (!isOpen || !item || !itemType) {
    return null;
  }

  const config = detailViewConfig[itemType];
  if (!config) {
    console.error(`No detail view configuration found for itemType: ${itemType}`);
    return null; // Or render an error state
  }

  // Determine a title for the modal
  const title = `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} Details`;
  const subTitle = (item as any).name || (item as any).title || (item as any).email || `ID: ${(item as any).id}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg"> {/* Adjust width as needed */}
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {subTitle && <DialogDescription>{subTitle}</DialogDescription>}
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4"> {/* Limit height and add scroll */}
          <div className="space-y-3 py-4 text-sm">
            {config.map((field) => {
              const rawValue = getNestedValue(item, field.key as string);
              const displayValue = field.formatter
                ? field.formatter(rawValue, item, managerMap)
                : rawValue ?? "N/A"; // Default formatting

              return (
                <div key={field.key as string} className="flex justify-between border-b pb-2 last:border-b-0">
                  <span className="font-medium text-gray-600">{field.label}:</span>
                  <span className="text-right ml-2">{displayValue}</span>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
