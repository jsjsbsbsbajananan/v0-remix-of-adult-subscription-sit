"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"

interface AccessKey {
  id: string
  key_code: string
  key_type: string
  status: string
  user_email: string | null
  created_at: string
  expires_at: string
  last_used_at: string | null
  created_by: string
  referred_by: string | null
}

export default function KeyLookup() {
  const [searchCode, setSearchCode] = useState("")
  const [keyData, setKeyData] = useState<AccessKey | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const searchKey = async () => {
    if (!searchCode.trim()) {
      setError("Digite um código para buscar")
      return
    }

    setLoading(true)
    setError("")
    setKeyData(null)

    try {
      const supabase = createClient()

      const { data, error: dbError } = await supabase
        .from("access_keys")
        .select("*")
        .eq("key_code", searchCode.toUpperCase())
        .single()

      if (dbError || !data) {
        setError(`Código "${searchCode}" não encontrado no banco de dados`)
        return
      }

      setKeyData(data)
    } catch (err) {
      console.error("Erro ao buscar chave:", err)
      setError("Erro ao conectar com o banco de dados")
    } finally {
      setLoading(false)
    }
  }

  const createKey = async (code: string) => {
    setLoading(true)
    setError("")

    try {
      const supabase = createClient()

      // Create key with 1 month expiration by default
      const expiresAt = new Date()
      expiresAt.setMonth(expiresAt.getMonth() + 1)

      const { data, error: dbError } = await supabase
        .from("access_keys")
        .insert({
          key_code: code.toUpperCase(),
          key_type: "1 mês",
          status: "Ativo",
          user_email: null,
          expires_at: expiresAt.toISOString(),
          created_by: "admin_manual",
        })
        .select()
        .single()

      if (dbError) {
        setError(`Erro ao criar chave: ${dbError.message}`)
        return
      }

      setKeyData(data)
      setSearchCode(code.toUpperCase())
    } catch (err) {
      console.error("Erro ao criar chave:", err)
      setError("Erro ao criar chave no banco de dados")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo":
        return "bg-green-500"
      case "Expirado":
        return "bg-red-500"
      case "Desativado":
        return "bg-gray-500"
      default:
        return "bg-blue-500"
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Buscar Código de Acesso</CardTitle>
          <CardDescription>Digite um código para buscar no banco de dados ou criar um novo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Digite o código (ex: gsbuz, zjly9mfrms)"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && searchKey()}
            />
            <Button onClick={searchKey} disabled={loading}>
              {loading ? "Buscando..." : "Buscar"}
            </Button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
              {error.includes("não encontrado") && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 bg-transparent"
                  onClick={() => createKey(searchCode)}
                  disabled={loading}
                >
                  Criar este código
                </Button>
              )}
            </div>
          )}

          {keyData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Código: {keyData.key_code}
                  <Badge className={getStatusColor(keyData.status)}>{keyData.status}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Tipo:</strong> {keyData.key_type}
                  </div>
                  <div>
                    <strong>Email:</strong> {keyData.user_email || "Não definido"}
                  </div>
                  <div>
                    <strong>Criado em:</strong> {new Date(keyData.created_at).toLocaleDateString("pt-BR")}
                  </div>
                  <div>
                    <strong>Expira em:</strong> {new Date(keyData.expires_at).toLocaleDateString("pt-BR")}
                  </div>
                  <div>
                    <strong>Último uso:</strong>{" "}
                    {keyData.last_used_at ? new Date(keyData.last_used_at).toLocaleDateString("pt-BR") : "Nunca usado"}
                  </div>
                  <div>
                    <strong>Criado por:</strong> {keyData.created_by}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Códigos Específicos</CardTitle>
          <CardDescription>Buscar pelos códigos mencionados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setSearchCode("gsbuz")
                searchKey()
              }}
              disabled={loading}
            >
              Buscar "gsbuz"
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSearchCode("zjly9mfrms")
                searchKey()
              }}
              disabled={loading}
            >
              Buscar "zjly9mfrms"
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
