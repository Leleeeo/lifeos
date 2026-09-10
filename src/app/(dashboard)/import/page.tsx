'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Upload,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  AlertCircle,
  Download,
  Eye,
  Trash2,
} from 'lucide-react'

interface ParsedRow {
  description: string
  amount: number
  date: string
  type: 'income' | 'expense'
  raw: string[]
  category?: string
}

interface ColumnMapping {
  description: number
  amount: number
  date: number
  type: number
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Alimentação': ['supermercado', 'mercado', 'restaurante', 'lanchonete', 'padaria', 'ifood', 'rappi', 'alimentacao', 'comida'],
  'Moradia': ['aluguel', 'condominio', 'iptu', 'luz', 'agua', 'gas', 'energia', 'moradia'],
  'Transporte': ['uber', '99', 'gasolina', 'combustivel', 'onibus', 'metro', 'estacionamento', 'transporte'],
  'Saúde': ['farmacia', 'hospital', 'medico', 'consulta', 'exame', 'plano de saude', 'saude'],
  'Educação': ['escola', 'faculdade', 'curso', 'livro', 'educacao', 'material escolar'],
  'Lazer': ['cinema', 'teatro', 'show', 'netflix', 'spotify', 'amazon prime', 'lazer', 'entretenimento'],
  'Vestuário': ['loja', 'roupa', 'sapato', 'vestuario', 'moda'],
  'Assinaturas': ['assinatura', 'mensalidade', 'spotify', 'netflix', 'cloud', 'software'],
  'Salário': ['salario', 'vencimento', 'pagamento', 'remuneracao'],
  'Freelance': ['freelance', 'projeto', 'servico', 'consultoria'],
}

function detectCategory(description: string): string {
  const lower = description.toLowerCase()
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return category
    }
  }
  return 'Outros'
}

function parseCSV(text: string): string[][] {
  const lines = text.split('\n').filter((l) => l.trim())
  return lines.map((line) => {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ';' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    result.push(current.trim())
    return result
  })
}

function detectAmount(value: string): number | null {
  let cleaned = value.replace(/[R$\s]/g, '')
  
  if (cleaned.includes(',') && cleaned.includes('.')) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.')
  } else if (cleaned.includes(',')) {
    cleaned = cleaned.replace(',', '.')
  }

  const num = parseFloat(cleaned)
  return isNaN(num) ? null : num
}

function detectDate(value: string): string | null {
  const datePatterns = [
    /(\d{2})\/(\d{2})\/(\d{4})/,
    /(\d{4})-(\d{2})-(\d{2})/,
    /(\d{2})-(\d{2})-(\d{4})/,
  ]

  for (const pattern of datePatterns) {
    const match = value.match(pattern)
    if (match) {
      if (pattern.source.includes('\\d{4}-\\d{2}-\\d{2}')) {
        return `${match[1]}-${match[2]}-${match[3]}`
      }
      return `${match[3]}-${match[2]}-${match[1]}`
    }
  }
  return null
}

