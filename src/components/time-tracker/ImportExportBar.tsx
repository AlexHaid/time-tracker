"use client";

import React from "react";
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
import { exportEntries, importEntries, clearAllEntries } from "@/lib/time-tracker/api";

interface ImportExportBarProps {
  onDataChanged: () => void;
}

export default function ImportExportBar({ onDataChanged }: ImportExportBarProps) {
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      const data = await exportEntries();
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
    } catch {
      toast({ title: "Export failed", description: "Could not export your data.", variant: "destructive" });
    }
  };

  const handleImportClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (ev) => {
        const content = ev.target?.result as string;
        try {
          const count = await importEntries(content);
          toast({
            title: "Data imported",
            description: `${count} entr${count !== 1 ? "ies" : "y"} imported successfully.`,
          });
          onDataChanged();
        } catch (err) {
          toast({
            title: "Import failed",
            description: err instanceof Error ? err.message : "The file format is invalid.",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleClearAll = async () => {
    try {
      const count = await clearAllEntries();
      toast({
        title: "Data cleared",
        description: `${count} entr${count !== 1 ? "ies" : "y"} removed.`,
      });
      onDataChanged();
    } catch {
      toast({
        title: "Clear failed",
        description: "Could not clear your data.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button variant="outline" size="sm" onClick={handleImportClick} className="h-8 text-xs gap-1.5 cursor-pointer">
        <Upload className="h-3.5 w-3.5" />
        Import
      </Button>
      <Button variant="outline" size="sm" onClick={handleExport} className="h-8 text-xs gap-1.5 cursor-pointer">
        <Download className="h-3.5 w-3.5" />
        Export
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 text-destructive hover:text-destructive cursor-pointer">
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
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAll}
              className="bg-destructive text-white hover:bg-destructive/90 cursor-pointer"
            >
              Clear All Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
