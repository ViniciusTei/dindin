import { useRef, useState, useEffect } from "react";
import { Form } from "react-router";

type CameraState = "idle" | "camera" | "captured";

export function ReceiptUploadStep({ error, loading }: { error?: string; loading?: boolean }) {
  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [cameraError, setCameraError] = useState<string | undefined>();
  const [capturedPreview, setCapturedPreview] = useState<string | undefined>();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => stopStream();
  }, []);

  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  // Attach the stream once the <video> element is mounted (after cameraState → "camera")
  useEffect(() => {
    if (cameraState === "camera" && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraState]);

  async function startCamera() {
    setCameraError(undefined);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      setCameraState("camera"); // triggers render → useEffect attaches srcObject
    } catch {
      setCameraError("Não foi possível acessar a câmera. Verifique as permissões do navegador.");
    }
  }

  function capturePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob || !fileInputRef.current) return;

        const file = new File([blob], "receipt.jpg", { type: "image/jpeg" });
        const dt = new DataTransfer();
        dt.items.add(file);
        fileInputRef.current.files = dt.files;

        setCapturedPreview(canvas.toDataURL("image/jpeg", 0.8));
        stopStream();
        setCameraState("captured");
      },
      "image/jpeg",
      0.9,
    );
  }

  function retake() {
    setCapturedPreview(undefined);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setCameraState("idle");
  }

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Importar nota fiscal</h2>
        <p className="text-base-content/60 mt-1 text-sm">
          Envie uma foto ou imagem da nota fiscal para extrair os itens automaticamente.
        </p>
      </div>

      <Form
        method="post"
        encType="multipart/form-data"
        className="card bg-base-200 w-full max-w-md"
      >
        <div className="card-body gap-4">
          <input type="hidden" name="_intent" value="parse" />

          {/* File input is always present in the DOM with a stable ref.
              Visibility changes via CSS — never conditionally unmounted — so
              DataTransfer can populate it after a camera capture and the form
              will always find exactly one "image" field on submit. */}
          <div className={cameraState === "idle" ? "fieldset" : "hidden"}>
            <p className="fieldset-legend">Imagem da nota fiscal</p>
            <input
              ref={fileInputRef}
              type="file"
              name="image"
              accept="image/jpeg,image/png,image/webp"
              className="file-input w-full"
              disabled={loading}
            />
            <p className="label">JPEG, PNG ou WebP. A imagem não é armazenada.</p>
          </div>

          {cameraState === "camera" && (
            <div className="flex flex-col items-center gap-3">
              <video ref={videoRef} autoPlay playsInline className="w-full rounded-box" />
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex gap-2">
                <button type="button" className="btn btn-primary" onClick={capturePhoto}>
                  Capturar foto
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => { stopStream(); setCameraState("idle"); }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {cameraState === "captured" && capturedPreview && (
            <div className="flex flex-col items-center gap-3">
              <img src={capturedPreview} alt="Foto capturada" className="w-full rounded-box" />
              <button type="button" className="btn btn-ghost btn-sm" onClick={retake}>
                Tirar outra foto
              </button>
            </div>
          )}

          {(error || cameraError) && (
            <div role="alert" className="alert alert-error alert-soft">
              <span>{cameraError ?? error}</span>
            </div>
          )}

          <div className="flex gap-2">
            {cameraState === "idle" && (
              <button
                type="button"
                className="btn btn-ghost flex-1"
                onClick={startCamera}
                disabled={loading}
              >
                Tirar foto
              </button>
            )}
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={loading || cameraState === "camera"}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
                  Processando…
                </>
              ) : (
                "Extrair itens"
              )}
            </button>
          </div>
        </div>
      </Form>
    </div>
  );
}
