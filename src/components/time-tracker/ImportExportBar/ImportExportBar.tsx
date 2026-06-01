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
import { useImportExport } from "./use-import-export";
import styles from "./ImportExportBar.module.css";

interface ImportExportBarProps {
  onDataChanged: () => void;
}

export default function ImportExportBar({ onDataChanged }: ImportExportBarProps) {
  const { handleExport, handleImportClick, handleClearAll } = useImportExport(onDataChanged);

  return (
    <div className={styles.bar}>
      <Button variant="outline" size="sm" onClick={handleImportClick} className={styles.importBtn}>
        <Upload style={{ height: "0.875rem", width: "0.875rem" }} />
        Import
      </Button>
      <Button variant="outline" size="sm" onClick={handleExport} className={styles.exportBtn}>
        <Download style={{ height: "0.875rem", width: "0.875rem" }} />
        Export
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm" className={styles.clearBtn}>
            <Trash2 style={{ height: "0.875rem", width: "0.875rem" }} />
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
            <AlertDialogCancel style={{ cursor: "pointer" }}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAll}
              className={styles.destructiveAction}
            >
              Clear All Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
