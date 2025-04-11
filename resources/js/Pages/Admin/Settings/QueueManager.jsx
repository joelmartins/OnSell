import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/Components/ui/card";
import { Progress } from "@/Components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Badge } from "@/Components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/Components/ui/alert";
import { Info, AlertCircle, Trash2, RefreshCcw, XCircle, Play } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/Components/ui/dialog";
import { toast } from "react-toastify";

export default function QueueManager({ pendingJobs, failedJobs, batches, stats }) {
    const [activeTab, setActiveTab] = useState("overview");
    const [selectedJob, setSelectedJob] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    
    const { processing: processingFlush, post: postFlush } = useForm();
    const { processing: processingRetry, post: postRetry } = useForm();
    const { processing: processingPurge, post: postPurge } = useForm();
    const { processing: processingRestart, post: postRestart } = useForm();
    
    const flushFailed = () => {
        postFlush(route('admin.settings.queues.flush-failed'), {
            onSuccess: () => {
                toast.success('Todos os jobs falhos foram removidos.');
            }
        });
    };
    
    const retryFailed = (id = null) => {
        postRetry(route('admin.settings.queues.retry-failed'), {
            data: { id },
            onSuccess: () => {
                toast.success(id ? 'Job enviado para reprocessamento.' : 'Todos os jobs falhos foram enviados para reprocessamento.');
                setDialogOpen(false);
            }
        });
    };
    
    const purgeQueue = (queue) => {
        postPurge(route('admin.settings.queues.purge'), {
            data: { queue },
            onSuccess: () => {
                toast.success(`Fila '${queue}' foi limpa.`);
            }
        });
    };
    
    const restartWorker = () => {
        postRestart(route('admin.settings.queues.restart-worker'), {
            onSuccess: () => {
                toast.success('Worker de filas reiniciado.');
            }
        });
    };
    
    const showJobDetails = (job) => {
        setSelectedJob(job);
        setDialogOpen(true);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Concluído':
                return 'bg-green-500';
            case 'Concluído com falhas':
                return 'bg-amber-500';
            case 'Em execução':
                return 'bg-blue-500';
            case 'Cancelado':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    return (
        <AdminLayout>
            <Head title="Gerenciador de Filas" />

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-semibold text-gray-800">Gerenciador de Filas</h2>
                                <Button onClick={restartWorker} disabled={processingRestart} className="bg-purple-600 hover:bg-purple-700">
                                    <RefreshCcw className="mr-2 h-4 w-4" /> Reiniciar Worker
                                </Button>
                            </div>

                            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
                                <TabsList className="mb-4">
                                    <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                                    <TabsTrigger value="pending">Filas Pendentes</TabsTrigger>
                                    <TabsTrigger value="failed">Jobs Falhos</TabsTrigger>
                                    <TabsTrigger value="batches">Lotes de Jobs</TabsTrigger>
                                </TabsList>

                                <TabsContent value="overview">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-medium">Jobs Pendentes</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">{stats.total_pending}</div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-medium">Jobs Falhos</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">{stats.total_failed}</div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-medium">Total de Lotes</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">{stats.total_batches}</div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-medium">Lotes Ativos</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">{stats.active_batches}</div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {stats.total_failed > 0 && (
                                        <Alert className="mb-6 border-amber-200 bg-amber-50">
                                            <AlertCircle className="h-4 w-4 text-amber-600" />
                                            <AlertTitle className="text-amber-800">Atenção</AlertTitle>
                                            <AlertDescription className="text-amber-700">
                                                Existem {stats.total_failed} jobs que falharam. Verifique a aba "Jobs Falhos" para mais detalhes.
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Filas Ativas</CardTitle>
                                                <CardDescription>Jobs pendentes por fila</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                {pendingJobs.length === 0 ? (
                                                    <div className="text-center py-4 text-gray-500">
                                                        Nenhum job pendente
                                                    </div>
                                                ) : (
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Fila</TableHead>
                                                                <TableHead>Jobs</TableHead>
                                                                <TableHead>Próximo Job</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {pendingJobs.map((queue, index) => (
                                                                <TableRow key={index}>
                                                                    <TableCell>{queue.queue}</TableCell>
                                                                    <TableCell>{queue.count}</TableCell>
                                                                    <TableCell>{queue.next_job || '-'}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                )}
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Lotes Recentes</CardTitle>
                                                <CardDescription>Últimos lotes de jobs processados</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                {batches.length === 0 ? (
                                                    <div className="text-center py-4 text-gray-500">
                                                        Nenhum lote de jobs processado recentemente
                                                    </div>
                                                ) : (
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Nome</TableHead>
                                                                <TableHead>Progresso</TableHead>
                                                                <TableHead>Status</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {batches.slice(0, 5).map((batch) => (
                                                                <TableRow key={batch.id}>
                                                                    <TableCell>{batch.name}</TableCell>
                                                                    <TableCell>
                                                                        <div className="w-full">
                                                                            <Progress value={batch.progress} className="h-2" />
                                                                            <div className="text-xs text-gray-500 mt-1">
                                                                                {batch.progress}% ({batch.total_jobs - batch.pending_jobs}/{batch.total_jobs})
                                                                            </div>
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Badge className={getStatusColor(batch.status)}>
                                                                            {batch.status}
                                                                        </Badge>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                )}
                                            </CardContent>
                                            {batches.length > 0 && (
                                                <CardFooter>
                                                    <Button variant="ghost" onClick={() => setActiveTab("batches")}>
                                                        Ver todos os lotes
                                                    </Button>
                                                </CardFooter>
                                            )}
                                        </Card>
                                    </div>
                                </TabsContent>

                                <TabsContent value="pending">
                                    <Card>
                                        <CardHeader>
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <CardTitle>Jobs Pendentes</CardTitle>
                                                    <CardDescription>Jobs na fila aguardando processamento</CardDescription>
                                                </div>
                                                {pendingJobs.length > 0 && (
                                                    <div className="flex space-x-2">
                                                        {pendingJobs.map(queue => (
                                                            <Button 
                                                                key={queue.queue}
                                                                variant="outline" 
                                                                className="text-red-600 border-red-200 hover:bg-red-50" 
                                                                onClick={() => purgeQueue(queue.queue)}
                                                                disabled={processingPurge}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" /> Limpar fila "{queue.queue}"
                                                            </Button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            {pendingJobs.length === 0 ? (
                                                <div className="text-center py-8 text-gray-500">
                                                    <Info className="mx-auto h-12 w-12 text-gray-400" />
                                                    <h3 className="mt-2 text-sm font-semibold text-gray-900">Nenhum job pendente</h3>
                                                    <p className="mt-1 text-sm text-gray-500">
                                                        Não há jobs aguardando processamento.
                                                    </p>
                                                </div>
                                            ) : (
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Fila</TableHead>
                                                            <TableHead>Quantidade</TableHead>
                                                            <TableHead>Próximo Job</TableHead>
                                                            <TableHead>Ações</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {pendingJobs.map((queue, index) => (
                                                            <TableRow key={index}>
                                                                <TableCell>{queue.queue}</TableCell>
                                                                <TableCell>{queue.count}</TableCell>
                                                                <TableCell>{queue.next_job || '-'}</TableCell>
                                                                <TableCell>
                                                                    <Button 
                                                                        variant="ghost" 
                                                                        className="text-red-600 hover:text-red-800 hover:bg-red-50" 
                                                                        onClick={() => purgeQueue(queue.queue)}
                                                                        disabled={processingPurge}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="failed">
                                    <Card>
                                        <CardHeader>
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <CardTitle>Jobs Falhos</CardTitle>
                                                    <CardDescription>Jobs que falharam durante o processamento</CardDescription>
                                                </div>
                                                {failedJobs.length > 0 && (
                                                    <div className="flex space-x-2">
                                                        <Button 
                                                            variant="outline" 
                                                            className="border-amber-200 hover:bg-amber-50"
                                                            onClick={() => retryFailed()}
                                                            disabled={processingRetry}
                                                        >
                                                            <RefreshCcw className="mr-2 h-4 w-4" /> Reprocessar Todos
                                                        </Button>
                                                        <Button 
                                                            variant="outline" 
                                                            className="text-red-600 border-red-200 hover:bg-red-50"
                                                            onClick={flushFailed}
                                                            disabled={processingFlush}
                                                        >
                                                            <XCircle className="mr-2 h-4 w-4" /> Limpar Todos
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            {failedJobs.length === 0 ? (
                                                <div className="text-center py-8 text-gray-500">
                                                    <Info className="mx-auto h-12 w-12 text-gray-400" />
                                                    <h3 className="mt-2 text-sm font-semibold text-gray-900">Nenhum job falho</h3>
                                                    <p className="mt-1 text-sm text-gray-500">
                                                        Todos os jobs foram processados com sucesso.
                                                    </p>
                                                </div>
                                            ) : (
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>ID</TableHead>
                                                            <TableHead>Fila</TableHead>
                                                            <TableHead>Falhou em</TableHead>
                                                            <TableHead>Exceção</TableHead>
                                                            <TableHead>Ações</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {failedJobs.map((job) => (
                                                            <TableRow key={job.id}>
                                                                <TableCell>{job.id}</TableCell>
                                                                <TableCell>{job.queue}</TableCell>
                                                                <TableCell>{job.failed_at}</TableCell>
                                                                <TableCell className="max-w-xs truncate">
                                                                    <span title={job.exception} className="cursor-help">
                                                                        {job.exception}
                                                                    </span>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="flex space-x-2">
                                                                        <Button 
                                                                            variant="ghost" 
                                                                            onClick={() => showJobDetails(job)}
                                                                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                                                        >
                                                                            <Info className="h-4 w-4" />
                                                                        </Button>
                                                                        <Button 
                                                                            variant="ghost" 
                                                                            onClick={() => retryFailed(job.id)}
                                                                            disabled={processingRetry}
                                                                            className="text-green-600 hover:text-green-800 hover:bg-green-50"
                                                                        >
                                                                            <Play className="h-4 w-4" />
                                                                        </Button>
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="batches">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Lotes de Jobs</CardTitle>
                                            <CardDescription>Lotes de jobs processados recentemente</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {batches.length === 0 ? (
                                                <div className="text-center py-8 text-gray-500">
                                                    <Info className="mx-auto h-12 w-12 text-gray-400" />
                                                    <h3 className="mt-2 text-sm font-semibold text-gray-900">Nenhum lote de jobs</h3>
                                                    <p className="mt-1 text-sm text-gray-500">
                                                        Não há lotes de jobs processados recentemente.
                                                    </p>
                                                </div>
                                            ) : (
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>ID</TableHead>
                                                            <TableHead>Nome</TableHead>
                                                            <TableHead>Progresso</TableHead>
                                                            <TableHead>Jobs</TableHead>
                                                            <TableHead>Falhos</TableHead>
                                                            <TableHead>Criado em</TableHead>
                                                            <TableHead>Status</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {batches.map((batch) => (
                                                            <TableRow key={batch.id}>
                                                                <TableCell className="font-mono text-xs">
                                                                    {batch.id.substring(0, 8)}...
                                                                </TableCell>
                                                                <TableCell>{batch.name}</TableCell>
                                                                <TableCell>
                                                                    <div className="w-full">
                                                                        <Progress value={batch.progress} className="h-2" />
                                                                        <div className="text-xs text-gray-500 mt-1">
                                                                            {batch.progress}%
                                                                        </div>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    {batch.total_jobs - batch.pending_jobs}/{batch.total_jobs}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {batch.failed_jobs > 0 ? (
                                                                        <span className="text-red-600">{batch.failed_jobs}</span>
                                                                    ) : (
                                                                        batch.failed_jobs
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>{batch.created_at}</TableCell>
                                                                <TableCell>
                                                                    <Badge className={getStatusColor(batch.status)}>
                                                                        {batch.status}
                                                                    </Badge>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Detalhes do Job</DialogTitle>
                        <DialogDescription>
                            Informações detalhadas sobre o job que falhou
                        </DialogDescription>
                    </DialogHeader>
                    
                    {selectedJob && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <div className="font-medium">ID:</div>
                                <div className="col-span-3">{selectedJob.id}</div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <div className="font-medium">UUID:</div>
                                <div className="col-span-3 font-mono text-sm">{selectedJob.uuid}</div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <div className="font-medium">Conexão:</div>
                                <div className="col-span-3">{selectedJob.connection}</div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <div className="font-medium">Fila:</div>
                                <div className="col-span-3">{selectedJob.queue}</div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <div className="font-medium">Falhou em:</div>
                                <div className="col-span-3">{selectedJob.failed_at}</div>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-4">
                                <div className="font-medium">Exceção:</div>
                                <div className="bg-gray-100 p-4 rounded-md overflow-auto max-h-48 text-sm font-mono whitespace-pre-line">
                                    {selectedJob.exception}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-4">
                                <div className="font-medium">Payload:</div>
                                <div className="bg-gray-100 p-4 rounded-md overflow-auto max-h-48 text-sm font-mono">
                                    {selectedJob.payload && 
                                        <pre>{JSON.stringify(selectedJob.payload, null, 2)}</pre>
                                    }
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => setDialogOpen(false)}
                        >
                            Fechar
                        </Button>
                        {selectedJob && (
                            <Button 
                                onClick={() => retryFailed(selectedJob.id)}
                                disabled={processingRetry}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <RefreshCcw className="mr-2 h-4 w-4" /> Reprocessar
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
} 