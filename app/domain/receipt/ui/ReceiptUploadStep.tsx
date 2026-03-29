import { Form } from "react-router";

export function ReceiptUploadStep({ error, loading }: { error?: string; loading?: boolean }) {
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

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Imagem da nota fiscal</legend>
            <input
              type="file"
              name="image"
              accept="image/jpeg,image/png,image/webp"
              required
              className="file-input w-full"
              disabled={loading}
            />
            <p className="label">JPEG, PNG ou WebP. A imagem não é armazenada.</p>
          </fieldset>

          {error && (
            <div role="alert" className="alert alert-error alert-soft">
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}>
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
      </Form>
    </div>
  );
}
