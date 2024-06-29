"use client"

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Form, FormField, FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardTitle } from '@/components/ui/card'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { revalidatePath } from 'next/cache'

const formSchema = z.object({
    email: z.string().min(1, "Email precisa ser preenchido").email("Este não é um email válido"),
    password: z.string().min(6)
})

export default function LoginForm() {

    let [loading, setLoading] = useState(false)

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    })

    const router = useRouter()

    function onSubmit(values) {
        setLoading(!loading)
        fetch('/api/login', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(values)

        })
        .then(response => {
            if(response.ok) {
                setLoading(!loading)
                router.push('/lobby')
            }            
        })
    }

    return (

        <Card className="w-[350px] py-6 px-10">
            <CardTitle className="pb-8">Login</CardTitle>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input placeholder="E-mail" type="email" {...field}></Input>
                                </FormControl>
                                <FormMessage variant="primary" />
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
                                <FormMessage variant="primary" />
                            </FormItem>
                        )} />
                    <div className="flex space-x-4 justify-end pt-4">
                        <Button type="submit" disabled={loading}>{loading ? "Carregando..." : "Entrar"}</Button>
                    </div>
                </form>
            </Form>
        </Card>
    )
}