"use client"

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Form, FormField, FormControl, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const formSchema = z.object({
    nickname: z.string().min(4, { 
        message: "O nick precisa ser maior que 4 caracteres"
    }).max(32, {
        message: "O nick só pode ter 32 caracteres"
    }).refine(s => !s.includes(" "), {
        message: "Nick não pode ter espaços"
    }),
    email: z.string().min(1, {
        message: "Email precisa ser preenchido"
    }).email({
        message: "Este não é um email válido"
    }),
    password: z.string().min(6),
    confirmPassword: z.string().min(6)
})

export default function SignupForm() {

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nickname: "",
            email: "",
            password: "",
            confirmPassword: ""
        }
    })

    const router = useRouter()

    async function onSubmit(values) {
        try {
            await fetch("/api/signup", {
                method: "POST", 
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(values)
            });
            return router.push('/comingsoon')
        } catch(error) {
            console.error(error);
        }
    }

    return (

        <Card className="w-[350px] py-6 px-10">
            <CardTitle className="pb-8">Cadastro</CardTitle>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="nickname"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input placeholder="Nickname" {...field}></Input>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input placeholder="E-mail" type="email" {...field}></Input>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input placeholder="Senha" type="password" {...field}></Input>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input placeholder="Confirmar senha" type="password" {...field}></Input>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    <div className="flex space-x-4 justify-end pt-4">
                        <Button variant="secondary" asChild>
                            <Link href="/auth">Voltar</Link>
                        </Button>
                        <Button type="submit">Registrar</Button>
                    </div>
                </form>
            </Form>
        </Card>
    )
}