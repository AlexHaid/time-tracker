"use client";

import React, { useRef } from "react";
import { Download, Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { exportData, importData } from "@/lib/time-tracker/storage";

interface ImportExportBarProps {
  onDataChanged: () => void;
}

export default function ImportExportBar({ onDataChanged }: ImportExportBarProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `time-tracker-export-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Data exported", description: "Your time tracking data has been downloaded." });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      const success = importData(content);
      if (success) {
        toast({
          title: "Data imported",
          description: "Your time tracking data has been loaded successfully.",
        });
        onDataChanged();
      } else {
        toast({
          title: "Import failed",
          description: "The file format is invalid. Please check and try again.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    // Reset the input so the same file can be re-imported
    e.target.value = "";
  };

  const handleClearAll = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("time-tracker-data");
      onDataChanged();
      toast({
        title: "Data cleared",
        description: "All time tracking data has been removed.",
      });
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Import data file"
      />
      <Button variant="outline" size="sm" onClick={handleImportClick} className="h-8 text-xs gap-1.5">
        <Upload className="h-3.5 w-3.5" />
        Import
      </Button>
      <Button variant="outline" size="sm" onClick={handleExport} className="h-8 text-xs gap-1.5">
        <Download className="h-3.5 w-3.5" />
        Export
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 text-destructive hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5" />
            Clear All
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Data</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all your time tracking data. This action cannot be undone.
              Consider exporting your data first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAll}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Clear All Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
