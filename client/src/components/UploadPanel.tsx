import type { ChangeEvent } from "react";

interface UploadPanelProps {
    selectedFile: File | null;
    uploading: boolean;
    uploadStatus: string | null;
    onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onUpload: () => void;
}

export const UploadPanel = ({
    selectedFile,
    uploading,
    uploadStatus,
    onFileChange,
    onUpload,
}: UploadPanelProps) => {
    return (
        <section className="uploadPanel">
            <div className="uploadRow">
                <label className="uploadButton" htmlFor="pdf-upload">
                    Choose PDF
                </label>
                <input
                    id="pdf-upload"
                    className="uploadInput"
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={onFileChange}
                />
                <button className="primaryButton" onClick={onUpload} disabled={!selectedFile || uploading}>
                    {uploading ? "Uploading..." : "Upload"}
                </button>
                <div className="uploadMeta">{selectedFile ? selectedFile.name : "No file selected"}</div>
            </div>
            {uploadStatus && <div className="uploadStatus">{uploadStatus}</div>}
        </section>
    );
};