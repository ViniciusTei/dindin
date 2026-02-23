export function HomePage(props: { username: string }) {
  return (
    <main className="mx-auto mt-10 max-w-2xl px-4">
      <div className="card bg-base-100 shadow">
        <div className="card-body gap-4">
          <h1 className="card-title">Financeiro</h1>
          <p>Olá, {props.username}.</p>

          <p className="text-sm opacity-70">
            Próximo: telas de meses, rendas e despesas.
          </p>
        </div>
      </div>
    </main>
  );
}
