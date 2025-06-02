import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/experiments")({
  component: ExperimentsPage,
});

function ExperimentsPage() {
  return (
    <>Coming soon</>
    // <div className="space-y-6">
    //   <div>
    //     <h1 className="text-3xl font-bold">Experimentos</h1>
    //     <p className="text-muted-foreground">
    //       Compara prompts, modelos y optimiza costos con IA
    //     </p>
    //   </div>

    //   <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    //     <Card className="border-2 border-dashed border-muted relative overflow-hidden">
    //       <CardHeader className="pb-3">
    //         <div className="flex items-center justify-between">
    //           <CardTitle className="text-lg flex items-center gap-2">
    //             <IconGitCompare className="h-5 w-5" />
    //             Comparador A/B
    //           </CardTitle>
    //           <Badge variant="secondary">Próximamente</Badge>
    //         </div>
    //       </CardHeader>
    //       <CardContent className="space-y-3">
    //         <p className="text-sm text-muted-foreground">
    //           Compara respuestas de diferentes modelos lado a lado
    //         </p>
    //         <div className="space-y-2">
    //           <div className="text-xs text-muted-foreground">
    //             • Análisis de calidad automático
    //           </div>
    //           <div className="text-xs text-muted-foreground">
    //             • Métricas de costo por token
    //           </div>
    //           <div className="text-xs text-muted-foreground">
    //             • Evaluación de latencia
    //           </div>
    //         </div>
    //         <Button variant="outline" size="sm" disabled className="w-full">
    //           Crear Experimento
    //         </Button>
    //       </CardContent>
    //     </Card>

    //     <Card className="border-2 border-dashed border-muted relative overflow-hidden">
    //       <CardHeader className="pb-3">
    //         <div className="flex items-center justify-between">
    //           <CardTitle className="text-lg flex items-center gap-2">
    //             <IconTrendingDown className="h-5 w-5" />
    //             Optimizador de Costos
    //           </CardTitle>
    //           <Badge variant="secondary">Próximamente</Badge>
    //         </div>
    //       </CardHeader>
    //       <CardContent className="space-y-3">
    //         <p className="text-sm text-muted-foreground">
    //           Sugerencias automáticas para reducir costos
    //         </p>
    //         <div className="space-y-2">
    //           <div className="text-xs text-muted-foreground">
    //             • Análisis de prompts redundantes
    //           </div>
    //           <div className="text-xs text-muted-foreground">
    //             • Recomendaciones de modelos
    //           </div>
    //           <div className="text-xs text-muted-foreground">
    //             • Optimización de parámetros
    //           </div>
    //         </div>
    //         <Button variant="outline" size="sm" disabled className="w-full">
    //           Analizar Costos
    //         </Button>
    //       </CardContent>
    //     </Card>

    //     <Card className="border-2 border-dashed border-muted relative overflow-hidden">
    //       <CardHeader className="pb-3">
    //         <div className="flex items-center justify-between">
    //           <CardTitle className="text-lg flex items-center gap-2">
    //             <IconBrain className="h-5 w-5" />
    //             Evaluación IA
    //           </CardTitle>
    //           <Badge variant="secondary">Próximamente</Badge>
    //         </div>
    //       </CardHeader>
    //       <CardContent className="space-y-3">
    //         <p className="text-sm text-muted-foreground">
    //           Evaluación automática de calidad de respuestas
    //         </p>
    //         <div className="space-y-2">
    //           <div className="text-xs text-muted-foreground">
    //             • Scoring de coherencia
    //           </div>
    //           <div className="text-xs text-muted-foreground">
    //             • Detección de alucinaciones
    //           </div>
    //           <div className="text-xs text-muted-foreground">
    //             • Métricas personalizadas
    //           </div>
    //         </div>
    //         <Button variant="outline" size="sm" disabled className="w-full">
    //           Configurar Evaluación
    //         </Button>
    //       </CardContent>
    //     </Card>
    //   </div>

    //   <Card>
    //     <CardHeader>
    //       <CardTitle className="flex items-center gap-2">
    //         <IconFlask className="h-5 w-5" />
    //         Próximas Funcionalidades
    //       </CardTitle>
    //     </CardHeader>
    //     <CardContent className="space-y-4">
    //       <div className="grid gap-4 md:grid-cols-2">
    //         <div className="space-y-2">
    //           <h4 className="font-medium flex items-center gap-2">
    //             🔬 Laboratorio de Prompts
    //           </h4>
    //           <p className="text-sm text-muted-foreground">
    //             Interfaz para iterar y mejorar prompts con historial de
    //             versiones
    //           </p>
    //         </div>

    //         <div className="space-y-2">
    //           <h4 className="font-medium flex items-center gap-2">
    //             📊 Dashboard de Experimentos
    //           </h4>
    //           <p className="text-sm text-muted-foreground">
    //             Vista centralizada de todos tus experimentos y resultados
    //           </p>
    //         </div>

    //         <div className="space-y-2">
    //           <h4 className="font-medium flex items-center gap-2">
    //             💰 Predictor de Costos
    //           </h4>
    //           <p className="text-sm text-muted-foreground">
    //             Estimaciones precisas antes de ejecutar cambios en producción
    //           </p>
    //         </div>

    //         <div className="space-y-2">
    //           <h4 className="font-medium flex items-center gap-2">
    //             🤖 Asistente de Optimización
    //           </h4>
    //           <p className="text-sm text-muted-foreground">
    //             IA que analiza tus logs y sugiere mejoras automáticamente
    //           </p>
    //         </div>
    //       </div>

    //       <div className="pt-4 border-t">
    //         <div className="flex items-center justify-between">
    //           <div>
    //             <h4 className="font-medium">
    //               ¿Tienes ideas o necesidades específicas?
    //             </h4>
    //             <p className="text-sm text-muted-foreground">
    //               Nos encantaría escuchar qué funcionalidades te serían más
    //               útiles
    //             </p>
    //           </div>
    //           <Button variant="outline" className="flex items-center gap-2">
    //             Enviar Feedback
    //             <IconArrowRight className="h-4 w-4" />
    //           </Button>
    //         </div>
    //       </div>
    //     </CardContent>
    //   </Card>
    // </div>
  );
}
