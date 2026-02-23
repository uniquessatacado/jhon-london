import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, FileText, Ruler, Image, Check } from 'lucide-react';

export function NewProductPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Novo Produto</h1>
          <p className="text-muted-foreground">Preencha os dados para cadastrar um novo produto.</p>
        </div>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="basic">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic"><Package className="mr-2 h-4 w-4" />Dados Básicos</TabsTrigger>
              <TabsTrigger value="fiscal"><FileText className="mr-2 h-4 w-4" />Fiscal</TabsTrigger>
              <TabsTrigger value="dimensions"><Ruler className="mr-2 h-4 w-4" />Dimensões</TabsTrigger>
              <TabsTrigger value="images"><Image className="mr-2 h-4 w-4" />Imagens</TabsTrigger>
            </TabsList>
            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle>Dados Básicos</CardTitle>
                  <CardDescription>Informações essenciais do produto.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-muted-foreground">Formulário de dados básicos em breve.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="fiscal">
              <Card>
                <CardHeader>
                  <CardTitle>Dados Fiscais</CardTitle>
                  <CardDescription>Informações para emissão de nota fiscal.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-muted-foreground">Formulário de dados fiscais em breve.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="dimensions">
              <Card>
                <CardHeader>
                  <CardTitle>Dimensões</CardTitle>
                  <CardDescription>Peso e medidas para cálculo de frete.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-muted-foreground">Formulário de dimensões em breve.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="images">
              <Card>
                <CardHeader>
                  <CardTitle>Imagens</CardTitle>
                  <CardDescription>Faça o upload das imagens do produto.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-muted-foreground">Componente de upload de imagens em breve.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <div className="mt-6 flex justify-end">
        <Button size="lg" className="bg-green-600 hover:bg-green-700">
          <Check className="mr-2 h-4 w-4" />
          Salvar Produto
        </Button>
      </div>
    </div>
  );
}
