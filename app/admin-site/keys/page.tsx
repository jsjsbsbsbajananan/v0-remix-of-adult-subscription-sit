import KeyLookup from "../key-lookup"

export default function KeysPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Gerenciar Códigos de Acesso</h1>
        <p className="text-muted-foreground mt-2">Busque e gerencie códigos de acesso no sistema</p>
      </div>

      <KeyLookup />
    </div>
  )
}