function detectType(value: string, amount: number): 'income' | 'expense' {
  const lower = value.toLowerCase()
  const incomeKeywords = ['receita', 'credito', 'deposito', 'transferencia entrada', 'salario', 'pgto']
  if (incomeKeywords.some((kw) => lower.includes(kw))) {
    return 'income'
  }
  return amount < 0 ? 'income' : 'expense'
}

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [rawData, setRawData] = useState<string[][]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [mapping, setMapping] = useState<ColumnMapping>({
    description: -1,
    amount: -1,
    date: -1,
    type: -1,
  })
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([])
  const [importing, setImporting] = useState(false)
  const [imported, setImported] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return

    setFile(selected)
    setImported(false)
    setError('')

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const rows = parseCSV(text)
      if (rows.length < 2) {
        setError('Arquivo vazio ou inválido')
        return
      }

      setHeaders(rows[0])
      setRawData(rows.slice(1))
      autoDetectColumns(rows[0])
    }
    reader.readAsText(selected, 'UTF-8')
  }, [])

  const autoDetectColumns = (headers: string[]) => {
    const lowerHeaders = headers.map((h) => h.toLowerCase())
    
    const descKeywords = ['descricao', 'descrição', 'descricao', 'historico', 'histórico', 'description', 'titulo', 'título', 'nome', 'estabelecimento', 'lancamento', 'lançamento']
    const amountKeywords = ['valor', 'amount', 'montante', 'total']
    const dateKeywords = ['data', 'date', 'dt', 'movimento']
    const typeKeywords = ['tipo', 'type', 'categoria']

    let descIdx = lowerHeaders.findIndex((h) => descKeywords.some((k) => h.includes(k)))
    let amountIdx = lowerHeaders.findIndex((h) => amountKeywords.some((k) => h.includes(k)))
    let dateIdx = lowerHeaders.findIndex((h) => dateKeywords.some((k) => h.includes(k)))
    let typeIdx = lowerHeaders.findIndex((h) => typeKeywords.some((k) => h.includes(k)))

    if (descIdx === -1) descIdx = 0
    if (amountIdx === -1) amountIdx = lowerHeaders.findIndex((h) => h.includes('r$') || h.includes('rs')) || 1
    if (dateIdx === -1) dateIdx = lowerHeaders.findIndex((h) => /\d{2}\/\d{2}/.test(h)) || 2

    setMapping({
      description: descIdx,
      amount: amountIdx,
      date: dateIdx,
      type: typeIdx,
    })

    parseData(descIdx, amountIdx, dateIdx, typeIdx)
  }

  const parseData = (descIdx: number, amountIdx: number, dateIdx: number, typeIdx: number) => {
    const parsed: ParsedRow[] = rawData.map((row) => {
      const description = row[descIdx] || 'Sem descrição'
      const amountVal = detectAmount(row[amountIdx] || '0')
      const amount = amountVal !== null ? Math.abs(amountVal) : 0
      const date = detectDate(row[dateIdx] || '') || new Date().toISOString().split('T')[0]
      const type = typeIdx >= 0 ? detectType(row[typeIdx], amount) : detectType(description, amount)
      const category = detectCategory(description)

      return { description, amount, date, type, raw: row, category }
    })

    setParsedRows(parsed)
  }

  const handleMappingChange = (field: keyof ColumnMapping, value: number) => {
    const newMapping = { ...mapping, [field]: value }
    setMapping(newMapping)
    parseData(newMapping.description, newMapping.amount, newMapping.date, newMapping.type)
  }

  const handleImport = async () => {
    setImporting(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Usuário não autenticado')
      setImporting(false)
      return
    }

    const { data: existingCategories } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)

    const categoryMap = new Map<string, string>()
    existingCategories?.forEach((c) => categoryMap.set(c.name.toLowerCase(), c.id))

    const transactions = parsedRows.map((row) => ({
      user_id: user.id,
      description: row.description,
      amount: row.amount,
      type: row.type,
      date: row.date,
      category_id: categoryMap.get((row.category || '').toLowerCase()) || null,
      is_recurring: false,
    }))

    const { error: insertError } = await supabase
      .from('transactions')
      .insert(transactions)

    if (insertError) {
      setError(`Erro ao importar: ${insertError.message}`)
    } else {
      setImported(true)
    }

    setImporting(false)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const totalIncome = parsedRows
    .filter((r) => r.type === 'income')
    .reduce((sum, r) => sum + r.amount, 0)
  const totalExpenses = parsedRows
    .filter((r) => r.type === 'expense')
    .reduce((sum, r) => sum + r.amount, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Importar Transações</h1>
        <p className="text-muted-foreground">
          Importe seus dados de-planilhas ou extratos bancários
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Upload do Arquivo</CardTitle>
            <CardDescription>
              Formatos aceitos: CSV (.csv) ou OFX (.ofx)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Arraste e solte ou selecione um arquivo
              </p>
              <Input
                type="file"
                accept=".csv,.ofx,.qfx"
                onChange={handleFileUpload}
                className="max-w-xs mx-auto"
              />
            </div>

            {file && (
              <div className="mt-4 flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{file.name}</span>
                <Badge variant="secondary">{rawData.length} linhas</Badge>
              </div>
            )}

            {error && (
              <div className="mt-4 flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instruções</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Como exportar do banco:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• <strong>Itaú:</strong> Extratos → Exportar CSV</li>
                <li>• <strong>Bradesco:</strong> Extratos → Download CSV</li>
                <li>• <strong>Nubank:</strong> settings → Extratos → CSV</li>
                <li>• <strong>Inter:</strong> Conta → Extratos → Exportar</li>
                <li>• <strong>Sicoob:</strong> Extratos → Gerar arquivo</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Colunas esperadas:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Data da transação</li>
                <li>• Descrição/Histórico</li>
                <li>• Valor (com ou sem R$)</li>
                <li>• Tipo (opcional)</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Dicas:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Use separador ";" ou ","</li>
                <li>• Valores podem ter "R$" ou não</li>
                <li>• Datas no formato DD/MM/AAAA</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {rawData.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Mapeamento de Colunas</CardTitle>
                <CardDescription>
                  Selecione qual coluna corresponde a cada campo
                </CardDescription>
              </div>
              {parsedRows.length > 0 && (
                <div className="flex gap-4 text-sm">
                  <span className="text-emerald-500">
                    Receitas: {formatCurrency(totalIncome)}
                  </span>
                  <span className="text-red-500">
                    Despesas: {formatCurrency(totalExpenses)}
                  </span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4 mb-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Descrição</label>
                <select
                  className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
                  value={mapping.description}
                  onChange={(e) => handleMappingChange('description', Number(e.target.value))}
                >
                  <option value={-1}>Selecionar...</option>
                  {headers.map((h, i) => (
                    <option key={i} value={i}>{h}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Valor</label>
                <select
                  className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
                  value={mapping.amount}
                  onChange={(e) => handleMappingChange('amount', Number(e.target.value))}
                >
                  <option value={-1}>Selecionar...</option>
                  {headers.map((h, i) => (
                    <option key={i} value={i}>{h}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Data</label>
                <select
                  className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
                  value={mapping.date}
                  onChange={(e) => handleMappingChange('date', Number(e.target.value))}
                >
                  <option value={-1}>Selecionar...</option>
                  {headers.map((h, i) => (
                    <option key={i} value={i}>{h}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo (opcional)</label>
                <select
                  className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
                  value={mapping.type}
                  onChange={(e) => handleMappingChange('type', Number(e.target.value))}
                >
                  <option value={-1}>Auto-detectar</option>
                  {headers.map((h, i) => (
                    <option key={i} value={i}>{h}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedRows.slice(0, 20).map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {row.description}
                      </TableCell>
                      <TableCell>{formatDate(row.date)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{row.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {row.type === 'income' ? (
                            <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3 text-red-500" />
                          )}
                          <span className={row.type === 'income' ? 'text-emerald-500' : 'text-red-500'}>
                            {row.type === 'income' ? 'Receita' : 'Despesa'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className={`text-right font-medium ${
                        row.type === 'income' ? 'text-emerald-500' : 'text-red-500'
                      }`}>
                        {formatCurrency(row.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {parsedRows.length > 20 && (
                <div className="p-2 text-center text-sm text-muted-foreground">
                  + {parsedRows.length - 20} mais transações
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setFile(null)
                  setRawData([])
                  setHeaders([])
                  setParsedRows([])
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button
                onClick={handleImport}
                disabled={importing || imported || parsedRows.length === 0}
              >
                {importing ? (
                  'Importando...'
                ) : imported ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Importado!
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Importar {parsedRows.length} Transações
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {imported && (
        <Card className="border-emerald-500/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-emerald-500">
              <Check className="h-5 w-5" />
              <span className="font-medium">
                {parsedRows.length} transações importadas com sucesso!
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              As transações foram adicionadas à sua conta.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
